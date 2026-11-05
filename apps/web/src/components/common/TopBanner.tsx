import Link from "next/link";

export function TopBanner() {
  return (
    <aside className="bg-[#0B2545] text-white py-2 px-4 sm:px-6 border-b border-[#1E3A8A] text-xs font-medium z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00B4D8] text-[#002A5D] uppercase tracking-wider">
            Chiến dịch
          </span>
          <p className="flex items-center gap-2 text-slate-200">
            <span>
              <strong>Mãnh liệt Tinh thần Việt Nam:</strong> Miễn phí sạc pin tại trạm V-GREEN đến 2026
            </span>
            <span className="text-[#00B4D8] hidden md:inline">|</span>
            <span className="hidden md:inline">Hỗ trợ vay trả góp lãi suất chỉ từ 5%/năm</span>
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0 text-[11px]">
          <Link href="/finance" className="text-[#00B4D8] hover:text-white flex items-center gap-1 transition-colors">
            Xem chi tiết
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
