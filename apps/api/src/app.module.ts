import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { TestDrivesModule } from './test-drives/test-drives.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    CatalogModule,
    PricingModule,
    PromotionsModule,
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
