import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@autonova.local' },
    update: {},
    create: {
      email: 'admin@autonova.local',
      passwordHash: await bcrypt.hash('Admin123!', 12),
      name: 'Admin',
      role: 'ADMIN',
    },
  });
  const customer = await prisma.user.upsert({
    where: { email: 'customer@autonova.local' },
    update: {},
    create: {
      email: 'customer@autonova.local',
      passwordHash: await bcrypt.hash('Customer123!', 12),
      name: 'Customer',
      role: 'CUSTOMER',
    },
  });

  const brand = await prisma.brand.upsert({
    where: { slug: 'autonova' },
    update: {},
    create: { name: 'AutoNova', slug: 'autonova' },
  });

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

  const dealer = await prisma.dealer.upsert({
    where: { id: 'dealer-hcm' },
    update: {},
    create: {
      id: 'dealer-hcm',
      name: 'AutoNova HCM - District 1',
      province: 'Ho Chi Minh',
      city: 'Ho Chi Minh City',
      address: '1 Vo Van Kiet, Quan 1',
      phone: '0900000001',
    },
  });

  const tomorrow = new Date(Date.now() + DAY);
  tomorrow.setUTCHours(0, 0, 0, 0);
  await prisma.testDriveSlot.upsert({
    where: { id: 'slot-hcm-1' },
    update: {},
    create: { id: 'slot-hcm-1', dealerId: dealer.id, date: tomorrow, startTime: '10:00', capacity: 3, booked: 0 },
  });
  await prisma.testDriveSlot.upsert({
    where: { id: 'slot-hcm-2' },
    update: {},
    create: { id: 'slot-hcm-2', dealerId: dealer.id, date: tomorrow, startTime: '14:00', capacity: 1, booked: 0 },
  });

  for (const [feeType, amountVnd] of [
    ['REGISTRATION', 10_000_000n],
    ['PLATE', 500_000n],
    ['OTHER', 1_000_000n],
  ] as const) {
    await prisma.onRoadFeeRule.upsert({
      where: { id: `fee-hcm-${feeType.toLowerCase()}` },
      update: { amountVnd },
      create: {
        id: `fee-hcm-${feeType.toLowerCase()}`,
        province: 'Ho Chi Minh',
        category: 'ALL',
        feeType,
        amountVnd,
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

  console.log('seeded', { admin: admin.id, customer: customer.id, model: model.id, dealer: dealer.id, ecoTrim: ecoTrim.id });
}

void main().finally(() => prisma.$disconnect());
