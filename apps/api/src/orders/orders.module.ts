import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { OrderLifecycleController } from './order-lifecycle.controller';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [AuthModule],
  controllers: [OrdersController, OrderLifecycleController],
  providers: [OrdersService, PrismaService],
})
export class OrdersModule {}
