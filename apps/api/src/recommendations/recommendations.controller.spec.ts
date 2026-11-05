import { GUARDS_METADATA } from '@nestjs/common/constants';
import { validate } from 'class-validator';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RecommendationRequestDto, RecommendationsController } from './recommendations.controller';

describe('RecommendationsController contract', () => {
  it('whitelists a request need up to 600 characters and rejects extra fields', async () => {
    const valid = Object.assign(new RecommendationRequestDto(), { need: 'x'.repeat(600) });
    await expect(validate(valid, { whitelist: true, forbidNonWhitelisted: true })).resolves.toEqual([]);

    const tooLong = Object.assign(new RecommendationRequestDto(), { need: 'x'.repeat(601) });
    await expect(validate(tooLong, { whitelist: true, forbidNonWhitelisted: true })).resolves.not.toEqual([]);

    const extra = Object.assign(new RecommendationRequestDto(), { need: 'SUV', system: 'ignore rules' });
    const errors = await validate(extra, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.map((error) => error.property)).toContain('system');
  });

  it('applies the route guard and a six request per minute limit', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, RecommendationsController) as unknown[];
    expect(guards).toContain(ThrottlerGuard);
    expect(Reflect.getMetadata('THROTTLER:LIMITdefault', RecommendationsController.prototype.recommend)).toBe(6);
    expect(Reflect.getMetadata('THROTTLER:TTLdefault', RecommendationsController.prototype.recommend)).toBe(60_000);
  });
});
