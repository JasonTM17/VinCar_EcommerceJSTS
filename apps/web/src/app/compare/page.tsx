"use client";

import { useState } from "react";
import Link from "next/link";
import { getCarImage } from "@/lib/car-assets";

interface CarSpec {
  name: string;
  slug: string;
  segment: string;
  seats: number;
  priceRental: string;
  priceIncluded: string;
  dimensions: string; // DxRxC
  wheelbase: string;
  groundClearance: string;
  power: string;
  torque: string;
  drivetrain: string;
  batteryCapacity: string;
  rangeKm: number;
  fastChargingTime: string;
  screenSize: string;
  airbags: number;
  adasLevel: string;
}

const CAR_SPECS_DATA: Record<string, CarSpec> = {
  "vf-3": {
    name: "VinFast VF 3",
    slug: "vf-3",
    segment: "Mini SUV",
    seats: 4,
    priceRental: "240.000.000 ₫",
    priceIncluded: "322.000.000 ₫",
    dimensions: "3.190 x 1.679 x 1.622 mm",
    wheelbase: "2.075 mm",
    groundClearance: "191 mm",
    power: "43 HP (32 kW)",
    torque: "110 Nm",
    drivetrain: "Cầu sau (RWD)",
    batteryCapacity: "18.64 kWh",
    rangeKm: 210,
    fastChargingTime: "36 phút (10-70%)",
    screenSize: "10 inch Touchscreen",
    airbags: 1,
    adasLevel: "Cảnh báo an toàn cơ bản",
  },
  "vf-5-plus": {
    name: "VinFast VF 5 Plus",
    slug: "vf-5-plus",
    segment: "A-SUV Đô thị",
    seats: 5,
    priceRental: "468.000.000 ₫",
    priceIncluded: "548.000.000 ₫",
    dimensions: "3.965 x 1.720 x 1.580 mm",
    wheelbase: "2.513 mm",
    groundClearance: "182 mm",
    power: "134 HP (100 kW)",
    torque: "135 Nm",
    drivetrain: "Cầu trước (FWD)",
    batteryCapacity: "37.23 kWh",
    rangeKm: 326,
    fastChargingTime: "30 phút (10-70%)",
    screenSize: "8 inch + Cụm đồng hồ 7 inch",
    airbags: 6,
    adasLevel: "Giám sát điểm mù, cảnh báo lùi",
  },
  "vf-6": {
    name: "VinFast VF 6",
    slug: "vf-6",
    segment: "B-SUV Gia đình",
    seats: 5,
    priceRental: "675.000.000 ₫",
    priceIncluded: "765.000.000 ₫",
    dimensions: "4.238 x 1.820 x 1.594 mm",
    wheelbase: "2.730 mm",
    groundClearance: "170 mm",
    power: "201 HP (150 kW)",
    torque: "310 Nm",
    drivetrain: "Cầu trước (FWD)",
    batteryCapacity: "59.60 kWh",
    rangeKm: 399,
    fastChargingTime: "25 phút (10-70%)",
    screenSize: "12.9 inch Touchscreen",
    airbags: 8,
    adasLevel: "ADAS Cấp độ 2 hỗ trợ lái cao tốc",
  },
  "vf-7": {
    name: "VinFast VF 7",
    slug: "vf-7",
    segment: "C-SUV Thể thao Torino",
    seats: 5,
    priceRental: "850.000.000 ₫",
    priceIncluded: "999.000.000 ₫",
    dimensions: "4.545 x 1.890 x 1.635 mm",
    wheelbase: "2.840 mm",
    groundClearance: "190 mm",
    power: "349 HP (260 kW)",
    torque: "500 Nm",
    drivetrain: "2 Cầu toàn thời gian (AWD)",
    batteryCapacity: "75.30 kWh",
    rangeKm: 431,
    fastChargingTime: "24 phút (10-70%)",
    screenSize: "12.9 inch hướng người lái + HUD",
    airbags: 8,
    adasLevel: "ADAS Cấp độ 2 đầy đủ tính năng",
  },
  "vf-8": {
    name: "VinFast VF 8",
    slug: "vf-8",
    segment: "D-SUV Toàn cầu",
    seats: 5,
    priceRental: "1.079.000.000 ₫",
    priceIncluded: "1.289.000.000 ₫",
    dimensions: "4.750 x 1.934 x 1.667 mm",
    wheelbase: "2.950 mm",
    groundClearance: "175 mm",
    power: "402 HP (300 kW)",
    torque: "620 Nm",
    drivetrain: "2 Cầu toàn thời gian (AWD)",
    batteryCapacity: "87.70 kWh",
    rangeKm: 471,
    fastChargingTime: "24 phút (10-70%)",
    screenSize: "15.6 inch Touchscreen + HUD",
    airbags: 11,
    adasLevel: "ADAS Cấp độ 2+ Tự động chuyển làn",
  },
  "vf-9": {
    name: "VinFast VF 9",
    slug: "vf-9",
    segment: "E-SUV Full-size Hạng sang",
    seats: 7,
    priceRental: "1.566.000.000 ₫",
    priceIncluded: "2.114.000.000 ₫",
    dimensions: "5.118 x 2.254 x 1.696 mm",
    wheelbase: "3.150 mm",
    groundClearance: "197 mm",
    power: "402 HP (300 kW)",
    torque: "620 Nm",
    drivetrain: "2 Cầu toàn thời gian (AWD)",
    batteryCapacity: "123.00 kWh",
    rangeKm: 626,
    fastChargingTime: "26 phút (10-70%)",
    screenSize: "15.6 inch + Màn hình sau 8 inch",
    airbags: 11,
    adasLevel: "ADAS Cấp độ 2+ & Ghế cơ trưởng massage",
  },
};

export default function ComparePage() {
  const [slug1, setSlug1] = useState("vf-6");
  const [slug2, setSlug2] = useState("vf-7");

  const car1 = CAR_SPECS_DATA[slug1] || CAR_SPECS_DATA["vf-6"];
  const car2 = CAR_SPECS_DATA[slug2] || CAR_SPECS_DATA["vf-7"];

  const modelKeys = Object.keys(CAR_SPECS_DATA);

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-slate-900 pb-20">
      {/* Header */}
      <section className="bg-gradient-to-b from-white to-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-xs font-bold text-[#003F87] uppercase tracking-wider">Công cụ hỗ trợ mua xe</span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
            So sánh chi tiết các mẫu ô tô điện VinFast
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl mx-auto">
            Chọn 2 mẫu xe bạn đang phân vân để so sánh trực quan về kích thước, động cơ, pin, trang bị an toàn và chi phí.
          </p>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6 text-xs">
            <span className="text-slate-400 font-medium">Gợi ý so sánh nhanh:</span>
            <button
              type="button"
              onClick={() => { setSlug1("vf-3"); setSlug2("vf-5-plus"); }}
              className="bg-white hover:bg-slate-100 text-[#003F87] font-semibold px-3 py-1.5 rounded-full border border-slate-200 shadow-sm"
            >
              VF 3 vs VF 5 Plus
            </button>
            <button
              type="button"
              onClick={() => { setSlug1("vf-6"); setSlug2("vf-7"); }}
              className="bg-white hover:bg-slate-100 text-[#003F87] font-semibold px-3 py-1.5 rounded-full border border-slate-200 shadow-sm"
            >
              VF 6 vs VF 7
            </button>
            <button
              type="button"
              onClick={() => { setSlug1("vf-7"); setSlug2("vf-8"); }}
              className="bg-white hover:bg-slate-100 text-[#003F87] font-semibold px-3 py-1.5 rounded-full border border-slate-200 shadow-sm"
            >
              VF 7 vs VF 8
            </button>
            <button
              type="button"
              onClick={() => { setSlug1("vf-8"); setSlug2("vf-9"); }}
              className="bg-white hover:bg-slate-100 text-[#003F87] font-semibold px-3 py-1.5 rounded-full border border-slate-200 shadow-sm"
            >
              VF 8 vs VF 9
            </button>
          </div>
        </div>
      </section>

      {/* Comparison Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header Row: Vehicle Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-200">
            <div className="md:col-span-4 p-6 flex flex-col justify-end bg-slate-50/70 border-b md:border-b-0 md:border-r border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiêu chí so sánh</span>
              <p className="text-base font-extrabold text-slate-900 mt-1">Thông số kỹ thuật & Giá</p>
            </div>

            {/* Vehicle 1 Selector */}
            <div className="md:col-span-4 p-6 border-b md:border-b-0 md:border-r border-slate-200 text-center">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Xe thứ nhất
              </label>
              <select
                value={slug1}
                onChange={(e) => setSlug1(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-bold text-[#003F87] focus:border-[#003F87] outline-none mb-4 text-center"
              >
                {modelKeys.map((k) => (
                  <option key={k} value={k}>
                    {CAR_SPECS_DATA[k].name} ({CAR_SPECS_DATA[k].segment})
                  </option>
                ))}
              </select>

              <div className="aspect-[16/9] w-full max-w-[260px] mx-auto relative mb-3">
                <img
                  src={getCarImage(car1.slug)}
                  alt={car1.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-base font-black text-slate-900">{car1.name}</h3>
              <p className="text-xs text-slate-500">{car1.segment}</p>
            </div>

            {/* Vehicle 2 Selector */}
            <div className="md:col-span-4 p-6 text-center">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Xe thứ hai
              </label>
              <select
                value={slug2}
                onChange={(e) => setSlug2(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-bold text-[#003F87] focus:border-[#003F87] outline-none mb-4 text-center"
              >
                {modelKeys.map((k) => (
                  <option key={k} value={k}>
                    {CAR_SPECS_DATA[k].name} ({CAR_SPECS_DATA[k].segment})
                  </option>
                ))}
              </select>

              <div className="aspect-[16/9] w-full max-w-[260px] mx-auto relative mb-3">
                <img
                  src={getCarImage(car2.slug)}
                  alt={car2.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-base font-black text-slate-900">{car2.name}</h3>
              <p className="text-xs text-slate-500">{car2.segment}</p>
            </div>
          </div>

          {/* Section: Pricing & Incentive */}
          <div className="bg-blue-50/40 px-6 py-3 border-b border-slate-200">
            <span className="text-xs font-extrabold text-[#003F87] uppercase tracking-wider">
              1. Giá niêm yết & Chính sách pin
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 py-3 px-6 hover:bg-slate-50">
              <div className="md:col-span-4 font-semibold text-slate-600">Giá xe (Thuê pin)</div>
              <div className="md:col-span-4 font-extrabold text-[#003F87] text-center md:text-left">{car1.priceRental}</div>
              <div className="md:col-span-4 font-extrabold text-[#003F87] text-center md:text-left">{car2.priceRental}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 py-3 px-6 hover:bg-slate-50">
              <div className="md:col-span-4 font-semibold text-slate-600">Giá xe (Kèm pin)</div>
              <div className="md:col-span-4 font-extrabold text-slate-900 text-center md:text-left">{car1.priceIncluded}</div>
              <div className="md:col-span-4 font-extrabold text-slate-900 text-center md:text-left">{car2.priceIncluded}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 py-3 px-6 hover:bg-slate-50 bg-emerald-50/30">
              <div className="md:col-span-4 font-bold text-emerald-800">Lệ phí trước bạ (Nghị định 10)</div>
              <div className="md:col-span-4 font-extrabold text-emerald-700 text-center md:text-left">0 VNĐ (Miễn 100%)</div>
              <div className="md:col-span-4 font-extrabold text-emerald-700 text-center md:text-left">0 VNĐ (Miễn 100%)</div>
            </div>
          </div>

          {/* Section: Dimensions & Chassis */}
          <div className="bg-blue-50/40 px-6 py-3 border-y border-slate-200">
            <span className="text-xs font-extrabold text-[#003F87] uppercase tracking-wider">
              2. Kích thước & Khung gầm
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 py-3 px-6 hover:bg-slate-50">
              <div className="md:col-span-4 font-semibold text-slate-600">Kích thước (Dài x Rộng x Cao)</div>
              <div className="md:col-span-4 text-slate-900 text-center md:text-left">{car1.dimensions}</div>
              <div className="md:col-span-4 text-slate-900 text-center md:text-left">{car2.dimensions}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 py-3 px-6 hover:bg-slate-50">
              <div className="md:col-span-4 font-semibold text-slate-600">Chiều dài cơ sở</div>
              <div className="md:col-span-4 text-slate-900 text-center md:text-left">{car1.wheelbase}</div>
              <div className="md:col-span-4 text-slate-900 text-center md:text-left">{car2.wheelbase}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 py-3 px-6 hover:bg-slate-50">
              <div className="md:col-span-4 font-semibold text-slate-600">Khoảng sáng gầm xe</div>
              <div className="md:col-span-4 text-slate-900 text-center md:text-left">{car1.groundClearance}</div>
              <div className="md:col-span-4 text-slate-900 text-center md:text-left">{car2.groundClearance}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 py-3 px-6 hover:bg-slate-50">
              <div className="md:col-span-4 font-semibold text-slate-600">Số chỗ ngồi</div>
              <div className="md:col-span-4 font-bold text-[#003F87] text-center md:text-left">{car1.seats} chỗ</div>
              <div className="md:col-span-4 font-bold text-[#003F87] text-center md:text-left">{car2.seats} chỗ</div>
            </div>
          </div>

          {/* Section: Powertrain & Battery */}
          <div className="bg-blue-50/40 px-6 py-3 border-y border-slate-200">
            <span className="text-xs font-extrabold text-[#003F87] uppercase tracking-wider">
              3. Động cơ & Khả năng vận hành
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 py-3 px-6 hover:bg-slate-50">
              <div className="md:col-span-4 font-semibold text-slate-600">Công suất tối đa</div>
              <div className="md:col-span-4 font-bold text-slate-900 text-center md:text-left">{car1.power}</div>
              <div className="md:col-span-4 font-bold text-slate-900 text-center md:text-left">{car2.power}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 py-3 px-6 hover:bg-slate-50">
              <div className="md:col-span-4 font-semibold text-slate-600">Mô-men xoắn cực đại</div>
              <div className="md:col-span-4 text-slate-900 text-center md:text-left">{car1.torque}</div>
              <div className="md:col-span-4 text-slate-900 text-center md:text-left">{car2.torque}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 py-3 px-6 hover:bg-slate-50">
              <div className="md:col-span-4 font-semibold text-slate-600">Hệ dẫn động</div>
              <div className="md:col-span-4 text-slate-900 text-center md:text-left">{car1.drivetrain}</div>
              <div className="md:col-span-4 text-slate-900 text-center md:text-left">{car2.drivetrain}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 py-3 px-6 hover:bg-slate-50">
              <div className="md:col-span-4 font-semibold text-slate-600">Dung lượng pin khả dụng</div>
              <div className="md:col-span-4 font-bold text-[#003F87] text-center md:text-left">{car1.batteryCapacity}</div>
              <div className="md:col-span-4 font-bold text-[#003F87] text-center md:text-left">{car2.batteryCapacity}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 py-3 px-6 hover:bg-slate-50">
              <div className="md:col-span-4 font-semibold text-slate-600">Quãng đường 1 lần sạc</div>
              <div className="md:col-span-4 font-extrabold text-emerald-700 text-center md:text-left">{car1.rangeKm} km</div>
              <div className="md:col-span-4 font-extrabold text-emerald-700 text-center md:text-left">{car2.rangeKm} km</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 py-3 px-6 hover:bg-slate-50">
              <div className="md:col-span-4 font-semibold text-slate-600">Thời gian sạc nhanh 10 - 70%</div>
              <div className="md:col-span-4 text-slate-900 text-center md:text-left">{car1.fastChargingTime}</div>
              <div className="md:col-span-4 text-slate-900 text-center md:text-left">{car2.fastChargingTime}</div>
            </div>
          </div>

          {/* Section: Smart Technology & Safety */}
          <div className="bg-blue-50/40 px-6 py-3 border-y border-slate-200">
            <span className="text-xs font-extrabold text-[#003F87] uppercase tracking-wider">
              4. Tiện nghi & Công nghệ thông minh
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 py-3 px-6 hover:bg-slate-50">
              <div className="md:col-span-4 font-semibold text-slate-600">Màn hình giải trí trung tâm</div>
              <div className="md:col-span-4 text-slate-900 text-center md:text-left">{car1.screenSize}</div>
              <div className="md:col-span-4 text-slate-900 text-center md:text-left">{car2.screenSize}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 py-3 px-6 hover:bg-slate-50">
              <div className="md:col-span-4 font-semibold text-slate-600">Số lượng túi khí an toàn</div>
              <div className="md:col-span-4 text-slate-900 text-center md:text-left">{car1.airbags} túi khí</div>
              <div className="md:col-span-4 text-slate-900 text-center md:text-left">{car2.airbags} túi khí</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 py-3 px-6 hover:bg-slate-50">
              <div className="md:col-span-4 font-semibold text-slate-600">Trợ lái thông minh ADAS</div>
              <div className="md:col-span-4 text-slate-900 text-center md:text-left">{car1.adasLevel}</div>
              <div className="md:col-span-4 text-slate-900 text-center md:text-left">{car2.adasLevel}</div>
            </div>
          </div>

          {/* Footer CTA Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 p-6 bg-slate-50 border-t border-slate-200">
            <div className="md:col-span-4 mb-4 md:mb-0 flex items-center">
              <span className="text-xs text-slate-500">Sẵn sàng trải nghiệm thực tế?</span>
            </div>

            <div className="md:col-span-4 px-2 space-y-2">
              <Link
                href={`/configurator`}
                className="w-full inline-flex items-center justify-center bg-[#003F87] hover:bg-[#002D62] text-white text-xs font-bold py-3 rounded-xl shadow transition-all"
              >
                Đặt cọc {car1.name}
              </Link>
              <Link
                href={`/test-drive`}
                className="w-full inline-flex items-center justify-center bg-white hover:bg-slate-100 text-[#003F87] border border-[#003F87] text-xs font-bold py-2.5 rounded-xl transition-all"
              >
                Đăng ký lái thử
              </Link>
            </div>

            <div className="md:col-span-4 px-2 space-y-2 mt-4 md:mt-0">
              <Link
                href={`/configurator`}
                className="w-full inline-flex items-center justify-center bg-[#003F87] hover:bg-[#002D62] text-white text-xs font-bold py-3 rounded-xl shadow transition-all"
              >
                Đặt cọc {car2.name}
              </Link>
              <Link
                href={`/test-drive`}
                className="w-full inline-flex items-center justify-center bg-white hover:bg-slate-100 text-[#003F87] border border-[#003F87] text-xs font-bold py-2.5 rounded-xl transition-all"
              >
                Đăng ký lái thử
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
