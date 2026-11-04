import assert from "node:assert/strict";
import test from "node:test";
import { calculateFinance, calculateQuote } from "./index.js";

test("quote clamps discount and sums fees", () => {
  const q = calculateQuote({ basePrice: 100n, colorSurcharge: 10n, optionsTotal: 5n, discount: 999n, registrationFee: 10n, plateFee: 1n, otherFees: 2n });
  assert.equal(q.vehicleBeforeDiscount, 115n);
  assert.equal(q.discount, 115n);
  assert.equal(q.vehicleAfterDiscount, 0n);
  assert.equal(q.onRoadTotal, 13n);
});

test("finance zero interest divides principal", () => {
  const f = calculateFinance({ principal: 100_000n, annualRateBps: 0, termMonths: 4, method: "EQUAL_PAYMENT" });
  assert.equal(f.totalInterest, 0n);
  assert.equal(f.totalPayment, 100_000n);
  assert.equal(f.schedule.at(-1)?.balanceAfter, 0n);
});

test("finance rejects invalid term", () => {
  assert.throws(() => calculateFinance({ principal: 1n, annualRateBps: 500, termMonths: 0, method: "EQUAL_PRINCIPAL" }));
});

test("finance equal principal rounds final month", () => {
  const f = calculateFinance({ principal: 100_003n, annualRateBps: 1200, termMonths: 3, method: "EQUAL_PRINCIPAL" });
  assert.equal(f.schedule.at(-1)?.balanceAfter, 0n);
  assert.equal(f.schedule.reduce((s, r) => s + r.principal, 0n), 100_003n);
});
