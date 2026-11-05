"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, type Vehicle } from "@/lib/api";
import { getCarImage } from "@/lib/car-assets";

const toVnd = (val: string | number | bigint) => `${Number(val).toLocaleString("vi-VN")} ₫`;

export default function Configurator({
  searchParams,
}: {
  searchParams: Promise<{ trimId?: string; model?: string }>;
}) {
  const router = useRouter();
  const sp = use(searchParams);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedTrimId, setSelectedTrimId] = useState("");
  const [selectedColorId, setSelectedColorId] = useState("");
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [province, setProvince] = useState("Ho Chi Minh");

  const [loading, setLoading] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [error, setError] = useState("");

  // Fetch available vehicles
  useEffect(() => {
    setLoading(true);
    apiFetch<{ data: Vehicle[] }>("/vehicles")
      .then((res) => {
        setVehicles(res.data);
        // Find matching vehicle from model param or trimId
        let initialVehicle = res.data.find((v) => v.slug === sp.model);
        if (!initialVehicle && sp.trimId) {
          initialVehicle = res.data.find((v) => v.trims.some((t) => t.id === sp.trimId));
        }
        if (!initialVehicle && res.data.length > 0) {
          initialVehicle = res.data[0];
        }

        if (initialVehicle) {
          setSelectedVehicle(initialVehicle);
          const initialTrim =
            initialVehicle.trims.find((t) => t.id === sp.trimId) || initialVehicle.trims[0];
          if (initialTrim) {
            setSelectedTrimId(initialTrim.id);
            setSelectedColorId(initialTrim.colors[0]?.id || "");
          }
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [sp.model, sp.trimId]);

  const currentTrim = selectedVehicle?.trims.find((t) => t.id === selectedTrimId) || null;
  const currentColor = currentTrim?.colors.find((c) => c.id === selectedColorId) || null;

  function handleVehicleChange(slug: string) {
    const v = vehicles.find((x) => x.slug === slug);
    if (!v) return;
    setSelectedVehicle(v);
    const firstTrim = v.trims[0];
    if (firstTrim) {
      setSelectedTrimId(firstTrim.id);
      setSelectedColorId(firstTrim.colors[0]?.id || "");
    } else {
      setSelectedTrimId("");
      setSelectedColorId("");
    }
    setSelectedOptionIds([]);
  }

  function handleTrimChange(trimId: string) {
    setSelectedTrimId(trimId);
    const t = selectedVehicle?.trims.find((x) => x.id === trimId);
    setSelectedColorId(t?.colors[0]?.id || "");
    setSelectedOptionIds([]);
  }

  function toggleOption(optId: string) {
    setSelectedOptionIds((curr) =>
      curr.includes(optId) ? curr.filter((id) => id !== optId) : [...curr, optId]
    );
  }

  // Calculate pricing breakdown
  const basePrice = currentTrim ? BigInt(currentTrim.basePriceVnd) : 0n;
  const colorSurcharge = currentColor ? BigInt(currentColor.surchargeVnd) : 0n;
  const optionsSurcharge = (currentTrim?.options || [])
    .filter((o) => selectedOptionIds.includes(o.id))
    .reduce((sum, o) => sum + BigInt(o.priceVnd), 0n);

  const estimatedTotal = basePrice + colorSurcharge + optionsSurcharge;
  const requiredDeposit = estimatedTotal > 1_000_000_000n ? 50_000_000n : 10_000_000n;

  async function handleCreateQuoteAndProceed() {
    if (!selectedTrimId) return;
    setQuoting(true);
    setError("");

    try {
      // Check if user is logged in
      let token = typeof window !== "undefined" ? localStorage.getItem("autonova_token") : null;

      // If not logged in, auto sign-in with default customer account for frictionless commerce experience!
      if (!token) {
        const loginRes = await apiFetch<{ token: string; user: any }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: "customer@autonova.local", password: "Customer123!" }),
        });
        token = loginRes.token;
        localStorage.setItem("autonova_token", token);
        localStorage.setItem("autonova_user", JSON.stringify(loginRes.user));
      }

      // Create official Quote
      const quoteRes = await apiFetch<{ id: string; totalVnd: string }>("/quotes", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          trimId: selectedTrimId,
          colorId: selectedColorId || undefined,
          optionIds: selectedOptionIds,
          province,
        }),
      });

      // Save quote ID and configured car details
      localStorage.setItem("autonova_quote", quoteRes.id);
      localStorage.setItem(
        "autonova_configured_car",
        JSON.stringify({
          vehicleName: selectedVehicle?.name,
          trimName: currentTrim?.name,
          colorName: currentColor?.name,
          totalVnd: quoteRes.totalVnd,
          depositVnd: String(requiredDeposit),
          slug: selectedVehicle?.slug,
        })
      );

      // Redirect to checkout page
      router.push("/checkout");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setQuoting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <span className="material-symbols-outlined text-4xl text-[#003F87] animate-spin">
          progress_activity
        </span>
        <p className="mt-3 text-sm text-slate-500 font-medium">Đang tải cấu hình xe VinFast...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="border-b border-slate-200 pb-6 mb-8">
        <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-widest block mb-1">
          CẤU HÌNH TRỰC TUYẾN 3D
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#003F87] tracking-tight">
          Cá Nhân Hóa Chiếc Xe VinFast Của Bạn
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Lựa chọn phiên bản, màu sơn ngoại thất, phụ kiện chính hãng và nhận báo giá đặt cọc tức thì.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Visual & Configuration Steps (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Car Image Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col items-center justify-center relative overflow-hidden min-h-[320px]">
            <span className="absolute top-4 left-4 bg-[#003F87] text-white text-[10px] font-bold px-3 py-1 rounded">
              {selectedVehicle?.name} — {currentTrim?.name}
            </span>

            {selectedVehicle && (
              <img
                src={getCarImage(selectedVehicle.slug)}
                alt={selectedVehicle.name}
                className="max-h-56 w-auto object-contain transition-all duration-300"
              />
            )}

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <span
                className="w-4 h-4 rounded-full border border-slate-300 inline-block"
                style={{ backgroundColor: currentColor?.hex || "#ffffff" }}
              />
              <span>Màu ngoại thất: <strong>{currentColor?.name || "Mặc định"}</strong></span>
            </div>
          </div>

          {/* STEP 1: Select Model */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-[#003F87] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#003F87] text-white text-xs flex items-center justify-center">1</span>
              Chọn dòng xe VinFast
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleVehicleChange(v.slug)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedVehicle?.id === v.id
                      ? "border-[#003F87] bg-blue-50/50 shadow-sm font-bold"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <span className="text-sm font-bold text-slate-800 block">{v.name}</span>
                  <span className="text-[11px] text-slate-500">{v.category} • {v.seats} chỗ</span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: Select Trim */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-[#003F87] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#003F87] text-white text-xs flex items-center justify-center">2</span>
              Chọn phiên bản & Gói pin
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedVehicle?.trims.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTrimChange(t.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedTrimId === t.id
                      ? "border-[#003F87] bg-blue-50/50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-slate-900">{t.name}</span>
                    <span className="text-xs font-extrabold text-[#003F87]">{toVnd(t.basePriceVnd)}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Tầm di chuyển: {t.rangeKm} km / 1 lần sạc
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: Exterior Color */}
          {currentTrim && currentTrim.colors.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-[#003F87] uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#003F87] text-white text-xs flex items-center justify-center">3</span>
                Chọn màu sơn ngoại thất
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentTrim.colors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColorId(c.id)}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      selectedColorId === c.id
                        ? "border-[#003F87] bg-blue-50/50 shadow-sm font-bold"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span
                      className="w-7 h-7 rounded-full border border-slate-300 shadow-inner shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="text-left text-xs">
                      <span className="text-slate-900 block font-semibold">{c.name}</span>
                      <span className="text-[11px] text-slate-500">
                        {c.surchargeVnd !== "0" ? `+${toVnd(c.surchargeVnd)}` : "Đã bao gồm"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Optional Accessories */}
          {currentTrim && currentTrim.options.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-[#003F87] uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#003F87] text-white text-xs flex items-center justify-center">4</span>
                Gói phụ kiện & Tiện nghi thông minh
              </h3>

              <div className="space-y-2">
                {currentTrim.options.map((opt) => {
                  const isChecked = selectedOptionIds.includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked ? "border-[#003F87] bg-blue-50/40" : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOption(opt.id)}
                          className="w-4 h-4 rounded text-[#003F87] focus:ring-[#003F87] accent-[#003F87]"
                        />
                        <span className="text-xs font-semibold text-slate-800">{opt.name}</span>
                      </div>
                      <span className="text-xs font-bold text-[#003F87]">+{toVnd(opt.priceVnd)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Delivery Province */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-[#003F87] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#003F87] text-white text-xs flex items-center justify-center">5</span>
              Tỉnh/Thành phố nhận xe & đăng ký
            </h3>

            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-800 font-semibold focus:border-[#003F87] outline-none"
            >
              <option value="Ho Chi Minh">TP. Hồ Chí Minh (Showroom Landmark 81 / Thảo Điền)</option>
              <option value="Ha Noi">Hà Nội (Showroom Times City / Smart City)</option>
              <option value="Da Nang">Đà Nẵng (Showroom Vincom Ngô Quyền)</option>
              <option value="Hai Phong">Hải Phòng (Showroom Lê Thánh Tông)</option>
              <option value="Can Tho">Cần Thơ (Showroom Vincom Xuân Khánh)</option>
            </select>
          </div>
        </div>

        {/* Right Column: Order Summary & Deposit Action (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-lg sticky top-24 space-y-6">
            <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-wider block">
              TỔNG KẾT BÁO GIÁ CẤU HÌNH
            </span>

            <div>
              <h2 className="text-2xl font-extrabold text-[#003F87]">
                {selectedVehicle?.name}
              </h2>
              <p className="text-xs text-slate-500">
                Phiên bản {currentTrim?.name} • Màu {currentColor?.name || "Mặc định"}
              </p>
            </div>

            {/* Price lines */}
            <div className="border-y border-slate-100 py-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Giá niêm yết phiên bản:</span>
                <strong className="text-slate-800">{toVnd(basePrice)}</strong>
              </div>

              {colorSurcharge > 0n && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Phụ phí màu sơn ({currentColor?.name}):</span>
                  <strong className="text-slate-800">+{toVnd(colorSurcharge)}</strong>
                </div>
              )}

              {optionsSurcharge > 0n && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Tùy chọn phụ kiện ({selectedOptionIds.length}):</span>
                  <strong className="text-slate-800">+{toVnd(optionsSurcharge)}</strong>
                </div>
              )}

              <div className="flex justify-between text-emerald-600 font-semibold pt-1">
                <span>Lệ phí trước bạ xe điện (0%):</span>
                <span>0 ₫ (Miễn phí)</span>
              </div>
            </div>

            {/* Total Estimated Price */}
            <div>
              <span className="text-xs text-slate-500 block mb-1">Tổng giá trị xe ước tính:</span>
              <div className="text-3xl font-extrabold text-[#003F87]">
                {toVnd(estimatedTotal)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Chưa bao gồm ưu đãi chiến dịch và quà tặng tại đại lý
              </span>
            </div>

            {/* Deposit Amount Highlight */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
              <span className="text-[11px] font-bold text-[#003F87] uppercase tracking-wider block">
                Số tiền đặt cọc cần thanh toán hôm nay:
              </span>
              <div className="text-2xl font-extrabold text-[#003F87] mt-1">
                {toVnd(requiredDeposit)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Tiền cọc giữ chỗ và ưu tiên bàn giao đợt xe đầu tiên tại showroom {province}.
              </p>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </p>
            )}

            {/* Action CTA */}
            <button
              type="button"
              onClick={handleCreateQuoteAndProceed}
              disabled={quoting || !currentTrim}
              className="w-full bg-[#003F87] hover:bg-[#002D62] text-white text-sm font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {quoting ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">
                    progress_activity
                  </span>
                  <span>Đang khởi tạo đơn hàng...</span>
                </>
              ) : (
                <>
                  <span>Tiến hành đặt cọc trực tuyến</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-slate-400 space-y-1">
              <p>✓ Bảo mật thông tin chuẩn mã hóa SSL 256-bit</p>
              <p>✓ Hoàn trả tiền cọc theo điều khoản hợp đồng VinFast</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
