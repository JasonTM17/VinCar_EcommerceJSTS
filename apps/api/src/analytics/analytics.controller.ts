import { BadRequestException, Controller, ForbiddenException, Get, Header, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AnalyticsService } from './analytics.service';

@Controller('admin')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  private requireAdmin(user: { role: string }) {
    if (user.role !== 'ADMIN') throw new ForbiddenException('Admin only');
  }

  @Get('analytics')
  dashboard(@CurrentUser() user: { role: string }) {
    this.requireAdmin(user);
    return this.analytics.dashboard();
  }

  /**
   * Authorized CSV export. Filters are applied server-side and the caller's permission
   * is checked before any row leaves the process.
   */
  @Get('reports/orders.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="orders.csv"')
  async exportOrders(@CurrentUser() user: { role: string }, @Query('status') status?: string) {
    this.requireAdmin(user);
    if (status && !/^[A-Z_]{3,40}$/.test(status)) throw new BadRequestException('Invalid status filter');

    const orders = await this.analytics.exportOrders(status);
    const header = 'order_id,status,amount_vnd,deposit_vnd,dealer_id,created_at';
    const rows = orders.map((order) =>
      [order.id, order.status, order.amountVnd.toString(), order.depositVnd.toString(), order.dealerId, order.createdAt.toISOString()].join(','),
    );
    return [header, ...rows].join('\n');
  }
}
