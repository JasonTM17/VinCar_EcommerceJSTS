"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Dealer = { id: string; name: string; province: string; city: string; address: string; phone: string };
type Slot = { id: string; date: string; startTime: string; capacity: number; booked: number };

export default function TestDrive() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [dealerId, setDealerId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotId, setSlotId] = useState("");
  const [modelSlug, setModelSlug] = useState("nova-v8");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<Dealer[]>("/dealers")
      .then((data) => {
        setDealers(data);
        if (data[0]) setDealerId(data[0].id);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  useEffect(() => {
    if (!dealerId) return;
    const query = date ? `&date=${date}` : "";
    apiFetch<Slot[]>(`/test-drive-slots?dealerId=${dealerId}${query}`)
      .then((data) => setSlots(data))
      .catch(() => setSlots([]));
  }, [dealerId, date]);

  async function submit() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const token = localStorage.getItem("autonova_token");
      if (!token) throw new Error("Vui lòng đăng nhập trước khi đăng ký lái thử.");
      const booking = await apiFetch<{ id: string; status: string }>("/test-drives", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dealerId, slotId, modelSlug }),
      });
      setMessage(`Đăng ký thành công. Mã lịch hẹn: ${booking.id} (${booking.status})`);
      setSlots((current) => current.map((s) => (s.id === slotId ? { ...s, booked: s.booked + 1 } : s)));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Đăng ký lái thử</h1>
      <p className="mt-2 text-sm text-neutral-500">Chọn đại lý, ngày và khung giờ. Hệ thống giữ chỗ ngay khi bạn xác nhận.</p>

      <div className="mt-8 space-y-5">
        <div>
          <label className="text-sm font-medium">Đại lý</label>
          <select value={dealerId} onChange={(e) => setDealerId(e.target.value)} className="mt-1 w-full rounded-lg border px-4 py-2">
            {dealers.map((d) => <option key={d.id} value={d.id}>{d.name} — {d.city}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Ngày</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-lg border px-4 py-2" />
        </div>

        <div>
          <label className="text-sm font-medium">Khung giờ</label>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {slots.length === 0 && <p className="text-sm text-neutral-500">Không có khung giờ nào.</p>}
            {slots.map((s) => {
              const full = s.booked >= s.capacity;
              return (
                <button key={s.id} onClick={() => !full && setSlotId(s.id)} disabled={full} aria-pressed={slotId === s.id}
                  className={`rounded-lg border px-4 py-3 text-left text-sm disabled:opacity-50 ${slotId === s.id ? "border-cyan-600 bg-cyan-50" : ""}`}>
                  <p className="font-medium">{s.startTime}</p>
                  <p className="text-neutral-500">{full ? "Hết chỗ" : `Còn ${s.capacity - s.booked}/${s.capacity} chỗ`}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Mẫu xe muốn lái thử</label>
          <select value={modelSlug} onChange={(e) => setModelSlug(e.target.value)} className="mt-1 w-full rounded-lg border px-4 py-2">
            <option value="nova-v8">AutoNova Nova V8</option>
          </select>
        </div>

        <button onClick={submit} disabled={loading || !slotId} className="w-full rounded-full bg-[#0a1633] py-3 text-white disabled:opacity-50">
          {loading ? "Đang đăng ký..." : "Xác nhận đăng ký"}
        </button>
        {message && <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">{message}</p>}
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      </div>
    </main>
  );
}
