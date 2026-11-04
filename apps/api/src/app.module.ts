import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaService } from './prisma/prisma.service';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { QuotesModule } from './quotes/quotes.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { DealersModule } from './dealers/dealers.module';
import { AdminModule } from './admin/admin.module';
import { FinanceModule } from './finance/finance.module';
import { PricingModule } from './pricing/pricing.module';
import { PromotionsModule } from './promotions/promotions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { InventoryModule } from './inventory/inventory.module';
import { AuditModule } from './audit/audit.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { TestDrivesModule } from './test-drives/test-drives.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Generous global ceiling; credential endpoints carry a much tighter limit.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 600 }]),
    AuthModule,
    CatalogModule,
    PricingModule,
    PromotionsModule,
    NotificationsModule,
    InventoryModule,
    AuditModule,
    AnalyticsModule,
    FinanceModule,
    QuotesModule,
    OrdersModule,
    PaymentsModule,
    DealersModule,
    TestDrivesModule,
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [PrismaService],
})
export class AppModule {}
