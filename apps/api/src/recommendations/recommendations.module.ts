import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LongCatClient } from './longcat.client';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

@Module({
  controllers: [RecommendationsController],
  providers: [PrismaService, LongCatClient, RecommendationsService],
})
export class RecommendationsModule {}
