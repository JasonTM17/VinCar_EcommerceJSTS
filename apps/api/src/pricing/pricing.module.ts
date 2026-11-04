import { Module } from '@nestjs/common';
import { PromotionsModule } from '../promotions/promotions.module';
import { PrismaService } from '../prisma/prisma.service';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';

@Module({
  imports: [PromotionsModule],
  controllers: [PricingController],
  providers: [PricingService, PrismaService],
  exports: [PricingService],
})
export class PricingModule {}
