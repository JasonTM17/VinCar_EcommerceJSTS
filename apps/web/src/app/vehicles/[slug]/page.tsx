import Link from "next/link";
import { apiFetch, type Vehicle } from "@/lib/api";
import { getCarImage } from "@/lib/car-assets";

export const dynamic = "force-dynamic";

export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let vehicle: Vehicle | null = null;

  try {
    vehicle = await apiFetch<Vehicle>(`/vehicles/${slug}`);
  } catch {
    vehicle = null;
  }

  if (!vehicle) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="material-symbols-outlined text-5xl text-slate-400">no_crash</span>
        <h1 className="mt-4 text-2xl font-bold text-slate-800">Không tìm thấy mẫu xe này</h1>
        <p className="mt-2 text-sm text-slate-500">Mẫu xe không tồn tại hoặc đã ngừng kinh doanh.</p>
        <Link href="/vehicles" className="mt-6 inline-block bg-[#003F87] text-white text-xs font-bold px-6 py-2.5 rounded-lg">
          Về danh sách xe
        </Link>
      </main>
    );
  }

  const minPrice = vehicle.trims[0]?.basePriceVnd
    ? Number(vehicle.trims[0].basePriceVnd).toLocaleString("vi-VN")
    : "0";
  const carImage = getCarImage(vehicle.slug);

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Top Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Link href="/" className="hover:text-[#003F87]">Trang chủ</Link>
            <span>/</span>
            <Link href="/vehicles" className="hover:text-[#003F87]">Ô tô điện</Link>
            <span>/</span>
            <span className="text-[#003F87] font-semibold">{vehicle.name}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href={`/test-drive`} className="text-[#003F87] font-bold hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">schedule</span>
              Đăng ký lái thử
            </Link>
          </div>
        </div>
      </div>

      {/* Main Showcase Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Visual Showcase (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex items-center justify-center relative overflow-hidden min-h-[360px] sm:min-h-[460px]">
              <span className="absolute top-4 left-4 bg-[#003F87] text-white text-[10px] font-bold px-2.5 py-1 rounded tracking-wider">
                {vehicle.category} • {vehicle.seats} CHỖ
              </span>
              <img
                src={carImage}
                alt={vehicle.name}
                className="max-h-72 sm:max-h-80 w-auto object-contain transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur text-white text-[11px] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#00B4D8]">360</span>
                <span>Góc nhìn 360 độ</span>
              </div>
            </div>

            {/* Core Tech Specs Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <span className="material-symbols-outlined text-[#003F87] text-2xl mb-1">speed</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Tầm di chuyển</span>
                <strong className="text-base text-[#003F87] font-extrabold">{vehicle.trims[0]?.rangeKm ?? 400} km</strong>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <span className="material-symbols-outlined text-[#00B4D8] text-2xl mb-1">battery_charging_full</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Pin LFP an toàn</span>
                <strong className="text-base text-[#003F87] font-extrabold">Chống nước IP67</strong>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <span className="material-symbols-outlined text-[#003F87] text-2xl mb-1">airline_seat_recline_normal</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Số chỗ ngồi</span>
                <strong className="text-base text-[#003F87] font-extrabold">{vehicle.seats} Ghế rộng rãi</strong>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <span className="material-symbols-outlined text-[#00B4D8] text-2xl mb-1">verified_user</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Bảo hành xe</span>
                <strong className="text-base text-[#003F87] font-extrabold">10 Năm / 200.000 km</strong>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-[#003F87]">Công nghệ & Tiện nghi vượt trội</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="material-symbols-outlined text-[#003F87] text-xl">smart_toy</span>
                  <div>
                    <strong className="block text-slate-900 mb-0.5">Trợ lý ảo VinFast Vivi</strong>
                    Hỗ trợ điều khiển giọng nói tiếng Việt đa vùng miền, tích hợp AI tạo sinh thông minh.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="material-symbols-outlined text-[#003F87] text-xl">security</span>
                  <div>
                    <strong className="block text-slate-900 mb-0.5">Hệ thống trợ lái ADAS</strong>
                    Cảnh báo điểm mù, hỗ trợ giữ làn khẩn cấp, phanh tự động phía trước và camera 360.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="material-symbols-outlined text-[#003F87] text-xl">ev_station</span>
                  <div>
                    <strong className="block text-slate-900 mb-0.5">Mạng lưới sạc V-GREEN</strong>
                    Sạc pin miễn phí đến 2026 tại hơn 150.000 cổng sạc trên toàn bộ 63 tỉnh thành.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="material-symbols-outlined text-[#003F87] text-xl">home_repair_service</span>
                  <div>
                    <strong className="block text-slate-900 mb-0.5">Mobile Service lưu động</strong>
                    Đội ngũ kỹ thuật viên phục vụ bảo dưỡng và sửa chữa tận nhà hoặc nơi làm việc.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Trims Selector (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <span className="text-[10px] font-bold text-[#00B4D8] uppercase tracking-wider block mb-1">
                {vehicle.brand.name} VIỆT NAM
              </span>
              <h1 className="text-3xl font-extrabold text-[#003F87] mb-2">{vehicle.name}</h1>
              <p className="text-xs text-slate-500 mb-6">
                Chính sách miễn 100% lệ phí trước bạ theo quy định của Chính phủ dành cho xe thuần điện.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
                <span className="text-xs text-slate-500 block mb-1">Giá bán niêm yết từ:</span>
                <div className="text-3xl font-extrabold text-[#003F87]">{minPrice} ₫</div>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                  ✓ Hỗ trợ vay trả góp 8 năm lãi suất từ 5%/năm
                </span>
              </div>

              {/* Trims List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#003F87] uppercase tracking-wider">
                  Các phiên bản có sẵn ({vehicle.trims.length})
                </h3>

                {vehicle.trims.map((t) => {
                  const trimPrice = Number(t.basePriceVnd).toLocaleString("vi-VN");
                  return (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-[#003F87] transition-all bg-white"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-sm font-bold text-slate-900">{t.name}</strong>
                          <span className="block text-[11px] text-slate-500 mt-0.5">
                            Quãng đường: {t.rangeKm} km / lần sạc
                          </span>
                        </div>
                        <span className="text-base font-bold text-[#003F87]">{trimPrice} ₫</span>
                      </div>

                      {/* Color dots preview */}
                      {t.colors.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
                          <span className="text-[11px] text-slate-400 mr-1">Màu:</span>
                          {t.colors.map((c) => (
                            <span
                              key={c.id}
                              title={c.name}
                              className="w-4 h-4 rounded-full border border-slate-300"
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <Link
                  href={`/configurator?model=${vehicle.slug}`}
                  className="w-full bg-[#003F87] hover:bg-[#002D62] text-white text-sm font-bold py-3.5 rounded-xl text-center block shadow-md hover:shadow-lg transition-all"
                >
                  Cấu hình xe & Đặt cọc trực tuyến
                </Link>

                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href={`/on-road?model=${vehicle.slug}`}
                    className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2.5 rounded-lg text-center transition-colors"
                  >
                    Dự toán lăn bánh
                  </Link>

                  <Link
                    href={`/finance?price=${vehicle.trims[0]?.basePriceVnd ?? ""}`}
                    className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2.5 rounded-lg text-center transition-colors"
                  >
                    Dự toán trả góp
                  </Link>

                  <Link
                    href={`/compare`}
                    className="border border-[#003F87]/30 bg-blue-50/50 hover:bg-blue-100/60 text-[#003F87] text-xs font-bold py-2.5 rounded-lg text-center transition-colors"
                  >
                    So sánh xe
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
