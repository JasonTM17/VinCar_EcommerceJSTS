import { formatKm } from "@/lib/formatters";

interface VehicleSpecsStripProps {
  rangeKm: number;
  batteryKwh?: string | null;
  seats: number;
  fastChargeMin?: number;
  powerHp?: number;
}

export function VehicleSpecsStrip({
  rangeKm,
  seats,
  fastChargeMin,
  powerHp,
}: VehicleSpecsStripProps) {
  return (
    <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 text-xs">
      <div>
        <span className="text-slate-400 block text-[11px]">Tầm di chuyển:</span>
        <strong className="text-[#003F87] text-sm">{formatKm(rangeKm)}</strong> / lần sạc
      </div>
      <div>
        {fastChargeMin ? (
          <>
            <span className="text-slate-400 block text-[11px]">Sạc siêu nhanh:</span>
            <strong className="text-[#003F87] text-sm">{fastChargeMin} phút (10-70%)</strong>
          </>
        ) : powerHp ? (
          <>
            <span className="text-slate-400 block text-[11px]">Công suất tối đa:</span>
            <strong className="text-[#003F87] text-sm">{powerHp} HP</strong>
          </>
        ) : (
          <>
            <span className="text-slate-400 block text-[11px]">Khoang hành khách:</span>
            <strong className="text-[#003F87] text-sm">{seats} chỗ ngồi</strong>
          </>
        )}
      </div>
    </div>
  );
}
