import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService, private readonly pricing: PricingService) {}

  async create(userId: string, input: { trimId: string; colorId?: string; optionIds?: string[]; province: string; promotionCode?: string }) {
    // Pricing is always re-derived on the server, including effective-dated fees
    // and promotions, so a quote can never be built from client-supplied amounts.
    const estimate = await this.pricing.onRoad({
      trimId: input.trimId,
      colorId: input.colorId,
      optionIds: input.optionIds ?? [],
      province: input.province,
      promotionCode: input.promotionCode,
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const quote = await this.prisma.quote.create({
      data: {
        userId,
        config: {
          trimId: input.trimId,
          colorId: input.colorId ?? null,
          optionIds: input.optionIds ?? [],
          province: input.province,
          promotionCode: input.promotionCode ?? null,
        },
        snapshot: {
          configuration: estimate.configuration,
          promotions: estimate.promotions,
          fees: estimate.fees,
          breakdown: estimate.breakdown,
        },
        totalVnd: BigInt(estimate.breakdown.onRoadTotalVnd),
        expiresAt,
      },
    });

    return {
      id: quote.id,
      totalVnd: quote.totalVnd.toString(),
      expiresAt: quote.expiresAt,
      configuration: estimate.configuration,
      promotions: estimate.promotions,
      fees: estimate.fees,
      breakdown: estimate.breakdown,
    };
  }

  async findOwned(id: string, userId: string) {
    const quote = await this.prisma.quote.findUnique({ where: { id } });
    if (!quote || quote.userId !== userId) throw new NotFoundException('Quote not found');
    return quote;
  }
}
