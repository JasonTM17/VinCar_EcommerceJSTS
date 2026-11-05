"use client";

import { useState } from "react";
import Link from "next/link";

interface CarProfile {
  id: string;
  name: string;
  batteryRentalMonth: number;
  evKwhPer100Km: number;
  gasLitersPer100Km: number;
}

const CAR_PROFILES: CarProfile[] = [
  { id: "VF3", name: "VinFast VF 3 (Mini SUV)", batteryRentalMonth: 900000, evKwhPer100Km: 9.0, gasLitersPer100Km: 6.0 },
  { id: "VF5", name: "VinFast VF 5 Plus (A-SUV)", batteryRentalMonth: 1200000, evKwhPer100Km: 11.5, gasLitersPer100Km: 7.2 },
  { id: "VF6", name: "VinFast VF 6 (B-SUV)", batteryRentalMonth: 1400000, evKwhPer100Km: 14.5, gasLitersPer100Km: 8.0 },
  { id: "VF7", name: "VinFast VF 7 (C-SUV Thể thao)", batteryRentalMonth: 1600000, evKwhPer100Km: 16.5, gasLitersPer100Km: 9.5 },
  { id: "VF8", name: "VinFast VF 8 (D-SUV Toàn cầu)", batteryRentalMonth: 1900000, evKwhPer100Km: 18.5, gasLitersPer100Km: 11.0 },
  { id: "VF9", name: "VinFast VF 9 (E-SUV Full Size)", batteryRentalMonth: 2200000, evKwhPer100Km: 21.0, gasLitersPer100Km: 13.5 },
];

const KWH_COST_HOME = 3200; // VND/kWh home electricity rate
const GAS_PRICE_PER_LITER = 24500; // VND/liter RON 95

export function HomeCostCalculator() {
  const [selectedCarId, setSelectedCarId] = useState("VF7");
  const [distanceKm, setDistanceKm] = useState(1500);
  const [batteryMode, setBatteryMode] = useState<"rental" | "included">("rental");

  const car = CAR_PROFILES.find((c) => c.id === selectedCarId) || CAR_PROFILES[3];

  // EV costs
  const electricKwhUsed = (distanceKm / 100) * car.evKwhPer100Km;
  const electricCost = electricKwhUsed * KWH_COST_HOME;
  const batteryFee = batteryMode === "rental" ? car.batteryRentalMonth : 0;
  const totalEvMonthlyCost = electricCost + batteryFee;

  // Gas costs
  const gasLitersUsed = (distanceKm / 100) * car.gasLitersPer100Km;
  const gasFuelCost = gasLitersUsed * GAS_PRICE_PER_LITER;
  const gasMaintenanceFee = 350000; // monthly oil, filter, maintenance avg
  const totalGasMonthlyCost = gasFuelCost + gasMaintenanceFee;

  // Savings
  const monthlySavings = Math.max(0, totalGasMonthlyCost - totalEvMonthlyCost);
  const yearlySavings = monthlySavings * 12;
  const savingsPercent = Math.round((monthlySavings / totalGasMonthlyCost) * 100);

  // Environmental metric
  const co2SavedTons = (distanceKm * 12 * 0.00012).toFixed(2);
  const treesEquivalent = Math.round(Number(co2SavedTons) * 45);

  const formatVnd = (num: number) => num.toLocaleString("vi-VN");

  return (
    <section className="py-20 bg-slate-50 border-y border-slate-200" id="calculator-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-widest block mb-2">
            BÀI TOÁN KINH TẾ THỰC TẾ
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003F87]">
            Dự Toán Chi Phí & Hiệu Quả Tiết Kiệm
          </h2>
          <p className="text-sm text-slate-600 mt-3">
            So sánh chi phí vận hành thực tế giữa ô tô điện VinFast và xe xăng cùng phân khúc theo thói quen di chuyển hàng tháng của bạn.
          </p>
        </div>

        {/* Calculator Main Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-10 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Input Controls (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* 1. Model Selection */}
              <div>
                <label className="block text-xs font-bold text-[#003F87] uppercase tracking-wide mb-2">
                  1. Chọn dòng xe dự tính
                </label>
                <select
                  value={selectedCarId}
                  onChange={(e) => setSelectedCarId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-sm text-[#003F87] font-semibold focus:border-[#003F87] focus:ring-2 focus:ring-[#00B4D8]/30 outline-none"
                >
                  {CAR_PROFILES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Distance Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-[#003F87] uppercase tracking-wide">
                    2. Quãng đường di chuyển mỗi tháng
                  </label>
                  <span className="text-base text-[#00B4D8] font-bold">
                    {formatVnd(distanceKm)} km
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#003F87]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                  <span>500 km</span>
                  <span>2.500 km</span>
                  <span>5.000 km</span>
                </div>
              </div>

              {/* 3. Battery Option */}
              <div>
                <label className="block text-xs font-bold text-[#003F87] uppercase tracking-wide mb-2">
                  3. Gói pin sử dụng
                </label>
                <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setBatteryMode("rental")}
                    className={`py-2 rounded font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      batteryMode === "rental"
                        ? "bg-white text-[#003F87] shadow-sm font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${batteryMode === "rental" ? "bg-[#00B4D8]" : "bg-transparent"}`} />
                    Thuê pin linh hoạt
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatteryMode("included")}
                    className={`py-2 rounded font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      batteryMode === "included"
                        ? "bg-white text-[#003F87] shadow-sm font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${batteryMode === "included" ? "bg-[#00B4D8]" : "bg-transparent"}`} />
                    Mua xe kèm pin
                  </button>
                </div>
              </div>

              {/* V-GREEN Free Charging Benefit */}
              <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined text-[#00B4D8] text-xl mt-0.5">verified</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-[#003F87]">Đặc quyền V-GREEN:</strong> Khách hàng được miễn phí sạc pin tại mạng lưới trạm sạc công cộng V-GREEN trên toàn quốc đến hết năm 2026.
                </p>
              </div>
            </div>

            {/* Results Display (7 cols) */}
            <div className="lg:col-span-7 bg-slate-50 rounded-xl p-6 lg:p-8 border border-slate-200">
              <h4 className="text-xs font-bold text-[#003F87] uppercase tracking-wider mb-6 flex items-center justify-between">
                <span>Bảng so sánh chi phí hàng tháng</span>
                <span className="font-normal text-slate-500 lowercase">(theo {formatVnd(distanceKm)} km/tháng)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* EV Breakdown */}
                <div className="bg-white p-5 rounded-xl border-2 border-[#003F87] shadow-sm relative">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#003F87] text-white absolute -top-2.5 right-4 tracking-wider">
                    VINFAST ĐIỆN
                  </span>
                  <span className="text-xs text-slate-500 block mb-1">Chi phí vận hành EV:</span>
                  <div className="text-2xl font-bold text-[#003F87] mb-3">
                    {formatVnd(Math.round(totalEvMonthlyCost))} ₫
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-3">
                    <li className="flex justify-between">
                      <span>Tiền điện sạc nhà:</span>
                      <strong className="text-slate-800">~{formatVnd(Math.round(electricCost))} ₫</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Phí thuê pin:</span>
                      <strong className="text-slate-800">
                        {batteryMode === "rental" ? `~${formatVnd(batteryFee)} ₫` : "0 ₫ (Đã kèm pin)"}
                      </strong>
                    </li>
                    <li className="flex justify-between text-emerald-600 font-semibold">
                      <span>Ưu đãi trạm sạc V-GREEN:</span>
                      <span>0 ₫ (Miễn phí)</span>
                    </li>
                  </ul>
                </div>

                {/* Gas Breakdown */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 absolute -top-2.5 right-4 tracking-wider">
                    XE XĂNG CÙNG HẠNG
                  </span>
                  <span className="text-xs text-slate-500 block mb-1">Chi phí xăng & bảo dưỡng:</span>
                  <div className="text-2xl font-bold text-slate-700 mb-3">
                    {formatVnd(Math.round(totalGasMonthlyCost))} ₫
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-3">
                    <li className="flex justify-between">
                      <span>Tiền xăng (RON 95):</span>
                      <strong className="text-slate-800">~{formatVnd(Math.round(gasFuelCost))} ₫</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Bảo dưỡng, thay dầu:</span>
                      <strong className="text-slate-800">~{formatVnd(gasMaintenanceFee)} ₫</strong>
                    </li>
                    <li className="flex justify-between text-slate-500">
                      <span>Thuế & phí BV môi trường:</span>
                      <span>Đã bao gồm</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Annual Savings Banner */}
              <div className="bg-gradient-to-r from-[#003F87] to-[#002D62] text-white p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div>
                  <span className="text-[10px] text-[#00B4D8] font-bold uppercase tracking-wider block">
                    Bạn tiết kiệm được mỗi năm
                  </span>
                  <div className="text-3xl font-extrabold tracking-tight mt-1 text-white">
                    {formatVnd(Math.round(yearlySavings))} VNĐ
                  </div>
                  <span className="text-xs text-slate-300 mt-1 block">
                    Tiết kiệm khoảng <strong>{savingsPercent}%</strong> chi phí vận hành so với xe xăng
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 text-center shrink-0">
                  <span className="material-symbols-outlined text-[#00B4D8] text-2xl mb-1">forest</span>
                  <div className="text-xs font-bold text-white">Giảm {co2SavedTons} tấn CO2/năm</div>
                  <span className="text-[10px] text-slate-300">Tương đương trồng {treesEquivalent} cây xanh</span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <Link
                  href={`/on-road?model=${car.id.toLowerCase()}`}
                  className="text-xs font-semibold text-[#003F87] hover:underline inline-flex items-center gap-1"
                >
                  Xem chi tiết dự toán lăn bánh cho {car.name}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
