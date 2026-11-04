import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IsString } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { OrdersService } from './orders.service';
class OrderDto { @IsString() quoteId!: string; @IsString() dealerId!: string; @IsString() idempotencyKey!: string; }
@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}
  @Post() create(@CurrentUser() user: any, @Body() dto: OrderDto) { return this.orders.create(user.sub, dto); }
  @Get() list(@CurrentUser() user: any) { return this.orders.list(user.sub); }
}
