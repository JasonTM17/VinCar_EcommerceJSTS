"use client";

import { useState } from "react";
import Link from "next/link";
import { VGREEN_MAP_IMAGE } from "@/lib/car-assets";

export function HomeChargingNetwork() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="charging-network">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Stats & Search (6 cols) */}
        <div className="lg:col-span-6 space-y-8">
          <div>
            <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-widest block mb-2">
              HẠ TẦNG XANH TIÊN PHONG
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#003F87] tracking-tight">
              Hệ Thống Trạm Sạc V-GREEN Phủ Sóng Toàn Quốc
            </h2>
            <p className="text-sm text-slate-600 mt-4 leading-relaxed">
              Mạng lưới trạm sạc xe điện lớn nhất Việt Nam được đầu tư bởi V-GREEN, hiện diện trên khắp 63 tỉnh thành, các tuyến cao tốc huyết mạch, trung tâm thương mại và đô thị lớn.
            </p>
          </div>

          {/* 4 Core Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-3xl font-extrabold text-[#003F87] block">150.000+</span>
              <span className="text-xs text-slate-600 mt-1 block">Cổng sạc trên 63 tỉnh thành</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-3xl font-extrabold text-[#00B4D8] block">≤ 3.5 km</span>
              <span className="text-xs text-slate-600 mt-1 block">Khoảng cách trung bình nội đô</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-3xl font-extrabold text-[#003F87] block">10 Năm</span>
              <span className="text-xs text-slate-600 mt-1 block">Bảo hành xe hoặc 200.000 km</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-3xl font-extrabold text-[#00B4D8] block">24/7</span>
              <span className="text-xs text-slate-600 mt-1 block">Cứu hộ & Mobile Service lưu động</span>
            </div>
          </div>

          {/* Quick Station Search */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <label htmlFor="station-search" className="block text-xs font-bold text-[#003F87] uppercase tracking-wide mb-2">
              Tìm trạm sạc hoặc showroom gần bạn nhất
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-xl">
                  search
                </span>
                <input
                  id="station-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nhập địa chỉ, quận/huyện hoặc tỉnh thành..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#003F87] outline-none"
                />
              </div>
              <Link
                href={`/dealers?q=${encodeURIComponent(searchQuery)}`}
                className="bg-[#003F87] hover:bg-[#002D62] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
              >
                <span>Tìm kiếm</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Map Card (6 cols) */}
        <div className="lg:col-span-6">
          <div className="bg-[#0B2545] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 p-3 sm:p-4 group">
            <div className="relative h-[380px] sm:h-[460px] rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
              <img
                src={VGREEN_MAP_IMAGE}
                alt="Bản đồ mạng lưới trạm sạc V-GREEN Việt Nam"
                className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
              />

              {/* Status Overlay Badges */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/40 shadow text-xs">
                <span className="flex items-center gap-2 font-bold text-[#003F87]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  Trạm sạc đang hoạt động: 99.4%
                </span>
              </div>

              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/40 shadow text-xs text-right">
                <div className="font-bold text-[#003F87]">V-GREEN Ultra Fast Charge</div>
                <span className="text-[10px] text-slate-600">Công suất sạc lên đến 360 kW</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
