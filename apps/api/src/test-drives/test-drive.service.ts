import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TestDriveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly audit: AuditService,
  ) {}

  async listSlots(dealerId: string, date?: string) {
    const day = date ? new Date(`${date}T00:00:00.000Z`) : undefined;
    if (day && Number.isNaN(day.getTime())) throw new NotFoundException('Invalid date');
    const nextDay = day ? new Date(day.getTime() + 24 * 60 * 60 * 1000) : undefined;
    return this.prisma.testDriveSlot.findMany({
      where: {
        dealerId,
        ...(day ? { date: { gte: day, lt: nextDay } } : {}),
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  /**
   * Capacity is enforced by a single atomic conditional UPDATE, so two concurrent
   * requests cannot both take the last seat. A unique (slotId, userId) constraint
   * additionally blocks the same user from double-booking.
   */
  async book(userId: string, input: { dealerId: string; slotId: string; modelSlug: string }) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const slot = await tx.testDriveSlot.findUnique({ where: { id: input.slotId } });
      if (!slot || slot.dealerId !== input.dealerId) throw new NotFoundException('Slot not found for this dealer');
      if (slot.date < new Date()) throw new ConflictException('Cannot book a past slot');

      const existing = await tx.testDrive.findUnique({ where: { slotId_userId: { slotId: input.slotId, userId } } });
      if (existing?.status === 'CONFIRMED') throw new ConflictException('You already have a booking for this slot');

      const updated = await tx.$executeRaw`
        UPDATE "TestDriveSlot"
        SET "booked" = "booked" + 1
        WHERE "id" = ${input.slotId}
          AND "dealerId" = ${input.dealerId}
          AND "booked" < "capacity"
      `;
      if (updated === 0) throw new ConflictException('Slot is full');

      // A previously cancelled booking keeps its row so (slotId, userId) stays unique;
      // reactivate it instead of inserting a duplicate.
      if (existing) {
        const reactivated = await tx.testDrive.update({
          where: { id: existing.id },
          data: { status: 'CONFIRMED' },
          include: { slot: true, dealer: true },
        });
        await this.notifications.publish(tx, 'TEST_DRIVE_BOOKED', { userId, bookingId: reactivated.id });
        await this.audit.record(tx, { actorId: userId, action: 'TEST_DRIVE_BOOKED', resource: 'TestDrive', resourceId: reactivated.id });
        return reactivated;
      }

      try {
        const booking = await tx.testDrive.create({
          data: { userId, dealerId: input.dealerId, slotId: input.slotId, modelSlug: input.modelSlug },
          include: { slot: true, dealer: true },
        });
        await this.notifications.publish(tx, 'TEST_DRIVE_BOOKED', { userId, bookingId: booking.id });
        await this.audit.record(tx, { actorId: userId, action: 'TEST_DRIVE_BOOKED', resource: 'TestDrive', resourceId: booking.id });
        return booking;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new ConflictException('You already have a booking for this slot');
        }
        throw error;
      }
    });
  }

  async cancel(userId: string, id: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const booking = await tx.testDrive.findUnique({ where: { id } });
      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.userId !== userId) throw new ForbiddenException('Not your booking');
      if (booking.status !== 'CONFIRMED') throw new ConflictException('Only confirmed bookings can be cancelled');

      await tx.$executeRaw`
        UPDATE "TestDriveSlot" SET "booked" = "booked" - 1 WHERE "id" = ${booking.slotId} AND "booked" > 0
      `;
      return tx.testDrive.update({ where: { id }, data: { status: 'CANCELLED' }, include: { slot: true } });
    });
  }

  listForUser(userId: string) {
    return this.prisma.testDrive.findMany({
      where: { userId },
      include: { dealer: true, slot: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
