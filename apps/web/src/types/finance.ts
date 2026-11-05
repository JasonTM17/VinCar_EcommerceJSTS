export type OnRoadResult = {
  configuration: {
    trimName: string;
    modelName: string;
    colorName: string | null;
    optionIds: string[];
  };
  fees: {
    registrationFeeVnd: string;
    plateFeeVnd: string;
    otherFeesVnd: string;
    ruleCount: number;
  };
  breakdown: {
    vehicleBeforeDiscountVnd: string;
    discountVnd: string;
    vehicleAfterDiscountVnd: string;
    registrationFeeVnd: string;
    plateFeeVnd: string;
    otherFeesVnd: string;
    onRoadTotalVnd: string;
  };
  disclaimer: string;
};

export type AmortizationItem = {
  month: number;
  paymentVnd: string;
  interestVnd: string;
  principalVnd: string;
  balanceAfterVnd: string;
};

export type FinanceResult = {
  monthlyPaymentVnd: string;
  totalInterestVnd: string;
  totalPaymentVnd: string;
  principalVnd: string;
  schedule: AmortizationItem[];
  disclaimer: string;
};
