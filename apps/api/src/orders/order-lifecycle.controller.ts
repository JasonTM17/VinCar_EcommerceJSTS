import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { OrdersService } from './orders.service';

class CancelOrderDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

@Controller()
export class OrderLifecycleController {
  constructor(private readonly orders: OrdersService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: { sub: string }) {
    return this.orders.profile(user.sub);
  }

  @Post('orders/:id/cancel')
  @UseGuards(AuthGuard)
  cancel(@CurrentUser() user: { sub: string; role: string }, @Param('id') id: string, @Body() dto: CancelOrderDto) {
    return this.orders.cancel(user.sub, user.role, id, dto.reason);
  }
}
