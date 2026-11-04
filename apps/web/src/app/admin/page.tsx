"use client";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Order = {
  id: string;
  status: string;
  amountVnd: string;
  depositVnd: string;
  createdAt: string;
  user: { name: string; email: string } | null;
  dealer: { name: string } | null;
  payments: { id: string; provider: string; amountVnd: string; status: string }[];
  refunds: { id: string; amountVnd: string; status: string; reason: string | null }[];
};

const STATUS_STYLE: Record<string, string> = {
  PENDING_DEPOSIT: "bg-amber-100 text-amber-800",
  DEPOSIT_PAID: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-neutral-200 text-neutral-700",
};

export default function Admin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [dealerId, setDealerId] = useState("dealer-hcm");
  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("10:00");
  const [capacity, setCapacity] = useState(3);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const token = localStorage.getItem("autonova_token");
    const rawUser = localStorage.getItem("autonova_user");
    if (!token || !rawUser) {
      setError("Vui lòng đăng nhập với tài khoản quản trị.");
      return;
    }
    const user = JSON.parse(rawUser) as { role?: string };
    setRole(user.role ?? null);
    if (!["ADMIN", "DEALER_MANAGER"].includes(user.role ?? "")) {
      setError("Tài khoản này không có quyền quản trị.");
      return;
    }
    try {
      setOrders(await apiFetch<Order[]>("/admin/orders", { headers: { Authorization: `Bearer ${token}` } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createSlot() {
    const token = localStorage.getItem("autonova_token");
    setNotice("");
    setError("");
    try {
      await apiFetch("/admin/test-drive-slots", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dealerId, date: new Date(slotDate).toISOString(), startTime: slotTime, capacity: Number(capacity) }),
      });
      setNotice("Đã tạo khung giờ lái thử.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (error) return <main className="mx-auto max-w-3xl px-4 py-16"><h1 className="text-2xl font-bold">Quản trị</h1><p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p><a href="/login" className="mt-4 inline-block text-cyan-700">Đăng nhập</a></main>;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bảng điều hành quản trị</h1>
          <p className="mt-1 text-sm text-neutral-500">Vai trò: {role}</p>
        </div>
        <a href="/admin/catalog" className="text-sm text-cyan-700">Quản lý danh mục</a>
        <a href="/" className="text-sm text-cyan-700">Về trang chủ</a>
      </div>

      <section className="mt-8 rounded-2xl border p-6">
        <h2 className="text-lg font-semibold">Khung giờ lái thử</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} className="rounded-lg border px-3 py-2" />
          <input type="time" value={slotTime} onChange={(e) => setSlotTime(e.target.value)} className="rounded-lg border px-3 py-2" />
          <input type="number" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="w-24 rounded-lg border px-3 py-2" />
          <button onClick={createSlot} className="rounded-full bg-[#0a1633] px-5 py-2 text-white">Tạo khung giờ</button>
        </div>
        {notice && <p className="mt-3 text-sm text-green-700">{notice}</p>}
      </section>

      <section className="mt-8 overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3">Đơn hàng</th>
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3">Đại lý</th>
              <th className="px-4 py-3">Giá trị</th>
              <th className="px-4 py-3">Thanh toán</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Hoàn tiền</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-neutral-500">Chưa có đơn hàng.</td></tr>}
            {orders.map((order) => (
              <tr key={order.id} className="border-t align-top">
                <td className="px-4 py-3 font-mono text-xs">{order.id.slice(-8)}</td>
                <td className="px-4 py-3">{order.user?.name}<br /><span className="text-xs text-neutral-500">{order.user?.email}</span></td>
                <td className="px-4 py-3">{order.dealer?.name}</td>
                <td className="px-4 py-3">{Number(order.amountVnd).toLocaleString("vi-VN")} ₫</td>
                <td className="px-4 py-3">{order.payments.map((p) => <div key={p.id} className="text-xs">{p.status}</div>)}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLE[order.status] ?? "bg-neutral-100"}`}>{order.status}</span></td>
                <td className="px-4 py-3">{order.refunds.length === 0 ? <span className="text-xs text-neutral-400">—</span> : order.refunds.map((r) => <div key={r.id} className="text-xs">{r.status} · {Number(r.amountVnd).toLocaleString("vi-VN")} ₫</div>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
