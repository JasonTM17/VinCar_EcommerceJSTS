import type { PrismaClient } from '@prisma/client';

type OutboxEvent = { id: string; type: string; payload: unknown };

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

/**
 * Turns pending outbox events into notifications.
 *
 * An event is only marked PROCESSED after its notification row exists, and the two
 * writes share one transaction, so re-running dispatch never duplicates a message.
 * Both the API's admin endpoint and the background worker call this same function.
 */
export async function dispatchOutbox(prisma: PrismaClient, limit = 100): Promise<{ pending: number; processed: number }> {
  const events: OutboxEvent[] = await prisma.outboxEvent.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });

  let processed = 0;
  for (const event of events) {
    const builder = TITLES[event.type];
    if (!builder) {
      await prisma.outboxEvent.update({ where: { id: event.id }, data: { status: 'FAILED', attempts: { increment: 1 } } });
      continue;
    }
    const payload = (event.payload ?? {}) as Record<string, unknown>;
    const { title, body } = builder(payload);
    await prisma.$transaction([
      prisma.notification.create({ data: { userId: (payload.userId as string) ?? null, type: event.type, title, body } }),
      prisma.outboxEvent.update({ where: { id: event.id }, data: { status: 'PROCESSED', processedAt: new Date() } }),
    ]);
    processed += 1;
  }
  return { pending: events.length, processed };
}
