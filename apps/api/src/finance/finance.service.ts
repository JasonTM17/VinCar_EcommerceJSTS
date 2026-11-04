import { BadRequestException, Injectable } from '@nestjs/common';
import { calculateFinance, type FinanceMethod } from '@autonova/pricing';
import type { SimulateFinanceDto } from './finance.controller';

@Injectable()
export class FinanceService {
  simulate(dto: SimulateFinanceDto) {
    const principal = this.parseMoney(dto.principalVnd, 'principalVnd');
    if (principal <= 0n) throw new BadRequestException('principalVnd must be positive');
    const result = calculateFinance({
      principal,
      annualRateBps: dto.annualRateBps,
      termMonths: dto.termMonths,
      method: dto.method as FinanceMethod,
    });
    return {
      principalVnd: principal.toString(),
      annualRateBps: dto.annualRateBps,
      termMonths: dto.termMonths,
      method: dto.method,
      monthlyPaymentVnd: result.schedule[0]?.payment.toString() ?? '0',
      totalInterestVnd: result.totalInterest.toString(),
      totalPaymentVnd: result.totalPayment.toString(),
      schedule: result.schedule.map((row) => ({
        month: row.month,
        paymentVnd: row.payment.toString(),
        interestVnd: row.interest.toString(),
        principalVnd: row.principal.toString(),
        balanceAfterVnd: row.balanceAfter.toString(),
      })),
      disclaimer: 'This is a simulation only and is not a loan approval or an offer of credit.',
    };
  }

  private parseMoney(value: string, field: string): bigint {
    if (!/^\d+$/.test(value)) throw new BadRequestException(`${field} must be a non-negative integer string`);
    return BigInt(value);
  }
}
