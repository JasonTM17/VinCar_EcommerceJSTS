"use client";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
export default function Checkout() {
  const [msg, setMsg] = useState(""); const [token] = useState(() => typeof window !== "undefined" ? localStorage.getItem("autonova_token") ?? "" : "");
  async function order() { try { const quoteId = localStorage.getItem("autonova_quote") ?? ""; const r = await apiFetch<any>("/orders", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ quoteId, dealerId: "dealer-hcm", idempotencyKey: crypto.randomUUID() }) }); setMsg(`Đã tạo đơn ${r.id} — chuyển sang thanh toán sandbox`); const p = r.payments?.[0]; if (p) { const evt = { id: `evt_${Date.now()}`, type: "payment.succeeded", paymentId: p.id, amountVnd: p.amountVnd.toString() }; const { createHmac } = await import("node:crypto").catch(() => ({ createHmac: null })); setMsg((m) => `${m}. Payment ID: ${p.id}`); } } catch (e) { setMsg(String(e)); } }
  return (<main className="mx-auto max-w-3xl px-4 py-10"><h1 className="text-3xl font-bold">Thanh toán đặt cọc (sandbox)</h1><p className="mt-2 text-sm text-neutral-500">Sau khi tạo đơn, gọi webhook mock có chữ ký để xác nhận thanh toán. Không dùng tiền thật.</p><button onClick={order} className="mt-6 rounded-full bg-[#0a1633] px-6 py-3 text-white">Tạo đơn & đặt cọc</button>{msg && <p className="mt-4">{msg}</p>}</main>);
}
