import { createHmac, timingSafeEqual } from 'node:crypto';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}
  sign(body: string) { return createHmac('sha256', process.env.PAYMENT_WEBHOOK_SECRET ?? 'mock-secret').update(body).digest('hex'); }
  verify(body: string, signature: string) {
    const expected = this.sign(body);
    if (signature.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }
  async handleWebhook(rawBody: string, signature: string) {
    if (!this.verify(rawBody, signature)) throw new UnauthorizedException('Invalid signature');
    const evt = JSON.parse(rawBody) as { id: string; type: string; paymentId: string; amountVnd: string };
    if (!evt?.id || !evt?.paymentId) throw new BadRequestException('Invalid event');
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const dup = await tx.paymentEvent.findUnique({ where: { providerEventId: evt.id } });
      if (dup) return { duplicate: true };
      const payment = await tx.payment.findUnique({ where: { id: evt.paymentId }, include: { order: true } });
      if (!payment) throw new BadRequestException('Payment not found');
      if (evt.type === 'payment.succeeded') {
        if (BigInt(evt.amountVnd) !== payment.amountVnd) throw new BadRequestException('Amount mismatch');
        await tx.payment.update({ where: { id: payment.id }, data: { status: 'SUCCEEDED' } });
        await tx.order.update({ where: { id: payment.orderId }, data: { status: 'DEPOSIT_PAID' } });
      }
      await tx.paymentEvent.create({ data: { paymentId: payment.id, providerEventId: evt.id, type: evt.type, raw: evt } });
      return { ok: true };
    });
  }
}
