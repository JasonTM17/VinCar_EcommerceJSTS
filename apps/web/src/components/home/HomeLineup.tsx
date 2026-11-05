"use client";

import { useState } from "react";
import Link from "next/link";
import { getCarImage } from "@/lib/car-assets";

interface CarItem {
  name: string;
  slug: string;
  badge: string;
  categoryGroup: "all" | "urban" | "crossover" | "luxury";
  tagline: string;
  description: string;
  rangeKm: number;
  fastChargeMin?: number;
  powerHp?: number;
  seats: number;
  batteryRentalPrice: string;
  batteryIncludedPrice: string;
  isFeatured?: boolean;
}

const CARS: CarItem[] = [
  {
    name: "VF 3",
    slug: "vf-3",
    badge: "MINI SUV",
    categoryGroup: "urban",
    tagline: "Lái phố linh hoạt",
    description: "Cá tính, thực dụng, sạc nhanh tiện lợi cho mọi nhu cầu nội đô.",
    rangeKm: 210,
    fastChargeMin: 36,
    seats: 4,
    batteryRentalPrice: "240.000.000",
    batteryIncludedPrice: "322.000.000",
  },
  {
    name: "VF 5 Plus",
    slug: "vf-5-plus",
    badge: "A-SUV ĐÔ THỊ",
    categoryGroup: "urban",
    tagline: "Xe điện quốc dân",
    description: "Lựa chọn kinh tế tối ưu cho gia đình trẻ và dịch vụ vận tải xanh thông minh.",
    rangeKm: 326,
    powerHp: 134,
    seats: 5,
    batteryRentalPrice: "468.000.000",
    batteryIncludedPrice: "548.000.000",
  },
  {
    name: "VF 6",
    slug: "vf-6",
    badge: "B-SUV THỜI THƯỢNG",
    categoryGroup: "crossover",
    tagline: "Thời thượng tinh tế",
    description: "Trang bị trợ lái ADAS cấp độ 2 cùng khoang lái rộng rãi vượt trội phân khúc.",
    rangeKm: 399,
    powerHp: 201,
    seats: 5,
    batteryRentalPrice: "675.000.000",
    batteryIncludedPrice: "765.000.000",
  },
  {
    name: "VF 7 Plus AWD",
    slug: "vf-7",
    badge: "C-SUV THỂ THAO",
    categoryGroup: "crossover",
    tagline: "349 HP Mạnh mẽ",
    description: "Cảm giác lái thể thao bùng nổ, trần kính toàn cảnh panorama sang trọng.",
    rangeKm: 431,
    powerHp: 349,
    seats: 5,
    batteryRentalPrice: "850.000.000",
    batteryIncludedPrice: "999.000.000",
    isFeatured: true,
  },
  {
    name: "VF 8",
    slug: "vf-8",
    badge: "D-SUV TOÀN CẦU",
    categoryGroup: "luxury",
    tagline: "Chuẩn Quốc Tế",
    description: "Dòng SUV toàn cầu xuất khẩu Bắc Mỹ & Châu Âu, trang bị tiện nghi đỉnh cao.",
    rangeKm: 471,
    seats: 5,
    batteryRentalPrice: "1.079.000.000",
    batteryIncludedPrice: "1.289.000.000",
  },
  {
    name: "VF 9",
    slug: "vf-9",
    badge: "E-SUV FULL SIZE",
    categoryGroup: "luxury",
    tagline: "Đẳng Cấp Chủ Nhân",
    description: "SUV 7 chỗ hạng sang hoặc cấu hình ghế cơ trưởng Captain Seat massage đa điểm.",
    rangeKm: 626,
    seats: 7,
    batteryRentalPrice: "1.566.000.000",
    batteryIncludedPrice: "2.114.000.000",
  },
];

export function HomeLineup() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "urban" | "crossover" | "luxury">("all");
  const [batteryMode, setBatteryMode] = useState<"rental" | "included">("rental");

  const filteredCars = CARS.filter((car) => {
    if (selectedCategory === "all") return true;
    return car.categoryGroup === selectedCategory;
  });

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="lineup-section">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-widest block mb-2">
            DANH MỤC SẢN PHẨM HOÀN CHỈNH
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003F87] tracking-tight">
            Hệ Sinh Thái Ô Tô Điện VinFast
          </h2>
        </div>
        <p className="text-sm text-slate-600 max-w-md">
          Khám phá các dòng xe thuần điện thông minh từ Mini SUV đô thị linh hoạt đến SUV Full-size cao cấp, sẵn sàng cùng bạn bứt phá tương lai xanh.
        </p>
      </div>

      {/* Filter and Battery Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-8">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 sm:pb-0">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-[#003F87] text-white shadow-sm"
                : "text-slate-600 hover:text-[#003F87] hover:bg-slate-100"
            }`}
          >
            Tất cả dòng xe (6)
          </button>
          <button
            onClick={() => setSelectedCategory("urban")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === "urban"
                ? "bg-[#003F87] text-white shadow-sm"
                : "text-slate-600 hover:text-[#003F87] hover:bg-slate-100"
            }`}
          >
            SUV Đô thị (VF 3, VF 5 Plus)
          </button>
          <button
            onClick={() => setSelectedCategory("crossover")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === "crossover"
                ? "bg-[#003F87] text-white shadow-sm"
                : "text-slate-600 hover:text-[#003F87] hover:bg-slate-100"
            }`}
          >
            Crossover Tiên phong (VF 6, VF 7)
          </button>
          <button
            onClick={() => setSelectedCategory("luxury")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === "luxury"
                ? "bg-[#003F87] text-white shadow-sm"
                : "text-slate-600 hover:text-[#003F87] hover:bg-slate-100"
            }`}
          >
            SUV Doanh nhân (VF 8, VF 9)
          </button>
        </div>

        {/* Battery Pricing Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setBatteryMode("rental")}
            className={`px-3 py-1.5 rounded font-semibold transition-all flex items-center gap-1.5 ${
              batteryMode === "rental"
                ? "bg-white text-[#003F87] shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${batteryMode === "rental" ? "bg-[#00B4D8]" : "bg-transparent"}`} />
            Thuê pin
          </button>
          <button
            onClick={() => setBatteryMode("included")}
            className={`px-3 py-1.5 rounded font-semibold transition-all flex items-center gap-1.5 ${
              batteryMode === "included"
                ? "bg-white text-[#003F87] shadow-sm font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${batteryMode === "included" ? "bg-[#00B4D8]" : "bg-transparent"}`} />
            Kèm pin
          </button>
        </div>
      </div>

      {/* Vehicle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCars.map((car) => {
          const displayPrice = batteryMode === "rental" ? car.batteryRentalPrice : car.batteryIncludedPrice;
          const altPrice = batteryMode === "rental" ? car.batteryIncludedPrice : car.batteryRentalPrice;
          const altLabel = batteryMode === "rental" ? "Kèm pin" : "Thuê pin";

          return (
            <div
              key={car.slug}
              className={`bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative ${
                car.isFeatured ? "border-2 border-[#003F87]" : "border-slate-200"
              }`}
            >
              {car.isFeatured && (
                <div className="absolute top-0 right-0 bg-[#003F87] text-white text-[10px] px-3 py-1 rounded-bl-lg uppercase tracking-wider font-bold z-10 shadow">
                  Tâm Điểm Công Nghệ
                </div>
              )}

              {/* Car Image Container */}
              <div className="relative bg-slate-50 p-6 overflow-hidden h-56 flex items-center justify-center">
                <span className="absolute top-4 left-4 bg-[#003F87] text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide">
                  {car.badge}
                </span>
                <img
                  src={getCarImage(car.slug)}
                  alt={`VinFast ${car.name}`}
                  className="max-h-44 object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xl font-bold text-[#003F87]">{car.name}</h3>
                    <span className="text-[11px] font-bold text-[#00B4D8] uppercase">{car.tagline}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">{car.description}</p>

                  {/* Tech Specs Strip */}
                  <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 text-xs mb-4">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Quãng đường:</span>
                      <strong className="text-[#003F87] text-sm">{car.rangeKm} km</strong> / lần sạc
                    </div>
                    <div>
                      {car.fastChargeMin ? (
                        <>
                          <span className="text-slate-400 block text-[11px]">Sạc nhanh (10-70%):</span>
                          <strong className="text-[#003F87] text-sm">{car.fastChargeMin} phút</strong>
                        </>
                      ) : car.powerHp ? (
                        <>
                          <span className="text-slate-400 block text-[11px]">Công suất:</span>
                          <strong className="text-[#003F87] text-sm">{car.powerHp} HP</strong>
                        </>
                      ) : (
                        <>
                          <span className="text-slate-400 block text-[11px]">Số chỗ ngồi:</span>
                          <strong className="text-[#003F87] text-sm">{car.seats} chỗ</strong>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-1 mb-6 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">
                        {batteryMode === "rental" ? "Giá thuê pin từ:" : "Giá kèm pin từ:"}
                      </span>
                      <span className="font-extrabold text-[#003F87] text-base">
                        {displayPrice} VNĐ
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-slate-200/60">
                      <span className="text-slate-400">{altLabel}:</span>
                      <span className="font-medium text-slate-700">{altPrice} VNĐ</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href={`/configurator?model=${car.slug}`}
                    className="bg-[#003F87] hover:bg-[#002D62] text-white text-xs font-bold py-2.5 rounded text-center transition-colors shadow-sm"
                  >
                    Đặt cọc ngay
                  </Link>
                  <Link
                    href={`/on-road?model=${car.slug}`}
                    className="border border-slate-200 text-[#003F87] hover:bg-slate-50 text-xs font-semibold py-2.5 rounded text-center transition-colors"
                  >
                    Dự toán chi phí
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
