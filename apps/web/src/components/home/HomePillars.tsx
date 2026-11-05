"use client";

import { useState } from "react";
import Link from "next/link";

export function HomePillars() {
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone) return;
    setSubmitted(true);
  }

  return (
    <section className="py-20 bg-[#003F87] text-white relative overflow-hidden" id="campaign-policy">
      {/* Decorative Glow Elements */}
      <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-[#00B4D8]/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mb-14">
          <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-widest block mb-2">
            CAM KẾT ĐỒNG HÀNH TOÀN DIỆN
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Chiến Dịch &ldquo;Mãnh Liệt Tinh Thần Việt Nam&rdquo;
          </h2>
          <p className="text-sm sm:text-base text-blue-100 mt-3 leading-relaxed">
            Chính sách bán hàng và dịch vụ hậu mãi vượt trội nhằm tri ân khách hàng và thúc đẩy cuộc cách mạng chuyển đổi xanh quốc gia.
          </p>
        </div>

        {/* 3 Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-8 hover:bg-white/15 transition-all">
            <div className="w-12 h-12 rounded-lg bg-[#00B4D8] text-[#002A5D] flex items-center justify-center mb-6 shadow-md">
              <span className="material-symbols-outlined text-2xl font-bold">payments</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Tài Chính Ưu Đãi 8 Năm</h3>
            <p className="text-xs text-blue-100 leading-relaxed mb-4">
              Khách hàng được vay tới 70-80% giá trị xe trong thời hạn lên tới 8 năm với lãi suất cố định chỉ từ 5% - 8%/năm, thanh toán nhẹ nhàng từ 5 triệu đồng/tháng.
            </p>
            <Link href="/finance" className="inline-flex items-center gap-1 text-[#00B4D8] text-xs font-bold hover:text-white transition-colors">
              Tính toán khoản vay
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-8 hover:bg-white/15 transition-all">
            <div className="w-12 h-12 rounded-lg bg-[#00B4D8] text-[#002A5D] flex items-center justify-center mb-6 shadow-md">
              <span className="material-symbols-outlined text-2xl font-bold">price_check</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Cam Kết Mua Lại Đến 90%</h3>
            <p className="text-xs text-blue-100 leading-relaxed mb-4">
              VinFast tiên phong cam kết giá trị thu mua lại xe đã qua sử dụng lên tới 90% sau 1 năm, 86% sau 2 năm và 78% sau 3 năm, bảo toàn giá trị đầu tư cho chủ sở hữu.
            </p>
            <span className="inline-flex items-center gap-1 text-[#00B4D8] text-xs font-bold">
              Chính sách minh bạch
              <span className="material-symbols-outlined text-sm">verified</span>
            </span>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-8 hover:bg-white/15 transition-all">
            <div className="w-12 h-12 rounded-lg bg-[#00B4D8] text-[#002A5D] flex items-center justify-center mb-6 shadow-md">
              <span className="material-symbols-outlined text-2xl font-bold">local_parking</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Đặc Quyền Hệ Sinh Thái</h3>
            <p className="text-xs text-blue-100 leading-relaxed mb-4">
              Miễn phí gửi xe dưới 5 tiếng tại tất cả trung tâm thương mại Vincom, bệnh viện Vinmec, trường học Vinschool và các khu nghỉ dưỡng Vinpearl trên toàn quốc.
            </p>
            <span className="inline-flex items-center gap-1 text-[#00B4D8] text-xs font-bold">
              Hệ sinh thái Vingroup
              <span className="material-symbols-outlined text-sm">apartment</span>
            </span>
          </div>
        </div>

        {/* Test Drive Consultation Bar */}
        <div className="mt-12 bg-white text-[#191C1E] rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="max-w-xl text-center md:text-left">
            <h4 className="text-xl font-bold text-[#003F87]">
              Đăng Ký Lái Thử Trải Nghiệm Tận Nơi
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Đội ngũ chuyên viên VinFast sẵn sàng mang mẫu xe bạn yêu thích đến tận nhà hoặc cơ quan để bạn trải nghiệm thực tế.
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 px-6 py-3 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">check_circle</span>
              Cảm ơn bạn! Chuyên viên VinFast sẽ liên hệ lại trong ít phút.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 w-full md:w-auto justify-center">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại của bạn..."
                required
                className="bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#003F87] outline-none w-full sm:w-64"
              />
              <button
                type="submit"
                className="bg-[#003F87] hover:bg-[#002D62] text-white text-xs font-bold px-6 py-2.5 rounded-lg transition-colors whitespace-nowrap shadow-sm"
              >
                Nhận tư vấn ngay
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
