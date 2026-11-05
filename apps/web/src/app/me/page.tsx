"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { formatVND } from "@/lib/formatters";
import { getCarImage } from "@/lib/car-assets";

interface OrderItem {
  id: string;
  depositVnd: string;
  status: string;
  createdAt: string;
  quote: {
    totalVnd: string;
    config: {
      trimName?: string;
      modelName?: string;
      colorName?: string;
    };
    snapshot?: {
      trimName?: string;
      modelName?: string;
      colorName?: string;
      modelSlug?: string;
    };
  };
  dealer?: {
    name: string;
    address: string;
  };
}

interface TestDriveBooking {
  id: string;
  modelSlug: string;
  status: string;
  createdAt: string;
  dealer: {
    name: string;
    address: string;
  };
  slot: {
    date: string;
    startTime: string;
  };
}

export default function CustomerPortalPage() {
  const { user, token, isLoggedIn, login, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"orders" | "testdrives" | "vinclub">("orders");
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [testDrives, setTestDrives] = useState<TestDriveBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrderForCert, setSelectedOrderForCert] = useState<OrderItem | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      apiFetch<OrderItem[]>("/orders", { token }).catch(() => []),
      apiFetch<TestDriveBooking[]>("/me/test-drives", { token }).catch(() => []),
    ])
      .then(([ordersRes, testDrivesRes]) => {
        setOrders(ordersRes);
        setTestDrives(testDrivesRes);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function cancelTestDrive(id: string) {
    if (!token) return;
    try {
      await apiFetch(`/test-drives/${id}/cancel`, { method: "POST", token });
      setTestDrives((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b))
      );
    } catch (e) {
      alert("Không thể hủy lịch hẹn: " + (e instanceof Error ? e.message : String(e)));
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex items-center gap-3 text-slate-500 text-xs font-semibold">
          <span className="material-symbols-outlined animate-spin text-xl text-[#003F87]">progress_activity</span>
          <span>Đang tải thông tin tài khoản...</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F8FAFC] px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#003F87] flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">account_circle</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Đăng nhập tài khoản VinFast ID</h2>
          <p className="text-xs text-slate-500 mb-6">
            Đăng nhập để xem tiến độ bàn giao xe, quản lý hợp đồng đặt cọc và lịch hẹn lái thử của bạn.
          </p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center bg-[#003F87] hover:bg-[#002D62] text-white text-xs font-bold py-3.5 rounded-xl shadow transition-all"
            >
              Đến trang đăng nhập
            </Link>
            <button
              type="button"
              onClick={() => login("customer@autonova.local", "Customer123!")}
              className="w-full inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-3.5 rounded-xl transition-all"
            >
              1-Click Đăng nhập nhanh khách hàng mẫu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-slate-900 pb-20">
      {/* Header Profile Summary */}
      <section className="bg-gradient-to-r from-[#0B2545] to-[#003F87] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#00B4D8] text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg">
              {user?.name ? user.name[0].toUpperCase() : "V"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black">{user?.name}</h1>
                <span className="bg-[#50D9FE]/20 text-[#50D9FE] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-[#50D9FE]/30">
                  Hội viên VinClub
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{user?.email} • Khách hàng tiên phong xe điện</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/configurator"
              className="bg-[#00B4D8] hover:bg-[#0096C7] text-slate-950 text-xs font-extrabold px-5 py-2.5 rounded-xl transition-all"
            >
              + Đặt cọc thêm xe mới
            </Link>
            <button
              type="button"
              onClick={logout}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-all"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex border-b border-slate-200 space-x-8 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === "orders"
                ? "border-[#003F87] text-[#003F87]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-lg">receipt_long</span>
            <span>Hợp đồng đặt cọc ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("testdrives")}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === "testdrives"
                ? "border-[#003F87] text-[#003F87]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-lg">calendar_month</span>
            <span>Lịch hẹn lái thử ({testDrives.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("vinclub")}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === "vinclub"
                ? "border-[#003F87] text-[#003F87]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-lg">workspace_premium</span>
            <span>Đặc quyền VinClub & Voucher</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-xs font-medium flex items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : activeTab === "orders" ? (
          <div>
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">shopping_cart</span>
                <h3 className="text-base font-bold text-slate-900 mb-1">Chưa có hợp đồng đặt cọc nào</h3>
                <p className="text-xs text-slate-500 mb-6">
                  Bạn chưa thực hiện đặt cọc xe điện VinFast nào. Khám phá dải sản phẩm và nhận ưu đãi trước bạ 0% ngay!
                </p>
                <Link
                  href="/configurator"
                  className="bg-[#003F87] text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-[#002D62] transition-colors"
                >
                  Cấu hình & Đặt cọc ngay
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const carName = order.quote.snapshot?.modelName || order.quote.config.modelName || "Ô tô điện VinFast";
                  const trimName = order.quote.snapshot?.trimName || order.quote.config.trimName || "Tiêu chuẩn";
                  const colorName = order.quote.snapshot?.colorName || order.quote.config.colorName || "Trắng Brahminy";
                  const slug = order.quote.snapshot?.modelSlug || "vf-7";

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:border-[#003F87]/40 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b border-slate-100 gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Mã hợp đồng: {order.id}
                          </span>
                          <p className="text-xs text-slate-500">
                            Ngày đặt cọc: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        <div>
                          {order.status === "DEPOSIT_PAID" || order.status === "ALLOCATED" ? (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Đã đặt cọc thành công
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                              Chờ xử lý thanh toán
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        <div className="lg:col-span-3 aspect-[16/9] w-full rounded-xl bg-slate-50 p-2 flex items-center justify-center">
                          <img
                            src={getCarImage(slug)}
                            alt={carName}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>

                        <div className="lg:col-span-5 space-y-2">
                          <h3 className="text-lg font-black text-slate-900">{carName}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                            <span className="font-semibold bg-slate-100 px-2 py-0.5 rounded">Phiên bản: {trimName}</span>
                            <span>•</span>
                            <span>Màu: {colorName}</span>
                          </div>
                          {order.dealer && (
                            <p className="text-xs text-slate-500">
                              📍 Showroom nhận xe: <strong>{order.dealer.name}</strong>
                            </p>
                          )}
                        </div>

                        <div className="lg:col-span-4 bg-slate-50 p-4 rounded-xl text-xs space-y-2 border border-slate-100">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Giá trị xe dự toán:</span>
                            <span className="font-bold text-slate-800">{formatVND(order.quote.totalVnd)}</span>
                          </div>
                          <div className="flex justify-between text-[#003F87] font-extrabold">
                            <span>Tiền đặt cọc (10%):</span>
                            <span>{formatVND(order.depositVnd)}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedOrderForCert(order)}
                            className="w-full mt-2 bg-[#003F87] hover:bg-[#002D62] text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-sm">verified</span>
                            <span>Xem chứng nhận đặt cọc</span>
                          </button>
                        </div>
                      </div>

                      {/* Delivery Stepper */}
                      <div className="mt-6 pt-6 border-t border-slate-100">
                        <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                          <div className="text-[#003F87] font-bold">
                            <div className="w-6 h-6 rounded-full bg-[#003F87] text-white flex items-center justify-center mx-auto mb-1">
                              ✓
                            </div>
                            <span>1. Đặt cọc online</span>
                          </div>
                          <div className="text-[#003F87] font-bold">
                            <div className="w-6 h-6 rounded-full bg-[#003F87] text-white flex items-center justify-center mx-auto mb-1">
                              ✓
                            </div>
                            <span>2. Xác nhận hợp đồng</span>
                          </div>
                          <div className="text-slate-400 font-medium">
                            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto mb-1">
                              3
                            </div>
                            <span>3. Gán số khung VIN</span>
                          </div>
                          <div className="text-slate-400 font-medium">
                            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto mb-1">
                              4
                            </div>
                            <span>4. Bàn giao xe</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === "testdrives" ? (
          <div>
            {testDrives.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">drive_eta</span>
                <h3 className="text-base font-bold text-slate-900 mb-1">Chưa có lịch hẹn lái thử nào</h3>
                <p className="text-xs text-slate-500 mb-6">
                  Đăng ký lái thử miễn phí tại Showroom hoặc tại nhà để trực tiếp cầm lái xe điện VinFast.
                </p>
                <Link
                  href="/test-drive"
                  className="bg-[#003F87] text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-[#002D62] transition-colors"
                >
                  Đăng ký lái thử ngay
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testDrives.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold text-[#003F87] uppercase tracking-wider">
                          Mẫu xe: {booking.modelSlug.toUpperCase()}
                        </span>
                        {booking.status === "CONFIRMED" ? (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            Đã xác nhận
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Đã hủy
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-black text-slate-900 mb-2">{booking.dealer?.name}</h4>
                      <p className="text-xs text-slate-500 mb-4">📍 {booking.dealer?.address}</p>

                      <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 mb-4">
                        <p>
                          📅 Ngày hẹn: <strong>{new Date(booking.slot?.date).toLocaleDateString("vi-VN")}</strong>
                        </p>
                        <p>
                          ⏰ Khung giờ: <strong>{booking.slot?.startTime}</strong>
                        </p>
                      </div>
                    </div>

                    {booking.status === "CONFIRMED" && (
                      <button
                        type="button"
                        onClick={() => cancelTestDrive(booking.id)}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold border border-red-200 hover:bg-red-50 py-2 rounded-lg transition-colors"
                      >
                        Hủy lịch hẹn này
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Tab: VinClub Privileges */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#003F87] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-xl">discount</span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-1">Mã ưu đãi chuyển đổi xanh</h3>
              <p className="text-xs text-slate-500 mb-4">
                Mã giảm giá trực tiếp 3% giá trị xe cho khách hàng tiên phong chuyển đổi phương tiện xanh.
              </p>
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl font-mono text-xs font-bold text-[#003F87] text-center">
                MANHLIETVN
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-xl">ev_station</span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-1">Ưu đãi sạc pin V-GREEN</h3>
              <p className="text-xs text-slate-500 mb-4">
                Miễn phí sạc pin tại toàn bộ trạm sạc V-GREEN công cộng trên toàn quốc trong thời gian ưu đãi.
              </p>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Áp dụng tự động qua App
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-xl">local_parking</span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-1">Đặc quyền đỗ xe Vincom</h3>
              <p className="text-xs text-slate-500 mb-4">
                Miễn phí gửi xe dưới 5 tiếng tại tất cả các Trung tâm Thương mại Vincom và Khu đô thị Vinhomes toàn quốc.
              </p>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                Đặc quyền chủ xe VinFast
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Official VinFast Deposit Certificate Modal */}
      {selectedOrderForCert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border-4 border-[#003F87] relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setSelectedOrderForCert(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            {/* Certificate Header */}
            <div className="text-center pb-6 border-b-2 border-slate-100">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl font-black text-[#003F87] tracking-wider">VINFAST</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">
                Giấy xác nhận đặt cọc xe điện trực tuyến
              </h2>
              <p className="text-[11px] text-slate-400 font-mono mt-1">Mã chứng nhận: {selectedOrderForCert.id}</p>
            </div>

            {/* Certificate Body */}
            <div className="py-6 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 text-[11px]">Chủ hợp đồng:</span>
                    <p className="font-bold text-slate-900">{user?.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Email đăng ký:</span>
                    <p className="font-bold text-slate-900 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[11px]">Mẫu xe đặt cọc:</span>
                  <p className="text-sm font-black text-[#003F87] mt-0.5">
                    {selectedOrderForCert.quote.snapshot?.modelName || "VinFast EV"}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Phiên bản: {selectedOrderForCert.quote.snapshot?.trimName || "Tiêu chuẩn"}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[11px]">Số tiền đặt cọc (10%):</span>
                  <p className="text-sm font-black text-emerald-700 mt-0.5">
                    {formatVND(selectedOrderForCert.depositVnd)}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">Đã ghi nhận thanh toán</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl text-[11px] text-slate-600 space-y-1">
                <p>• Showroom giao dịch bàn giao: <strong>{selectedOrderForCert.dealer?.name || "Hệ thống VinFast"}</strong></p>
                <p>• Hợp đồng có giá trị giữ xe và áp dụng chính sách ưu đãi Lệ phí trước bạ 0% theo quy định.</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">print</span>
                <span>In xác nhận</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrderForCert(null)}
                className="bg-[#003F87] hover:bg-[#002D62] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
