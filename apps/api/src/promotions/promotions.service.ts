import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePromotionDto } from './dto';

interface Candidate {
  promotion: { id: string; code: string; name: string; discountType: string; stacking: string };
  discountVnd: bigint;
}

export interface ResolvedPromotionSet {
  promotions: Array<{ id: string; code: string; name: string; discountType: string; stacking: string; discountVnd: string }>;
  discountVnd: bigint;
}

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePromotionDto) {
    return this.prisma.promotion.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        discountType: dto.discountType,
        discountValue: BigInt(dto.discountValue),
        maxDiscountVnd: dto.maxDiscountVnd === undefined ? null : BigInt(dto.maxDiscountVnd),
        minVehiclePriceVnd: BigInt(dto.minVehiclePriceVnd),
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        stacking: dto.stacking,
        models: { create: dto.modelIds.map((modelId) => ({ modelId })) },
        excludedTrims: { create: dto.excludedTrimIds.map((trimId) => ({ trimId })) },
      },
      include: { models: true, excludedTrims: true },
    });
  }

  /**
   * Applies the promotion rules server-side:
   * - EXCLUSIVE campaigns never combine with each other; only the best one wins.
   * - STACKABLE campaigns combine on top of the best EXCLUSIVE campaign.
   * - An explicit code that is unknown, inactive, expired or ineligible fails loudly
   *   instead of silently falling back to another campaign.
   */
  async resolveDiscounts(input: { modelId: string; trimId: string; vehiclePriceVnd: bigint; code?: string }): Promise<ResolvedPromotionSet> {
    const now = new Date();
    const candidates = await this.prisma.promotion.findMany({
      where: {
        status: 'ACTIVE',
        startsAt: { lte: now },
        endsAt: { gte: now },
        ...(input.code ? { code: input.code } : {}),
        OR: [{ models: { some: { modelId: input.modelId } } }, { models: { none: {} } }],
      },
      include: { excludedTrims: true },
    });

    const eligible: Candidate[] = candidates
      .filter((promotion) => !promotion.excludedTrims.some((excluded) => excluded.trimId === input.trimId))
      .filter((promotion) => input.vehiclePriceVnd >= promotion.minVehiclePriceVnd)
      .map((promotion) => ({
        promotion: {
          id: promotion.id,
          code: promotion.code,
          name: promotion.name,
          discountType: promotion.discountType,
          stacking: promotion.stacking,
        },
        discountVnd: this.computeDiscount(promotion, input.vehiclePriceVnd),
      }))
      .filter((entry) => entry.discountVnd > 0n)
      .sort((a, b) => (b.discountVnd > a.discountVnd ? 1 : -1));

    if (input.code && !eligible.some((entry) => entry.promotion.code === input.code)) {
      const exists = candidates.find((promotion) => promotion.code === input.code);
      if (!exists) throw new BadRequestException(`Unknown promotion code "${input.code}"`);
      if (exists.status !== 'ACTIVE') throw new BadRequestException(`Promotion "${input.code}" is not active`);
      if (exists.startsAt > now || exists.endsAt < now) throw new BadRequestException(`Promotion "${input.code}" is not within its validity window`);
      throw new BadRequestException(`Promotion "${input.code}" does not apply to this vehicle`);
    }

    let selected: Candidate[];
    if (input.code) {
      const requested = eligible.find((entry) => entry.promotion.code === input.code)!;
      selected = requested.promotion.stacking === 'STACKABLE'
        ? [requested, ...eligible.filter((entry) => entry.promotion.stacking === 'EXCLUSIVE' && entry.promotion.id !== requested.promotion.id)]
        : [requested];
    } else {
      const bestExclusive = eligible.find((entry) => entry.promotion.stacking === 'EXCLUSIVE') ?? null;
      const stackable = eligible.filter((entry) => entry.promotion.stacking === 'STACKABLE');
      selected = bestExclusive ? [bestExclusive, ...stackable] : stackable;
    }

    const raw = selected.reduce((sum, entry) => sum + entry.discountVnd, 0n);
    const discountVnd = raw > input.vehiclePriceVnd ? input.vehiclePriceVnd : raw;

    return {
      discountVnd,
      promotions: selected.map((entry) => ({ ...entry.promotion, discountVnd: entry.discountVnd.toString() })),
    };
  }

  private computeDiscount(
    promotion: { discountType: string; discountValue: bigint; maxDiscountVnd: bigint | null },
    vehiclePriceVnd: bigint,
  ): bigint {
    const raw = promotion.discountType === 'PERCENTAGE'
      ? (vehiclePriceVnd * promotion.discountValue) / 10_000n
      : promotion.discountValue;
    if (raw <= 0n) return 0n;
    const capped = promotion.maxDiscountVnd !== null && raw > promotion.maxDiscountVnd ? promotion.maxDiscountVnd : raw;
    return capped > vehiclePriceVnd ? vehiclePriceVnd : capped;
  }
}
