import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Controller('vehicles')
export class CatalogController {
  constructor(private readonly prisma: PrismaService) {}
  @Get()
  async list(@Query('category') category?: string, @Query('q') q?: string, @Query('page') page = '1', @Query('limit') limit = '12') {
    const requestedPage = Number(page);
    const requestedLimit = Number(limit);
    const p = Number.isSafeInteger(requestedPage) ? Math.max(1, requestedPage) : 1;
    const l = Number.isSafeInteger(requestedLimit)
      ? Math.min(50, Math.max(1, requestedLimit || 12))
      : 12;
    const skip = (p - 1) * l;
    const where: Record<string, unknown> = { status: 'PUBLISHED' };
    if (category) where['category'] = category;
    if (q) where['name'] = { contains: escapeLikePattern(q), mode: 'insensitive' };
    const [items, total] = await Promise.all([
      Number.isSafeInteger(skip)
        ? this.prisma.vehicleModel.findMany({ where, include: { brand: true, trims: { include: { colors: true, options: true } } }, skip, take: l, orderBy: { createdAt: 'desc' } })
        : Promise.resolve([]),
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
function escapeLikePattern(query: string) {
  return query.replace(/[\\%_]/g, '\\$&');
}
export function serializeVehicle(v: any) {
  return { ...v, brandId: v.brandId, trims: v.trims.map((t: any) => ({ ...t, basePriceVnd: t.basePriceVnd.toString(), batteryKwh: t.batteryKwh?.toString() ?? null, colors: t.colors.map((c: any) => ({ ...c, surchargeVnd: c.surchargeVnd.toString() })), options: t.options.map((o: any) => ({ ...o, priceVnd: o.priceVnd.toString() })) })) };
}
