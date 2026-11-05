export const MAX_NEED_LENGTH = 600;
export const MAX_BUDGET_VND = 100_000_000_000;
export const MAX_RANGE_KM = 5_000;
export const MAX_SEATS = 20;

export interface VehiclePreferences {
  maxBudgetVnd?: number;
  minRangeKm?: number;
  minSeats?: number;
  category?: string;
  powertrain?: string;
}

export interface SupportedVehicleFilters {
  categories: readonly string[];
  powertrains: readonly string[];
}

export class InvalidPreferenceExtractionError extends Error {}
export class NoRecognizedPreferencesError extends Error {}

const ALLOWED_KEYS = new Set(['maxBudgetVnd', 'minRangeKm', 'minSeats', 'category', 'powertrain']);

export function parseVehiclePreferences(
  content: string,
  supported: SupportedVehicleFilters,
): VehiclePreferences {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new InvalidPreferenceExtractionError();
  }

  if (!isRecord(parsed)) throw new InvalidPreferenceExtractionError();
  const keys = Object.keys(parsed);
  if (keys.some((key) => !ALLOWED_KEYS.has(key))) throw new InvalidPreferenceExtractionError();

  const preferences: VehiclePreferences = {};
  if ('maxBudgetVnd' in parsed) {
    preferences.maxBudgetVnd = readInteger(parsed.maxBudgetVnd, 1, MAX_BUDGET_VND);
  }
  if ('minRangeKm' in parsed) {
    preferences.minRangeKm = readInteger(parsed.minRangeKm, 1, MAX_RANGE_KM);
  }
  if ('minSeats' in parsed) {
    preferences.minSeats = readInteger(parsed.minSeats, 1, MAX_SEATS);
  }
  if ('category' in parsed) {
    preferences.category = readSupportedString(parsed.category, supported.categories);
  }
  if ('powertrain' in parsed) {
    preferences.powertrain = readSupportedString(parsed.powertrain, supported.powertrains);
  }

  if (keys.length === 0) throw new NoRecognizedPreferencesError();
  return preferences;
}

function readInteger(value: unknown, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max) {
    throw new InvalidPreferenceExtractionError();
  }
  return value;
}

function readSupportedString(value: unknown, allowed: readonly string[]): string {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    throw new InvalidPreferenceExtractionError();
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
