"use client";

import { useState } from "react";
import Link from "next/link";
import { VINFAST_INFO } from "@/lib/constants";

export default function ServicesPage() {
  const [model, setModel] = useState("vf-7");
  const [plateNumber, setPlateNumber] = useState("");
  const [servicePackage, setServicePackage] = useState("12000");
  const [dealer, setDealer] = useState("dealer-timescity");
  const [bookingDate, setBookingDate] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-slate-900 pb-20">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-[#0B2545] via-[#003F87] to-[#002A5D] text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00B4D8_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 bg-[#00B4D8]/20 text-[#50D9FE] text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-[#00B4D8]/30 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#50D9FE] animate-pulse" />
              Chính sách hậu mãi số 1 Việt Nam
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
              Dịch vụ & Hậu mãi Đẳng cấp Toàn cầu
            </h1>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-8">
              VinFast đặt khách hàng làm trọng tâm với chính sách bảo hành chính hãng lên tới 10 năm,
              mạng lưới xưởng dịch vụ phủ khắp 63 tỉnh thành cùng dịch vụ cứu hộ, sạc pin lưu động 24/7.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#booking"
                className="bg-[#00B4D8] hover:bg-[#0096C7] text-slate-950 text-xs sm:text-sm font-extrabold px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">calendar_add_on</span>
                <span>Đặt hẹn dịch vụ trực tuyến</span>
              </a>
              <a
                href="tel:1900232389"
                className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl border border-white/20 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base text-[#50D9FE]">call</span>
                <span>Cứu hộ 24/7: 1900 23 23 89</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of VinFast Aftersales Commitment */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/80 hover:border-[#003F87]/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003F87] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-2">Bảo hành 10 năm</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bảo hành kỷ lục 10 năm hoặc 200.000 km cho toàn bộ dải xe điện. Bảo hành pin 10 năm không giới hạn km.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/80 hover:border-[#003F87]/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-[#00677D] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">support_agent</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-2">Cứu hộ 24/7 Miễn phí</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Đội ngũ cứu hộ chuyên nghiệp ứng cứu trên toàn quốc 24 giờ mỗi ngày, 365 ngày trong năm hoàn toàn miễn phí.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/80 hover:border-[#003F87]/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">electric_car</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-2">Mobile Service & Charging</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Xe sửa chữa lưu động và xe sạc pin lưu động đến tận nhà hoặc địa điểm khách hàng yêu cầu để bảo dưỡng, cứu trợ pin.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/80 hover:border-[#003F87]/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-2">Cam kết hỗ trợ tài chính</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hỗ trợ 1.000.000 ₫/ngày chi phí đi lại nếu xe gặp sự cố kỹ thuật phải lưu xưởng sửa chữa quá thời gian cam kết.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison: Maintenance Cost EV vs Gasoline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#003F87] uppercase tracking-wider">Tiết kiệm vượt trội</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            So sánh chi phí bảo dưỡng Xe điện vs Xe xăng
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Động cơ điện loại bỏ hơn 70% linh kiện cơ khí chuyển động so với động cơ đốt trong (không cần thay nhớt động cơ, bugi, dây đai cam, lọc xăng...).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Electric Vehicle Card */}
          <div className="bg-gradient-to-br from-blue-50/80 to-white rounded-2xl p-8 border-2 border-[#003F87] shadow-lg relative">
            <div className="inline-block bg-[#003F87] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full mb-4">
              Ô tô điện VinFast
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Bảo dưỡng định kỳ tối giản</h3>
            <p className="text-xs text-slate-600 mb-6">Mỗi 12.000 km hoặc 12 tháng (chu kỳ gấp đôi xe xăng thông thường).</p>

            <ul className="space-y-3 text-xs text-slate-700 mb-8">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                <span>Không cần thay dầu động cơ, lọc nhớt, bugi</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                <span>Hệ thống phanh tái sinh giảm mòn má phanh tới 50%</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                <span>Chỉ kiểm tra định kỳ: lọc gió cabin, dầu phanh, nước làm mát pin</span>
              </li>
              <li className="flex items-center gap-2 font-bold text-[#003F87]">
                <span className="material-symbols-outlined text-[#003F87] text-sm">check_circle</span>
                <span>Chi phí trung bình chỉ ~650.000 ₫ - 950.000 ₫ / lần</span>
              </li>
            </ul>

            <div className="p-4 rounded-xl bg-blue-100/60 border border-blue-200">
              <span className="text-xs text-slate-600">Tổng chi phí bảo dưỡng sau 100.000 km:</span>
              <p className="text-2xl font-black text-[#003F87] mt-1">~8.500.000 ₫</p>
            </div>
          </div>

          {/* Gasoline Vehicle Card */}
          <div className="bg-white rounded-2xl p-8 border border-slate-300 shadow-sm">
            <div className="inline-block bg-slate-200 text-slate-700 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full mb-4">
              Xe xăng truyền thống cùng phân khúc
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Bảo dưỡng định kỳ phức tạp</h3>
            <p className="text-xs text-slate-600 mb-6">Mỗi 5.000 km hoặc 6 tháng phải thay dầu và kiểm tra liên tục.</p>

            <ul className="space-y-3 text-xs text-slate-600 mb-8">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 text-sm">cancel</span>
                <span>Bắt buộc thay nhớt động cơ + lọc nhớt mỗi 5.000 - 10.000 km</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 text-sm">cancel</span>
                <span>Thay bugi, vệ sinh kim phun, họng hút, buồng đốt định kỳ</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 text-sm">cancel</span>
                <span>Thay thế dây curoa cam, dầu hộp số phức tạp, nước làm mát máy</span>
              </li>
              <li className="flex items-center gap-2 font-bold text-red-600">
                <span className="material-symbols-outlined text-red-500 text-sm">cancel</span>
                <span>Chi phí trung bình ~2.500.000 ₫ - 5.000.000 ₫ / lần</span>
              </li>
            </ul>

            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
              <span className="text-xs text-slate-600">Tổng chi phí bảo dưỡng sau 100.000 km:</span>
              <p className="text-2xl font-black text-slate-700 mt-1">~35.000.000 ₫ - 50.000.000 ₫</p>
            </div>
          </div>
        </div>
      </section>

      {/* Online Service Booking Form */}
      <section id="booking" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-[#003F87] uppercase tracking-wider">Đặt lịch nhanh chóng</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Đăng ký lịch dịch vụ & Bảo dưỡng trực tuyến
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Chuyên viên dịch vụ VinFast sẽ liên hệ xác nhận lịch hẹn trong vòng 15 phút.
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-12 bg-blue-50 rounded-2xl border border-blue-200 p-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">check</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Đăng ký lịch hẹn thành công!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mb-6">
                Cảm ơn Quý khách <strong>{fullName}</strong>. Chúng tôi đã ghi nhận lịch hẹn bảo dưỡng cho xe biển số{" "}
                <strong>{plateNumber || "theo yêu cầu"}</strong> tại xưởng dịch vụ VinFast.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="bg-[#003F87] text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-[#002D62] transition-colors"
              >
                Đặt lịch hẹn khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Dòng xe VinFast
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold focus:border-[#003F87] outline-none"
                  >
                    <option value="vf-3">VinFast VF 3</option>
                    <option value="vf-5-plus">VinFast VF 5 Plus</option>
                    <option value="vf-6">VinFast VF 6</option>
                    <option value="vf-7">VinFast VF 7</option>
                    <option value="vf-8">VinFast VF 8</option>
                    <option value="vf-9">VinFast VF 9</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Biển số xe
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 30A-999.88 hoặc 51K-123.45"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold focus:border-[#003F87] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Gói dịch vụ yêu cầu
                  </label>
                  <select
                    value={servicePackage}
                    onChange={(e) => setServicePackage(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold focus:border-[#003F87] outline-none"
                  >
                    <option value="12000">Bảo dưỡng định kỳ cấp 1 (12.000 km)</option>
                    <option value="24000">Bảo dưỡng định kỳ cấp 2 (24.000 km)</option>
                    <option value="48000">Bảo dưỡng tổng thể cấp 3 (48.000 km)</option>
                    <option value="check">Kiểm tra tổng quát / Chuẩn đoán lỗi</option>
                    <option value="mobile">Yêu cầu dịch vụ Mobile Service tại nhà</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Xưởng dịch vụ VinFast
                  </label>
                  <select
                    value={dealer}
                    onChange={(e) => setDealer(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold focus:border-[#003F87] outline-none"
                  >
                    <option value="dealer-hcm">VinFast Landmark 81 - Bình Thạnh, TP.HCM</option>
                    <option value="dealer-thaodien">VinFast Thảo Điền - TP. Thủ Đức, TP.HCM</option>
                    <option value="dealer-timescity">VinFast Times City - Hai Bà Trưng, Hà Nội</option>
                    <option value="dealer-smartcity">VinFast Smart City - Nam Từ Liêm, Hà Nội</option>
                    <option value="dealer-haiphong">VinFast Lê Thánh Tông - Hải Phòng</option>
                    <option value="dealer-cantho">VinFast Xuân Khánh - Cần Thơ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Họ và tên chủ xe
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold focus:border-[#003F87] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold focus:border-[#003F87] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Ngày hẹn dự kiến
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold focus:border-[#003F87] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#003F87] hover:bg-[#002D62] text-white text-xs sm:text-sm font-extrabold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">task_alt</span>
                <span>Xác nhận đăng ký lịch bảo dưỡng</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
