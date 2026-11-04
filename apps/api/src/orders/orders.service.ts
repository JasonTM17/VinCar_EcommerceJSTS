import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}
  async create(userId: string, input: { quoteId: string; dealerId: string; idempotencyKey: string }) {
    const existing = await this.prisma.order.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (existing) {
      if (existing.userId !== userId) throw new BadRequestException('Idempotency key conflict');
      return existing;
    }
    return this.prisma.$transaction(async (tx) => {
      const quote = await tx.quote.findUnique({ where: { id: input.quoteId } });
      if (!quote) throw new NotFoundException('Quote not found');
      if (quote.userId !== userId) throw new BadRequestException('Quote does not belong to user');
      if (quote.expiresAt < new Date()) throw new BadRequestException('Quote expired — re-price required');
      const dealer = await tx.dealer.findUnique({ where: { id: input.dealerId } });
      if (!dealer || dealer.status !== 'ACTIVE') throw new BadRequestException('Dealer unavailable');
      const depositVnd = (quote.totalVnd * 10n) / 100n; // 10% demo deposit
      return tx.order.create({ data: { userId, quoteId: quote.id, dealerId: dealer.id, amountVnd: quote.totalVnd, depositVnd, status: 'PENDING_DEPOSIT', idempotencyKey: input.idempotencyKey, payments: { create: { provider: 'mock', amountVnd: depositVnd, status: 'CREATED', providerRef: `mock_${input.idempotencyKey}` } } }, include: { payments: true } });
    });
  }
  list(userId: string) { return this.prisma.order.findMany({ where: { userId }, include: { dealer: true, payments: true }, orderBy: { createdAt: 'desc' } }); }
}
