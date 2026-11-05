export type ExteriorColor = {
  id: string;
  name: string;
  hex: string;
  surchargeVnd: string;
};

export type TrimOption = {
  id: string;
  name: string;
  priceVnd: string;
};

export type VehicleTrim = {
  id: string;
  name: string;
  basePriceVnd: string;
  rangeKm: number;
  batteryKwh?: string | null;
  colors: ExteriorColor[];
  options: TrimOption[];
};

export type Vehicle = {
  id: string;
  name: string;
  slug: string;
  category: string;
  seats: number;
  powertrain: string;
  brand: { name: string };
  trims: VehicleTrim[];
};

export type RecommendationReasonCode =
  | "WITHIN_BASE_PRICE_BUDGET"
  | "MEETS_MINIMUM_RANGE"
  | "MEETS_MINIMUM_SEATS"
  | "MATCHES_VEHICLE_TYPE"
  | "MATCHES_POWERTRAIN";

export type VehicleRecommendation = {
  vehicleId: string;
  slug: string;
  name: string;
  brandName: string;
  category: string;
  seats: number;
  powertrain: string;
  trim: {
    id: string;
    name: string;
    basePriceVnd: string;
    rangeKm: number;
  };
  reasonCodes: RecommendationReasonCode[];
};

export type VehicleRecommendationResponse = {
  recommendations: VehicleRecommendation[];
};
