"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "./BrandLogo";
import { NAV_LINKS, VINFAST_MODELS_PREVIEW } from "@/lib/constants";
import { getCarImage } from "@/lib/car-assets";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <BrandLogo />

        {/* Navigation Menu */}
        <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-sm font-semibold">
          {/* Ô tô điện with Mega-Menu Trigger */}
          <div
            className="relative py-6"
            onMouseEnter={() => setShowMegaMenu(true)}
            onMouseLeave={() => setShowMegaMenu(false)}
          >
            <Link
              href="/vehicles"
              className={`flex items-center gap-1 transition-colors ${
                showMegaMenu ? "text-[#003F87]" : "text-slate-800 hover:text-[#003F87]"
              }`}
            >
              <span>Ô tô điện</span>
              <span className={`material-symbols-outlined text-base transition-transform ${showMegaMenu ? "rotate-180 text-[#003F87]" : "text-slate-400"}`}>
                keyboard_arrow_down
              </span>
            </Link>

            {/* Mega Menu Dropdown */}
            {showMegaMenu && (
              <div className="absolute top-full -left-20 w-[840px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00B4D8]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Dải sản phẩm ô tô điện thông minh VinFast
                    </span>
                  </div>
                  <Link
                    href="/vehicles"
                    className="text-xs font-bold text-[#003F87] hover:underline flex items-center gap-1"
                  >
                    <span>Xem tất cả mẫu xe</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {VINFAST_MODELS_PREVIEW.map((car) => (
                    <Link
                      key={car.slug}
                      href={`/vehicles/${car.slug}`}
                      className="group p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex flex-col"
                      onClick={() => setShowMegaMenu(false)}
                    >
                      <div className="aspect-[16/9] w-full relative mb-2 overflow-hidden rounded-lg bg-slate-100">
                        <img
                          src={getCarImage(car.slug)}
                          alt={car.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-[#003F87]">
                          {car.name}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {car.segment}
                        </span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between text-xs">
                        <span className="text-slate-400">Giá từ</span>
                        <span className="font-extrabold text-[#003F87]">{car.priceFrom}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{car.rangeKm} km/sạc</span>
                        <span>•</span>
                        <span>{car.seats} chỗ</span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Sub banner inside mega menu */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between bg-blue-50/60 -mx-6 -mb-6 p-4 rounded-b-2xl">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#003F87] text-xl">electric_bolt</span>
                    <span className="text-xs text-slate-700">
                      Ưu đãi <strong>Lệ phí trước bạ 0%</strong> & Giảm trực tiếp 3% giá trị xe cho khách hàng tiên phong.
                    </span>
                  </div>
                  <Link
                    href="/on-road"
                    className="text-xs font-bold text-[#003F87] hover:underline"
                    onClick={() => setShowMegaMenu(false)}
                  >
                    Tính giá lăn bánh →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Regular Links */}
          {NAV_LINKS.filter((l) => l.href !== "/vehicles").map((link) => {
            if ("badge" in link && link.badge) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-1.5 text-[#003F87] bg-blue-50 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-[#00B4D8] animate-pulse" />
                  {link.label}
                </Link>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-700 hover:text-[#003F87] transition-colors py-1"
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Trailing Cluster */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* User Account State */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-[#003F87] text-white flex items-center justify-center text-[10px] font-bold">
                  {user?.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="max-w-[120px] truncate hidden md:inline">{user?.name || "Khách hàng"}</span>
                <span className="material-symbols-outlined text-sm text-slate-400">arrow_drop_down</span>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    href="/me"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-[#003F87]"
                  >
                    <span className="material-symbols-outlined text-base">receipt_long</span>
                    <span>Hợp đồng đặt cọc của tôi</span>
                  </Link>
                  <Link
                    href="/me"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-[#003F87]"
                  >
                    <span className="material-symbols-outlined text-base">calendar_month</span>
                    <span>Lịch hẹn lái thử</span>
                  </Link>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-left font-semibold"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-[#003F87] px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-lg mr-1 text-slate-500">account_circle</span>
              <span>VinFast ID</span>
            </Link>
          )}

          {/* Primary Action Button */}
          <Link
            href="/configurator"
            className="inline-flex items-center justify-center bg-[#003F87] hover:bg-[#002D62] text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 gap-1.5"
          >
            <span>Đặt cọc ngay</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Mobile Horizontal Sub-menu */}
      <div className="lg:hidden border-t border-slate-200/60 bg-white/95 overflow-x-auto custom-scrollbar px-4 py-2 flex items-center gap-4 text-xs font-medium whitespace-nowrap">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`hover:text-[#003F87] ${
              "badge" in link && link.badge ? "text-[#003F87] font-bold" : "text-slate-700"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
