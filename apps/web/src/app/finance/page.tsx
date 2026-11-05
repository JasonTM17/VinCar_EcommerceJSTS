"use client";

import { useMemo, useState, useEffect, use } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type FinanceResult = {
  monthlyPaymentVnd: string;
  totalInterestVnd: string;
  totalPaymentVnd: string;
  principalVnd: string;
  schedule: { month: number; paymentVnd: string; interestVnd: string; principalVnd: string; balanceAfterVnd: string }[];
  disclaimer: string;
};

const toVnd = (value: string | number | bigint) => `${Number(value).toLocaleString("vi-VN")} ₫`;

export default function Finance({
  searchParams,
}: {
  searchParams?: Promise<{ price?: string }>;
}) {
  const sp = searchParams ? use(searchParams) : {};

  const [price, setPrice] = useState(850_000_000);
  const [downPercent, setDownPercent] = useState(20); // 20% down payment
  const [rate, setRate] = useState(5.0); // VinFast promotional 5.0% interest rate
  const [months, setMonths] = useState(96); // 8 years (96 months)
  const [method, setMethod] = useState<"EQUAL_PAYMENT" | "EQUAL_PRINCIPAL">("EQUAL_PAYMENT");
  const [result, setResult] = useState<FinanceResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sp?.price) {
      const p = Number(sp.price);
      if (!isNaN(p) && p > 0) setPrice(p);
    }
  }, [sp?.price]);

  const downAmount = Math.round((price * downPercent) / 100);
  const principal = Math.max(0, price - downAmount);
  const canSubmit = principal > 0 && months > 0 && rate >= 0;

  async function simulate() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<FinanceResult>("/finance/simulate", {
        method: "POST",
        body: JSON.stringify({
          principalVnd: String(principal),
          annualRateBps: Math.round(rate * 100),
          termMonths: months,
          method,
        }),
      });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  // Auto calculate on mount or param changes
  useEffect(() => {
    simulate();
  }, [price, downPercent, rate, months, method]);

  const preview = useMemo(() => {
    if (!result) return null;
    return result.schedule.slice(0, 12);
  }, [result]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="border-b border-slate-200 pb-6 mb-8">
        <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-widest block mb-1">
          CHÍNH SÁCH TÀI CHÍNH ƯU ĐÃI
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#003F87] tracking-tight">
          Ước Tính Vay Mua Xe Trả Góp VinFast
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Chương trình &ldquo;Mãnh liệt Tinh thần Việt Nam&rdquo;: Hỗ trợ vay tới 80% giá trị xe trong 8 năm với lãi suất cố định ưu đãi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-[#003F87] uppercase tracking-wider mb-2">
                1. Giá trị xe dự kiến (VNĐ)
              </label>
              <input
                type="number"
                step="10000000"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-[#003F87] font-extrabold focus:border-[#003F87] outline-none"
              />
              <span className="text-xs text-slate-500 mt-1 block">Hiện tại: {toVnd(price)}</span>
            </div>

            {/* Down Payment Percent Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-[#003F87] uppercase tracking-wider">
                  2. Tỷ lệ trả trước: {downPercent}%
                </label>
                <strong className="text-xs text-[#003F87]">{toVnd(downAmount)}</strong>
              </div>
              <input
                type="range"
                min="15"
                max="80"
                step="5"
                value={downPercent}
                onChange={(e) => setDownPercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#003F87]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>15% (Tối thiểu)</span>
                <span>50%</span>
                <span>80%</span>
              </div>
            </div>

            {/* Loan Term */}
            <div>
              <label className="block text-xs font-bold text-[#003F87] uppercase tracking-wider mb-2">
                3. Kỳ hạn vay: {months} tháng ({Math.round(months / 12)} năm)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[36, 60, 84, 96].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMonths(m)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      months === m
                        ? "bg-[#003F87] text-white border-[#003F87] shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {m / 12} năm
                  </button>
                ))}
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <label className="block text-xs font-bold text-[#003F87] uppercase tracking-wider mb-2">
                4. Gói lãi suất (%/năm)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { r: 5.0, label: "5.0% (VinFast)" },
                  { r: 7.0, label: "7.0% (Cố định)" },
                  { r: 8.5, label: "8.5% (Tiêu chuẩn)" },
                ].map((item) => (
                  <button
                    key={item.r}
                    type="button"
                    onClick={() => setRate(item.r)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      rate === item.r
                        ? "bg-[#003F87] text-white border-[#003F87] shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Repayment Method */}
            <div>
              <label className="block text-xs font-bold text-[#003F87] uppercase tracking-wider mb-2">
                5. Phương thức trả nợ
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as "EQUAL_PAYMENT" | "EQUAL_PRINCIPAL")}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-xs text-slate-800 font-medium focus:border-[#003F87] outline-none"
              >
                <option value="EQUAL_PAYMENT">Trả đều hàng tháng (Gốc + Lãi cố định)</option>
                <option value="EQUAL_PRINCIPAL">Gốc đều hàng tháng (Lãi giảm dần theo dư nợ)</option>
              </select>
            </div>

            {/* Loan Principal Highlight */}
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs flex justify-between items-center">
              <span className="text-slate-600">Số tiền cần vay ngân hàng:</span>
              <strong className="text-sm font-extrabold text-[#003F87]">{toVnd(principal)}</strong>
            </div>

            {error && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
          </div>
        </div>

        {/* Results Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-wider block">
              BẢNG TÍNH LỊCH TRẢ NỢ DỰ KIẾN
            </span>

            {result ? (
              <div className="space-y-6">
                {/* Highlight Monthly Payment */}
                <div className="p-6 rounded-2xl bg-gradient-to-tr from-[#003F87] to-[#002D62] text-white">
                  <span className="text-[10px] text-[#00B4D8] font-bold uppercase tracking-wider block">
                    SỐ TIỀN THANH TOÁN MỖI THÁNG (KỲ ĐẦU TIÊN):
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold mt-1 text-white">
                    {toVnd(result.monthlyPaymentVnd)}
                  </div>
                  <span className="text-xs text-slate-300 mt-1 block">
                    Đã bao gồm gốc và lãi theo kỳ hạn {months} tháng
                  </span>
                </div>

                {/* Overall Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Tiền trả trước ({downPercent}%):</span>
                    <strong className="text-slate-800 text-sm">{toVnd(downAmount)}</strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Tổng tiền lãi ước tính:</span>
                    <strong className="text-slate-800 text-sm">{toVnd(result.totalInterestVnd)}</strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block text-[11px]">Tổng số tiền gốc + lãi:</span>
                    <strong className="text-[#003F87] text-sm">{toVnd(result.totalPaymentVnd)}</strong>
                  </div>
                </div>

                {/* Schedule Table Preview */}
                <div>
                  <h4 className="text-xs font-bold text-[#003F87] uppercase tracking-wider mb-3">
                    Lịch trả góp 12 tháng đầu tiên:
                  </h4>
                  <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Kỳ</th>
                          <th className="py-2.5 px-3">Tiền trả hàng tháng</th>
                          <th className="py-2.5 px-3">Tiền gốc</th>
                          <th className="py-2.5 px-3">Tiền lãi</th>
                          <th className="py-2.5 px-3">Dư nợ còn lại</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {preview?.map((row) => (
                          <tr key={row.month} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-semibold text-slate-700">Tháng {row.month}</td>
                            <td className="py-2 px-3 font-bold text-[#003F87]">{toVnd(row.paymentVnd)}</td>
                            <td className="py-2 px-3 text-slate-700">{toVnd(row.principalVnd)}</td>
                            <td className="py-2 px-3 text-slate-500">{toVnd(row.interestVnd)}</td>
                            <td className="py-2 px-3 font-medium text-slate-600">{toVnd(row.balanceAfterVnd)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2 block italic">
                    {result.disclaimer}
                  </span>
                </div>

                {/* Action button */}
                <div className="pt-2">
                  <Link
                    href="/configurator"
                    className="w-full bg-[#003F87] hover:bg-[#002D62] text-white text-xs font-bold py-3.5 rounded-xl text-center block shadow transition-all"
                  >
                    Tiến hành cấu hình xe & Đặt cọc
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400">
                <span className="material-symbols-outlined text-4xl animate-spin text-[#003F87]">
                  progress_activity
                </span>
                <p className="mt-2 text-xs">Đang tính toán bảng lịch trả nợ...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
