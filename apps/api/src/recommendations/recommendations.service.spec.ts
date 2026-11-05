import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LongCatClient } from './longcat.client';
import { RecommendationsService } from './recommendations.service';

describe('RecommendationsService', () => {
  const findMany = jest.fn();
  const prisma = { vehicleModel: { findMany } } as unknown as PrismaService;
  const longCat = { extractPreferences: jest.fn() } as unknown as LongCatClient;
  const service = new RecommendationsService(prisma, longCat);
  const facets = [{ category: 'SUV', powertrain: 'Electric' }];

  beforeEach(() => {
    findMany.mockReset();
    (longCat.extractPreferences as jest.Mock).mockReset();
  });

  it('applies validated hard constraints to published models and trims', async () => {
    (longCat.extractPreferences as jest.Mock).mockResolvedValue(
      '{"maxBudgetVnd":1000000000,"minRangeKm":400,"minSeats":5,"category":"SUV","powertrain":"Electric"}',
    );
    findMany.mockResolvedValueOnce(facets).mockResolvedValueOnce([
      vehicle('matched', 'match', 800_000_000n, 500),
    ]);

    const response = await service.recommend('xe gia dinh duoi 1 ty, chay dien, tam 400 km');

    expect(findMany).toHaveBeenNthCalledWith(1, {
      where: { status: 'PUBLISHED' },
      select: { category: true, powertrain: true },
    });
    const candidateQuery = findMany.mock.calls[1][0];
    expect(candidateQuery.where).toEqual({
      status: 'PUBLISHED',
      category: 'SUV',
      powertrain: 'Electric',
      seats: { gte: 5 },
      trims: { some: { basePriceVnd: { lte: 1_000_000_000n }, rangeKm: { gte: 400 } } },
    });
    expect(candidateQuery.select.trims.where).toEqual({
      basePriceVnd: { lte: 1_000_000_000n },
      rangeKm: { gte: 400 },
    });
    expect(response.recommendations).toEqual([{
      vehicleId: 'matched',
      slug: 'match',
      name: 'Vehicle match',
      brandName: 'AutoNova',
      category: 'SUV',
      seats: 5,
      powertrain: 'Electric',
      trim: { id: 'matched-trim', name: 'Standard', basePriceVnd: '800000000', rangeKm: 500 },
      reasonCodes: [
        'WITHIN_BASE_PRICE_BUDGET',
        'MEETS_MINIMUM_RANGE',
        'MEETS_MINIMUM_SEATS',
        'MATCHES_VEHICLE_TYPE',
        'MATCHES_POWERTRAIN',
      ],
    }]);
  });

  it('chooses one trim per model and ranks within budget deterministically, capped at three models', async () => {
    (longCat.extractPreferences as jest.Mock).mockResolvedValue('{"maxBudgetVnd":1000000000}');
    findMany.mockResolvedValueOnce(facets).mockResolvedValueOnce([
      vehicle('zeta', 'zeta', 800_000_000n, 500),
      vehicle('alpha', 'alpha', 800_000_000n, 600, [
        { id: 'alpha-standard', name: 'Standard', basePriceVnd: 800_000_000n, rangeKm: 500 },
        { id: 'alpha-premium', name: 'Premium', basePriceVnd: 900_000_000n, rangeKm: 700 },
      ]),
      vehicle('beta', 'beta', 700_000_000n, 450),
      vehicle('gamma', 'gamma', 900_000_000n, 800),
    ]);

    const response = await service.recommend('xe duoi 1 ty');

    expect(response.recommendations.map((item) => item.slug)).toEqual(['beta', 'alpha', 'zeta']);
    expect(response.recommendations).toHaveLength(3);
    expect(new Set(response.recommendations.map((item) => item.vehicleId)).size).toBe(3);
    expect(response.recommendations[1].trim).toEqual({
      id: 'alpha-standard', name: 'Standard', basePriceVnd: '800000000', rangeKm: 500,
    });
  });

  it('ranks by greater range without budget, then by price and stable slug', async () => {
    (longCat.extractPreferences as jest.Mock).mockResolvedValue('{"minRangeKm":400}');
    findMany.mockResolvedValueOnce(facets).mockResolvedValueOnce([
      vehicle('zeta', 'zeta', 600_000_000n, 500),
      vehicle('alpha', 'alpha', 800_000_000n, 500),
      vehicle('range', 'range', 900_000_000n, 700),
    ]);

    const response = await service.recommend('xe tam xa');

    expect(response.recommendations.map((item) => item.slug)).toEqual(['range', 'zeta', 'alpha']);
  });

  it('selects the lowest-price trim when only model-level filters are requested', async () => {
    (longCat.extractPreferences as jest.Mock).mockResolvedValue('{"minSeats":5}');
    findMany.mockResolvedValueOnce(facets).mockResolvedValueOnce([
      vehicle('family', 'family', 900_000_000n, 700, [
        { id: 'family-entry', name: 'Entry', basePriceVnd: 700_000_000n, rangeKm: 400 },
        { id: 'family-premium', name: 'Premium', basePriceVnd: 900_000_000n, rangeKm: 700 },
      ]),
    ]);

    const response = await service.recommend('xe 5 cho');

    expect(findMany.mock.calls[1][0].select.trims.orderBy).toEqual([
      { basePriceVnd: 'asc' }, { rangeKm: 'desc' }, { name: 'asc' },
    ]);
    expect(response.recommendations[0].trim.id).toBe('family-entry');
  });

  it('returns no fabricated results for an empty published catalog', async () => {
    findMany.mockResolvedValueOnce([]);

    await expect(service.recommend('xe gia dinh')).resolves.toEqual({ recommendations: [] });
    expect(longCat.extractPreferences).not.toHaveBeenCalled();
    expect(findMany).toHaveBeenCalledTimes(1);
  });

  it('rejects malformed provider output without querying candidate vehicle details', async () => {
    (longCat.extractPreferences as jest.Mock).mockResolvedValue(
      '{"maxBudgetVnd":1000000000,"vehicleName":"Invented Model","price":1}',
    );
    findMany.mockResolvedValueOnce(facets);

    await expect(service.recommend('xe duoi 1 ty')).rejects.toThrow(ServiceUnavailableException);
    expect(findMany).toHaveBeenCalledTimes(1);
  });

  it('asks for a clearer need when the extraction contains no constraints', async () => {
    (longCat.extractPreferences as jest.Mock).mockResolvedValue('{}');
    findMany.mockResolvedValueOnce(facets);

    await expect(service.recommend('xe tot nhat')).rejects.toThrow(BadRequestException);
    expect(findMany).toHaveBeenCalledTimes(1);
  });

  it('rejects overlong text before making database or provider calls', async () => {
    await expect(service.recommend('x'.repeat(601))).rejects.toThrow(BadRequestException);
    expect(findMany).not.toHaveBeenCalled();
    expect(longCat.extractPreferences).not.toHaveBeenCalled();
  });
});

function vehicle(
  id: string,
  slug: string,
  price: bigint,
  rangeKm: number,
  trims = [{ id: `${id}-trim`, name: 'Standard', basePriceVnd: price, rangeKm }],
) {
  return {
    id,
    slug,
    name: `Vehicle ${slug}`,
    category: 'SUV',
    seats: 5,
    powertrain: 'Electric',
    brand: { name: 'AutoNova' },
    trims,
  };
}
