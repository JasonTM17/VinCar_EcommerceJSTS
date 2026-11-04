import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const TITLES: Record<string, (payload: Record<string, unknown>) => { title: string; body: string }> = {
  TEST_DRIVE_BOOKED: (p) => ({
    title: 'Đăng ký lái thử thành công',
    body: `Lịch hẹn ${p.bookingId ?? ''} của bạn đã được xác nhận.`,
  }),
  ORDER_CREATED: (p) => ({
    title: 'Đơn đặt cọc đã tạo',
    body: `Đơn ${p.orderId ?? ''} đang chờ thanh toán đặt cọc.`,
  }),
  PAYMENT_SUCCEEDED: (p) => ({
    title: 'Đã nhận đặt cọc',
    body: `Chúng tôi đã nhận ${p.amountVnd ?? ''} VND cho đơn ${p.orderId ?? ''}.`,
  }),
  ORDER_CANCELLED: (p) => ({
    title: 'Đơn đã bị hủy',
    body: `Đơn ${p.orderId ?? ''} đã bị hủy.${p.refundVnd ? ` Khoản hoàn tiền ${p.refundVnd} VND đang chờ xử lý.` : ''}`,
  }),
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Writes an outbox event inside the caller's transaction. */
  async publish(tx: Prisma.TransactionClient, type: string, payload: Prisma.InputJsonValue) {
    await tx.outboxEvent.create({ data: { type, payload } });
  }

  /**
   * Turns pending outbox events into notifications. Idempotent per event: an event
   * is only marked PROCESSED after its notification rows exist.
   */
  async dispatch() {
    const events = await this.prisma.outboxEvent.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    let processed = 0;
    for (const event of events) {
      const builder = TITLES[event.type];
      if (!builder) {
        await this.prisma.outboxEvent.update({ where: { id: event.id }, data: { status: 'FAILED', attempts: { increment: 1 } } });
        continue;
      }
      const payload = event.payload as Record<string, unknown>;
      const { title, body } = builder(payload);
      await this.prisma.$transaction([
        this.prisma.notification.create({ data: { userId: (payload.userId as string) ?? null, type: event.type, title, body } }),
        this.prisma.outboxEvent.update({ where: { id: event.id }, data: { status: 'PROCESSED', processedAt: new Date() } }),
      ]);
      processed += 1;
    }
    return { pending: events.length, processed };
  }

  listForUser(userId: string) {
    return this.prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  async markRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({ where: { id }, data: { read: true } });
  }
}
