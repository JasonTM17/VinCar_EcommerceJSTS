import { BadRequestException, Injectable } from '@nestjs/common';
import { calculateQuote, type QuoteBreakdown } from '@autonova/pricing';
import { PrismaService } from '../prisma/prisma.service';

export interface ResolvedConfiguration {
  trim: {
    id: string;
    name: string;
    basePriceVnd: bigint;
    model: { name: string; category: string };
  };
  color: { id: string; name: string; surchargeVnd: bigint } | null;
  options: { id: string; name: string; priceVnd: bigint }[];
}

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  /** Loads a trim with its colors/options/model and rejects unknown selections. */
  async resolve(trimId: string, colorId?: string, optionIds: string[] = []): Promise<{ config: ResolvedConfiguration; errors: string[] }> {
    const trim = await this.prisma.vehicleTrim.findUnique({
      where: { id: trimId },
      include: { colors: true, options: true, model: true },
    });
    if (!trim) return { config: undefined as never, errors: ['Unknown trimId'] };

    const errors: string[] = [];
    const color = colorId ? trim.colors.find((c) => c.id === colorId) : trim.colors[0] ?? null;
    if (colorId && !color) errors.push('Selected color is not available for this trim');

    const knownOptionIds = new Set(trim.options.map((o) => o.id));
    const unknown = optionIds.filter((id) => !knownOptionIds.has(id));
    if (unknown.length > 0) errors.push(`Options not available for this trim: ${unknown.join(', ')}`);
    const options = trim.options.filter((o) => optionIds.includes(o.id));

    return {
      errors,
      config: {
        trim: { id: trim.id, name: trim.name, basePriceVnd: trim.basePriceVnd, model: { name: trim.model.name, category: trim.model.category } },
        color: color ? { id: color.id, name: color.name, surchargeVnd: color.surchargeVnd } : null,
        options: options.map((o) => ({ id: o.id, name: o.name, priceVnd: o.priceVnd })),
      },
    };
  }

  /** Fee rules come from OnRoadFeeRule rows with an effective-dated window, never from code. */
  async onRoad(input: { trimId: string; colorId?: string; optionIds?: string[]; province: string }) {
    const { config, errors } = await this.resolve(input.trimId, input.colorId, input.optionIds ?? []);
    if (errors.length > 0 || !config) throw new BadRequestException(errors.join('; '));

    const now = new Date();
    const rules = await this.prisma.onRoadFeeRule.findMany({
      where: {
        province: input.province,
        AND: [
          { OR: [{ category: config.trim.model.category }, { category: 'ALL' }] },
          { effectiveFrom: { lte: now } },
          { OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }] },
        ],
      },
    });
    if (rules.length === 0) throw new BadRequestException(`No fee rules configured for province "${input.province}"`);

    const fees = rules.reduce<Record<string, bigint>>((acc, rule) => {
      acc[rule.feeType] = (acc[rule.feeType] ?? 0n) + rule.amountVnd;
      return acc;
    }, {});

    const optionsTotal = config.options.reduce((sum, option) => sum + option.priceVnd, 0n);
    const breakdown = calculateQuote({
      basePrice: config.trim.basePriceVnd,
      colorSurcharge: config.color?.surchargeVnd ?? 0n,
      optionsTotal,
      discount: 0n,
      registrationFee: fees.REGISTRATION ?? 0n,
      plateFee: fees.PLATE ?? 0n,
      otherFees: fees.OTHER ?? 0n,
    });

    return {
      configuration: {
        trimId: config.trim.id,
        trimName: config.trim.name,
        modelName: config.trim.model.name,
        colorId: config.color?.id ?? null,
        colorName: config.color?.name ?? null,
        optionIds: config.options.map((o) => o.id),
      },
      fees: {
        registrationFeeVnd: (fees.REGISTRATION ?? 0n).toString(),
        plateFeeVnd: (fees.PLATE ?? 0n).toString(),
        otherFeesVnd: (fees.OTHER ?? 0n).toString(),
        ruleCount: rules.length,
      },
      breakdown: this.serialize(breakdown),
      estimated: true,
      disclaimer: 'Estimate only. The dealer’s signed quotation is the binding price.',
    };
  }

  serialize(breakdown: QuoteBreakdown) {
    return {
      vehicleBeforeDiscountVnd: breakdown.vehicleBeforeDiscount.toString(),
      discountVnd: breakdown.discount.toString(),
      vehicleAfterDiscountVnd: breakdown.vehicleAfterDiscount.toString(),
      registrationFeeVnd: breakdown.registrationFee.toString(),
      plateFeeVnd: breakdown.plateFee.toString(),
      otherFeesVnd: breakdown.otherFees.toString(),
      onRoadTotalVnd: breakdown.onRoadTotal.toString(),
    };
  }
}
