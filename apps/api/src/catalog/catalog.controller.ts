import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Controller('vehicles')
export class CatalogController {
  constructor(private readonly prisma: PrismaService) {}
  @Get()
  async list(@Query('category') category?: string, @Query('q') q?: string, @Query('page') page = '1', @Query('limit') limit = '12') {
    const p = Math.max(1, Number(page) || 1); const l = Math.min(50, Math.max(1, Number(limit) || 12));
    const where: Record<string, unknown> = { status: 'PUBLISHED' };
    if (category) where['category'] = category;
    if (q) where['name'] = { contains: q, mode: 'insensitive' };
    const [items, total] = await Promise.all([
      this.prisma.vehicleModel.findMany({ where, include: { brand: true, trims: { include: { colors: true, options: true } } }, skip: (p - 1) * l, take: l, orderBy: { createdAt: 'desc' } }),
      this.prisma.vehicleModel.count({ where }),
    ]);
    return { data: items.map(serializeVehicle), meta: { page: p, limit: l, total, pages: Math.ceil(total / l) } };
  }
  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    const v = await this.prisma.vehicleModel.findUnique({ where: { slug }, include: { brand: true, trims: { include: { colors: true, options: true } } } });
    if (!v || v.status !== 'PUBLISHED') throw new NotFoundException('Vehicle not found');
    return serializeVehicle(v as never);
  }
}
export function serializeVehicle(v: any) {
  return { ...v, brandId: v.brandId, trims: v.trims.map((t: any) => ({ ...t, basePriceVnd: t.basePriceVnd.toString(), batteryKwh: t.batteryKwh?.toString() ?? null, colors: t.colors.map((c: any) => ({ ...c, surchargeVnd: c.surchargeVnd.toString() })), options: t.options.map((o: any) => ({ ...o, priceVnd: o.priceVnd.toString() })) })) };
}
