import { IsArray, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePromotionDto {
  @IsString()
  @MinLength(3)
  code!: string;

  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsIn(['PERCENTAGE', 'FIXED'])
  discountType!: 'PERCENTAGE' | 'FIXED';

  /** Basis points for PERCENTAGE, VND for FIXED. */
  @Type(() => Number)
  discountValue!: number;

  @IsOptional()
  @Type(() => Number)
  maxDiscountVnd?: number;

  @Type(() => Number)
  minVehiclePriceVnd!: number;

  @IsString()
  startsAt!: string;

  @IsString()
  endsAt!: string;

  @IsIn(['EXCLUSIVE', 'STACKABLE'])
  stacking!: 'EXCLUSIVE' | 'STACKABLE';

  @IsArray()
  @IsString({ each: true })
  modelIds!: string[];

  @IsArray()
  @IsString({ each: true })
  excludedTrimIds!: string[];
}
