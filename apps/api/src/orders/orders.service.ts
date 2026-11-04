import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const ADMIN_ROLES = ['ADMIN', 'DEALER_MANAGER'];

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async profile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  async create(userId: string, input: { quoteId: string; dealerId: string; idempotencyKey: string }) {
    const existing = await this.prisma.order.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) {
      if (existing.userId !== userId) throw new BadRequestException('Idempotency key conflict');
      return existing;
    }
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const quote = await tx.quote.findUnique({ where: { id: input.quoteId } });
      if (!quote) throw new NotFoundException('Quote not found');
      if (quote.userId !== userId) throw new BadRequestException('Quote does not belong to user');
      if (quote.expiresAt < new Date()) throw new BadRequestException('Quote expired — re-price required');
      const dealer = await tx.dealer.findUnique({ where: { id: input.dealerId } });
      if (!dealer || dealer.status !== 'ACTIVE') throw new BadRequestException('Dealer unavailable');
      const depositVnd = (quote.totalVnd * 10n) / 100n; // 10% demo deposit
      return tx.order.create({
        data: {
          userId,
          quoteId: quote.id,
          dealerId: dealer.id,
          amountVnd: quote.totalVnd,
          depositVnd,
          status: 'PENDING_DEPOSIT',
          idempotencyKey: input.idempotencyKey,
          payments: { create: { provider: 'mock', amountVnd: depositVnd, status: 'CREATED', providerRef: `mock_${input.idempotencyKey}` } },
        },
        include: { payments: true },
      });
    });
  }

  list(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { dealer: true, payments: true, refunds: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Cancels an order. A paid deposit is never silently dropped: it produces a
   * REFUND_PENDING payment and a REQUESTED refund for authorized staff to approve.
   */
  async cancel(userId: string, role: string, id: string, reason?: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const order = await tx.order.findUnique({ where: { id }, include: { payments: true } });
      if (!order) throw new NotFoundException('Order not found');
      if (order.userId !== userId && !ADMIN_ROLES.includes(role)) throw new ForbiddenException('Not your order');
      if (order.status === 'CANCELLED') throw new BadRequestException('Order already cancelled');
      if (order.status === 'DELIVERED') throw new BadRequestException('Delivered orders cannot be cancelled');

      const paid = order.payments.find((payment) => payment.status === 'SUCCEEDED');
      if (paid) {
        const existing = await tx.refund.findFirst({ where: { orderId: order.id } });
        if (!existing) {
          await tx.refund.create({
            data: { orderId: order.id, amountVnd: paid.amountVnd, reason: reason ?? 'Customer cancellation', status: 'REQUESTED' },
          });
        }
        await tx.payment.update({ where: { id: paid.id }, data: { status: 'REFUND_PENDING' } });
      }

      return tx.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
        include: { payments: true, refunds: true },
      });
    });
  }
}
