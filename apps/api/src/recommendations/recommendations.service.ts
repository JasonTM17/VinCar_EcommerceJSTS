import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  InvalidPreferenceExtractionError,
  MAX_NEED_LENGTH,
  NoRecognizedPreferencesError,
  parseVehiclePreferences,
} from './preferences';
import { LongCatClient } from './longcat.client';

const EXTRACTION_UNAVAILABLE = 'Vehicle recommendations are temporarily unavailable.';
const NO_PREFERENCE_MESSAGE = 'Please include a budget, range, seating, vehicle type, or powertrain preference.';

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly longCat: LongCatClient,
  ) {}

  async recommend(need: string) {
    const normalizedNeed = typeof need === 'string' ? need.trim() : '';
    if (!normalizedNeed || normalizedNeed.length > MAX_NEED_LENGTH) {
      throw new BadRequestException(`Please provide a vehicle need of 1-${MAX_NEED_LENGTH} characters.`);
    }

    const publishedFacets = await this.prisma.vehicleModel.findMany({
      where: { status: 'PUBLISHED' },
      select: { category: true, powertrain: true },
    });
    if (publishedFacets.length === 0) return { recommendations: [] };

    const supported = {
      categories: [...new Set(publishedFacets.map((vehicle) => vehicle.category))].sort(),
      powertrains: [...new Set(publishedFacets.map((vehicle) => vehicle.powertrain))].sort(),
    };

    let preferences;
    try {
      const extraction = await this.longCat.extractPreferences(normalizedNeed, supported);
      preferences = parseVehiclePreferences(extraction, supported);
    } catch (error) {
      if (error instanceof NoRecognizedPreferencesError) {
        throw new BadRequestException(NO_PREFERENCE_MESSAGE);
      }
      if (error instanceof InvalidPreferenceExtractionError) {
        throw new ServiceUnavailableException(EXTRACTION_UNAVAILABLE);
      }
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException(EXTRACTION_UNAVAILABLE);
    }

    const trimWhere: Prisma.VehicleTrimWhereInput = {
      ...(preferences.maxBudgetVnd === undefined
        ? {}
        : { basePriceVnd: { lte: BigInt(preferences.maxBudgetVnd) } }),
      ...(preferences.minRangeKm === undefined ? {} : { rangeKm: { gte: preferences.minRangeKm } }),
    };
    const modelWhere: Prisma.VehicleModelWhereInput = {
      status: 'PUBLISHED',
      ...(preferences.category === undefined ? {} : { category: preferences.category }),
      ...(preferences.powertrain === undefined ? {} : { powertrain: preferences.powertrain }),
      ...(preferences.minSeats === undefined ? {} : { seats: { gte: preferences.minSeats } }),
      trims: { some: trimWhere },
    };
    const priceFirst = preferences.maxBudgetVnd !== undefined || preferences.minRangeKm === undefined;
    const trimOrderBy: Prisma.VehicleTrimOrderByWithRelationInput[] = priceFirst
      ? [{ basePriceVnd: 'asc' }, { rangeKm: 'desc' }, { name: 'asc' }]
      : [{ rangeKm: 'desc' }, { basePriceVnd: 'asc' }, { name: 'asc' }];

    const vehicles = await this.prisma.vehicleModel.findMany({
      where: modelWhere,
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        seats: true,
        powertrain: true,
        brand: { select: { name: true } },
        trims: {
          where: trimWhere,
          orderBy: trimOrderBy,
          select: { id: true, name: true, basePriceVnd: true, rangeKm: true },
        },
      },
      orderBy: { slug: 'asc' },
    });

    const ranked = vehicles.flatMap((vehicle) => {
      const trim = vehicle.trims[0];
      return trim ? [{ vehicle, trim }] : [];
    });
    ranked.sort((a, b) => compareCandidates(a, b, preferences, priceFirst));

    return {
      recommendations: ranked.slice(0, 3).map(({ vehicle, trim }) => ({
        vehicleId: vehicle.id,
        slug: vehicle.slug,
        name: vehicle.name,
        brandName: vehicle.brand.name,
        category: vehicle.category,
        seats: vehicle.seats,
        powertrain: vehicle.powertrain,
        trim: {
          id: trim.id,
          name: trim.name,
          basePriceVnd: trim.basePriceVnd.toString(),
          rangeKm: trim.rangeKm,
        },
        reasonCodes: buildReasonCodes(vehicle, trim, preferences),
      })),
    };
  }
}

function compareCandidates(
  a: { vehicle: { slug: string }; trim: { name: string; basePriceVnd: bigint; rangeKm: number } },
  b: { vehicle: { slug: string }; trim: { name: string; basePriceVnd: bigint; rangeKm: number } },
  preferences: { maxBudgetVnd?: number; minRangeKm?: number },
  priceFirst: boolean,
): number {
  const primary = priceFirst
    ? compareBigInt(a.trim.basePriceVnd, b.trim.basePriceVnd)
    : b.trim.rangeKm - a.trim.rangeKm;
  if (primary !== 0) return primary;

  const secondary = priceFirst
    ? b.trim.rangeKm - a.trim.rangeKm
    : compareBigInt(a.trim.basePriceVnd, b.trim.basePriceVnd);
  if (secondary !== 0) return secondary;
  const slugOrder = a.vehicle.slug.localeCompare(b.vehicle.slug);
  return slugOrder !== 0 ? slugOrder : a.trim.name.localeCompare(b.trim.name);
}

function compareBigInt(a: bigint, b: bigint): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function buildReasonCodes(
  vehicle: { category: string; seats: number; powertrain: string },
  trim: { basePriceVnd: bigint; rangeKm: number },
  preferences: { maxBudgetVnd?: number; minRangeKm?: number; minSeats?: number; category?: string; powertrain?: string },
): string[] {
  const reasons: string[] = [];
  if (preferences.maxBudgetVnd !== undefined && trim.basePriceVnd <= BigInt(preferences.maxBudgetVnd)) {
    reasons.push('WITHIN_BASE_PRICE_BUDGET');
  }
  if (preferences.minRangeKm !== undefined && trim.rangeKm >= preferences.minRangeKm) {
    reasons.push('MEETS_MINIMUM_RANGE');
  }
  if (preferences.minSeats !== undefined && vehicle.seats >= preferences.minSeats) {
    reasons.push('MEETS_MINIMUM_SEATS');
  }
  if (preferences.category !== undefined && vehicle.category === preferences.category) {
    reasons.push('MATCHES_VEHICLE_TYPE');
  }
  if (preferences.powertrain !== undefined && vehicle.powertrain === preferences.powertrain) {
    reasons.push('MATCHES_POWERTRAIN');
  }
  return reasons;
}
