import { Body, Controller, Post } from '@nestjs/common';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { PricingService } from './pricing.service';

export class ConfigurationDto {
  @IsString()
  trimId!: string;

  @IsOptional()
  @IsString()
  colorId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  optionIds?: string[];
}

@Controller()
export class PricingController {
  constructor(private readonly pricing: PricingService) {}

  @Post('configurations/validate')
  async validate(@Body() dto: ConfigurationDto) {
    const { config, errors } = await this.pricing.resolve(dto.trimId, dto.colorId, dto.optionIds ?? []);
    return {
      valid: errors.length === 0,
      errors,
      normalized: errors.length === 0
        ? {
            trimId: config.trim.id,
            colorId: config.color?.id ?? null,
            optionIds: config.options.map((o) => o.id),
          }
        : null,
    };
  }

  @Post('on-road/simulate')
  onRoad(@Body() dto: ConfigurationDto & { province: string }) {
    return this.pricing.onRoad(dto);
  }
}
