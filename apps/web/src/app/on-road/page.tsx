"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { apiFetch, type Vehicle } from "@/lib/api";
import { getCarImage } from "@/lib/car-assets";

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

const toVnd = (value: string | number | bigint) => `${Number(value).toLocaleString("vi-VN")} ₫`;

export default function OnRoad({
  searchParams,
}: {
  searchParams?: Promise<{ model?: string }>;
}) {
  const sp = searchParams ? use(searchParams) : {};

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
        const match = sp?.model ? data.data.find((v) => v.slug === sp.model) : null;
        const initial = match || data.data[0];
        if (initial) {
          setVehicle(initial);
          setTrimId(initial.trims[0]?.id ?? "");
          setColorId(initial.trims[0]?.colors[0]?.id ?? "");
          setOptionIds([]);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [sp?.model]);

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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="border-b border-slate-200 pb-6 mb-8">
        <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-widest block mb-1">
          DỰ TOÁN CHI PHÍ TRỌN GÓI
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#003F87] tracking-tight">
          Ước Tính Chi Phí Lăn Bánh Xe VinFast
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Chính sách miễn 100% lệ phí trước bạ của Chính phủ dành cho ô tô điện giúp tiết kiệm lên tới hàng trăm triệu đồng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Controls Column (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Vehicle Select */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            <div>
              <label className="block text-xs font-bold text-[#003F87] uppercase tracking-wider mb-2">
                1. Chọn dòng xe VinFast
              </label>
              <select
                value={vehicle?.id ?? ""}
                onChange={(e) => chooseVehicle(vehicles.find((v) => v.id === e.target.value)!)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs text-[#003F87] font-bold focus:border-[#003F87] outline-none"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.category} • {v.seats} chỗ)
                  </option>
                ))}
              </select>
            </div>

            {/* Trim Select */}
            <div>
              <label className="block text-xs font-bold text-[#003F87] uppercase tracking-wider mb-2">
                2. Phiên bản xe
              </label>
              <div className="space-y-2">
                {vehicle?.trims.map((t) => (
                  <label
                    key={t.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      trimId === t.id ? "border-[#003F87] bg-blue-50/50 shadow-sm" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="trim"
                        checked={trimId === t.id}
                        onChange={() => {
                          setTrimId(t.id);
                          setColorId(t.colors[0]?.id ?? "");
                          setOptionIds([]);
                        }}
                        className="text-[#003F87] focus:ring-[#003F87] accent-[#003F87]"
                      />
                      <span className="text-xs font-bold text-slate-900">{t.name}</span>
                    </div>
                    <span className="text-xs font-extrabold text-[#003F87]">{toVnd(t.basePriceVnd)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Swatches */}
            {trim && trim.colors.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-[#003F87] uppercase tracking-wider mb-2">
                  3. Màu sắc ngoại thất
                </label>
                <div className="flex flex-wrap gap-2">
                  {trim.colors.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColorId(c.id)}
                      className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs transition-all ${
                        colorId === c.id
                          ? "border-[#003F87] bg-blue-50/60 font-bold text-[#003F87] shadow-sm"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="h-3.5 w-3.5 rounded-full border border-slate-300" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                      {c.surchargeVnd !== "0" && <span className="text-slate-400 font-normal">+{toVnd(c.surchargeVnd)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Optional features */}
            {trim && trim.options.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-[#003F87] uppercase tracking-wider mb-2">
                  4. Phụ kiện & Tiện nghi tùy chọn
                </label>
                <div className="space-y-2">
                  {trim.options.map((o) => (
                    <label key={o.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-xs cursor-pointer hover:bg-slate-50">
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={optionIds.includes(o.id)}
                          onChange={() => toggleOption(o.id)}
                          className="accent-[#003F87]"
                        />
                        <span className="font-medium text-slate-800">{o.name}</span>
                      </span>
                      <span className="text-slate-500 font-semibold">+{toVnd(o.priceVnd)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Province */}
            <div>
              <label className="block text-xs font-bold text-[#003F87] uppercase tracking-wider mb-2">
                5. Khu vực đăng ký lăn bánh
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 font-semibold focus:border-[#003F87] outline-none"
              >
                <option value="Ho Chi Minh">TP. Hồ Chí Minh (Phí biển số 20 triệu)</option>
                <option value="Ha Noi">Hà Nội (Phí biển số 20 triệu)</option>
                <option value="Da Nang">Đà Nẵng (Phí biển số 1 triệu)</option>
                <option value="Hai Phong">Hải Phòng (Phí biển số 1 triệu)</option>
                <option value="Can Tho">Cần Thơ (Phí biển số 1 triệu)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={calculate}
              disabled={loading || !trim}
              className="w-full rounded-xl bg-[#003F87] hover:bg-[#002D62] py-3.5 text-white text-xs font-bold shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span>Đang tính toán...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">calculate</span>
                  <span>Tính chi phí lăn bánh ngay</span>
                </>
              )}
            </button>

            {error && <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>}
          </div>
        </div>

        {/* Results Column (6 cols) */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-wider block">
              KẾT QUẢ DỰ TOÁN LĂN BÁNH
            </span>

            {result ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#003F87]">
                    {result.configuration.modelName} — {result.configuration.trimName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Đăng ký tại: <strong>{province}</strong> • Màu: {result.configuration.colorName ?? "Tiêu chuẩn"}
                  </p>
                </div>

                {/* Big Total */}
                <div className="p-5 rounded-2xl bg-gradient-to-tr from-[#003F87] to-[#002D62] text-white">
                  <span className="text-[10px] text-[#00B4D8] font-bold uppercase tracking-wider block">
                    TỔNG CHI PHÍ LĂN BÁNH DỰ KIẾN:
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold mt-1 text-white">
                    {toVnd(result.breakdown.onRoadTotalVnd)}
                  </div>
                  <span className="text-xs text-slate-300 mt-1 block">
                    Đã bao gồm toàn bộ lệ phí bắt buộc theo quy định pháp luật
                  </span>
                </div>

                {/* Detailed Fees Breakdown */}
                <div className="border border-slate-200 rounded-xl p-4 divide-y divide-slate-100 text-xs">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Giá xe niêm yết:</span>
                    <strong className="text-slate-800">{toVnd(result.breakdown.vehicleBeforeDiscountVnd)}</strong>
                  </div>

                  {result.breakdown.discountVnd !== "0" && (
                    <div className="flex justify-between py-2 text-emerald-600 font-semibold">
                      <span>Ưu đãi áp dụng:</span>
                      <span>-{toVnd(result.breakdown.discountVnd)}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-2">
                    <span className="text-slate-600 flex items-center gap-1">
                      <span>Lệ phí trước bạ (0% EV):</span>
                      <span className="material-symbols-outlined text-xs text-emerald-600">verified</span>
                    </span>
                    <strong className="text-emerald-600">0 ₫ (Miễn 100%)</strong>
                  </div>

                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Lệ phí cấp biển số:</span>
                    <strong className="text-slate-800">{toVnd(result.breakdown.plateFeeVnd)}</strong>
                  </div>

                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Phí bảo trì đường bộ, đăng kiểm & TNDS:</span>
                    <strong className="text-slate-800">{toVnd(result.breakdown.otherFeesVnd)}</strong>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    href={`/configurator?trimId=${trimId}`}
                    className="bg-[#003F87] hover:bg-[#002D62] text-white text-xs font-bold py-3 rounded-lg text-center shadow transition-all"
                  >
                    Đặt cọc xe ngay
                  </Link>

                  <Link
                    href={`/finance?price=${result.breakdown.onRoadTotalVnd}`}
                    className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold py-3 rounded-lg text-center transition-all"
                  >
                    Tính tiền vay trả góp
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <span className="material-symbols-outlined text-5xl text-slate-300">calculate</span>
                <p className="text-xs text-slate-500">
                  Vui lòng chọn phiên bản và bấm <strong>&ldquo;Tính chi phí lăn bánh ngay&rdquo;</strong> để xem chi tiết.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
