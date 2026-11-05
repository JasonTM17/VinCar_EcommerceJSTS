import Link from "next/link";
import { apiFetch, type Vehicle } from "@/lib/api";
import { VehicleCard } from "@/components/vehicles/VehicleCard";

export const dynamic = "force-dynamic";

export default async function Vehicles({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  if (sp.q) qs.set("q", sp.q);
  if (sp.category) qs.set("category", sp.category);
  qs.set("page", sp.page ?? "1");

  let vehicles: Vehicle[] = [];
  let total = 0;

  try {
    const data = await apiFetch<{ data: Vehicle[]; meta: { total: number } }>(`/vehicles?${qs}`);
    vehicles = data.data;
    total = data.meta.total;
  } catch {
    vehicles = [];
    total = 0;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-8">
        <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-widest block mb-2">
          BỘ SƯU TẬP XE ĐIỆN THÔNG MINH
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#003F87] tracking-tight">
          Danh Sách Dòng Xe VinFast
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
          Được thiết kế tinh xảo bởi các studio hàng đầu thế giới (Pininfarina, Torino Design), trang bị công nghệ an toàn ADAS và hệ thống tiện nghi thông minh VF Connect.
        </p>

        {/* Filters Form */}
        <form className="mt-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">
              search
            </span>
            <input
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="Tìm theo tên xe (VF 3, VF 7, VF 8...)"
              className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#003F87] outline-none"
            />
          </div>

          <select
            name="category"
            defaultValue={sp.category ?? ""}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-700 font-medium focus:border-[#003F87] outline-none"
          >
            <option value="">Tất cả phân khúc</option>
            <option value="SUV">SUV điện</option>
            <option value="Sedan">Sedan điện</option>
          </select>

          <button
            type="submit"
            className="rounded-lg bg-[#003F87] hover:bg-[#002D62] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-colors"
          >
            Lọc kết quả
          </button>

          {(sp.q || sp.category) && (
            <Link
              href="/vehicles"
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Xóa bộ lọc
            </Link>
          )}
        </form>
      </div>

      {/* Grid of Vehicles */}
      {vehicles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 mt-8">
          <span className="material-symbols-outlined text-4xl text-slate-400">directions_car</span>
          <p className="mt-2 text-sm font-semibold text-slate-700">Không tìm thấy dòng xe phù hợp.</p>
          <Link href="/vehicles" className="mt-4 inline-block text-xs text-[#003F87] font-bold hover:underline">
            Xem toàn bộ xe
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      )}

      {/* Footer Stats */}
      <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-500">
        <span>Tổng cộng {total} dòng xe đang niêm yết</span>
        <span>Giá chưa bao gồm ưu đãi chiến dịch và các tùy chọn phụ kiện</span>
      </div>
    </main>
  );
}
