import Link from "next/link";
import { VINFAST_INFO } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-[#0B2545] text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Corporate info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-[#002A5D] to-[#00B4D8] p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#0B2545] rounded-[2px] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35L2.5 4h4.15L12 14.88 17.35 4h4.15L12 21.35z" />
                  </svg>
                </div>
              </div>
              <span className="text-2xl font-bold tracking-wider text-white">VINFAST</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              {VINFAST_INFO.fullName} — Thành viên của {VINFAST_INFO.parentCompany}. Tiên phong thúc đẩy cuộc cách mạng xe điện thông minh toàn cầu.
            </p>
            <div className="text-xs text-slate-300 space-y-1.5 pt-2">
              <p>
                <strong className="text-white">Hotline CSKH 24/7:</strong>{" "}
                <span className="text-[#00B4D8] font-bold text-sm">{VINFAST_INFO.hotline}</span>
              </p>
              <p>
                <strong className="text-white">Email hỗ trợ:</strong> {VINFAST_INFO.email}
              </p>
              <p>
                <strong className="text-white">Trụ sở chính:</strong> {VINFAST_INFO.headquarters}
              </p>
            </div>
          </div>

          {/* Col 2: Dòng xe */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Dòng xe điện</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li><Link href="/vehicles/vf-3" className="hover:text-white transition-colors">VinFast VF 3</Link></li>
              <li><Link href="/vehicles/vf-5-plus" className="hover:text-white transition-colors">VinFast VF 5 Plus</Link></li>
              <li><Link href="/vehicles/vf-6" className="hover:text-white transition-colors">VinFast VF 6</Link></li>
              <li><Link href="/vehicles/vf-7" className="hover:text-white transition-colors">VinFast VF 7</Link></li>
              <li><Link href="/vehicles/vf-8" className="hover:text-white transition-colors">VinFast VF 8</Link></li>
              <li><Link href="/vehicles/vf-9" className="hover:text-white transition-colors">VinFast VF 9</Link></li>
            </ul>
          </div>

          {/* Col 3: Dịch vụ & Chính sách */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Dịch vụ & Tiện ích</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li><Link href="/charging" className="hover:text-white transition-colors">Hệ sinh thái pin & Trạm sạc V-GREEN</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Dịch vụ bảo dưỡng & Hậu mãi</Link></li>
              <li><Link href="/compare" className="hover:text-white transition-colors">So sánh các dòng xe VinFast</Link></li>
              <li><Link href="/on-road" className="hover:text-white transition-colors">Dự toán chi phí lăn bánh</Link></li>
              <li><Link href="/finance" className="hover:text-white transition-colors">Dự toán vay mua trả góp 8 năm</Link></li>
              <li><Link href="/test-drive" className="hover:text-white transition-colors">Đăng ký lái thử tại nhà</Link></li>
              <li><Link href="/dealers" className="hover:text-white transition-colors">Mạng lưới Showroom 3S</Link></li>
              <li><Link href="/me" className="hover:text-white transition-colors">Quản lý đơn cọc VinFast ID</Link></li>
            </ul>
          </div>

          {/* Col 4: Cam kết & Chứng nhận */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Cam kết chất lượng</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Bảo hành chính hãng {VINFAST_INFO.warrantyYears} năm hoặc {VINFAST_INFO.warrantyKm.toLocaleString("vi-VN")} km. Cứu hộ 24/7 và dịch vụ sửa chữa lưu động Mobile Service toàn quốc.
            </p>
            <div className="p-3 rounded bg-slate-900/60 border border-slate-700 text-[11px] text-slate-300 space-y-1">
              <p className="font-semibold text-white">⭐ ASEAN NCAP 5 Sao</p>
              <p className="text-[10px] text-slate-400">Đã đăng ký chứng nhận với Bộ Công Thương Việt Nam.</p>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2025 VinFast Auto Vietnam. Bản quyền thuộc Tập đoàn Vingroup.</p>
          <div className="flex items-center space-x-6">
            <span className="hover:text-white cursor-pointer">Điều khoản dịch vụ</span>
            <span className="hover:text-white cursor-pointer">Chính sách bảo mật</span>
            <span className="hover:text-white cursor-pointer">Sơ đồ trang web</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
