# VinFast Auto — Nền Tảng Thương Mại Điện Tử Ô Tô Điện Thông Minh

Hệ thống thương mại điện tử O2O xe điện VinFast chuẩn nhận diện thương hiệu `https://vinfastauto.com/vn_vi`: nghiên cứu danh mục → xem thông số kỹ thuật 3D → dự toán chi phí lăn bánh (ưu đãi thuế trước bạ 0%) → dự toán vay trả góp 8 năm → cấu hình xe cá nhân hóa → đăng ký lái thử tại showroom/tận nhà → đặt cọc trực tuyến.

---

## 🏛️ Kiến Trúc Thư Mục Chuẩn (Modular & Scalable)

Dự án tuân thủ cấu trúc **Monorepo** với phân chia module nghiệp vụ rõ ràng, tách bạch giữa UI Components, Core Logic, Types và Data Access.

```
VinCar_Ecommerce/
├── apps/
│   ├── api/                           # NestJS REST API Server
│   │   ├── src/
│   │   │   ├── auth/                  # Xác thực người dùng, JWT, RBAC
│   │   │   ├── catalog/               # Danh mục xe (VF 3 -> VF 9) & Admin CRUD
│   │   │   ├── pricing/               # Tính phí lăn bánh, quy tắc tỉnh/thành
│   │   │   ├── promotions/            # Mã giảm giá, chiến dịch "Mãnh liệt Tinh thần VN"
│   │   │   ├── finance/               # Tính lịch trả góp, dư nợ giảm dần / đều
│   │   │   ├── quotes/                # Báo giá xe đã cấu hình, snapshot giá
│   │   │   ├── orders/                # Khởi tạo đơn hàng, vòng đời đơn cọc
│   │   │   ├── payments/              # Webhook thanh toán sandbox VNPAY/VietQR
│   │   │   ├── dealers/               # Showroom & Đại lý trên toàn quốc
│   │   │   ├── test-drives/           # Lịch hẹn lái thử xe theo khung giờ
│   │   │   ├── inventory/             # Quản lý kho xe, VIN, giữ xe
│   │   │   ├── recommendations/       # AI tư vấn xe theo nhu cầu & ngân sách
│   │   │   └── notifications/         # Transactional Outbox gửi email/SMS
│   │   └── prisma/
│   │       ├── schema.prisma          # PostgreSQL Schema (Money = BigInt VND)
│   │       └── seed.ts                # Dữ liệu chuẩn VinFast (xe, showroom, phí)
│   │
│   └── web/                           # Next.js 16 Storefront (App Router)
│       └── src/
│           ├── app/                   # App Router Pages (Chỉ quản lý định tuyến)
│           │   ├── layout.tsx         # Layout chuẩn VinFast (TopBanner, Header, Footer)
│           │   ├── page.tsx           # Trang chủ chính thức chuẩn vinfastauto.com
│           │   ├── vehicles/          # Danh mục xe & Trang chi tiết xe ([slug])
│           │   ├── configurator/      # Cấu hình xe 3D trực tuyến & Lấy báo giá
│           │   ├── checkout/          # Thanh toán đặt cọc trực tuyến
│           │   ├── on-road/           # Dự toán chi phí lăn bánh (Thuế trước bạ 0%)
│           │   ├── finance/           # Bảng tính vay trả góp 8 năm
│           │   ├── test-drive/        # Đăng ký lái thử tại Showroom / Tận nơi
│           │   ├── dealers/           # Mạng lưới Showroom & Trạm sạc V-GREEN
│           │   ├── recommend/         # AI tư vấn chọn xe thông minh
│           │   ├── login/             # Đăng nhập VinFast ID
│           │   └── globals.css        # VinFast design tokens & Tailwind 4
│           │
│           ├── components/            # Thư viện Components phân chia theo domain
│           │   ├── common/            # Header, Footer, TopBanner, BrandLogo
│           │   ├── home/              # Hero, Lineup, CostCalculator, ChargingNetwork, Pillars
│           │   ├── vehicles/          # VehicleCard, VehicleSpecsStrip
│           │   └── dealers/           # DealerCard
│           │
│           ├── hooks/                 # Custom React Hooks
│           │   └── useAuth.ts         # Hook quản lý phiên đăng nhập & khách
│           │
│           ├── lib/                   # Tiện ích hệ thống & API client
│           │   ├── api.ts             # Typed fetcher kết nối NestJS backend
│           │   ├── car-assets.ts      # Quản lý ảnh xe chất lượng cao từ Stitch
│           │   ├── constants.ts       # Thông tin VinFast, Menu, Tỉnh/Thành
│           │   └── formatters.ts      # Định dạng tiền tệ VND, khoảng cách, %
│           │
│           └── types/                 # TypeScript Type Definitions
│               ├── vehicle.ts         # Kiểu dữ liệu xe, phiên bản, màu sắc, phụ kiện
│               ├── dealer.ts          # Đại lý, khung giờ lái thử, lịch hẹn
│               ├── order.ts           # Báo giá, đơn cọc, thanh toán
│               ├── finance.ts         # Chi phí lăn bánh, bảng lịch trả nợ
│               └── index.ts           # Central types re-export
│
├── packages/
│   ├── pricing/                       # Logic tính giá, chiết khấu, lãi suất (TS)
│   ├── shared-js/                     # Helpers định dạng tiền tệ, slugify (ESM)
│   └── outbox/                        # Transactional outbox pattern
│
├── scripts/                           # Kịch bản kiểm thử tích hợp tự động
└── docker-compose.yml                 # PostgreSQL (127.0.0.1:5434) & Redis (6379)
```

---

## 🚗 Danh Mục Dòng Xe Điện VinFast Đã Tích Hợp

| Mẫu xe | Phân khúc | Số chỗ | Tầm di chuyển | Giá thuê pin từ | Giá kèm pin từ | Điểm nổi bật |
| --- | --- | --- | --- | --- | --- | --- |
| **VF 3** | Mini SUV | 4 | 210 km | 240.000.000 ₫ | 322.000.000 ₫ | Lái phố linh hoạt, cá tính, sạc nhanh 36 phút |
| **VF 5 Plus** | A-SUV | 5 | 326 km | 468.000.000 ₫ | 548.000.000 ₫ | Xe điện quốc dân, kinh tế cho gia đình trẻ |
| **VF 6** | B-SUV | 5 | 399 km | 675.000.000 ₫ | 765.000.000 ₫ | Thời thượng, trợ lái ADAS cấp độ 2 |
| **VF 7** | C-SUV | 5 | 431 km | 850.000.000 ₫ | 999.000.000 ₫ | Torino Design, 349 HP, 2 cầu AWD, trần kính toàn cảnh |
| **VF 8** | D-SUV | 5 | 471 km | 1.079.000.000 ₫ | 1.289.000.000 ₫ | Xuất khẩu toàn cầu (Mỹ, Châu Âu), ADAS nâng cao |
| **VF 9** | E-SUV | 7 | 626 km | 1.566.000.000 ₫ | 2.114.000.000 ₫ | Full-size hạng sang, ghế cơ trưởng massage đa điểm |

---

## ⚡ Các Tính Năng & Nghiệp Vụ Chuẩn VinFast

1. **Giao Diện & Nhận Diện Thương Hiệu Chuẩn:**
   - Logo cánh chim chữ V biểu tượng kết hợp hiệu ứng mạ kim loại sắc nét.
   - Bảng màu chủ đạo: Xanh hoàng gia VinFast (`#003F87`), Xanh điện khí (`#00B4D8`), Xanh khung gầm (`#0B2545`), Nền trắng ngọc trai (`#F8FAFC`).
   - Font chữ tối ưu diacritic tiếng Việt: **Be Vietnam Pro** và font thông số kỹ thuật **Inter**.

2. **Dự Toán Chi Phí & So Sánh Tiết Kiệm (Cost Savings Calculator):**
   - Thanh trượt quãng đường (500 km – 5.000 km/tháng).
   - So sánh trực quan chi phí vận hành xe điện vs xe xăng cùng hạng (tiết kiệm đến hơn 30.000.000 ₫/năm ~ 65%).
   - Thống kê giảm phát thải CO2 và tương đương số cây xanh đóng góp cho môi trường.

3. **Dự Toán Chi Phí Lăn Bánh (On-Road Estimator):**
   - Áp dụng chính sách **0% Lệ phí trước bạ** dành riêng cho ô tô điện theo nghị định của Chính phủ Việt Nam.
   - Phí cấp biển số theo khu vực: Hà Nội & TP.HCM (20 triệu đồng), Tỉnh thành khác (1 triệu đồng).
   - Phí đăng kiểm, bảo trì đường bộ và bảo hiểm TNDS bắt buộc được tính toán chuẩn xác từ máy chủ.

4. **Dự Toán Vay Trả Góp 8 Năm (Finance Calculator):**
   - Gói ưu đãi *"Mãnh liệt Tinh thần Việt Nam"*: Vay tới 80% trong tối đa 8 năm (96 tháng).
   - Lãi suất ưu đãi cố định từ 5.0%/năm.
   - Bảng phân bổ lịch trả nợ từng tháng (gốc, lãi, dư nợ còn lại).

5. **Cấu Hình Xe Cá Nhân Hóa (Configurator) & Đặt Cọc Online (Checkout):**
   - Chọn dòng xe, phiên bản, màu sơn ngoại thất VinFast chuẩn, phụ kiện thông minh.
   - Thông tin hợp đồng chủ xe: Họ tên, Số CCCD/Hộ chiếu, SĐT, Email, Địa chỉ.
   - Lựa chọn Showroom/Đại lý bàn giao xe trên toàn quốc.
   - Phương thức thanh toán: VNPAY-QR, Thẻ ATM nội địa, Thẻ quốc tế Visa/Mastercard.
   - Xác nhận đơn hàng cọc tức thì với mã đơn hàng duy nhất và chứng nhận đặt cọc thành công.

6. **Mạng Lưới Showroom & Trạm Sạc V-GREEN Phủ Sóng Toàn Quốc:**
   - Bản đồ trạm sạc với 150.000+ cổng sạc phủ khắp 63 tỉnh thành.
   - Tìm kiếm showroom, xưởng dịch vụ 3S và trạm sạc siêu nhanh 360 kW.

7. **Đăng Ký Lái Thử Trực Tuyến:**
   - Chọn mẫu xe muốn lái thử, chọn đại lý gần nhất, ngày hẹn và khung giờ còn trống (giữ chỗ theo slot thực tế).
   - Tùy chọn lái thử tại Showroom hoặc mang xe đến tận nhà/cơ quan.

---

## 🚀 Khởi Động Nhanh (Local Development)

```bash
# 1. Khởi chạy cơ sở dữ liệu PostgreSQL & Redis
docker compose up -d db redis

# 2. Cài đặt các gói phụ thuộc
pnpm install

# 3. Seed dữ liệu xe điện VinFast, Showroom & quy tắc phí lăn bánh
pnpm db:seed

# 4. Khởi chạy đồng thời API (cổng 4000) và Web Storefront (cổng 3000)
pnpm dev
```

Truy cập:
- Trang chủ VinFast: **http://localhost:3000**
- Cấu hình & Đặt cọc: **http://localhost:3000/configurator**
- Dự toán lăn bánh: **http://localhost:3000/on-road**
- Vay trả góp: **http://localhost:3000/finance**
- Đăng ký lái thử: **http://localhost:3000/test-drive**
- Showroom & Trạm sạc: **http://localhost:3000/dealers**
- Swagger API Docs: **http://localhost:4000/docs**

---

## ✅ Kiểm Thử & Đảm Bảo Chất Lượng

```bash
pnpm typecheck   # Kiểm tra kiểu TypeScript nghiêm ngặt trên toàn bộ monorepo (0 lỗi)
pnpm test        # Chạy toàn bộ unit test (API, Storefront, Pricing domain)
pnpm -r build    # Build production cho toàn bộ workspace
```
