import { Controller, Get, UseGuards } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}
  private requireAdmin(user: any) { if (!['ADMIN', 'DEALER_MANAGER'].includes(user.role)) throw new ForbiddenException('Admin only'); }
  @Get('orders')
  orders(@CurrentUser() user: any) { this.requireAdmin(user); return this.prisma.order.findMany({ include: { user: true, dealer: true, payments: true }, orderBy: { createdAt: 'desc' }, take: 100 }); }
  @Get('audit-logs')
  audit(@CurrentUser() user: any) { this.requireAdmin(user); return this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }); }
}
