import { Body, Controller, ForbiddenException, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from './inventory.service';

class CreateVehicleUnitDto {
  @IsString()
  dealerId!: string;

  @IsString()
  modelId!: string;

  @IsOptional()
  @IsString()
  trimId?: string;

  @IsOptional()
  @IsString()
  vin?: string;

  @IsOptional()
  @IsIn(['IN_STOCK', 'IN_TRANSIT', 'PREORDER'])
  status?: string;
}

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminInventoryController {
  constructor(private readonly inventory: InventoryService, private readonly prisma: PrismaService) {}

  private requireAdmin(user: { role: string }) {
    if (user.role !== 'ADMIN') throw new ForbiddenException('Admin only');
  }

  @Get('inventory')
  units(@CurrentUser() user: { role: string }, @Query('dealerId') dealerId?: string) {
    this.requireAdmin(user);
    return this.inventory.listUnits(dealerId);
  }

  @Get('inventory/reservations')
  reservations(@CurrentUser() user: { role: string }) {
    this.requireAdmin(user);
    return this.inventory.listReservations();
  }

  @Post('inventory/release-expired')
  releaseExpired(@CurrentUser() user: { role: string }) {
    this.requireAdmin(user);
    return this.inventory.releaseExpired();
  }

  @Post('inventory/vehicle-units')
  createUnit(@CurrentUser() user: { role: string }, @Body() dto: CreateVehicleUnitDto) {
    this.requireAdmin(user);
    return this.prisma.vehicleUnit.create({ data: dto });
  }

  @Post('orders/:id/allocate')
  allocate(@CurrentUser() user: { role: string }, @Param('id') id: string, @Body() body: { vehicleUnitId: string }) {
    this.requireAdmin(user);
    return this.inventory.allocate(id, body.vehicleUnitId);
  }
}
