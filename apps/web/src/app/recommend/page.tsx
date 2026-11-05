"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { apiFetch, type RecommendationReasonCode, type VehicleRecommendationResponse } from "@/lib/api";
import { getCarImage } from "@/lib/car-assets";

const REASON_LABELS: Record<RecommendationReasonCode, string> = {
  WITHIN_BASE_PRICE_BUDGET: "Phù hợp ngân sách dự kiến",
  MEETS_MINIMUM_RANGE: "Đạt tầm hoạt động mong muốn",
  MEETS_MINIMUM_SEATS: "Đủ số chỗ ngồi cho gia đình",
  MATCHES_VEHICLE_TYPE: "Đúng phân khúc xe bạn chọn",
  MATCHES_POWERTRAIN: "Thuần điện thông minh",
};

export default function RecommendPage() {
  const [need, setNeed] = useState("");
  const [result, setResult] = useState<VehicleRecommendationResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const requestNeed = need.trim();
    if (!requestNeed) {
      setError("Hãy nhập ngân sách hoặc nhu cầu cụ thể về xe.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await apiFetch<VehicleRecommendationResponse>("/recommendations", {
        method: "POST",
        body: JSON.stringify({ need: requestNeed }),
      });
      setResult(response);
    } catch (cause) {
      setError(messageFor(cause));
    } finally {
      setLoading(false);
    }
  }

  function setExample(text: string) {
    setNeed(text);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <section className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-widest block mb-1">
          TRÍ TUỆ NHÂN TẠO VINFAST
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#003F87]">
          AI Tư Vấn Chọn Xe Phù Hợp Nhu Cầu
        </h1>
        <p className="mt-3 text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Mô tả phong cách sống, mục đích sử dụng và ngân sách dự tính. Hệ thống AI sẽ phân tích và đề xuất chiếc xe điện VinFast tối ưu nhất cho bạn.
        </p>

        {/* Quick Example Prompts */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setExample("Tôi muốn mua xe đô thị nhỏ gọn, giá dưới 300 triệu để đi làm hàng ngày trong phố.")}
            className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-[#003F87] transition-colors"
          >
            🚗 Xe đô thị dưới 300 triệu
          </button>
          <button
            type="button"
            onClick={() => setExample("Cần tìm SUV điện gia đình 5 chỗ, tầm di chuyển trên 400 km, thiết kế thể thao mạnh mẽ dưới 1 tỷ.")}
            className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-[#003F87] transition-colors"
          >
            ⚡ SUV thể thao dưới 1 tỷ
          </button>
          <button
            type="button"
            onClick={() => setExample("Tìm xe 7 chỗ rộng rãi sang trọng cho doanh nghiệp tiếp đón đối tác và gia đình đi du lịch xa.")}
            className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-[#003F87] transition-colors"
          >
            👑 SUV 7 chỗ hạng sang
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={submit} className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg text-left">
          <label htmlFor="vehicle-need" className="block text-xs font-bold uppercase tracking-wider text-[#003F87] mb-2">
            Mô tả chiếc xe bạn mong muốn:
          </label>
          <textarea
            id="vehicle-need"
            name="need"
            value={need}
            onChange={(event) => setNeed(event.target.value)}
            maxLength={600}
            rows={4}
            required
            placeholder="Ví dụ: Tôi cần một chiếc xe SUV điện 5 chỗ cho gia đình, thường xuyên đi lại giữa Hà Nội và Hải Phòng, ngân sách khoảng 800 - 900 triệu..."
            className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-xs sm:text-sm leading-6 text-slate-800 outline-none transition focus:border-[#003F87] focus:ring-2 focus:ring-[#003F87]/15"
          />
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-slate-400">
            <span>Yêu cầu được phân tích bằng mô hình ngôn ngữ lớn bảo mật.</span>
            <span>{need.length}/600 ký tự</span>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#003F87] hover:bg-[#002D62] px-7 py-3 text-xs font-bold text-white shadow transition-all disabled:opacity-60 gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span>Đang phân tích tiêu chí…</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">auto_awesome</span>
                  <span>Nhận tư vấn ngay</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs font-semibold text-amber-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-700">warning</span>
          <span>{error}</span>
        </div>
      )}

      {result && result.recommendations.length === 0 && (
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-600 shadow-sm">
          <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">sentiment_dissatisfied</span>
          <p className="font-semibold text-slate-800">Chưa tìm thấy mẫu xe phù hợp với toàn bộ các tiêu chí này.</p>
          <p className="mt-1">Bạn có thể nới lỏng ngân sách, tầm hoạt động hoặc số chỗ ngồi để AI tìm thêm phương án.</p>
        </div>
      )}

      {result && result.recommendations.length > 0 && (
        <section className="mt-14" aria-labelledby="recommendation-results">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-widest block mb-1">
              KẾT QUẢ ĐỀ XUẤT TỐI ƯU
            </span>
            <h2 id="recommendation-results" className="text-2xl sm:text-3xl font-extrabold text-[#003F87]">
              Các Mẫu Xe VinFast Phù Hợp Với Bạn
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.recommendations.map((vehicle) => (
              <div
                key={vehicle.vehicleId}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all"
              >
                {/* Visual */}
                <div className="bg-slate-50 p-5 h-48 flex items-center justify-center relative">
                  <span className="absolute top-3 left-3 bg-[#003F87] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {vehicle.category} • {vehicle.seats} chỗ
                  </span>
                  <img
                    src={getCarImage(vehicle.slug)}
                    alt={vehicle.name}
                    className="max-h-36 object-contain"
                  />
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#003F87]">{vehicle.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Phiên bản {vehicle.trim.name}</p>

                    <div className="my-4 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Giá niêm yết:</span>
                      <span className="text-xl font-extrabold text-[#003F87]">
                        {formatVnd(vehicle.trim.basePriceVnd)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 mb-4">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">Tầm hoạt động:</span>
                        <strong className="text-slate-800">{vehicle.trim.rangeKm} km</strong>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[10px]">Hệ truyền động:</span>
                        <strong className="text-slate-800">{vehicle.powertrain}</strong>
                      </div>
                    </div>

                    {/* Reason badges */}
                    <div className="space-y-1 mb-6">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Điểm tương thích:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {vehicle.reasonCodes.map((reason) => (
                          <span
                            key={reason}
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-800"
                          >
                            <span className="material-symbols-outlined text-xs text-emerald-600">check</span>
                            {REASON_LABELS[reason]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-slate-100">
                    <Link
                      href={`/vehicles/${vehicle.slug}`}
                      className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-lg text-center transition-colors"
                    >
                      Chi tiết xe
                    </Link>
                    <Link
                      href={`/configurator?model=${vehicle.slug}`}
                      className="bg-[#003F87] hover:bg-[#002D62] text-white font-bold py-2.5 rounded-lg text-center transition-colors shadow-sm"
                    >
                      Đặt cọc ngay
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function formatVnd(value: string): string {
  return `${new Intl.NumberFormat("vi-VN").format(BigInt(value))} ₫`;
}

function messageFor(cause: unknown): string {
  const message = cause instanceof Error ? cause.message : "";
  if (message.startsWith("API 429:")) return "Bạn vừa gửi nhiều yêu cầu. Vui lòng đợi một phút rồi thử lại.";
  if (message.startsWith("API 400:")) return "Chưa nhận ra tiêu chí xe. Hãy nêu ngân sách, tầm hoạt động, số chỗ hoặc kiểu xe cụ thể hơn.";
  if (message.startsWith("API 503:")) return "Dịch vụ gợi ý đang tạm thời chưa sẵn sàng. Vui lòng thử lại sau.";
  return "Không kết nối được với dịch vụ gợi ý. Hãy kiểm tra kết nối rồi thử lại.";
}
