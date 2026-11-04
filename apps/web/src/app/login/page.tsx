"use client";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
export default function Login() {
  const [email, setEmail] = useState("customer@autonova.local"); const [password, setPassword] = useState("Customer123!"); const [msg, setMsg] = useState("");
  async function submit() { try { const r = await apiFetch<any>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }); localStorage.setItem("autonova_token", r.token); localStorage.setItem("autonova_user", JSON.stringify(r.user)); setMsg(`Xin chào ${r.user.name}`); } catch (e) { setMsg(String(e)); } }
  return (<main className="mx-auto max-w-md px-4 py-16"><h1 className="text-3xl font-bold">Đăng nhập</h1><input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-6 w-full rounded-lg border px-4 py-2" placeholder="Email" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-3 w-full rounded-lg border px-4 py-2" placeholder="Mật khẩu" /><button onClick={submit} className="mt-4 w-full rounded-full bg-[#0a1633] py-3 text-white">Đăng nhập</button>{msg && <p className="mt-4">{msg}</p>}</main>);
}
