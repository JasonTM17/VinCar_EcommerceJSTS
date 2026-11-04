import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto } from './dto';
import { PromotionsService } from './promotions.service';

@Controller()
export class PromotionsController {
  constructor(private readonly promotions: PromotionsService, private readonly prisma: PrismaService) {}

  private requireAdmin(user: { role: string }) {
    if (user.role !== 'ADMIN') throw new ForbiddenException('Admin only');
  }

  @Get('promotions')
  listActive(@Query('modelId') modelId?: string) {
    const now = new Date();
    return this.prisma.promotion.findMany({
      where: {
        status: 'ACTIVE',
        startsAt: { lte: now },
        endsAt: { gte: now },
        ...(modelId ? { models: { some: { modelId } } } : {}),
      },
      include: { models: true, excludedTrims: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('admin/promotions')
  @UseGuards(AuthGuard)
  listAll(@CurrentUser() user: { role: string }) {
    this.requireAdmin(user);
    return this.prisma.promotion.findMany({ include: { models: true, excludedTrims: true }, orderBy: { createdAt: 'desc' } });
  }

  @Post('admin/promotions')
  @UseGuards(AuthGuard)
  create(@CurrentUser() user: { role: string }, @Body() dto: CreatePromotionDto) {
    this.requireAdmin(user);
    return this.promotions.create(dto);
  }

  @Patch('admin/promotions/:id')
  @UseGuards(AuthGuard)
  setStatus(@CurrentUser() user: { role: string }, @Param('id') id: string, @Body() body: { status: string }) {
    this.requireAdmin(user);
    return this.prisma.promotion.update({ where: { id }, data: { status: body.status } });
  }
}
