import Link from "next/link";
import { type Dealer } from "@/types";

interface DealerCardProps {
  dealer: Dealer;
}

export function DealerCard({ dealer }: DealerCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-bold text-[#003F87] leading-snug">{dealer.name}</h3>
          <span className="px-2 py-0.5 rounded bg-blue-50 text-[#003F87] font-bold text-[10px] shrink-0 border border-blue-100 uppercase">
            {dealer.city}
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          <span className="material-symbols-outlined text-sm text-slate-400 mr-1 align-sub">
            location_on
          </span>
          {dealer.address}
        </p>

        <div className="space-y-1.5 text-xs text-slate-600 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-emerald-600">call</span>
            <span>Hotline: <strong>{dealer.phone}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-slate-400">schedule</span>
            <span>Giờ mở cửa: 08:00 — 21:00 (Tất cả các ngày)</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-[11px] text-[#00B4D8] font-semibold">
            <span className="material-symbols-outlined text-sm">ev_station</span>
            <span>Có trạm sạc siêu nhanh V-GREEN</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <Link
          href={`/test-drive`}
          className="bg-[#003F87] hover:bg-[#002D62] text-white font-bold py-2.5 rounded-lg text-center transition-colors shadow-sm"
        >
          Lái thử tại đây
        </Link>
        <a
          href={`tel:${dealer.phone}`}
          className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 rounded-lg text-center transition-colors"
        >
          Gọi tư vấn
        </a>
      </div>
    </div>
  );
}
