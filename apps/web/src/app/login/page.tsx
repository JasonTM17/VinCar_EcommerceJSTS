"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("customer@autonova.local");
  const [password, setPassword] = useState("Customer123!");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");

    try {
      const res = await apiFetch<any>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("autonova_token", res.token);
      localStorage.setItem("autonova_user", JSON.stringify(res.user));
      setMsg(`Đăng nhập thành công! Xin chào ${res.user.name}`);
      setTimeout(() => {
        router.push("/");
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(role: "customer" | "admin") {
    if (role === "customer") {
      setEmail("customer@autonova.local");
      setPassword("Customer123!");
    } else {
      setEmail("admin@autonova.local");
      setPassword("Admin123!");
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#002A5D] via-[#003F87] to-[#00B4D8] p-0.5 shadow-md mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <svg className="w-7 h-7 text-[#003F87]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35L2.5 4h4.15L12 14.88 17.35 4h4.15L12 21.35z"></path>
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-[#003F87] tracking-tight">
            Đăng Nhập VinFast ID
          </h1>
          <p className="text-xs text-slate-500">
            Quản lý đơn hàng đặt cọc xe, lịch hẹn lái thử và dịch vụ hậu mãi.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {error}
          </div>
        )}

        {msg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold">
            {msg}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Email / Tài khoản</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 focus:border-[#003F87] outline-none"
              placeholder="example@vinfast.vn"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 focus:border-[#003F87] outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#003F87] hover:bg-[#002D62] text-white text-xs font-bold py-3 rounded-xl shadow transition-all disabled:opacity-50"
          >
            {loading ? "Đang xác thực..." : "Đăng nhập ngay"}
          </button>
        </form>

        {/* Quick Demo Accounts */}
        <div className="border-t border-slate-100 pt-4 text-center">
          <span className="text-[11px] text-slate-400 block mb-2">Đăng nhập nhanh bằng tài khoản thử nghiệm:</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemo("customer")}
              className="py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
            >
              Khách hàng
            </button>
            <button
              type="button"
              onClick={() => fillDemo("admin")}
              className="py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
            >
              Quản trị viên
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link href="/" className="text-xs text-[#003F87] font-semibold hover:underline">
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
