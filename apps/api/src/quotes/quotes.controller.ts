import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { QuotesService } from './quotes.service';
class QuoteDto {
  @IsString() trimId!: string;
  @IsOptional() @IsString() colorId?: string;
  @IsOptional() @IsArray() optionIds?: string[];
  @IsString() province!: string;
  @IsOptional() @IsString() promotionCode?: string;
}
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotes: QuotesService) {}
  @Post() @UseGuards(AuthGuard) create(@CurrentUser() user: any, @Body() dto: QuoteDto) { return this.quotes.create(user.sub, dto); }
}
