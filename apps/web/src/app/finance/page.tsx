"use client";
import { useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

type FinanceResult = {
  monthlyPaymentVnd: string;
  totalInterestVnd: string;
  totalPaymentVnd: string;
  principalVnd: string;
  schedule: { month: number; paymentVnd: string; interestVnd: string; principalVnd: string; balanceAfterVnd: string }[];
  disclaimer: string;
};

const toVnd = (value: string) => `${Number(value).toLocaleString("vi-VN")} ₫`;

export default function Finance() {
  const [price, setPrice] = useState(700_000_000);
  const [down, setDown] = useState(140_000_000);
  const [rate, setRate] = useState(7.5);
  const [months, setMonths] = useState(60);
  const [method, setMethod] = useState<"EQUAL_PAYMENT" | "EQUAL_PRINCIPAL">("EQUAL_PAYMENT");
  const [result, setResult] = useState<FinanceResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const principal = Math.max(0, price - down);
  const canSubmit = principal > 0 && months > 0 && rate >= 0;

  async function simulate() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<FinanceResult>("/finance/simulate", {
        method: "POST",
        body: JSON.stringify({ principalVnd: String(principal), annualRateBps: Math.round(rate * 100), termMonths: months, method }),
      });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const preview = useMemo(() => {
    if (!result) return null;
    return result.schedule.slice(0, 12);
  }, [result]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Dự toán trả góp</h1>
      <p className="mt-2 text-sm text-neutral-500">Kết quả do máy chủ tính toán. Đây là mô phỏng, không phải phê duyệt khoản vay.</p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Giá xe (₫)</label>
          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="mt-1 w-full rounded-lg border px-4 py-2" />

          <label className="mt-4 block text-sm font-medium">Tiền trả trước: {toVnd(String(down))}</label>
          <input type="range" min={0} max={price} step={1_000_000} value={down} onChange={(e) => setDown(Number(e.target.value))} className="w-full accent-cyan-600" />

          <label className="mt-4 block text-sm font-medium">Lãi suất (%/năm)</label>
          <input type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="mt-1 w-full rounded-lg border px-4 py-2" />

          <label className="mt-4 block text-sm font-medium">Kỳ hạn (tháng)</label>
          <input type="number" min={1} max={120} value={months} onChange={(e) => setMonths(Number(e.target.value))} className="mt-1 w-full rounded-lg border px-4 py-2" />

          <label className="mt-4 block text-sm font-medium">Phương pháp trả</label>
          <select value={method} onChange={(e) => setMethod(e.target.value as "EQUAL_PAYMENT" | "EQUAL_PRINCIPAL")} className="mt-1 w-full rounded-lg border px-4 py-2">
            <option value="EQUAL_PAYMENT">Trả góp đều (ăn mỳ)</option>
            <option value="EQUAL_PRINCIPAL">Trả gốc đều (dư nợ giảm dần)</option>
          </select>

          <p className="mt-4 text-sm text-neutral-500">Tiền vay: <strong>{toVnd(String(principal))}</strong></p>
          <button onClick={simulate} disabled={loading || !canSubmit} className="mt-4 w-full rounded-full bg-[#0a1633] py-3 text-white disabled:opacity-50">
            {loading ? "Đang tính..." : "Dự toán"}
          </button>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        <div>
          {result ? (
            <div className="rounded-2xl bg-neutral-100 p-6">
              <p className="text-sm text-neutral-500">Mỗi tháng (kỳ đầu)</p>
              <p className="text-3xl font-bold text-cyan-700">{toVnd(result.monthlyPaymentVnd)}</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt>Tổng lãi dự kiến</dt><dd>{toVnd(result.totalInterestVnd)}</dd></div>
                <div className="flex justify-between"><dt>Tổng tiền phải trả</dt><dd>{toVnd(result.totalPaymentVnd)}</dd></div>
              </dl>
              <table className="mt-6 w-full text-left text-xs">
                <thead className="text-neutral-500"><tr><th>Tháng</th><th>Gốc</th><th>Lãi</th><th>Còn lại</th></tr></thead>
                <tbody>
                  {preview?.map((row) => (
                    <tr key={row.month} className="border-t">
                      <td>{row.month}</td>
                      <td>{toVnd(row.principalVnd)}</td>
                      <td>{toVnd(row.interestVnd)}</td>
                      <td>{toVnd(row.balanceAfterVnd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.schedule.length > 12 && <p className="mt-2 text-xs text-neutral-500">Hiển thị 12 kỳ đầu của {result.schedule.length} kỳ.</p>}
              <p className="mt-4 text-xs text-neutral-500">{result.disclaimer}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-neutral-500">Nhập thông tin và bấm “Dự toán”.</div>
          )}
        </div>
      </div>
    </main>
  );
}
