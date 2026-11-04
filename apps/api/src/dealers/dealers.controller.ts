import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Controller('dealers')
export class DealersController {
  constructor(private readonly prisma: PrismaService) {}
  @Get() list(@Query('province') province?: string) { return this.prisma.dealer.findMany({ where: { status: 'ACTIVE', ...(province ? { province } : {}) }, orderBy: { name: 'asc' } }); }
}
