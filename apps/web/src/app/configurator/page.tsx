"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
export default function Configurator({ searchParams }: { searchParams: Promise<{ trimId?: string }> }) {
  const [trimId, setTrimId] = useState(""); const [result, setResult] = useState<any>(null); const [token, setToken] = useState(""); const [error, setError] = useState("");
  useEffect(() => { searchParams.then((s) => setTrimId(s.trimId ?? "")); const t = localStorage.getItem("autonova_token"); if (t) setToken(t); }, [searchParams]);
  async function quote() { setError(""); try { const r = await apiFetch<any>("/quotes", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ trimId, province: "Ho Chi Minh" }) }); setResult(r); localStorage.setItem("autonova_quote", r.id); } catch (e) { setError(String(e)); } }
  return (<main className="mx-auto max-w-3xl px-4 py-10"><h1 className="text-3xl font-bold">Cấu hình xe</h1><label className="mt-6 block">Token (đăng nhập trước): <input value={token} onChange={(e) => setToken(e.target.value)} className="mt-1 w-full rounded-lg border px-4 py-2" /></label><label className="mt-4 block">Trim ID: <input value={trimId} onChange={(e) => setTrimId(e.target.value)} className="mt-1 w-full rounded-lg border px-4 py-2" /></label><button onClick={quote} className="mt-6 rounded-full bg-[#0a1633] px-6 py-3 text-white">Lấy báo giá</button>{error && <p className="mt-4 text-red-600">{error}</p>}{result && <pre className="mt-6 overflow-auto rounded-xl bg-neutral-100 p-4">{JSON.stringify(result, null, 2)}</pre>}</main>);
}
