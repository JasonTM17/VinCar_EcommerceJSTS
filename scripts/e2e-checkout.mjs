import { createHmac } from "node:crypto";

const API = process.env.API_URL ?? "http://127.0.0.1:4000/api/v1";
const SECRET = process.env.PAYMENT_WEBHOOK_SECRET ?? "mock-secret";

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

// 1. health
const health = await call("/health");
check("health returns ok", health.status === 200 && health.json.status === "ok", JSON.stringify(health.json));

// 2. login customer
const login = await call("/auth/login", { method: "POST", body: { email: "customer@autonova.local", password: "Customer123!" } });
check("customer login", [200, 201].includes(login.status) && !!login.json.token, JSON.stringify(login.json));
const token = login.json.token;

// 3. bad login rejected
const badLogin = await call("/auth/login", { method: "POST", body: { email: "customer@autonova.local", password: "wrong-password" } });
check("wrong password rejected", badLogin.status === 401, String(badLogin.status));

// 4. catalog list
const catalog = await call("/vehicles");
check("catalog list returns data", catalog.status === 200 && Array.isArray(catalog.json.data) && catalog.json.data.length > 0, JSON.stringify(catalog.json).slice(0, 200));
const vehicle = catalog.json.data.find((v) => v.slug === "nova-v8");
check("seeded Nova V8 present", !!vehicle);
const trim = vehicle?.trims?.[0];
check("trim present", !!trim?.id);

// 5. catalog filter
const filtered = await call("/vehicles?category=SUV");
check("category filter works", filtered.status === 200 && filtered.json.data.every((v) => v.category === "SUV"));

// 6. quote
const quote = await call("/quotes", { method: "POST", token, body: { trimId: trim.id, province: "Ho Chi Minh" } });
check("quote created", [200, 201].includes(quote.status) && quote.json.totalVnd === "675550000", JSON.stringify(quote.json).slice(0, 300));
const quoteId = quote.json.id;

// 7. quote requires auth
const quoteNoAuth = await call("/quotes", { method: "POST", body: { trimId: trim.id, province: "Ho Chi Minh" } });
check("quote requires auth", quoteNoAuth.status === 401, String(quoteNoAuth.status));

// 8. dealers
const dealers = await call("/dealers");
check("dealers list", dealers.status === 200 && dealers.json.length > 0);
const dealer = dealers.json[0];

// 9. order create (idempotency)
const idem = `e2e-${Date.now()}`;
const order1 = await call("/orders", { method: "POST", token, body: { quoteId, dealerId: dealer.id, idempotencyKey: idem } });
check("order created", [200, 201].includes(order1.status) && order1.json.status === "PENDING_DEPOSIT", JSON.stringify(order1.json).slice(0, 300));
const order2 = await call("/orders", { method: "POST", token, body: { quoteId, dealerId: dealer.id, idempotencyKey: idem } });
check("duplicate idempotency key returns same order", [200, 201].includes(order2.status) && order2.json.id === order1.json.id, JSON.stringify(order2.json).slice(0, 200));
const order = order1.json;
check("deposit is 10%", order.depositVnd === "67555000", order.depositVnd);

// 10. webhook with bad signature rejected
const evtBad = { id: `evt-${Date.now()}`, type: "payment.succeeded", paymentId: order.payments[0].id, amountVnd: order.depositVnd };
const badSig = await fetch(`${API}/webhooks/payments/mock`, { method: "POST", headers: { "Content-Type": "application/json", "x-signature": "deadbeef" }, body: JSON.stringify(evtBad) });
check("webhook bad signature rejected", badSig.status === 401, String(badSig.status));

// 11. signed webhook succeeds
const evt = { id: `evt-${Date.now()}`, type: "payment.succeeded", paymentId: order.payments[0].id, amountVnd: order.depositVnd };
const raw = JSON.stringify(evt);
const sig = createHmac("sha256", SECRET).update(raw).digest("hex");
const hook1 = await fetch(`${API}/webhooks/payments/mock`, { method: "POST", headers: { "Content-Type": "application/json", "x-signature": sig }, body: raw });
const hook1Json = await hook1.json();
check("signed webhook accepted", [200, 201].includes(hook1.status) && hook1Json.ok === true, JSON.stringify(hook1Json));

// 12. duplicate webhook is idempotent
const hook2 = await fetch(`${API}/webhooks/payments/mock`, { method: "POST", headers: { "Content-Type": "application/json", "x-signature": sig }, body: raw });
const hook2Json = await hook2.json();
check("duplicate webhook deduped", [200, 201].includes(hook2.status) && hook2Json.duplicate === true, JSON.stringify(hook2Json));

// 13. order status updated
const orders = await call("/orders", { token });
const updated = orders.json.find((o) => o.id === order.id);
check("order DEPOSIT_PAID after webhook", updated?.status === "DEPOSIT_PAID", updated?.status);
check("payment SUCCEEDED after webhook", updated?.payments?.[0]?.status === "SUCCEEDED", JSON.stringify(updated?.payments));

// 14. amount mismatch rejected
const evtMismatch = { id: `evt-mismatch-${Date.now()}`, type: "payment.succeeded", paymentId: order.payments[0].id, amountVnd: "1" };
const rawMismatch = JSON.stringify(evtMismatch);
const sigMismatch = createHmac("sha256", SECRET).update(rawMismatch).digest("hex");
const hookMismatch = await fetch(`${API}/webhooks/payments/mock`, { method: "POST", headers: { "Content-Type": "application/json", "x-signature": sigMismatch }, body: rawMismatch });
check("webhook amount mismatch rejected", hookMismatch.status === 400, String(hookMismatch.status));

// 15. RBAC: customer cannot access admin
const adminAsCustomer = await call("/admin/orders", { token });
check("customer forbidden from admin", adminAsCustomer.status === 403, String(adminAsCustomer.status));

// 16. admin can access admin
const adminLogin = await call("/auth/login", { method: "POST", body: { email: "admin@autonova.local", password: "Admin123!" } });
const adminOrders = await call("/admin/orders", { token: adminLogin.json.token });
check("admin can list orders", adminOrders.status === 200 && Array.isArray(adminOrders.json), String(adminOrders.status));

// 17. auth guard: no token
const noToken = await call("/orders");
check("orders requires auth", noToken.status === 401, String(noToken.status));

// 18. current user profile
const me = await call("/me", { token });
check("me returns profile", me.status === 200 && me.json.email === "customer@autonova.local" && me.json.role === "CUSTOMER", JSON.stringify(me.json));

// 19. cancelling a paid order must produce a refund, never silently drop the money
const idem2 = `e2e-cancel-${Date.now()}`;
const order3 = await call("/orders", { method: "POST", token, body: { quoteId, dealerId: dealer.id, idempotencyKey: idem2 } });
const evt2 = { id: `evt-${Date.now()}-cancel`, type: "payment.succeeded", paymentId: order3.json.payments[0].id, amountVnd: order3.json.depositVnd };
const raw2 = JSON.stringify(evt2);
const sig2 = createHmac("sha256", SECRET).update(raw2).digest("hex");
await fetch(`${API}/webhooks/payments/mock`, { method: "POST", headers: { "Content-Type": "application/json", "x-signature": sig2 }, body: raw2 });

const cancelledOrder = await call(`/orders/${order3.json.id}/cancel`, { method: "POST", token, body: { reason: "Changed mind" } });
check("paid order cancelled", [200, 201].includes(cancelledOrder.status) && cancelledOrder.json.status === "CANCELLED", JSON.stringify(cancelledOrder.json).slice(0, 300));
check("refund requested for paid deposit", cancelledOrder.json?.refunds?.length === 1 && cancelledOrder.json.refunds[0].status === "REQUESTED", JSON.stringify(cancelledOrder.json?.refunds));
check("payment marked refund pending", cancelledOrder.json?.payments?.[0]?.status === "REFUND_PENDING", JSON.stringify(cancelledOrder.json?.payments));

const cancelAgain = await call(`/orders/${order3.json.id}/cancel`, { method: "POST", token, body: {} });
check("double cancel rejected", cancelAgain.status === 400, String(cancelAgain.status));

const other = await call("/auth/register", { method: "POST", body: { email: `other-${Date.now()}@example.com`, password: "Password123!", name: "Other" } });
const forbiddenCancel = await call(`/orders/${order3.json.id}/cancel`, { method: "POST", token: other.json.token, body: {} });
check("cross-user cancel forbidden", forbiddenCancel.status === 403, String(forbiddenCancel.status));

// 21. transactional outbox -> notifications
const notificationsBefore = await call("/me/notifications", { token });
const dispatch = await call("/admin/outbox/dispatch", { method: "POST", token: adminLogin.json.token });
check("outbox dispatch processes events", [200, 201].includes(dispatch.status) && dispatch.json.processed >= 1, JSON.stringify(dispatch.json));

const notificationsAfter = await call("/me/notifications", { token });
check("notifications created from outbox", notificationsAfter.status === 200 && notificationsAfter.json.length > notificationsBefore.json.length, JSON.stringify(notificationsAfter.json).slice(0, 300));
check("payment notification present", notificationsAfter.json.some((n) => n.type === "PAYMENT_SUCCEEDED"), JSON.stringify(notificationsAfter.json).slice(0, 200));
check("order notification present", notificationsAfter.json.some((n) => n.type === "ORDER_CREATED"));

const readOne = await call(`/me/notifications/${notificationsAfter.json[0].id}/read`, { method: "POST", token });
check("notification marked read", [200, 201].includes(readOne.status) && readOne.json.read === true, JSON.stringify(readOne.json));

const dispatchAgain = await call("/admin/outbox/dispatch", { method: "POST", token: adminLogin.json.token });
check("outbox dispatch is idempotent", dispatchAgain.json.processed === 0, JSON.stringify(dispatchAgain.json));

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
