import type { ReactNode } from "react";
import "./globals.css";
import { TopBanner } from "@/components/common/TopBanner";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";

export const metadata = {
  title: "VinFast Auto Vietnam — Mãnh liệt Tinh thần Việt Nam | Trang chủ chính thức",
  description: "Trang thương mại điện tử chính thức xe ô tô điện VinFast: VF 3, VF 5 Plus, VF 6, VF 7, VF 8, VF 9. Cấu hình xe, dự toán lăn bánh, vay trả góp và đặt cọc trực tuyến.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#191C1E] antialiased">
        <TopBanner />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
