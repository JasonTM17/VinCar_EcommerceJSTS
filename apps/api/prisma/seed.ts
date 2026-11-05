import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;

async function main() {
  // 0. Clean up any transient models created during test runs (e.g. e2e-presales)
  const testModels = await prisma.vehicleModel.findMany({
    where: { slug: { startsWith: 'nova-test' } },
    select: { id: true },
  });
  if (testModels.length > 0) {
    const testModelIds = testModels.map((m) => m.id);
    const testTrims = await prisma.vehicleTrim.findMany({
      where: { modelId: { in: testModelIds } },
      select: { id: true },
    });
    const testTrimIds = testTrims.map((t) => t.id);
    await prisma.exteriorColor.deleteMany({ where: { trimId: { in: testTrimIds } } });
    await prisma.trimOption.deleteMany({ where: { trimId: { in: testTrimIds } } });
    await prisma.promotionExcludedTrim.deleteMany({ where: { trimId: { in: testTrimIds } } });
    await prisma.vehicleTrim.deleteMany({ where: { id: { in: testTrimIds } } });
    await prisma.promotionModel.deleteMany({ where: { modelId: { in: testModelIds } } });
    await prisma.vehicleModel.deleteMany({ where: { id: { in: testModelIds } } });
  }

  const admin = await prisma.user.upsert({
    where: { email: 'admin@autonova.local' },
    update: {},
    create: {
      email: 'admin@autonova.local',
      passwordHash: await bcrypt.hash('Admin123!', 12),
      name: 'Admin VinFast',
      role: 'ADMIN',
    },
  });
  const customer = await prisma.user.upsert({
    where: { email: 'customer@autonova.local' },
    update: {},
    create: {
      email: 'customer@autonova.local',
      passwordHash: await bcrypt.hash('Customer123!', 12),
      name: 'Nguyễn Văn An',
      role: 'CUSTOMER',
    },
  });

  // 1. Brands
  const vinfast = await prisma.brand.upsert({
    where: { slug: 'vinfast' },
    update: { name: 'VinFast' },
    create: { name: 'VinFast', slug: 'vinfast' },
  });

  const brand = await prisma.brand.upsert({
    where: { slug: 'autonova' },
    update: {},
    create: { name: 'AutoNova', slug: 'autonova' },
  });

  // Preserve Nova V8 for existing e2e test suite compatibility
  const model = await prisma.vehicleModel.upsert({
    where: { slug: 'nova-v8' },
    update: {},
    create: {
      brandId: brand.id,
      name: 'Nova V8',
      slug: 'nova-v8',
      category: 'SUV',
      seats: 7,
      powertrain: 'Electric',
      status: 'PUBLISHED',
      trims: {
        create: [
          {
            name: 'Eco',
            basePriceVnd: 699_000_000n,
            rangeKm: 420,
            batteryKwh: '75.00',
            colors: {
              create: [
                { name: 'Pearl White', hex: '#f5f5f5', surchargeVnd: 0n },
                { name: 'Midnight Navy', hex: '#0a1633', surchargeVnd: 10_000_000n },
              ],
            },
            options: {
              create: [
                { name: 'Sunroof', priceVnd: 20_000_000n },
                { name: 'Driver Assist', priceVnd: 35_000_000n },
              ],
            },
          },
          {
            name: 'Plus',
            basePriceVnd: 849_000_000n,
            rangeKm: 500,
            batteryKwh: '90.00',
            colors: {
              create: [{ name: 'Graphite Black', hex: '#1a1a1a', surchargeVnd: 15_000_000n }],
            },
            options: {
              create: [{ name: 'Premium Audio', priceVnd: 25_000_000n }],
            },
          },
        ],
      },
    },
    include: { trims: true },
  });

  const ecoTrim = model.trims.find((trim) => trim.name === 'Eco')!;

  // 2. VinFast Complete Electric Vehicle Lineup
  const createdVinFastModelIds: string[] = [];
  const vinfastCars = [
    {
      name: 'VF 3',
      slug: 'vf-3',
      category: 'SUV',
      seats: 4,
      powertrain: 'Electric',
      trims: [
        {
          name: 'Thuê pin',
          basePriceVnd: 240_000_000n,
          rangeKm: 210,
          batteryKwh: '18.64',
          colors: [
            { name: 'Vàng Solar (Solar Yellow)', hex: '#FACC15', surchargeVnd: 0n },
            { name: 'Trắng Brahminy (Brahminy White)', hex: '#F8FAFC', surchargeVnd: 0n },
            { name: 'Hồng Iris (Iris Pink)', hex: '#F472B6', surchargeVnd: 5_000_000n },
            { name: 'Xanh Lá Zen (Zen Green)', hex: '#4ADE80', surchargeVnd: 5_000_000n },
          ],
          options: [
            { name: 'Bọc vô lăng da cao cấp', priceVnd: 1_500_000n },
            { name: 'Thảm lót sàn chính hãng', priceVnd: 2_000_000n },
            { name: 'Bộ sạc di động 2.2kW', priceVnd: 4_000_000n },
          ],
        },
        {
          name: 'Kèm pin',
          basePriceVnd: 322_000_000n,
          rangeKm: 210,
          batteryKwh: '18.64',
          colors: [
            { name: 'Vàng Solar (Solar Yellow)', hex: '#FACC15', surchargeVnd: 0n },
            { name: 'Trắng Brahminy (Brahminy White)', hex: '#F8FAFC', surchargeVnd: 0n },
            { name: 'Hồng Iris (Iris Pink)', hex: '#F472B6', surchargeVnd: 5_000_000n },
          ],
          options: [
            { name: 'Bộ sạc treo tường 7.4kW', priceVnd: 9_500_000n },
            { name: 'Bọc vô lăng da cao cấp', priceVnd: 1_500_000n },
          ],
        },
      ],
    },
    {
      name: 'VF 5 Plus',
      slug: 'vf-5-plus',
      category: 'SUV',
      seats: 5,
      powertrain: 'Electric',
      trims: [
        {
          name: 'Thuê pin',
          basePriceVnd: 468_000_000n,
          rangeKm: 326,
          batteryKwh: '37.23',
          colors: [
            { name: 'Trắng Brahminy', hex: '#F8FAFC', surchargeVnd: 0n },
            { name: 'Xanh VinFast Blue', hex: '#0284C7', surchargeVnd: 0n },
            { name: 'Bạc Desat Silver', hex: '#94A3B8', surchargeVnd: 0n },
            { name: 'Đỏ Crimson Red', hex: '#DC2626', surchargeVnd: 8_000_000n },
          ],
          options: [
            { name: 'Gói tính năng ADAS cơ bản', priceVnd: 15_000_000n },
            { name: 'Bộ sạc di động 3.5kW', priceVnd: 6_000_000n },
          ],
        },
        {
          name: 'Kèm pin',
          basePriceVnd: 548_000_000n,
          rangeKm: 326,
          batteryKwh: '37.23',
          colors: [
            { name: 'Trắng Brahminy', hex: '#F8FAFC', surchargeVnd: 0n },
            { name: 'Xanh VinFast Blue', hex: '#0284C7', surchargeVnd: 0n },
            { name: 'Đỏ Crimson Red', hex: '#DC2626', surchargeVnd: 8_000_000n },
          ],
          options: [
            { name: 'Bộ sạc treo tường 7.4kW', priceVnd: 9_500_000n },
            { name: 'Gói tiện nghi thông minh Smart Services', priceVnd: 12_000_000n },
          ],
        },
      ],
    },
    {
      name: 'VF 6',
      slug: 'vf-6',
      category: 'SUV',
      seats: 5,
      powertrain: 'Electric',
      trims: [
        {
          name: 'Eco',
          basePriceVnd: 675_000_000n,
          rangeKm: 399,
          batteryKwh: '59.60',
          colors: [
            { name: 'Xanh Rêu (Deep Ocean)', hex: '#14532D', surchargeVnd: 0n },
            { name: 'Trắng Brahminy', hex: '#F8FAFC', surchargeVnd: 0n },
            { name: 'Đen Jet Black', hex: '#0F172A', surchargeVnd: 0n },
            { name: 'Xám Neptune Grey', hex: '#475569', surchargeVnd: 10_000_000n },
          ],
          options: [
            { name: 'Cửa sổ trời toàn cảnh Panorama', priceVnd: 20_000_000n },
            { name: 'Trợ lái ADAS Cấp độ 2', priceVnd: 30_000_000n },
          ],
        },
        {
          name: 'Plus',
          basePriceVnd: 765_000_000n,
          rangeKm: 381,
          batteryKwh: '59.60',
          colors: [
            { name: 'Xanh Rêu (Deep Ocean)', hex: '#14532D', surchargeVnd: 0n },
            { name: 'Đỏ Crimson Red', hex: '#DC2626', surchargeVnd: 10_000_000n },
            { name: 'Xám Neptune Grey', hex: '#475569', surchargeVnd: 10_000_000n },
          ],
          options: [
            { name: 'Nội thất da cao cấp phối 2 màu', priceVnd: 25_000_000n },
            { name: 'Âm thanh 10 loa vòm cao cấp', priceVnd: 18_000_000n },
          ],
        },
      ],
    },
    {
      name: 'VF 7',
      slug: 'vf-7',
      category: 'SUV',
      seats: 5,
      powertrain: 'Electric',
      trims: [
        {
          name: 'Base',
          basePriceVnd: 850_000_000n,
          rangeKm: 375,
          batteryKwh: '59.60',
          colors: [
            { name: 'Xanh VinFast Blue', hex: '#003F87', surchargeVnd: 0n },
            { name: 'Trắng Brahminy', hex: '#F8FAFC', surchargeVnd: 0n },
            { name: 'Đen Jet Black', hex: '#0F172A', surchargeVnd: 0n },
            { name: 'Xám Titan', hex: '#334155', surchargeVnd: 12_000_000n },
          ],
          options: [
            { name: 'Gói hỗ trợ lái ADAS nâng cao', priceVnd: 35_000_000n },
            { name: 'Cửa cốp đóng mở điện thông minh', priceVnd: 15_000_000n },
          ],
        },
        {
          name: 'Plus AWD (349 HP)',
          basePriceVnd: 999_000_000n,
          rangeKm: 431,
          batteryKwh: '75.30',
          colors: [
            { name: 'Xanh VinFast Blue', hex: '#003F87', surchargeVnd: 0n },
            { name: 'Đỏ Crimson Red', hex: '#DC2626', surchargeVnd: 15_000_000n },
            { name: 'Trắng Brahminy', hex: '#F8FAFC', surchargeVnd: 0n },
          ],
          options: [
            { name: 'Trần kính toàn cảnh Panorama', priceVnd: 25_000_000n },
            { name: 'Gói mâm đúc 20 inch thể thao', priceVnd: 30_000_000n },
            { name: 'Hiển thị kính lái HUD cao cấp', priceVnd: 18_000_000n },
          ],
        },
      ],
    },
    {
      name: 'VF 8',
      slug: 'vf-8',
      category: 'SUV',
      seats: 5,
      powertrain: 'Electric',
      trims: [
        {
          name: 'Eco',
          basePriceVnd: 1_079_000_000n,
          rangeKm: 471,
          batteryKwh: '87.70',
          colors: [
            { name: 'Trắng Brahminy', hex: '#F8FAFC', surchargeVnd: 0n },
            { name: 'Đen Jet Black', hex: '#0F172A', surchargeVnd: 0n },
            { name: 'Bạc Desat Silver', hex: '#94A3B8', surchargeVnd: 0n },
            { name: 'Đỏ Crimson Red', hex: '#DC2626', surchargeVnd: 15_000_000n },
          ],
          options: [
            { name: 'Gói trợ lái ADAS Cấp độ 2+', priceVnd: 45_000_000n },
            { name: 'Bộ sạc treo tường tại nhà 11kW', priceVnd: 12_000_000n },
          ],
        },
        {
          name: 'Plus',
          basePriceVnd: 1_289_000_000n,
          rangeKm: 457,
          batteryKwh: '87.70',
          colors: [
            { name: 'Trắng Brahminy', hex: '#F8FAFC', surchargeVnd: 0n },
            { name: 'Xanh VinFast Blue', hex: '#003F87', surchargeVnd: 0n },
            { name: 'Xám Neptune Grey', hex: '#475569', surchargeVnd: 15_000_000n },
          ],
          options: [
            { name: 'Ghế da thật chỉnh điện 12 hướng làm mát', priceVnd: 35_000_000n },
            { name: 'Hệ thống âm thanh cao cấp 10 loa', priceVnd: 22_000_000n },
          ],
        },
      ],
    },
    {
      name: 'VF 9',
      slug: 'vf-9',
      category: 'SUV',
      seats: 7,
      powertrain: 'Electric',
      trims: [
        {
          name: 'Eco 7 Chỗ',
          basePriceVnd: 1_566_000_000n,
          rangeKm: 626,
          batteryKwh: '123.00',
          colors: [
            { name: 'Đen Jet Black', hex: '#0F172A', surchargeVnd: 0n },
            { name: 'Trắng Brahminy', hex: '#F8FAFC', surchargeVnd: 0n },
            { name: 'Xám Neptune Grey', hex: '#475569', surchargeVnd: 0n },
            { name: 'Xanh VinFast Blue', hex: '#003F87', surchargeVnd: 20_000_000n },
          ],
          options: [
            { name: 'Gói an toàn chủ động ADAS toàn diện', priceVnd: 50_000_000n },
            { name: 'Trần kính toàn cảnh chống tia UV', priceVnd: 30_000_000n },
          ],
        },
        {
          name: 'Plus 6 Chỗ Ghế Cơ Trưởng',
          basePriceVnd: 2_114_000_000n,
          rangeKm: 602,
          batteryKwh: '123.00',
          colors: [
            { name: 'Đen Jet Black', hex: '#0F172A', surchargeVnd: 0n },
            { name: 'Trắng Brahminy', hex: '#F8FAFC', surchargeVnd: 0n },
            { name: 'Đỏ Crimson Red', hex: '#DC2626', surchargeVnd: 20_000_000n },
          ],
          options: [
            { name: 'Ghế cơ trưởng massage đa điểm sưởi thông gió', priceVnd: 60_000_000n },
            { name: 'Màn hình giải trí hàng ghế sau 8 inch', priceVnd: 35_000_000n },
          ],
        },
      ],
    },
  ];

  for (const car of vinfastCars) {
    const vModel = await prisma.vehicleModel.upsert({
      where: { slug: car.slug },
      update: {
        name: car.name,
        category: car.category,
        seats: car.seats,
        powertrain: car.powertrain,
        status: 'PUBLISHED',
      },
      create: {
        brandId: vinfast.id,
        name: car.name,
        slug: car.slug,
        category: car.category,
        seats: car.seats,
        powertrain: car.powertrain,
        status: 'PUBLISHED',
      },
    });

    createdVinFastModelIds.push(vModel.id);

    for (const trim of car.trims) {
      const vTrim = await prisma.vehicleTrim.upsert({
        where: {
          modelId_name: {
            modelId: vModel.id,
            name: trim.name,
          },
        },
        update: {
          basePriceVnd: trim.basePriceVnd,
          rangeKm: trim.rangeKm,
          batteryKwh: trim.batteryKwh,
        },
        create: {
          modelId: vModel.id,
          name: trim.name,
          basePriceVnd: trim.basePriceVnd,
          rangeKm: trim.rangeKm,
          batteryKwh: trim.batteryKwh,
        },
      });

      // Colors
      for (const col of trim.colors) {
        const existingColor = await prisma.exteriorColor.findFirst({
          where: { trimId: vTrim.id, name: col.name },
        });
        if (!existingColor) {
          await prisma.exteriorColor.create({
            data: {
              trimId: vTrim.id,
              name: col.name,
              hex: col.hex,
              surchargeVnd: col.surchargeVnd,
            },
          });
        }
      }

      // Options
      for (const opt of trim.options) {
        const existingOpt = await prisma.trimOption.findFirst({
          where: { trimId: vTrim.id, name: opt.name },
        });
        if (!existingOpt) {
          await prisma.trimOption.create({
            data: {
              trimId: vTrim.id,
              name: opt.name,
              priceVnd: opt.priceVnd,
            },
          });
        }
      }
    }
  }

  // 3. Dealers across Vietnam
  const dealer = await prisma.dealer.upsert({
    where: { id: 'dealer-hcm' },
    update: {},
    create: {
      id: 'dealer-hcm',
      name: 'VinFast Landmark 81 - Bình Thạnh',
      province: 'Ho Chi Minh',
      city: 'Ho Chi Minh City',
      address: 'Tầng B1, TTTM Vincom Center Landmark 81, 720A Điện Biên Phủ, Phường 22, Bình Thạnh',
      phone: '1900 23 23 89',
    },
  });

  const dealersList = [
    {
      id: 'dealer-timescity',
      name: 'VinFast Showroom 3S Times City - Hà Nội',
      province: 'Ha Noi',
      city: 'Hà Nội',
      address: 'Tầng B1, Vincom Mega Mall Times City, 458 Minh Khai, Hai Bà Trưng',
      phone: '0901234567',
    },
    {
      id: 'dealer-smartcity',
      name: 'VinFast Showroom Smart City - Hà Nội',
      province: 'Ha Noi',
      city: 'Hà Nội',
      address: 'TTTM Vincom Mega Mall Smart City, Tây Mỗ, Nam Từ Liêm',
      phone: '0901234568',
    },
    {
      id: 'dealer-thaodien',
      name: 'VinFast Showroom Thảo Điền - TP.HCM',
      province: 'Ho Chi Minh',
      city: 'TP. Hồ Chí Minh',
      address: 'Vincom Mega Mall Thảo Điền, 161 Xa Lộ Hà Nội, TP. Thủ Đức',
      phone: '0901234569',
    },
    {
      id: 'dealer-danang',
      name: 'VinFast Showroom 3S Đà Nẵng',
      province: 'Da Nang',
      city: 'Đà Nẵng',
      address: 'TTTM Vincom Plaza Ngô Quyền, 910A Ngô Quyền, Sơn Trà',
      phone: '0901234570',
    },
    {
      id: 'dealer-haiphong',
      name: 'VinFast Showroom Lê Thánh Tông - Hải Phòng',
      province: 'Hai Phong',
      city: 'Hải Phòng',
      address: 'Số 1 Lê Thánh Tông, Máy Tơ, Ngô Quyền',
      phone: '0901234571',
    },
    {
      id: 'dealer-cantho',
      name: 'VinFast Showroom Xuân Khánh - Cần Thơ',
      province: 'Can Tho',
      city: 'Cần Thơ',
      address: 'TTTM Vincom Plaza Xuân Khánh, 209 đường 30/4, Ninh Kiều',
      phone: '0901234572',
    },
  ];

  for (const d of dealersList) {
    await prisma.dealer.upsert({
      where: { id: d.id },
      update: { name: d.name, address: d.address, phone: d.phone },
      create: d,
    });
  }

  // 4. Test Drive Slots
  const tomorrow = new Date(Date.now() + DAY);
  tomorrow.setUTCHours(0, 0, 0, 0);
  await prisma.testDriveSlot.upsert({
    where: { id: 'slot-hcm-1' },
    update: {},
    create: { id: 'slot-hcm-1', dealerId: dealer.id, date: tomorrow, startTime: '10:00', capacity: 5, booked: 0 },
  });
  await prisma.testDriveSlot.upsert({
    where: { id: 'slot-hcm-2' },
    update: {},
    create: { id: 'slot-hcm-2', dealerId: dealer.id, date: tomorrow, startTime: '14:00', capacity: 5, booked: 0 },
  });

  for (const d of dealersList) {
    await prisma.testDriveSlot.upsert({
      where: { id: `slot-${d.id}-morning` },
      update: {},
      create: { id: `slot-${d.id}-morning`, dealerId: d.id, date: tomorrow, startTime: '09:00', capacity: 5, booked: 0 },
    });
    await prisma.testDriveSlot.upsert({
      where: { id: `slot-${d.id}-afternoon` },
      update: {},
      create: { id: `slot-${d.id}-afternoon`, dealerId: d.id, date: tomorrow, startTime: '15:00', capacity: 5, booked: 0 },
    });
  }

  // 5. On-Road Fee Rules
  // Clean up any stale or conflicting fee rules
  await prisma.onRoadFeeRule.deleteMany({});

  // 5.1 Ho Chi Minh fee rules (Standard baseline for E2E tests & HCM registrations: 10M + 500K + 1M = 11.5M)
  for (const [feeType, amountVnd] of [
    ['REGISTRATION', 10_000_000n],
    ['PLATE', 500_000n],
    ['OTHER', 1_000_000n],
  ] as const) {
    await prisma.onRoadFeeRule.create({
      data: {
        id: `fee-hcm-${feeType.toLowerCase()}`,
        province: 'Ho Chi Minh',
        category: 'ALL',
        feeType,
        amountVnd,
      },
    });
  }

  // 5.2 Provincial rules for other key markets (Ha Noi, Hai Phong, Can Tho)
  // Note: Da Nang is intentionally unseeded so that E2E tests can verify 400 rejection for unconfigured provinces
  const otherProvinces = [
    { name: 'Ha Noi', plateFee: 20_000_000n },
    { name: 'Hai Phong', plateFee: 1_000_000n },
    { name: 'Can Tho', plateFee: 1_000_000n },
  ];

  for (const p of otherProvinces) {
    await prisma.onRoadFeeRule.create({
      data: {
        id: `fee-${p.name.toLowerCase().replace(/\s+/g, '-')}-registration`,
        province: p.name,
        category: 'ALL',
        feeType: 'REGISTRATION',
        amountVnd: 0n,
      },
    });

    await prisma.onRoadFeeRule.create({
      data: {
        id: `fee-${p.name.toLowerCase().replace(/\s+/g, '-')}-plate`,
        province: p.name,
        category: 'ALL',
        feeType: 'PLATE',
        amountVnd: p.plateFee,
      },
    });

    await prisma.onRoadFeeRule.create({
      data: {
        id: `fee-${p.name.toLowerCase().replace(/\s+/g, '-')}-other`,
        province: p.name,
        category: 'ALL',
        feeType: 'OTHER',
        amountVnd: 2_380_000n,
      },
    });
  }

  // 6. Promotions
  const manhLietPromo = await prisma.promotion.upsert({
    where: { code: 'MANHLIETVN' },
    update: { status: 'ACTIVE' },
    create: {
      code: 'MANHLIETVN',
      name: 'Mãnh liệt Tinh thần Việt Nam',
      description: 'Hỗ trợ trực tiếp 3% giá trị xe cho khách hàng đăng ký chuyển đổi xe điện.',
      discountType: 'PERCENTAGE',
      discountValue: 300n,
      maxDiscountVnd: 50_000_000n,
      minVehiclePriceVnd: 0n,
      startsAt: new Date(Date.now() - DAY),
      endsAt: new Date(Date.now() + 60 * DAY),
      stacking: 'EXCLUSIVE',
    },
  });

  // Attach MANHLIETVN specifically to VinFast EV models so it does not collide with Nova V8 test fixtures
  for (const mId of createdVinFastModelIds) {
    await prisma.promotionModel.upsert({
      where: {
        promotionId_modelId: {
          promotionId: manhLietPromo.id,
          modelId: mId,
        },
      },
      update: {},
      create: {
        promotionId: manhLietPromo.id,
        modelId: mId,
      },
    });
  }

  await prisma.promotion.upsert({
    where: { code: 'NOVA5' },
    update: { status: 'ACTIVE' },
    create: {
      code: 'NOVA5',
      name: 'Nova V8 5% off',
      description: 'Demo campaign: 5% off, capped at 50,000,000 VND.',
      discountType: 'PERCENTAGE',
      discountValue: 500n,
      maxDiscountVnd: 50_000_000n,
      minVehiclePriceVnd: 0n,
      startsAt: new Date(Date.now() - DAY),
      endsAt: new Date(Date.now() + 30 * DAY),
      stacking: 'EXCLUSIVE',
      models: { create: [{ modelId: model.id }] },
    },
  });

  await prisma.promotion.upsert({
    where: { code: 'EXPIRED10' },
    update: {},
    create: {
      code: 'EXPIRED10',
      name: 'Expired campaign',
      description: 'Always outside its validity window.',
      discountType: 'PERCENTAGE',
      discountValue: 1_000n,
      minVehiclePriceVnd: 0n,
      startsAt: new Date(Date.now() - 30 * DAY),
      endsAt: new Date(Date.now() - DAY),
      stacking: 'EXCLUSIVE',
      models: { create: [{ modelId: model.id }] },
    },
  });

  await prisma.promotion.upsert({
    where: { code: 'ECOEXTRA' },
    update: {},
    create: {
      code: 'ECOEXTRA',
      name: 'Eco trim excluded',
      description: 'Applies to the model but explicitly excludes the Eco trim.',
      discountType: 'FIXED',
      discountValue: 5_000_000n,
      minVehiclePriceVnd: 0n,
      startsAt: new Date(Date.now() - DAY),
      endsAt: new Date(Date.now() + 30 * DAY),
      stacking: 'STACKABLE',
      models: { create: [{ modelId: model.id }] },
      excludedTrims: { create: [{ trimId: ecoTrim.id }] },
    },
  });

  console.log('VinFast seed completed successfully.');
}

void main().finally(() => prisma.$disconnect());
