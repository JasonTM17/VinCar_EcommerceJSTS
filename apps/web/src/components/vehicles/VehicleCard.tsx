import Link from "next/link";
import { type Vehicle } from "@/types";
import { getCarImage } from "@/lib/car-assets";
import { formatVND } from "@/lib/formatters";
import { VehicleSpecsStrip } from "./VehicleSpecsStrip";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const minTrim = vehicle.trims[0];
  const minPrice = minTrim?.basePriceVnd ? formatVND(minTrim.basePriceVnd) : "0 ₫";
  const maxRange = Math.max(...vehicle.trims.map((t) => t.rangeKm), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Visual */}
      <div className="relative bg-slate-50 p-6 overflow-hidden h-52 flex items-center justify-center">
        <span className="absolute top-4 left-4 bg-[#003F87] text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide">
          {vehicle.category} • {vehicle.seats} chỗ
        </span>
        <img
          src={getCarImage(vehicle.slug)}
          alt={vehicle.name}
          className="max-h-40 object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Info */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-[#003F87]">{vehicle.name}</h2>
            <span className="text-[11px] font-semibold text-slate-400">{vehicle.powertrain}</span>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            {vehicle.brand.name} • Động cơ điện thông minh • Bảo hành 10 năm
          </p>

          <VehicleSpecsStrip rangeKm={maxRange} seats={vehicle.seats} />

          <div className="bg-slate-50 p-3 rounded-lg mb-6">
            <span className="text-slate-400 text-xs block">Giá khởi điểm từ:</span>
            <span className="text-xl font-extrabold text-[#003F87]">{minPrice}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <Link
            href={`/vehicles/${vehicle.slug}`}
            className="border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-2.5 rounded text-center transition-colors"
          >
            Chi tiết xe
          </Link>
          <Link
            href={`/configurator?model=${vehicle.slug}`}
            className="bg-[#003F87] hover:bg-[#002D62] text-white font-bold py-2.5 rounded text-center transition-colors shadow-sm"
          >
            Đặt cọc ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
