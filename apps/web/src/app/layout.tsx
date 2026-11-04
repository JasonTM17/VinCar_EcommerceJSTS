import type { ReactNode } from "react";
import "./globals.css";
export const metadata = { title: "AutoNova — Intelligent Automotive Commerce", description: "Configure, quote and deposit for your next car." };
export default function RootLayout({ children }: { children: ReactNode }) {
  return (<html lang="vi"><body><header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3"><a href="/" className="text-xl font-bold tracking-tight">AutoNova</a><nav className="hidden gap-6 md:flex"><a href="/vehicles">Xe</a><a href="/dealers">Đại lý</a><a href="/test-drive">Lái thử</a><a href="/finance">Trả góp</a><a href="/login">Đăng nhập</a></nav><a href="/vehicles" className="rounded-full bg-[#0a1633] px-4 py-2 text-white">Khám phá xe</a></div></header>{children}<footer className="border-t py-10 text-center text-sm text-neutral-500">© AutoNova — thương hiệu demo độc lập, không liên kết VinFast.</footer></body></html>);
}
