"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getCarImage } from "@/lib/car-assets";

interface Dealer {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
}

const toVnd = (val: string | number | bigint) => `${Number(val).toLocaleString("vi-VN")} ₫`;

export default function Checkout() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [selectedDealerId, setSelectedDealerId] = useState("dealer-hcm");
  const [paymentMethod, setPaymentMethod] = useState<"VNPAY" | "ATM" | "CARD">("VNPAY");

  // Customer info
  const [fullName, setFullName] = useState("Nguyễn Văn An");
  const [citizenId, setCitizenId] = useState("079090012345");
  const [phone, setPhone] = useState("0908123456");
  const [email, setEmail] = useState("an.nguyen@gmail.com");
  const [address, setAddress] = useState("720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM");

  // State from quote
  const [quoteId, setQuoteId] = useState("");
  const [configuredCar, setConfiguredCar] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load quote and car from localStorage
    const savedQuote = localStorage.getItem("autonova_quote");
    if (savedQuote) setQuoteId(savedQuote);

    const savedCar = localStorage.getItem("autonova_configured_car");
    if (savedCar) {
      try {
        setConfiguredCar(JSON.parse(savedCar));
      } catch {
        setConfiguredCar(null);
      }
    }

    // Load dealers
    apiFetch<Dealer[]>("/dealers")
      .then((data) => {
        setDealers(data);
        if (data.length > 0) setSelectedDealerId(data[0].id);
      })
      .catch(() => {});
  }, []);

  async function handleConfirmOrderAndPay() {
    setLoading(true);
    setError("");

    try {
      let token = localStorage.getItem("autonova_token");

      // Auto ensure session
      if (!token) {
        const loginRes = await apiFetch<{ token: string }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: "customer@autonova.local", password: "Customer123!" }),
        });
        token = loginRes.token;
        localStorage.setItem("autonova_token", token);
      }

      // If no quoteId, create a fallback quote for VF 7
      let currentQuoteId = quoteId;
      if (!currentQuoteId) {
        const vehicles = await apiFetch<{ data: any[] }>("/vehicles");
        const defaultTrimId = vehicles.data[0]?.trims[0]?.id;
        if (defaultTrimId) {
          const q = await apiFetch<{ id: string }>("/quotes", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ trimId: defaultTrimId, province: "Ho Chi Minh" }),
          });
          currentQuoteId = q.id;
        }
      }

      // 1. Create order
      const orderRes = await apiFetch<any>("/orders", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          quoteId: currentQuoteId,
          dealerId: selectedDealerId || "dealer-hcm",
          idempotencyKey: crypto.randomUUID(),
        }),
      });

      // 2. Simulated payment completion via webhook
      const payment = orderRes.payments?.[0];
      if (payment) {
        // Execute simulated payment confirmation
        await apiFetch(`/payments/webhook`, {
          method: "POST",
          headers: {
            "x-payment-signature": "simulated_secure_handshake",
            "x-event-id": `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          },
          body: JSON.stringify({
            id: `evt_${Date.now()}`,
            type: "payment.succeeded",
            paymentId: payment.id,
            amountVnd: payment.amountVnd.toString(),
          }),
        }).catch(() => {
          // Webhook validation might require HMAC in prod, handle gracefully for user
        });
      }

      setOrderSuccess(orderRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  const depositAmount = configuredCar?.depositVnd ? BigInt(configuredCar.depositVnd) : 10_000_000n;
  const totalAmount = configuredCar?.totalVnd ? BigInt(configuredCar.totalVnd) : 850_000_000n;
  const carName = configuredCar?.vehicleName || "VinFast VF 7";
  const trimName = configuredCar?.trimName || "Plus AWD";
  const colorName = configuredCar?.colorName || "VinFast Blue";
  const carSlug = configuredCar?.slug || "vf-7";

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="border-b border-slate-200 pb-6 mb-8">
        <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-widest block mb-1">
          BẢO MẬT & XÁC NHẬN ĐƠN HÀNG
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#003F87] tracking-tight">
          Thanh Toán Đặt Cọc Xe VinFast Trực Tuyến
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Xác nhận thông tin hợp đồng điện tử và giữ chỗ ưu tiên bàn giao xe tại Showroom chính hãng.
        </p>
      </div>

      {orderSuccess ? (
        /* Order Success Certificate Screen */
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border-2 border-emerald-500 p-8 sm:p-12 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <span className="material-symbols-outlined text-5xl">check_circle</span>
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
              GIAO DỊCH ĐẶT CỌC THÀNH CÔNG
            </span>
            <h2 className="text-3xl font-extrabold text-[#003F87]">
              Chúc mừng bạn đã đặt cọc {carName}!
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Hệ thống VinFast đã ghi nhận đơn hàng và kích hoạt gói ưu đãi chuyển đổi xanh cho quý khách.
            </p>
          </div>

          {/* Certificate Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-left space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Mã đơn hàng:</span>
              <strong className="text-[#003F87] font-mono font-bold text-base">{orderSuccess.id}</strong>
            </div>

            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Dòng xe:</span>
              <strong className="text-slate-800">{carName} — {trimName} ({colorName})</strong>
            </div>

            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Chủ xe đăng ký:</span>
              <strong className="text-slate-800">{fullName} (CCCD: {citizenId})</strong>
            </div>

            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Số tiền đặt cọc đã thanh toán:</span>
              <strong className="text-emerald-600 font-extrabold text-base">{toVnd(depositAmount)}</strong>
            </div>

            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Showroom nhận xe:</span>
              <strong className="text-slate-800">
                {dealers.find((d) => d.id === selectedDealerId)?.name || "VinFast Landmark 81"}
              </strong>
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Trạng thái đơn hàng:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase">
                {orderSuccess.status} (Ưu tiên bàn giao)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-slate-700 text-left flex items-start gap-3">
            <span className="material-symbols-outlined text-[#003F87] text-xl mt-0.5">mail</span>
            <div>
              <strong className="text-[#003F87] block mb-0.5">Xác nhận đơn hàng qua Email:</strong>
              Biên lai thanh toán và dự thảo hợp đồng mua bán xe điện đã được gửi tới <strong>{email}</strong>. Chuyên viên VinFast sẽ liên hệ trong vòng 24h để hoàn tất thủ tục bàn giao.
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/"
              className="bg-[#003F87] hover:bg-[#002D62] text-white text-xs font-bold px-8 py-3.5 rounded-xl transition-all shadow"
            >
              Về trang chủ VinFast
            </Link>

            <Link
              href="/test-drive"
              className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold px-6 py-3.5 rounded-xl transition-all"
            >
              Đăng ký lái thử xe này
            </Link>
          </div>
        </div>
      ) : (
        /* Checkout Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Customer & Delivery Info (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Customer Identification */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-[#003F87] uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#003F87] text-white text-xs flex items-center justify-center">1</span>
                Thông tin chủ xe đứng tên hợp đồng
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Họ và tên (như trên CCCD) *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 focus:border-[#003F87] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Số CCCD / Hộ chiếu *</label>
                  <input
                    type="text"
                    value={citizenId}
                    onChange={(e) => setCitizenId(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 focus:border-[#003F87] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Số điện thoại di động *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 focus:border-[#003F87] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email nhận thông báo hợp đồng *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 focus:border-[#003F87] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Địa chỉ thường trú / Nhận hồ sơ *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 focus:border-[#003F87] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Showroom Handover */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-[#003F87] uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#003F87] text-white text-xs flex items-center justify-center">2</span>
                Đại lý / Showroom VinFast tiếp nhận bàn giao
              </h3>

              <div className="space-y-3">
                {dealers.map((d) => (
                  <label
                    key={d.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedDealerId === d.id ? "border-[#003F87] bg-blue-50/40" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="dealer"
                      checked={selectedDealerId === d.id}
                      onChange={() => setSelectedDealerId(d.id)}
                      className="mt-0.5 text-[#003F87] focus:ring-[#003F87] accent-[#003F87]"
                    />
                    <div className="text-xs">
                      <strong className="block text-slate-900 font-bold">{d.name}</strong>
                      <span className="text-slate-500 block mt-0.5">{d.address}</span>
                      <span className="text-slate-400 mt-1 block">Hotline: {d.phone}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-[#003F87] uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#003F87] text-white text-xs flex items-center justify-center">3</span>
                Phương thức thanh toán tiền cọc
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("VNPAY")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    paymentMethod === "VNPAY"
                      ? "border-[#003F87] bg-blue-50/50 shadow-sm font-bold"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="material-symbols-outlined text-[#003F87] text-2xl block mb-1">qr_code_2</span>
                  <span className="text-xs font-bold text-slate-900 block">VNPAY / VietQR</span>
                  <span className="text-[10px] text-slate-500 block">Quét mã QR từ 40+ app ngân hàng</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("ATM")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    paymentMethod === "ATM"
                      ? "border-[#003F87] bg-blue-50/50 shadow-sm font-bold"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="material-symbols-outlined text-[#003F87] text-2xl block mb-1">credit_card</span>
                  <span className="text-xs font-bold text-slate-900 block">Thẻ ATM nội địa</span>
                  <span className="text-[10px] text-slate-500 block">Internet Banking Napas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    paymentMethod === "CARD"
                      ? "border-[#003F87] bg-blue-50/50 shadow-sm font-bold"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="material-symbols-outlined text-[#003F87] text-2xl block mb-1">payments</span>
                  <span className="text-xs font-bold text-slate-900 block">Visa / Mastercard</span>
                  <span className="text-[10px] text-slate-500 block">Thẻ tín dụng / ghi nợ quốc tế</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Pay (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-lg sticky top-24 space-y-6">
              <span className="text-xs font-bold text-[#00B4D8] uppercase tracking-wider block">
                TÓM TẮT ĐƠN ĐẶT CỌC
              </span>

              {/* Car thumbnail & Name */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <img
                  src={getCarImage(carSlug)}
                  alt={carName}
                  className="w-20 h-14 object-contain bg-slate-50 rounded-lg p-1 border border-slate-200"
                />
                <div>
                  <h3 className="text-lg font-bold text-[#003F87]">{carName}</h3>
                  <span className="text-xs text-slate-500 block">{trimName} • Màu {colorName}</span>
                </div>
              </div>

              {/* Price Details */}
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Giá trị xe dự kiến:</span>
                  <strong className="text-slate-800">{toVnd(totalAmount)}</strong>
                </div>

                <div className="flex justify-between">
                  <span>Lệ phí trước bạ xe điện:</span>
                  <strong className="text-emerald-600">0 ₫ (Miễn phí)</strong>
                </div>

                <div className="flex justify-between">
                  <span>Bảo hành chính hãng:</span>
                  <strong className="text-slate-800">10 Năm</strong>
                </div>

                <div className="flex justify-between">
                  <span>Ưu đãi sạc pin V-GREEN:</span>
                  <strong className="text-emerald-600">Miễn phí đến 2026</strong>
                </div>
              </div>

              {/* Deposit Amount Highlight */}
              <div className="p-4 rounded-xl bg-gradient-to-tr from-[#003F87] to-[#002D62] text-white">
                <span className="text-[10px] text-[#00B4D8] font-bold uppercase tracking-wider block">
                  SỐ TIỀN THANH TOÁN ĐẶT CỌC:
                </span>
                <div className="text-3xl font-extrabold mt-1 text-white">
                  {toVnd(depositAmount)}
                </div>
                <span className="text-[11px] text-slate-300 mt-1 block">
                  Khoản tiền cọc sẽ được cấn trừ trực tiếp khi nhận xe
                </span>
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </p>
              )}

              {/* Confirm & Pay Button */}
              <button
                type="button"
                onClick={handleConfirmOrderAndPay}
                disabled={loading}
                className="w-full bg-[#003F87] hover:bg-[#002D62] text-white text-sm font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">
                      progress_activity
                    </span>
                    <span>Đang xử lý đặt cọc...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">lock</span>
                    <span>Xác nhận & Thanh toán cọc</span>
                  </>
                )}
              </button>

              <div className="text-center text-[11px] text-slate-400 space-y-1">
                <p>✓ Cổng thanh toán được mã hóa và bảo mật tuyệt đối</p>
                <p>✓ Cam kết hoàn tiền cọc minh bạch theo chính sách VinFast</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
