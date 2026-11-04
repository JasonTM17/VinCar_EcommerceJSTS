import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PricingModule } from '../pricing/pricing.module';
import { PrismaService } from '../prisma/prisma.service';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';

@Module({
  imports: [AuthModule, PricingModule],
  controllers: [QuotesController],
  providers: [QuotesService, PrismaService],
})
export class QuotesModule {}
