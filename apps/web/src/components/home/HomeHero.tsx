"use client";

import Link from "next/link";
import { HERO_VF7_IMAGE } from "@/lib/car-assets";

export function HomeHero() {
  return (
    <section className="relative bg-[#071326] text-white min-h-[640px] lg:min-h-[720px] flex items-center overflow-hidden border-b border-slate-800">
      {/* Background Hero Ambient Lighting */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#071326] via-[#071326]/90 to-transparent z-10 pointer-events-none w-full lg:w-3/5" />
      <div className="absolute top-0 right-0 w-full lg:w-3/4 h-full z-0 overflow-hidden">
        <img
          className="w-full h-full object-cover object-center lg:object-right opacity-85"
          src={HERO_VF7_IMAGE}
          alt="VinFast VF 7 Electric SUV - Bức phá đam mê"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071326] via-transparent to-transparent lg:hidden" />
      </div>

      {/* Hero Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-20 w-full">
        <div className="max-w-2xl">
          {/* Badge Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#003F87]/40 border border-[#00B4D8]/30 text-[#00B4D8] text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-[#00B4D8] animate-pulse" />
            Kiệt tác Crossover Điện Thông Minh
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none mb-3 text-white">
            VINFAST VF 7
          </h1>

          <p className="text-lg sm:text-2xl text-[#00B4D8] mb-4 font-semibold tracking-wide">
            BỨC PHÁ ĐAM MÊ • Mãnh liệt Tinh thần Việt Nam
          </p>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mb-8 leading-relaxed">
            Kiệt tác thiết kế hợp tác cùng <strong>Torino Design</strong> (Ý). Động cơ điện công suất tối đa{" "}
            <strong className="text-white">349 mã lực</strong>, dẫn động 4 bánh toàn thời gian AWD, công nghệ an toàn thông minh ADAS cấp độ cao.
          </p>

          {/* Floating Spec Metric Strip */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-5 shadow-2xl mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="border-r border-white/15 pr-2">
              <span className="block text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                Tầm vận hành (WLTP)
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl text-white font-extrabold">431</span>
                <span className="text-xs text-slate-300 font-medium">km</span>
              </div>
            </div>

            <div className="border-r border-white/15 pr-2">
              <span className="block text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                Công suất cực đại
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl text-white font-extrabold">349</span>
                <span className="text-xs text-slate-300 font-medium">HP</span>
              </div>
            </div>

            <div className="border-r border-white/15 pr-2">
              <span className="block text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                0-100 km/h
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl text-white font-extrabold">5.8</span>
                <span className="text-xs text-slate-300 font-medium">giây</span>
              </div>
            </div>

            <div>
              <span className="block text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                Sạc siêu nhanh (10-70%)
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl sm:text-3xl text-[#00B4D8] font-extrabold">24</span>
                <span className="text-xs text-slate-300 font-medium">phút</span>
              </div>
            </div>
          </div>

          {/* Dual CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/configurator"
              className="bg-[#003F87] hover:bg-[#002D62] text-white text-sm font-bold px-7 py-3.5 rounded-lg shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center gap-2 group active:scale-95"
            >
              <span>Đặt cọc VF 7 ngay — Từ 850 Triệu</span>
              <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>

            <Link
              href="/vehicles/vf-3"
              className="border-2 border-white/40 text-white hover:bg-white/10 text-sm font-bold px-6 py-3.5 rounded-lg transition-all"
            >
              Khám phá VF 3 (Chỉ từ 240 triệu)
            </Link>
          </div>
        </div>

        {/* Quick Vehicle Model Tabs */}
        <div className="mt-12 pt-6 border-t border-white/15 flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2 text-xs">
          <span className="text-slate-400 uppercase tracking-wider font-semibold shrink-0">
            Dòng xe tiêu biểu:
          </span>
          <Link
            href="/vehicles/vf-3"
            className="px-4 py-1.5 rounded-full font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors whitespace-nowrap"
          >
            VF 3 • Đô thị sáng tạo
          </Link>
          <span className="px-4 py-1.5 rounded-full font-semibold bg-[#003F87] text-white shadow-sm whitespace-nowrap border border-[#00B4D8]/40">
            VF 7 • Bức phá đam mê
          </span>
          <Link
            href="/vehicles/vf-8"
            className="px-4 py-1.5 rounded-full font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors whitespace-nowrap"
          >
            VF 8 • SUV D-Class Toàn cầu
          </Link>
          <Link
            href="/vehicles/vf-9"
            className="px-4 py-1.5 rounded-full font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors whitespace-nowrap"
          >
            VF 9 • E-Class Đẳng cấp Doanh nhân
          </Link>
        </div>
      </div>
    </section>
  );
}
