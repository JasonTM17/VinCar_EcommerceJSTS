"use client";
import { useState } from "react";
export default function TestDrive() { const [msg, setMsg] = useState("Đăng ký lái thử: chọn đại lý & thời gian ở trang đại lý, hoặc liên hệ hotline. (Luồng booking API: POST /test-drives — đang triển khai ở Phase 07.)"); return (<main className="mx-auto max-w-3xl px-4 py-10"><h1 className="text-3xl font-bold">Đăng ký lái thử</h1><p className="mt-4">{msg}</p><a href="/dealers" className="mt-4 inline-block rounded-full bg-[#0a1633] px-6 py-3 text-white">Chọn đại lý</a></main>); }
