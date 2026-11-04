export type MoneyVnd = bigint;

export interface QuoteInput {
  basePrice: MoneyVnd;
  colorSurcharge: MoneyVnd;
  optionsTotal: MoneyVnd;
  discount: MoneyVnd;
  registrationFee: MoneyVnd;
  plateFee: MoneyVnd;
  otherFees: MoneyVnd;
}

export interface QuoteBreakdown {
  vehicleBeforeDiscount: MoneyVnd;
  discount: MoneyVnd;
  vehicleAfterDiscount: MoneyVnd;
  registrationFee: MoneyVnd;
  plateFee: MoneyVnd;
  otherFees: MoneyVnd;
  onRoadTotal: MoneyVnd;
}

export function calculateQuote(input: QuoteInput): QuoteBreakdown {
  const vehicleBeforeDiscount = input.basePrice + input.colorSurcharge + input.optionsTotal;
  const discount = input.discount < 0n ? 0n : input.discount > vehicleBeforeDiscount ? vehicleBeforeDiscount : input.discount;
  const vehicleAfterDiscount = vehicleBeforeDiscount - discount;
  const onRoadTotal = vehicleAfterDiscount + input.registrationFee + input.plateFee + input.otherFees;
  return { vehicleBeforeDiscount, discount, vehicleAfterDiscount, registrationFee: input.registrationFee, plateFee: input.plateFee, otherFees: input.otherFees, onRoadTotal };
}

export type FinanceMethod = "EQUAL_PAYMENT" | "EQUAL_PRINCIPAL";

export interface FinanceInput {
  principal: MoneyVnd;
  annualRateBps: number;
  termMonths: number;
  method: FinanceMethod;
}

export interface ScheduleRow {
  month: number;
  payment: MoneyVnd;
  interest: MoneyVnd;
  principal: MoneyVnd;
  balanceAfter: MoneyVnd;
}

export interface FinanceResult {
  monthlyPayment: MoneyVnd;
  totalInterest: MoneyVnd;
  totalPayment: MoneyVnd;
  schedule: ScheduleRow[];
}

function roundHalfUp(x: number): bigint {
  return BigInt(Math.floor(x + 0.5));
}

export function calculateFinance(input: FinanceInput): FinanceResult {
  if (!Number.isInteger(input.termMonths) || input.termMonths <= 0) throw new Error("termMonths must be positive");
  if (input.principal <= 0n) throw new Error("principal must be positive");
  if (input.annualRateBps < 0) throw new Error("rate must be non-negative");
  const r = input.annualRateBps / 10_000 / 12;
  const n = input.termMonths;
  const P = Number(input.principal);
  const schedule: ScheduleRow[] = [];
  let balance = P;
  let totalInterest = 0n;
  if (r === 0) {
    const base = Math.floor(P / n);
    for (let i = 1; i <= n; i++) {
      const principal = i === n ? P - base * (n - 1) : base;
      balance -= principal;
      schedule.push({ month: i, payment: BigInt(principal), interest: 0n, principal: BigInt(principal), balanceAfter: BigInt(balance) });
    }
  } else if (input.method === "EQUAL_PAYMENT") {
    const m = (P * r) / (1 - Math.pow(1 + r, -n));
    const monthly = roundHalfUp(m);
    for (let i = 1; i <= n; i++) {
      const interest = roundHalfUp(balance * r);
      let principal = monthly - interest;
      if (i === n) principal = BigInt(balance);
      balance -= Number(principal);
      if (balance < 0) balance = 0;
      totalInterest += interest;
      schedule.push({ month: i, payment: interest + principal, interest, principal, balanceAfter: BigInt(balance) });
    }
  } else {
    const principalBase = roundHalfUp(P / n);
    for (let i = 1; i <= n; i++) {
      const interest = roundHalfUp(balance * r);
      let principal = i === n ? BigInt(balance) : principalBase;
      balance -= Number(principal);
      if (balance < 0) balance = 0;
      totalInterest += interest;
      schedule.push({ month: i, payment: interest + principal, interest, principal, balanceAfter: BigInt(balance) });
    }
  }
  const totalPayment = input.principal + totalInterest;
  return { monthlyPayment: schedule[0]?.payment ?? 0n, totalInterest, totalPayment, schedule };
}
