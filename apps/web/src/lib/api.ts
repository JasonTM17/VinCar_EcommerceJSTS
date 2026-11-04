const DEFAULT_API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export type ApiFetch = <T>(path: string, init?: RequestInit) => Promise<T>;

/**
 * Builds a typed JSON API client. The base URL is injectable so tests can point
 * it at a local stub server instead of the real backend.
 */
export function createApiFetch(baseUrl: string = DEFAULT_API): ApiFetch {
  return async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
    return res.json() as Promise<T>;
  };
}

export const apiFetch = createApiFetch();

export type Vehicle = {
  id: string;
  name: string;
  slug: string;
  category: string;
  seats: number;
  powertrain: string;
  brand: { name: string };
  trims: {
    id: string;
    name: string;
    basePriceVnd: string;
    rangeKm: number;
    colors: { id: string; name: string; hex: string; surchargeVnd: string }[];
    options: { id: string; name: string; priceVnd: string }[];
  }[];
};
