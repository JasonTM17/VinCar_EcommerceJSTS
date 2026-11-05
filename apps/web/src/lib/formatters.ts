/**
 * Currency & numerical formatters for the VinFast platform.
 */

export function formatVND(value: string | number | bigint | null | undefined): string {
  if (value === null || value === undefined || value === "") return "0 ₫";
  const num = typeof value === "bigint" ? value : BigInt(Math.round(Number(value)));
  return `${new Intl.NumberFormat("vi-VN").format(num)} ₫`;
}

export function formatNumber(value: number | string): string {
  return new Intl.NumberFormat("vi-VN").format(Number(value));
}

export function formatKm(km: number | string): string {
  return `${formatNumber(km)} km`;
}

export function formatPercent(rate: number): string {
  return `${rate.toFixed(1)}%`;
}
