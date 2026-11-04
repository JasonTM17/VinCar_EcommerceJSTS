import { Controller, ForbiddenException, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

@Controller('admin')
export class AdminOutboxController {
  constructor(private readonly notifications: NotificationsService, private readonly prisma: PrismaService) {}

  private requireAdmin(user: { role: string }) {
    if (user.role !== 'ADMIN') throw new ForbiddenException('Admin only');
  }

  @Get('outbox')
  @UseGuards(AuthGuard)
  list(@CurrentUser() user: { role: string }) {
    this.requireAdmin(user);
    return this.prisma.outboxEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  }

  @Post('outbox/dispatch')
  @UseGuards(AuthGuard)
  dispatch(@CurrentUser() user: { role: string }) {
    this.requireAdmin(user);
    return this.notifications.dispatch();
  }
}
