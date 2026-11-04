"use client";
import { useEffect, useState } from "react";
import { apiFetch, type Vehicle } from "@/lib/api";

type OnRoadResult = {
  configuration: { trimName: string; modelName: string; colorName: string | null; optionIds: string[] };
  fees: { registrationFeeVnd: string; plateFeeVnd: string; otherFeesVnd: string; ruleCount: number };
  breakdown: {
    vehicleBeforeDiscountVnd: string;
    discountVnd: string;
    vehicleAfterDiscountVnd: string;
    registrationFeeVnd: string;
    plateFeeVnd: string;
    otherFeesVnd: string;
    onRoadTotalVnd: string;
  };
  disclaimer: string;
};

const toVnd = (value: string) => `${Number(value).toLocaleString("vi-VN")} ₫`;

export default function OnRoad() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [trimId, setTrimId] = useState("");
  const [colorId, setColorId] = useState("");
  const [optionIds, setOptionIds] = useState<string[]>([]);
  const [province, setProvince] = useState("Ho Chi Minh");
  const [result, setResult] = useState<OnRoadResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<{ data: Vehicle[] }>("/vehicles")
      .then((data) => {
        setVehicles(data.data);
        if (data.data[0]) {
          setVehicle(data.data[0]);
          setTrimId(data.data[0].trims[0]?.id ?? "");
          setColorId(data.data[0].trims[0]?.colors[0]?.id ?? "");
          setOptionIds([]);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  const trim = vehicle?.trims.find((t) => t.id === trimId) ?? null;

  function chooseVehicle(next: Vehicle) {
    setVehicle(next);
    setTrimId(next.trims[0]?.id ?? "");
    setColorId(next.trims[0]?.colors[0]?.id ?? "");
    setOptionIds([]);
    setResult(null);
  }

  function toggleOption(id: string) {
    setOptionIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  }

  async function calculate() {
    if (!trim) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<OnRoadResult>("/on-road/simulate", {
        method: "POST",
        body: JSON.stringify({ trimId, colorId: colorId || undefined, optionIds, province }),
      });
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Dự toán chi phí lăn bánh</h1>
      <p className="mt-2 text-sm text-neutral-500">Mức phí lấy từ quy tắc hiệu lực theo tỉnh/thành, do máy chủ tính toán.</p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium">Mẫu xe</label>
            <select value={vehicle?.id ?? ""} onChange={(e) => chooseVehicle(vehicles.find((v) => v.id === e.target.value)!)} className="mt-1 w-full rounded-lg border px-4 py-2">
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.brand.name} {v.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Phiên bản</label>
            <select value={trimId} onChange={(e) => { setTrimId(e.target.value); const t = vehicle?.trims.find((x) => x.id === e.target.value); setColorId(t?.colors[0]?.id ?? ""); setOptionIds([]); }} className="mt-1 w-full rounded-lg border px-4 py-2">
              {vehicle?.trims.map((t) => <option key={t.id} value={t.id}>{t.name} — {toVnd(t.basePriceVnd)}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Màu ngoại thất</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {trim?.colors.map((c) => (
                <button key={c.id} onClick={() => setColorId(c.id)} aria-pressed={colorId === c.id} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${colorId === c.id ? "border-cyan-600 bg-cyan-50" : ""}`}>
                  <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: c.hex }} aria-hidden="true" />
                  {c.name}
                  {c.surchargeVnd !== "0" && <span className="text-xs text-neutral-500">+{toVnd(c.surchargeVnd)}</span>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tùy chọn</label>
            <div className="mt-2 space-y-2">
              {trim?.options.map((o) => (
                <label key={o.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" checked={optionIds.includes(o.id)} onChange={() => toggleOption(o.id)} className="accent-cyan-600" />
                    {o.name}
                  </span>
                  <span className="text-neutral-500">+{toVnd(o.priceVnd)}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tỉnh/thành đăng ký</label>
            <select value={province} onChange={(e) => setProvince(e.target.value)} className="mt-1 w-full rounded-lg border px-4 py-2">
              <option>Ho Chi Minh</option>
              <option>Ha Noi</option>
              <option>Da Nang</option>
            </select>
          </div>

          <button onClick={calculate} disabled={loading || !trim} className="w-full rounded-full bg-[#0a1633] py-3 text-white disabled:opacity-50">
            {loading ? "Đang tính..." : "Dự toán"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div>
          {result ? (
            <div className="rounded-2xl bg-neutral-100 p-6">
              <p className="text-sm text-neutral-500">{result.configuration.modelName} · {result.configuration.trimName} · {result.configuration.colorName ?? "Không chọn màu"}</p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt>Giá xe trước giảm giá</dt><dd>{toVnd(result.breakdown.vehicleBeforeDiscountVnd)}</dd></div>
                <div className="flex justify-between"><dt>Giảm giá</dt><dd>-{toVnd(result.breakdown.discountVnd)}</dd></div>
                <div className="flex justify-between"><dt>Lệ phí đăng ký</dt><dd>{toVnd(result.breakdown.registrationFeeVnd)}</dd></div>
                <div className="flex justify-between"><dt>Lệ phí biển số</dt><dd>{toVnd(result.breakdown.plateFeeVnd)}</dd></div>
                <div className="flex justify-between"><dt>Chi phí khác</dt><dd>{toVnd(result.breakdown.otherFeesVnd)}</dd></div>
              </dl>
              <p className="mt-4 border-t pt-4 text-xl font-bold text-cyan-700">Tổng lăn bánh dự kiến: {toVnd(result.breakdown.onRoadTotalVnd)}</p>
              <p className="mt-2 text-xs text-neutral-500">{result.fees.ruleCount} quy tắc phí áp dụng. {result.disclaimer}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-neutral-500">Chọn cấu hình và bấm “Dự toán”.</div>
          )}
        </div>
      </div>
    </main>
  );
}
