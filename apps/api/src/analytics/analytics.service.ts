import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Every figure here is derived from the database with an explicit formula, so the
   * dashboard cannot drift from the underlying orders.
   */
  async dashboard() {
    const [orderGroups, paymentGroups, testDriveGroups, dealerGroups, refundGroups] = await Promise.all([
      this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.payment.groupBy({ by: ['status'], _sum: { amountVnd: true } }),
      this.prisma.testDrive.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.order.groupBy({ by: ['dealerId'], _count: { _all: true }, _sum: { amountVnd: true } }),
      this.prisma.refund.groupBy({ by: ['status'], _count: { _all: true }, _sum: { amountVnd: true } }),
    ]);

    const ordersByStatus = Object.fromEntries(orderGroups.map((row) => [row.status, row._count._all]));
    const totalOrders = orderGroups.reduce((sum, row) => sum + row._count._all, 0);
    const paidOrders = ordersByStatus.DEPOSIT_PAID ?? 0;
    const deliveredOrders = ordersByStatus.DELIVERED ?? 0;
    const cancelledOrders = ordersByStatus.CANCELLED ?? 0;

    const depositsVnd = paymentGroups
      .filter((row) => row.status === 'SUCCEEDED')
      .reduce((sum, row) => sum + (row._sum.amountVnd ?? 0n), 0n);

    const refundsVnd = refundGroups
      .filter((row) => row.status === 'REQUESTED')
      .reduce((sum, row) => sum + (row._sum.amountVnd ?? 0n), 0n);

    return {
      orders: {
        total: totalOrders,
        byStatus: ordersByStatus,
        // A deposit is the first committed step, so it is the funnel's conversion point.
        conversionRate: totalOrders === 0 ? 0 : Number(((paidOrders / totalOrders) * 100).toFixed(2)),
        completionRate: totalOrders === 0 ? 0 : Number(((deliveredOrders / totalOrders) * 100).toFixed(2)),
        cancelled: cancelledOrders,
      },
      money: {
        depositsCollectedVnd: depositsVnd.toString(),
        refundsPendingVnd: refundsVnd.toString(),
      },
      testDrives: {
        total: testDriveGroups.reduce((sum, row) => sum + row._count._all, 0),
        byStatus: Object.fromEntries(testDriveGroups.map((row) => [row.status, row._count._all])),
      },
      dealers: dealerGroups.map((row) => ({
        dealerId: row.dealerId,
        orders: row._count._all,
        orderValueVnd: (row._sum.amountVnd ?? 0n).toString(),
      })),
    };
  }

  /** Bounded export so a report can never scan an unbounded result set. */
  async exportOrders(status?: string) {
    return this.prisma.order.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      take: 10_000,
      select: { id: true, status: true, amountVnd: true, depositVnd: true, dealerId: true, createdAt: true },
    });
  }
}
