const API = process.env.API_URL ?? "http://127.0.0.1:4000/api/v1";

let pass = 0;
let fail = 0;
function check(name, cond, detail = "") {
  if (cond) {
    pass++;
    console.log(`PASS  ${name}`);
  } else {
    fail++;
    console.log(`FAIL  ${name} ${detail}`);
  }
}

async function call(path, { method = "GET", token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json };
}

const login = await call("/auth/login", { method: "POST", body: { email: "customer@autonova.local", password: "Customer123!" } });
const token = login.json.token;
check("login", [200, 201].includes(login.status) && !!token);

const catalog = await call("/vehicles");
const vehicle = catalog.json.data.find((v) => v.slug === "nova-v8");
const trim = vehicle.trims[0];
const color = trim.colors[0];
const option = trim.options[0];

// --- configuration validation ---
const valid = await call("/configurations/validate", { method: "POST", body: { trimId: trim.id, colorId: color.id, optionIds: [option.id] } });
check("valid configuration accepted", [200, 201].includes(valid.status) && valid.json.valid === true, JSON.stringify(valid.json));

const invalid = await call("/configurations/validate", { method: "POST", body: { trimId: trim.id, colorId: "not-a-color", optionIds: ["not-an-option"] } });
check("invalid configuration rejected", [200, 201].includes(invalid.status) && invalid.json.valid === false, JSON.stringify(invalid.json));

// --- on-road cost ---
// 699,000,000 base + 0 color + 20,000,000 option = 719,000,000 vehicle price.
// NOVA5 auto-applies 5% (35,950,000), then fees 10,000,000 + 500,000 + 1,000,000
// => 719,000,000 - 35,950,000 + 11,500,000 = 694,550,000.
const onRoad = await call("/on-road/simulate", { method: "POST", body: { trimId: trim.id, colorId: color.id, optionIds: [option.id], province: "Ho Chi Minh" } });
check("on-road total computed", [200, 201].includes(onRoad.status) && onRoad.json.breakdown.onRoadTotalVnd === "694550000", JSON.stringify(onRoad.json).slice(0, 300));
check("on-road fees come from rules", onRoad.json?.fees?.ruleCount === 3, JSON.stringify(onRoad.json?.fees));

const onRoadNoRules = await call("/on-road/simulate", { method: "POST", body: { trimId: trim.id, province: "Da Nang" } });
check("province without fee rules rejected", onRoadNoRules.status === 400, String(onRoadNoRules.status));

// --- promotions (rules enforced server-side) ---
const promoAuto = await call("/on-road/simulate", { method: "POST", body: { trimId: trim.id, colorId: color.id, optionIds: [option.id], province: "Ho Chi Minh" } });
check("best eligible promotion auto-applied", [200, 201].includes(promoAuto.status) && promoAuto.json.promotions?.some((p) => p.code === "NOVA5"), JSON.stringify(promoAuto.json.promotions));
check("promotion discount computed server-side", promoAuto.json?.promotions?.[0]?.discountVnd === "35950000", JSON.stringify(promoAuto.json?.promotions));

const promoExplicit = await call("/on-road/simulate", { method: "POST", body: { trimId: trim.id, colorId: color.id, optionIds: [option.id], province: "Ho Chi Minh", promotionCode: "NOVA5" } });
check("explicit promotion applied", [200, 201].includes(promoExplicit.status) && promoExplicit.json.promotions?.length === 1, JSON.stringify(promoExplicit.json.promotions));
check("promotion reduces on-road total", promoExplicit.json?.breakdown?.onRoadTotalVnd === "694550000", promoExplicit.json?.breakdown?.onRoadTotalVnd);

const promoExpired = await call("/on-road/simulate", { method: "POST", body: { trimId: trim.id, colorId: color.id, optionIds: [option.id], province: "Ho Chi Minh", promotionCode: "EXPIRED10" } });
check("expired promotion rejected", promoExpired.status === 400, String(promoExpired.status));

const promoExcluded = await call("/on-road/simulate", { method: "POST", body: { trimId: trim.id, colorId: color.id, optionIds: [option.id], province: "Ho Chi Minh", promotionCode: "ECOEXTRA" } });
check("excluded trim promotion rejected", promoExcluded.status === 400, String(promoExcluded.status));

const promoUnknown = await call("/on-road/simulate", { method: "POST", body: { trimId: trim.id, colorId: color.id, optionIds: [option.id], province: "Ho Chi Minh", promotionCode: "NOPE" } });
check("unknown promotion rejected", promoUnknown.status === 400, String(promoUnknown.status));

// --- finance ---
const finance = await call("/finance/simulate", { method: "POST", body: { principalVnd: "100000000", annualRateBps: 0, termMonths: 4, method: "EQUAL_PAYMENT" } });
check("finance zero-interest monthly", [200, 201].includes(finance.status) && finance.json.monthlyPaymentVnd === "25000000", JSON.stringify(finance.json).slice(0, 200));
check("finance zero-interest total", finance.json?.totalInterestVnd === "0", finance.json?.totalInterestVnd);

const financeRate = await call("/finance/simulate", { method: "POST", body: { principalVnd: "100000000", annualRateBps: 1200, termMonths: 12, method: "EQUAL_PRINCIPAL" } });
const sum = financeRate.json.schedule.reduce((acc, row) => acc + Number(row.principalVnd), 0);
check("finance schedule principal sums to loan", [200, 201].includes(financeRate.status) && sum === 100000000, String(sum));
check("finance last balance zero", financeRate.json?.schedule?.at(-1)?.balanceAfterVnd === "0", financeRate.json?.schedule?.at(-1)?.balanceAfterVnd);

const financeBad = await call("/finance/simulate", { method: "POST", body: { principalVnd: "100000000", annualRateBps: 1200, termMonths: 0, method: "EQUAL_PAYMENT" } });
check("finance invalid term rejected", financeBad.status === 400, String(financeBad.status));

// --- test drive booking ---
const adminLogin = await call("/auth/login", { method: "POST", body: { email: "admin@autonova.local", password: "Admin123!" } });
const adminToken = adminLogin.json.token;
check("admin login", [200, 201].includes(adminLogin.status) && !!adminToken, JSON.stringify(adminLogin.json));

// Fresh slots per run keep this script idempotent.
const slotDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
const slotA = await call("/admin/test-drive-slots", { method: "POST", token: adminToken, body: { dealerId: "dealer-hcm", date: slotDate, startTime: "10:00", capacity: 3 } });
check("admin created slot", [200, 201].includes(slotA.status) && !!slotA.json.id, JSON.stringify(slotA.json));
const slotB = await call("/admin/test-drive-slots", { method: "POST", token: adminToken, body: { dealerId: "dealer-hcm", date: slotDate, startTime: "14:00", capacity: 1 } });
check("admin created race slot", [200, 201].includes(slotB.status) && !!slotB.json.id, JSON.stringify(slotB.json));

// catalog management
const newModel = await call("/admin/catalog/vehicle-models", { method: "POST", token: adminToken, body: { brandId: vehicle.brandId, name: "Nova Test", slug: `nova-test-${Date.now()}`, category: "SUV", seats: 5, powertrain: "Electric" } });
check("admin created vehicle model", [200, 201].includes(newModel.status) && !!newModel.json.id, JSON.stringify(newModel.json));
const newTrim = await call(`/admin/catalog/vehicle-models/${newModel.json.id}/trims`, { method: "POST", token: adminToken, body: { name: "Base", basePriceVnd: "500000000", rangeKm: 400 } });
check("admin created trim", [200, 201].includes(newTrim.status) && !!newTrim.json.id, JSON.stringify(newTrim.json));

const slots = await call(`/test-drive-slots?dealerId=dealer-hcm`);
check("slots listed", slots.status === 200 && slots.json.length >= 2, JSON.stringify(slots.json).slice(0, 200));
const slot = slotA.json;

const booking = await call("/test-drives", { method: "POST", token, body: { dealerId: "dealer-hcm", slotId: slot.id, modelSlug: "nova-v8" } });
check("test drive booked", [200, 201].includes(booking.status) && booking.json.status === "CONFIRMED", JSON.stringify(booking.json).slice(0, 300));

const duplicate = await call("/test-drives", { method: "POST", token, body: { dealerId: "dealer-hcm", slotId: slot.id, modelSlug: "nova-v8" } });
check("same user cannot double-book slot", duplicate.status === 409, String(duplicate.status));

const mine = await call("/me/test-drives", { token });
check("my bookings listed", mine.status === 200 && mine.json.some((b) => b.id === booking.json.id), JSON.stringify(mine.json).slice(0, 200));

const cancelled = await call(`/test-drives/${booking.json.id}/cancel`, { method: "POST", token });
check("booking cancelled", [200, 201].includes(cancelled.status) && cancelled.json.status === "CANCELLED", JSON.stringify(cancelled.json).slice(0, 200));

const slotsAfter = await call(`/test-drive-slots?dealerId=dealer-hcm`);
const slotAfter = slotsAfter.json.find((s) => s.id === slotA.json.id);
check("capacity released after cancel", slotAfter.booked === 0, String(slotAfter.booked));

// --- concurrency: 5 users race for a 1-seat slot ---
const users = await Promise.all(
  Array.from({ length: 5 }, (_, i) =>
    call("/auth/register", { method: "POST", body: { email: `race-${Date.now()}-${i}@example.com`, password: "Password123!", name: `Race ${i}` } }),
  ),
);
check("5 racing users registered", users.every((u) => [200, 201].includes(u.status)), JSON.stringify(users.map((u) => u.status)));

const raceSlot = slotB.json;
const results = await Promise.all(
  users.map((u, i) =>
    call("/test-drives", { method: "POST", token: u.json.token, body: { dealerId: "dealer-hcm", slotId: raceSlot.id, modelSlug: "nova-v8" } }),
  ),
);
const succeeded = results.filter((r) => [200, 201].includes(r.status));
const rejected = results.filter((r) => r.status === 409);
check("exactly one racer wins the last seat", succeeded.length === 1, JSON.stringify(results.map((r) => r.status)));
check("other racers rejected with 409", rejected.length === 4, JSON.stringify(results.map((r) => r.status)));

const raceSlotAfter = (await call(`/test-drive-slots?dealerId=dealer-hcm`)).json.find((s) => s.id === slotB.json.id);
check("slot booked count never exceeds capacity", raceSlotAfter.booked === 1 && raceSlotAfter.capacity === 1, JSON.stringify(raceSlotAfter));

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
