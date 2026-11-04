import { Injectable, NotFoundException } from '@nestjs/common';
import { calculateQuote } from '@autonova/pricing';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(userId: string, input: { trimId: string; colorId?: string; optionIds?: string[]; province: string }) {
    const trim = await this.prisma.vehicleTrim.findUnique({ where: { id: input.trimId }, include: { colors: true, options: true, model: true } });
    if (!trim) throw new NotFoundException('Trim not found');
    const color = input.colorId ? trim.colors.find((c) => c.id === input.colorId) : trim.colors[0];
    if (input.colorId && !color) throw new NotFoundException('Color not compatible with trim');
    const opts = trim.options.filter((o) => (input.optionIds ?? []).includes(o.id));
    const optionsTotal = opts.reduce((s, o) => s + o.priceVnd, 0n);
    // Province fees are demo estimates (must be replaced by admin-configured rules + effective dates before production).
    const fees = { registrationFee: 10_000_000n, plateFee: 500_000n, otherFees: 1_000_000n };
    const breakdown = calculateQuote({ basePrice: trim.basePriceVnd, colorSurcharge: color?.surchargeVnd ?? 0n, optionsTotal, discount: 0n, ...fees });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const quote = await this.prisma.quote.create({ data: { userId, config: { trimId: trim.id, colorId: color?.id ?? null, optionIds: opts.map((o) => o.id), province: input.province }, snapshot: { trim: trim.name, model: trim.model.name, color: color?.name ?? null, options: opts.map((o) => o.name), breakdown: Object.fromEntries(Object.entries(breakdown).map(([k, v]) => [k, v.toString()])) }, totalVnd: breakdown.onRoadTotal, expiresAt } });
    return { ...quote, totalVnd: quote.totalVnd.toString(), breakdown: Object.fromEntries(Object.entries(breakdown).map(([k, v]) => [k, v.toString()])) };
  }
}
