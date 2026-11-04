import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { AdminInventoryController } from './admin-inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminInventoryController],
  providers: [InventoryService, PrismaService],
  exports: [InventoryService],
})
export class InventoryModule {}
