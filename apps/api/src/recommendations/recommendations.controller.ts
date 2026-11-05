import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { MAX_NEED_LENGTH } from './preferences';
import { RecommendationsService } from './recommendations.service';

export class RecommendationRequestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_NEED_LENGTH)
  need!: string;
}

@Controller('recommendations')
@UseGuards(ThrottlerGuard)
export class RecommendationsController {
  constructor(private readonly recommendations: RecommendationsService) {}

  @Post()
  @Throttle({ default: { limit: 6, ttl: 60_000 } })
  recommend(@Body() request: RecommendationRequestDto) {
    return this.recommendations.recommend(request.need);
  }
}
