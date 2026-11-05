import {
  InvalidPreferenceExtractionError,
  NoRecognizedPreferencesError,
  parseVehiclePreferences,
} from './preferences';

describe('parseVehiclePreferences', () => {
  const supported = { categories: ['SUV'], powertrains: ['Electric'] };

  it('accepts only recognized, bounded constraints', () => {
    expect(parseVehiclePreferences(
      '{"maxBudgetVnd":1200000000,"minRangeKm":400,"minSeats":5,"category":"SUV","powertrain":"Electric"}',
      supported,
    )).toEqual({
      maxBudgetVnd: 1_200_000_000,
      minRangeKm: 400,
      minSeats: 5,
      category: 'SUV',
      powertrain: 'Electric',
    });
  });

  it.each([
    'not json',
    '[]',
    'null',
    '{"maxBudgetVnd":"1200000000"}',
    '{"maxBudgetVnd":1200000000.5}',
    '{"maxBudgetVnd":100000000001}',
    '{"minRangeKm":0}',
    '{"minSeats":21}',
    '{"category":"FLYING_CAR"}',
    '{"powertrain":null}',
    '{"maxBudgetVnd":1000000000,"vehicleName":"Invented Model"}',
    '{"maxBudgetVnd":1000000000,"price":"0 VND"}',
  ])('rejects malformed or unauthorized output: %s', (content) => {
    expect(() => parseVehiclePreferences(content, supported)).toThrow(InvalidPreferenceExtractionError);
  });

  it('rejects an empty extraction as an unrecognized need', () => {
    expect(() => parseVehiclePreferences('{}', supported)).toThrow(NoRecognizedPreferencesError);
  });
});
