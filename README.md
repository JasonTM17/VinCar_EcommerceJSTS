# AutoNova — Intelligent Automotive Commerce Platform

O2O car commerce monorepo: research → configure → on-road/finance estimate → quote →
dealer test drive → deposit order → sandbox payment → stock allocation → delivery.

> AutoNova is an independent demo brand. It is not affiliated with, endorsed by, or a
> copy of VinFast. All names, vehicles, prices and dealers here are fictional fixtures.

## Stack

| Layer | Choice |
| --- | --- |
| Storefront | Next.js 16 (App Router, standalone output), React 19, TypeScript, Tailwind CSS 4 |
| API | NestJS 11, TypeScript strict, REST + Swagger at `/docs` |
| Database | PostgreSQL 16 + Prisma 6 (money as `BigInt` VND) |
| Cache/Queue | Redis 7 (provisioned) |
| Shared | `packages/pricing` (TypeScript domain logic), `packages/shared-js` (ESM + JSDoc) |
| Tests | node:test, Jest, end-to-end HTTP scripts |

## Layout

```
apps/api      NestJS REST API (auth, catalog, pricing, promotions, finance, quotes,
              orders, payments, dealers, test drives, inventory, notifications, audit, admin)
apps/web      Next.js storefront + admin dashboard
packages/     pricing (TS), shared-js (JS ESM + JSDoc)
scripts/      end-to-end verification and dev utilities
docs/         product and architecture notes
```

## Run locally

```bash
# 1. infrastructure (PostgreSQL on 127.0.0.1:5434, Redis on 6379)
docker compose up -d db redis

# 2. dependencies
pnpm install

# 3. database
cp apps/api/.env.example apps/api/.env
pnpm db:push          # or: pnpm --filter @autonova/api exec prisma migrate deploy
pnpm db:seed

# 4. app (API on :4000, web on :3000)
pnpm --filter @autonova/api start
pnpm --filter @autonova/web dev
```

Open http://localhost:3000, http://localhost:3000/admin, http://localhost:4000/docs.

### Demo accounts (fictional, seeded)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@autonova.local` | `Admin123!` |
| Customer | `customer@autonova.local` | `Customer123!` |

### Production containers

```bash
cp .env.example .env   # fill DB_PASSWORD and JWT_SECRET
docker compose -f docker-compose.prod.yml up -d --build
```

The compose file runs migrations first, then starts the API and web containers.

## Verification

```bash
pnpm test            # unit tests (shared-js, pricing, web, api)
pnpm typecheck       # strict TypeScript across the workspace
pnpm -r build        # production builds
pnpm test:e2e        # 77 HTTP checks against a running API + seeded DB
```

The end-to-end scripts prove, against the real API and a real PostgreSQL:

- catalog search/filter and vehicle detail;
- quote creation and server-side pricing;
- order idempotency (same key twice → one order);
- signed payment webhook: bad signature rejected, duplicate event deduped,
  amount mismatch rejected, order moves to `DEPOSIT_PAID`;
- RBAC: a customer is forbidden from `/admin/*`, an admin is allowed;
- configuration validation (valid build accepted, unknown color/option rejected);
- on-road cost driven by effective-dated `OnRoadFeeRule` rows, not hard-coded values;
- promotions: eligible auto-apply, explicit codes validated, expired and
  trim-excluded codes rejected, `STACKABLE` combines on top of `EXCLUSIVE`;
- finance amortisation (equal payment and equal principal, zero interest, rounding);
- test-drive capacity: 5 concurrent users racing for a 1-seat slot → exactly 1 wins;
- inventory: orders hold stock atomically, paid orders can be allocated a unit,
  unpaid orders cannot, expired holds release safely;
- notifications: transactional outbox dispatch is idempotent;
- audit: order, payment, and cancellation changes leave a trace.

## Business rules enforced

- Backend is the source of truth for price, stock and order state; the frontend never
  decides a payable amount.
- Money is stored as integer VND `BigInt` and serialized as a decimal string — never
  floating point.
- Quotes expire and must be re-priced; orders snapshot price and configuration.
- Order creation is idempotent via a unique `idempotencyKey`.
- Payment webhooks require an HMAC-SHA256 signature, a unique provider event id, and an
  amount that matches the recorded payment.
- Test-drive seats and vehicle stock are claimed with single atomic conditional
  `UPDATE` statements, so the last unit cannot be sold twice.
- A cancelled paid order produces a `REQUESTED` refund and a `REFUND_PENDING` payment;
  the money is never silently dropped.

## Known limitations

- Payments use a mock gateway; no real money moves. Do not claim production payment
  readiness without a licensed provider integration and legal review.
- Notifications are dispatched on demand through an admin endpoint; a production
  deployment should consume the outbox with a real queue worker.
- No load test, backup/restore runbook, or multi-region deployment yet.
