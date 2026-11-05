"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, type Vehicle } from "@/lib/api";
import { getCarImage } from "@/lib/car-assets";

type Dealer = { id: string; name: string; province: string; city: string; address: string; phone: string };
type Slot = { id: string; date: string; startTime: string; capacity: number; booked: number };

export default function TestDrive() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [dealerId, setDealerId] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return d.toISOString().split("T")[0];
  });
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotId, setSlotId] = useState("");
  const [modelSlug, setModelSlug] = useState("vf-7");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Driver info
  const [fullName, setFullName] = useState("Nguyễn Văn An");
  const [phone, setPhone] = useState("0908123456");
  const [email, setEmail] = useState("an.nguyen@gmail.com");
  const [driveType, setDriveType] = useState<"SHOWROOM" | "HOME">("SHOWROOM");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch dealers and vehicles
  useEffect(() => {
    apiFetch<Dealer[]>("/dealers")
      .then((data) => {
        setDealers(data);
        if (data[0]) setDealerId(data[0].id);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));

    apiFetch<{ data: Vehicle[] }>("/vehicles")
      .then((res) => {
        setVehicles(res.data);
        if (res.data[0]) setModelSlug(res.data[0].slug);
      })
      .catch(() => {});
  }, []);

  // Fetch slots for dealer and date
  useEffect(() => {
    if (!dealerId) return;
    const query = date ? `&date=${date}` : "";
    apiFetch<Slot[]>(`/test-drive-slots?dealerId=${dealerId}${query}`)
      .then((data) => {
        setSlots(data);
        if (data[0]) setSlotId(data[0].id);
      })
      .catch(() => setSlots([]));
  }, [dealerId, date]);

  async function submit() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      let token = localStorage.getItem("autonova_token");
      if (!token) {
        // Auto authenticate seamless session
        const loginRes = await apiFetch<{ token: string }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: "customer@autonova.local", password: "Customer123!" }),
        });
        token = loginRes.token;
        localStorage.setItem("autonova_token", token);
      }

      const booking = await apiFetch<{ id: string; status: string }>("/test-drives", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dealerId, slotId, modelSlug }),
      });

      setMessage(`Đăng ký lái thử thành công! Mã lịch hẹn: ${booking.id} (${booking.status})`);
      setSlots((current) => current.map((s) => (s.id === slotId ? { ...s, booked: s.booked + 1 } : s)));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  const selectedDealer = dealers.find((d) => d.id === dealerId);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="border-b border-slate-200 pb-6 mb-8">
        <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-widest block mb-1">
          TRẢI NGHIỆM THỰC TẾ
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#003F87] tracking-tight">
          Đăng Ký Lái Thử Xe Điện VinFast
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Trải nghiệm cảm giác lái thể thao, công nghệ thông minh ADAS và khoang lái tương lai hoàn toàn miễn phí.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Booking Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {message && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-red-600 text-xl">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* 1. Pick Vehicle */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-[#003F87] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#003F87] text-white text-[11px] flex items-center justify-center">1</span>
              Chọn dòng xe bạn muốn lái thử
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setModelSlug(v.slug)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    modelSlug === v.slug
                      ? "border-[#003F87] bg-blue-50/50 shadow-sm font-bold"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block">{v.name}</span>
                  <span className="text-[10px] text-slate-500">{v.category} • {v.seats} chỗ</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Pick Location */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-[#003F87] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#003F87] text-white text-[11px] flex items-center justify-center">2</span>
              Chọn Đại lý / Showroom tiếp nhận
            </h3>

            <select
              value={dealerId}
              onChange={(e) => setDealerId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-[#003F87] font-bold focus:border-[#003F87] outline-none"
            >
              {dealers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.city}
                </option>
              ))}
            </select>

            {selectedDealer && (
              <p className="text-[11px] text-slate-500">
                Địa chỉ: {selectedDealer.address} • Hotline: {selectedDealer.phone}
              </p>
            )}
          </div>

          {/* 3. Pick Date & Slot */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-[#003F87] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#003F87] text-white text-[11px] flex items-center justify-center">3</span>
              Chọn ngày và khung giờ lái thử
            </h3>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Ngày hẹn:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-xs text-slate-800 font-semibold focus:border-[#003F87] outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-2 font-semibold">Khung giờ có sẵn:</label>
              {slots.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center border border-dashed rounded-lg">
                  Không còn khung giờ trống trong ngày này. Vui lòng chọn ngày khác.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {slots.map((s) => {
                    const full = s.booked >= s.capacity;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => !full && setSlotId(s.id)}
                        disabled={full}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          slotId === s.id
                            ? "border-[#003F87] bg-blue-50/50 shadow-sm"
                            : "border-slate-200 hover:bg-slate-50"
                        } ${full ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex justify-between items-center">
                          <strong className="text-xs text-slate-900">{s.startTime}</strong>
                          <span className="text-[10px] text-slate-500">
                            {full ? "Hết chỗ" : `Còn ${s.capacity - s.booked} chỗ`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 4. Driver Information */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-[#003F87] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#003F87] text-white text-[11px] flex items-center justify-center">4</span>
              Thông tin người lái thử
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Họ và tên *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#003F87]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#003F87]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-semibold mb-1">Email nhận xác nhận *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#003F87]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-semibold mb-1">Hình thức trải nghiệm:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDriveType("SHOWROOM")}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold ${
                      driveType === "SHOWROOM"
                        ? "border-[#003F87] bg-blue-50 text-[#003F87] font-bold"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    Lái thử tại Showroom
                  </button>
                  <button
                    type="button"
                    onClick={() => setDriveType("HOME")}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold ${
                      driveType === "HOME"
                        ? "border-[#003F87] bg-blue-50 text-[#003F87] font-bold"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    Mang xe đến tận nhà / Cơ quan
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={loading || !slotId}
              className="w-full bg-[#003F87] hover:bg-[#002D62] text-white text-xs font-bold py-3.5 rounded-xl shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  <span>Đang đăng ký lịch hẹn...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">how_to_reg</span>
                  <span>Xác nhận đăng ký lái thử</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Visual Info Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 sticky top-24">
            <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-wider block">
              MẪU XE LỰA CHỌN TRẢI NGHIỆM
            </span>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
              <img
                src={getCarImage(modelSlug)}
                alt={modelSlug}
                className="max-h-40 mx-auto object-contain mb-3"
              />
              <h4 className="text-xl font-bold text-[#003F87]">
                {vehicles.find((v) => v.slug === modelSlug)?.name || "VinFast VF 7"}
              </h4>
              <p className="text-xs text-slate-500 mt-1">Động cơ điện thông minh • ADAS Cấp độ 2</p>
            </div>

            <div className="space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                <span>Miễn phí 100% chi phí lái thử và trải nghiệm</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                <span>Chuyên viên kỹ thuật VinFast hướng dẫn tận tình các tính năng an toàn</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                <span>Quà tặng lưu niệm độc quyền VinFast sau buổi lái thử</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-slate-700">
              <strong className="text-[#003F87] block mb-1">Lưu ý khi tham gia lái thử:</strong>
              Quý khách vui lòng mang theo Giấy phép lái xe ô tô (Bằng B1/B2 hoặc tương đương) còn hiệu lực khi đến nhận xe.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
