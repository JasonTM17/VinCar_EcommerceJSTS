"use client";

import { useState } from "react";
import Link from "next/link";
import { VGREEN_MAP_IMAGE } from "@/lib/car-assets";
import { VINFAST_INFO } from "@/lib/constants";

export default function ChargingPage() {
  const [carModel, setCarModel] = useState("vf-7");
  const [kmPerMonth, setKmPerMonth] = useState(1500);

  // Energy consumption ~ 16 kWh / 100km for average EV, price 3,858 VND / kWh
  const evCost = Math.round((kmPerMonth * 16 * 3858) / 100);
  // Gasoline consumption ~ 8.5 liters / 100km, price 24,000 VND / liter
  const gasCost = Math.round((kmPerMonth * 8.5 * 24000) / 100);
  const savings = gasCost - evCost;

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-slate-900 pb-20">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-[#002A5D] via-[#003F87] to-[#00677D] text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-[#00B4D8]/20 text-[#50D9FE] text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-[#00B4D8]/30 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#50D9FE] animate-pulse" />
              Mạng lưới trạm sạc V-GREEN toàn cầu
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
              Hệ sinh thái Pin & Trạm sạc phủ khắp 63 Tỉnh Thành
            </h1>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-8">
              Với hơn <strong>150.000 cổng sạc</strong> trên toàn quốc, khoảng cách trung bình chỉ dưới 3,5 km trong đô thị
              và dưới 65 km trên các tuyến quốc lộ, cao tốc huyết mạch. VinFast đảm bảo bạn luôn an tâm trên mọi hành trình.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/dealers"
                className="bg-[#00B4D8] hover:bg-[#0096C7] text-slate-950 text-xs sm:text-sm font-extrabold px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">near_me</span>
                <span>Tìm trạm sạc gần bạn nhất</span>
              </Link>
              <a
                href="#calculator"
                className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl border border-white/20 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">savings</span>
                <span>Tính chi phí sạc pin</span>
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-slate-900/50">
              <img
                src={VGREEN_MAP_IMAGE}
                alt="Bản đồ mạng lưới trạm sạc V-GREEN"
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-200 text-slate-900 hidden sm:flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                63
              </span>
              <div>
                <p className="text-xs font-extrabold text-slate-900">Phủ kín 63 tỉnh thành</p>
                <p className="text-[11px] text-slate-500">100% các tuyến cao tốc Bắc - Nam</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Levels of Charging Ports */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#003F87] uppercase tracking-wider">Đa dạng công suất</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Hệ thống trụ sạc chuẩn quốc tế V-GREEN
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Áp dụng chuẩn sạc kết hợp CCS2 và Type 2 phổ biến toàn cầu, tương thích hoàn hảo và an toàn tuyệt đối với mọi dòng xe VinFast.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* AC 11kW */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003F87] flex items-center justify-center mb-4 font-black">
                AC
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Trụ sạc chậm 11 kW</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Phù hợp cho bãi đỗ xe chung cư, cơ quan, khách sạn sạc qua đêm hoặc đỗ xe thời gian dài.
              </p>
              <ul className="text-xs text-slate-700 space-y-2 mb-6">
                <li>• Thời gian sạc: 6 - 8 giờ (đầy 100%)</li>
                <li>• Chuẩn cổng: Type 2 AC</li>
                <li>• Công suất: 11 kW 3 pha</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Vị trí</span>
              <span className="font-bold text-slate-800">Hầm chung cư, văn phòng</span>
            </div>
          </div>

          {/* DC 30kW */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-[#00677D] flex items-center justify-center mb-4 font-black">
                DC
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Trụ sạc nhanh 30 kW</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Phù hợp điểm dừng chân công cộng, trung tâm mua sắm vừa đỗ xe giải trí vừa sạc pin.
              </p>
              <ul className="text-xs text-slate-700 space-y-2 mb-6">
                <li>• Thời gian sạc 10 - 70%: ~45 - 60 phút</li>
                <li>• Chuẩn cổng: CCS2 DC</li>
                <li>• Tự động ngắt khi pin đầy</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Vị trí</span>
              <span className="font-bold text-slate-800">TTTM Vincom, bãi đỗ xe</span>
            </div>
          </div>

          {/* DC 60kW */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 font-black">
                DC
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Trụ sạc nhanh 60 kW</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Tốc độ sạc nhanh chóng tại cây xăng, bến xe, nhà hàng phục vụ xe dịch vụ và gia đình.
              </p>
              <ul className="text-xs text-slate-700 space-y-2 mb-6">
                <li>• Thời gian sạc 10 - 70%: ~30 - 40 phút</li>
                <li>• Chuẩn cổng: 2 súng CCS2</li>
                <li>• Tích hợp tính năng Autocharge</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Vị trí</span>
              <span className="font-bold text-slate-800">Cây xăng, trạm dừng chân</span>
            </div>
          </div>

          {/* DC 150kW - 250kW Superfast */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border-2 border-[#003F87] shadow-lg flex flex-col justify-between relative">
            <span className="absolute -top-3 right-4 bg-[#003F87] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
              Siêu nhanh
            </span>
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#003F87] text-white flex items-center justify-center mb-4 font-black">
                ⚡ DC
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Trụ sạc siêu nhanh 150 - 250 kW</h3>
              <p className="text-xs text-slate-600 mt-1 mb-4">
                Công suất khủng bố trí trên các trục cao tốc Bắc - Nam, nạp năng lượng trong chớp mắt.
              </p>
              <ul className="text-xs text-slate-700 space-y-2 mb-6">
                <li className="font-bold text-[#003F87]">• Sạc 10 - 70%: Chỉ ~20 - 25 phút</li>
                <li>• Cung cấp thêm 200 - 250 km tầm hoạt động</li>
                <li>• Hệ thống làm mát bằng dung dịch tiên tiến</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Vị trí</span>
              <span className="font-extrabold text-[#003F87]">Trạm dừng nghỉ cao tốc</span>
            </div>
          </div>
        </div>
      </section>

      {/* Energy Cost Calculator Widget */}
      <section id="calculator" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#003F87] uppercase tracking-wider">Tiết kiệm chi phí vận hành</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Ước tính chi phí sạc pin vs Đổ xăng hàng tháng
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Kéo thanh trượt để xem bạn tiết kiệm được bao nhiêu triệu đồng mỗi tháng khi chuyển sang xe điện VinFast.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Dòng xe VinFast quan tâm
                </label>
                <select
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold focus:border-[#003F87] outline-none"
                >
                  <option value="vf-3">VinFast VF 3 (Tiêu thụ ~11 kWh/100km)</option>
                  <option value="vf-5-plus">VinFast VF 5 Plus (Tiêu thụ ~13 kWh/100km)</option>
                  <option value="vf-6">VinFast VF 6 (Tiêu thụ ~15 kWh/100km)</option>
                  <option value="vf-7">VinFast VF 7 (Tiêu thụ ~17 kWh/100km)</option>
                  <option value="vf-8">VinFast VF 8 (Tiêu thụ ~19 kWh/100km)</option>
                  <option value="vf-9">VinFast VF 9 (Tiêu thụ ~21 kWh/100km)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Quãng đường di chuyển mỗi tháng
                  </span>
                  <span className="text-sm font-extrabold text-[#003F87]">{kmPerMonth.toLocaleString("vi-VN")} km</span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={5000}
                  step={100}
                  value={kmPerMonth}
                  onChange={(e) => setKmPerMonth(Number(e.target.value))}
                  className="w-full accent-[#003F87] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>500 km</span>
                  <span>2.000 km</span>
                  <span>5.000 km</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <p>• Đơn giá sạc công cộng V-GREEN: <strong>3.858 ₫ / kWh</strong> (đã gồm VAT).</p>
                <p>• Giá xăng RON 95 tham chiếu: <strong>24.000 ₫ / lít</strong>.</p>
                <p>• Nếu sạc tại nhà (giá điện sinh hoạt bậc 3-4), chi phí còn rẻ hơn từ <strong>30% đến 45%</strong>!</p>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-[#0B2545] to-[#003F87] text-white p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#50D9FE] bg-white/10 px-3 py-1 rounded-full">
                  Khoản tiền tiết kiệm mỗi tháng
                </span>
                <p className="text-3xl sm:text-4xl font-black text-white mt-3">
                  +{savings.toLocaleString("vi-VN")} ₫
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Tiết kiệm tương đương <strong>{((savings * 12) / 1_000_000).toFixed(1)} triệu đồng</strong> mỗi năm!
                </p>
              </div>

              <div className="space-y-3 mt-8 pt-6 border-t border-white/10 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Chi phí sạc điện xe VinFast:</span>
                  <span className="font-extrabold text-[#50D9FE]">{evCost.toLocaleString("vi-VN")} ₫</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Chi phí đổ xăng xe cùng cỡ:</span>
                  <span className="font-bold line-through text-slate-400">{gasCost.toLocaleString("vi-VN")} ₫</span>
                </div>
              </div>

              <Link
                href="/configurator"
                className="mt-6 w-full bg-[#00B4D8] hover:bg-[#0096C7] text-slate-950 font-extrabold text-xs py-3 rounded-xl transition-all text-center"
              >
                Chuyển đổi sang xe điện ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Official Home Chargers Portfolio */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#003F87] uppercase tracking-wider">Tiện nghi tại gia</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Bộ sạc chính hãng VinFast tại nhà
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Cắm sạc qua đêm tại nhà với chi phí tiết kiệm tối đa, sẵn sàng 100% năng lượng mỗi sáng thức dậy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-[#003F87]/40 transition-all">
            <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
              Di động 2.2 kW - 3.5 kW
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-3 mb-1">Bộ sạc di động cầm tay</h3>
            <p className="text-xs text-slate-500 mb-4">
              Cắm trực tiếp vào ổ cắm điện gia dụng 220V tiêu chuẩn, mang theo cốp xe tiện lợi khi đi xa.
            </p>
            <p className="text-lg font-black text-[#003F87] mb-4">Từ 4.000.000 ₫</p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-4 border-t border-slate-100">
              <li>• Nguồn điện: 220V 1 pha</li>
              <li>• Chống nước chuẩn IP67</li>
              <li>• Có tích hợp bảo vệ quá nhiệt</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-[#003F87] shadow-md hover:shadow-lg transition-all relative">
            <span className="absolute -top-3 right-4 bg-[#003F87] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
              Khuyên dùng
            </span>
            <span className="text-[10px] font-bold uppercase bg-blue-100 text-[#003F87] px-2.5 py-1 rounded-full">
              Treo tường 7.4 kW
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-3 mb-1">Bộ sạc treo tường thông minh</h3>
            <p className="text-xs text-slate-500 mb-4">
              Lắp đặt gọn gàng tại garage gia đình, sạc đầy xe trong khoảng 5 - 8 tiếng qua đêm an toàn tuyệt đối.
            </p>
            <p className="text-lg font-black text-[#003F87] mb-4">9.500.000 ₫</p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-4 border-t border-slate-100">
              <li>• Nguồn điện: 220V 1 pha 32A</li>
              <li>• Kết nối ứng dụng VinFast quản lý sạc từ xa</li>
              <li>• Cáp sạc dài 5m linh hoạt</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-[#003F87]/40 transition-all">
            <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
              Treo tường 11 kW
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-3 mb-1">Bộ sạc công suất cao 11 kW</h3>
            <p className="text-xs text-slate-500 mb-4">
              Dành cho biệt thự, nhà riêng có nguồn điện 3 pha, rút ngắn thời gian sạc đầy xe lớn như VF 8, VF 9.
            </p>
            <p className="text-lg font-black text-[#003F87] mb-4">12.000.000 ₫</p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-4 border-t border-slate-100">
              <li>• Nguồn điện: 380V 3 pha 16A</li>
              <li>• Quản lý sạc thông minh theo lịch hẹn</li>
              <li>• Chuẩn an toàn chống giật RCD Type B</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
