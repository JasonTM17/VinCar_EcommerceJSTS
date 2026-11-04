import { Body, Controller, Post } from '@nestjs/common';
import { IsIn, IsInt, IsString, Max, Min } from 'class-validator';
import { FinanceService } from './finance.service';

export type FinanceMethod = 'EQUAL_PAYMENT' | 'EQUAL_PRINCIPAL';

export class SimulateFinanceDto {
  /** Loan principal in VND. Sent as a string so no precision is lost in JSON. */
  @IsString()
  principalVnd!: string;

  /** Annual interest rate in basis points, e.g. 750 = 7.5%. */
  @IsInt()
  @Min(0)
  @Max(100000)
  annualRateBps!: number;

  @IsInt()
  @Min(1)
  @Max(120)
  termMonths!: number;

  @IsIn(['EQUAL_PAYMENT', 'EQUAL_PRINCIPAL'])
  method!: FinanceMethod;
}

@Controller('finance')
export class FinanceController {
  constructor(private readonly finance: FinanceService) {}

  @Post('simulate')
  simulate(@Body() dto: SimulateFinanceDto) {
    return this.finance.simulate(dto);
  }
}
