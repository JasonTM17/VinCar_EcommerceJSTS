import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { type Dealer } from "@/types";
import { DealerCard } from "@/components/dealers/DealerCard";

export const dynamic = "force-dynamic";

export default async function Dealers({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; province?: string }>;
}) {
  const sp = searchParams ? await searchParams : {};
  let dealers: Dealer[] = [];

  try {
    dealers = await apiFetch<Dealer[]>("/dealers");
  } catch {
    dealers = [];
  }

  // Filter in memory for responsiveness
  const filteredDealers = dealers.filter((d) => {
    if (sp.province && d.province !== sp.province) return false;
    if (sp.q) {
      const query = sp.q.toLowerCase();
      return (
        d.name.toLowerCase().includes(query) ||
        d.address.toLowerCase().includes(query) ||
        d.city.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="border-b border-slate-200 pb-6 mb-8">
        <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-widest block mb-1">
          MẠNG LƯỚI PHỦ SÓNG TOÀN QUỐC
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#003F87] tracking-tight">
          Hệ Thống Showroom & Trạm Sạc V-GREEN
        </h1>
        <p className="mt-1 text-sm text-slate-500 max-w-2xl">
          Tìm kiếm Showroom 3S, Xưởng dịch vụ chính hãng và các điểm sạc siêu nhanh V-GREEN gần nhất trên khắp 63 tỉnh thành.
        </p>

        {/* Filter Form */}
        <form className="mt-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">
              search
            </span>
            <input
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="Tìm theo tên showroom, quận/huyện, địa chỉ..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:border-[#003F87] outline-none"
            />
          </div>

          <select
            name="province"
            defaultValue={sp.province ?? ""}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-700 font-medium focus:border-[#003F87] outline-none"
          >
            <option value="">Tất cả tỉnh thành</option>
            <option value="Ha Noi">Hà Nội</option>
            <option value="Ho Chi Minh">TP. Hồ Chí Minh</option>
            <option value="Da Nang">Đà Nẵng</option>
            <option value="Hai Phong">Hải Phòng</option>
            <option value="Can Tho">Cần Thơ</option>
          </select>

          <button
            type="submit"
            className="rounded-lg bg-[#003F87] hover:bg-[#002D62] px-6 py-2.5 text-xs font-bold text-white shadow transition-colors"
          >
            Tìm kiếm
          </button>

          {(sp.q || sp.province) && (
            <Link
              href="/dealers"
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Xem tất cả
            </Link>
          )}
        </form>
      </div>

      {/* Network Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-2xl font-extrabold text-[#003F87] block">150.000+</span>
          <span className="text-xs text-slate-500 mt-0.5 block">Cổng sạc V-GREEN toàn quốc</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-2xl font-extrabold text-[#00B4D8] block">360 kW</span>
          <span className="text-xs text-slate-500 mt-0.5 block">Công suất sạc siêu nhanh tối đa</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-2xl font-extrabold text-[#003F87] block">63 / 63</span>
          <span className="text-xs text-slate-500 mt-0.5 block">Tỉnh thành có showroom & xưởng dịch vụ</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-2xl font-extrabold text-[#00B4D8] block">24/7</span>
          <span className="text-xs text-slate-500 mt-0.5 block">Trạm sạc tự động mở cửa xuyên đêm</span>
        </div>
      </div>

      {/* Dealers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDealers.map((d) => (
          <DealerCard key={d.id} dealer={d} />
        ))}
      </div>

      {filteredDealers.length === 0 && (
        <div className="py-16 text-center text-slate-400">
          <span className="material-symbols-outlined text-5xl">storefront</span>
          <p className="mt-2 text-sm">Không tìm thấy showroom nào phù hợp với bộ lọc.</p>
        </div>
      )}
    </main>
  );
}
