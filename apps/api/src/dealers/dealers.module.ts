import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DealersController } from './dealers.controller';
@Module({ controllers: [DealersController], providers: [PrismaService] })
export class DealersModule {}
