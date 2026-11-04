# AutoNova — Intelligent Automotive Commerce Platform

O2O car commerce monorepo: research → configure → on-road/finance estimate → quote →
dealer test drive → deposit order → sandbox payment → allocation/delivery.

> AutoNova is an independent demo brand. It is not affiliated with, endorsed by, or a
> copy of VinFast. All names, vehicles, prices and dealers here are fictional fixtures.

## Stack

| Layer | Choice |
| --- | --- |
| Storefront | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| API | NestJS 11, TypeScript strict, REST + Swagger at `/docs` |
| Database | PostgreSQL 16 + Prisma 6 (money as `BigInt` VND) |
| Cache/Queue | Redis 7 (provisioned) |
| Shared | `packages/pricing` (TypeScript domain logic), `packages/shared-js` (ESM + JSDoc) |
| Tests | node:test, Jest, end-to-end HTTP scripts |

## Layout

```
apps/api      NestJS REST API (auth, catalog, pricing, finance, quotes, orders,
              payments, dealers, test drives, admin)
apps/web      Next.js storefront
packages/     pricing (TS), shared-js (JS ESM + JSDoc)
scripts/      end-to-end verification scripts
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
pnpm db:push
pnpm db:seed

# 4. app (API on :4000, web on :3000)
pnpm --filter @autonova/api start
pnpm --filter @autonova/web dev
```

Open http://localhost:3000 and http://localhost:4000/docs.

### Demo accounts (fictional, seeded)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@autonova.local` | `Admin123!` |
| Customer | `customer@autonova.local` | `Customer123!` |

## Verification

```bash
pnpm test            # unit tests (shared-js, pricing, web, api)
pnpm typecheck       # strict TypeScript across the workspace
pnpm -r build        # production builds
pnpm test:e2e        # 43 HTTP checks against a running API + seeded DB
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
- finance amortisation (equal payment and equal principal, zero interest, rounding);
- test-drive capacity: 5 concurrent users racing for a 1-seat slot → exactly 1 wins.

## Business rules enforced

- Backend is the source of truth for price, stock and order state; the frontend never
  decides a payable amount.
- Money is stored as integer VND `BigInt` and serialized as a decimal string — never
  floating point.
- Quotes expire and must be re-priced; orders snapshot price and configuration.
- Order creation is idempotent via a unique `idempotencyKey`.
- Payment webhooks require an HMAC-SHA256 signature, a unique provider event id, and an
  amount that matches the recorded payment.
- Test-drive seats are claimed with a single atomic conditional `UPDATE`, so the last
  seat cannot be sold twice.

## Known limitations

- Payments use a mock gateway; no real money moves. Do not claim production payment
  readiness without a licensed provider integration and legal review.
- Notifications, promotions, inventory allocation, refunds and analytics are modelled in
  the schema but not yet implemented end to end.
- No production deployment, CI pipeline, backup/restore runbook or load test yet.
