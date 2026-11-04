import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { dispatchOutbox } from '@autonova/outbox';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Writes an outbox event inside the caller's transaction. */
  async publish(tx: Prisma.TransactionClient, type: string, payload: Prisma.InputJsonValue) {
    await tx.outboxEvent.create({ data: { type, payload } });
  }

  /** Shared with the background worker so both paths apply identical rules. */
  dispatch() {
    return dispatchOutbox(this.prisma);
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
