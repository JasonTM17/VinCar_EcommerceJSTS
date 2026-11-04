import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const RESERVATION_TTL_MS = 30 * 60 * 1000; // a deposit hold lasts 30 minutes

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Holds stock for a new order. A single atomic conditional UPDATE claims the unit,
   * so two orders cannot both take the same physical car. When nothing is in stock the
   * reservation is still created (without a unit) to represent a factory order.
   */
  async reserveForOrder(tx: Prisma.TransactionClient, orderId: string, dealerId: string, modelId: string) {
    const expiresAt = new Date(Date.now() + RESERVATION_TTL_MS);
    const unit = await tx.vehicleUnit.findFirst({ where: { dealerId, modelId, status: 'IN_STOCK' }, orderBy: { createdAt: 'asc' } });

    if (unit) {
      const claimed = await tx.$executeRaw`
        UPDATE "VehicleUnit" SET "status" = 'RESERVED'
        WHERE "id" = ${unit.id} AND "status" = 'IN_STOCK'
      `;
      if (claimed === 0) {
        return tx.inventoryReservation.create({ data: { orderId, expiresAt } });
      }
      return tx.inventoryReservation.create({ data: { orderId, vehicleUnitId: unit.id, expiresAt }, include: { vehicleUnit: true } });
    }

    return tx.inventoryReservation.create({ data: { orderId, expiresAt } });
  }

  /** Releases holds whose deposit window closed without payment. */
  async releaseExpired() {
    const now = new Date();
    const expired = await this.prisma.inventoryReservation.findMany({
      where: { status: 'HELD', expiresAt: { lt: now }, order: { status: 'PENDING_DEPOSIT' } },
      include: { vehicleUnit: true },
    });

    let released = 0;
    for (const reservation of expired) {
      await this.prisma.$transaction(async (tx) => {
        const result = await tx.$executeRaw`
          UPDATE "InventoryReservation" SET "status" = 'RELEASED'
          WHERE "id" = ${reservation.id} AND "status" = 'HELD'
        `;
        if (result === 0) return;
        if (reservation.vehicleUnitId) {
          await tx.$executeRaw`
            UPDATE "VehicleUnit" SET "status" = 'IN_STOCK'
            WHERE "id" = ${reservation.vehicleUnitId} AND "status" = 'RESERVED'
          `;
        }
        await tx.order.update({ where: { id: reservation.orderId }, data: { status: 'CANCELLED' } });
      });
      released += 1;
    }
    return { expired: expired.length, released };
  }

  /** Assigns a specific physical unit to a paid order and converts the hold. */
  async allocate(orderId: string, vehicleUnitId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { reservation: true } });
      if (!order) throw new NotFoundException('Order not found');
      if (order.status !== 'DEPOSIT_PAID') throw new BadRequestException(`Only DEPOSIT_PAID orders can be allocated (current: ${order.status})`);

      const unit = await tx.vehicleUnit.findUnique({ where: { id: vehicleUnitId } });
      if (!unit || unit.dealerId !== order.dealerId) throw new NotFoundException('Unit not found for this dealer');
      if (unit.status !== 'IN_STOCK' && unit.status !== 'RESERVED') throw new BadRequestException(`Unit is not available (status: ${unit.status})`);

      await tx.$executeRaw`
        UPDATE "VehicleUnit" SET "status" = 'ALLOCATED', "vin" = COALESCE("vin", ${`VIN-${unit.id}`})
        WHERE "id" = ${unit.id} AND "status" IN ('IN_STOCK', 'RESERVED')
      `;

      if (order.reservation) {
        await tx.inventoryReservation.update({ where: { id: order.reservation.id }, data: { status: 'CONVERTED', vehicleUnitId: unit.id } });
      } else {
        await tx.inventoryReservation.create({ data: { orderId, vehicleUnitId: unit.id, status: 'CONVERTED', expiresAt: new Date() } });
      }

      return tx.order.update({ where: { id: orderId }, data: { status: 'ALLOCATED' }, include: { reservation: { include: { vehicleUnit: true } } } });
    });
  }

  listUnits(dealerId?: string) {
    return this.prisma.vehicleUnit.findMany({
      where: dealerId ? { dealerId } : {},
      include: { model: true, trim: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  listReservations() {
    return this.prisma.inventoryReservation.findMany({ include: { vehicleUnit: true, order: true }, orderBy: { createdAt: 'desc' }, take: 100 });
  }
}
