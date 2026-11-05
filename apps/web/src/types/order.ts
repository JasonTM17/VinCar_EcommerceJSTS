export type Quote = {
  id: string;
  userId: string;
  totalVnd: string;
  expiresAt: string;
  status: string;
  config: {
    trimId: string;
    colorId?: string;
    optionIds?: string[];
    province?: string;
  };
};

export type Payment = {
  id: string;
  orderId: string;
  provider: string;
  amountVnd: string;
  status: string;
  providerRef?: string | null;
};

export type Order = {
  id: string;
  userId: string;
  quoteId: string;
  dealerId: string;
  amountVnd: string;
  depositVnd: string;
  status: string;
  idempotencyKey: string;
  createdAt: string;
  payments?: Payment[];
};
