const DEFAULT_API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export type ApiFetchOptions = RequestInit & { token?: string | null };

export type ApiFetch = <T>(path: string, init?: ApiFetchOptions) => Promise<T>;

/**
 * Builds a typed JSON API client. The base URL is injectable so tests can point
 * it at a local stub server instead of the real backend.
 */
export function createApiFetch(baseUrl: string = DEFAULT_API): ApiFetch {
  return async <T>(path: string, init: ApiFetchOptions = {}): Promise<T> => {
    const { token, ...requestInit } = init;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((requestInit.headers as Record<string, string>) ?? {}),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${baseUrl}${path}`, {
      ...requestInit,
      headers,
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
    return res.json() as Promise<T>;
  };
}

export const apiFetch = createApiFetch();

// Core API entity types
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
