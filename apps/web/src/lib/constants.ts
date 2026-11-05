export const VINFAST_INFO = {
  brandName: "VinFast",
  fullName: "Công ty Cổ phần Sản xuất và Kinh doanh VinFast",
  parentCompany: "Tập đoàn Vingroup",
  hotline: "1900 23 23 89",
  email: "cskh@vinfastauto.com",
  headquarters: "Khu Kinh tế Đình Vũ - Cát Hải, Phường Đông Hải 2, Quận Hải An, Thành phố Hải Phòng, Việt Nam",
  warrantyYears: 10,
  warrantyKm: 200000,
  chargingPortsCount: "150.000+",
};

export const NAV_LINKS = [
  { href: "/vehicles", label: "Ô tô điện", hasMegaMenu: true },
  { href: "/charging", label: "Pin & Trạm sạc" },
  { href: "/services", label: "Dịch vụ hậu mãi" },
  { href: "/compare", label: "So sánh xe" },
  { href: "/on-road", label: "Dự toán lăn bánh" },
  { href: "/finance", label: "Vay trả góp" },
  { href: "/test-drive", label: "Lái thử" },
  { href: "/dealers", label: "Showroom" },
  { href: "/recommend", label: "AI Tư vấn xe", badge: true },
] as const;

export const PROVINCES = [
  { id: "Ho Chi Minh", name: "TP. Hồ Chí Minh", plateFeeVnd: 20000000 },
  { id: "Ha Noi", name: "Hà Nội", plateFeeVnd: 20000000 },
  { id: "Da Nang", name: "Đà Nẵng", plateFeeVnd: 1000000 },
  { id: "Hai Phong", name: "Hải Phòng", plateFeeVnd: 1000000 },
  { id: "Can Tho", name: "Cần Thơ", plateFeeVnd: 1000000 },
] as const;

export const VINFAST_MODELS_PREVIEW = [
  {
    name: "VF 3",
    slug: "vf-3",
    segment: "Mini SUV",
    priceFrom: "240.000.000 ₫",
    rangeKm: 210,
    seats: 4,
    battery: "18.64 kWh",
  },
  {
    name: "VF 5 Plus",
    slug: "vf-5-plus",
    segment: "A-SUV Đô thị",
    priceFrom: "468.000.000 ₫",
    rangeKm: 326,
    seats: 5,
    battery: "37.23 kWh",
  },
  {
    name: "VF 6",
    slug: "vf-6",
    segment: "B-SUV Gia đình",
    priceFrom: "675.000.000 ₫",
    rangeKm: 399,
    seats: 5,
    battery: "59.60 kWh",
  },
  {
    name: "VF 7",
    slug: "vf-7",
    segment: "C-SUV Thể thao",
    priceFrom: "850.000.000 ₫",
    rangeKm: 431,
    seats: 5,
    battery: "75.30 kWh",
  },
  {
    name: "VF 8",
    slug: "vf-8",
    segment: "D-SUV Toàn cầu",
    priceFrom: "1.079.000.000 ₫",
    rangeKm: 471,
    seats: 5,
    battery: "87.70 kWh",
  },
  {
    name: "VF 9",
    slug: "vf-9",
    segment: "E-SUV Full-size Hạng sang",
    priceFrom: "1.566.000.000 ₫",
    rangeKm: 626,
    seats: 7,
    battery: "123.00 kWh",
  },
];

