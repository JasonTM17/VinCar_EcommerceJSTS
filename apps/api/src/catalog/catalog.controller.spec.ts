import { PrismaService } from '../prisma/prisma.service';
import { CatalogController } from './catalog.controller';

describe('CatalogController', () => {
  const findMany = jest.fn();
  const count = jest.fn();
  const prisma = { vehicleModel: { findMany, count } } as unknown as PrismaService;
  const controller = new CatalogController(prisma);

  beforeEach(() => {
    findMany.mockReset().mockResolvedValue([]);
    count.mockReset().mockResolvedValue(0);
  });

  it.each([
    ['ordinary text', 'Nova', 'Nova'],
    ['percent wildcard', '%', '\\%'],
    ['underscore wildcard', '_', '\\_'],
    ['backslash escape', '\\', '\\\\'],
  ])('treats %s as literal search text', async (_case, query, expected) => {
    await controller.list(undefined, query);

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        status: 'PUBLISHED',
        name: { contains: expected, mode: 'insensitive' },
      },
    }));
  });

  it('keeps category filtering and pagination metadata', async () => {
    count.mockResolvedValue(8);

    const response = await controller.list('SUV', undefined, '2', '3');

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: 'PUBLISHED', category: 'SUV' },
      skip: 3,
      take: 3,
    }));
    expect(count).toHaveBeenCalledWith({ where: { status: 'PUBLISHED', category: 'SUV' } });
    expect(response.meta).toEqual({ page: 2, limit: 3, total: 8, pages: 3 });
  });

  it.each([
    ['fractional values', '1.5', '1.5'],
    ['non-finite values', '1e309', '1e309'],
  ])('falls back to safe defaults for %s', async (_case, page, limit) => {
    await controller.list(undefined, undefined, page, limit);

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 12 }));
  });

  it('does not send an unsafe offset to Prisma', async () => {
    const response = await controller.list(undefined, undefined, '9007199254740991', '50');

    expect(findMany).not.toHaveBeenCalled();
    expect(response.data).toEqual([]);
    expect(response.meta).toEqual({ page: Number.MAX_SAFE_INTEGER, limit: 50, total: 0, pages: 0 });
  });
});
