# Architecture (C003)

Modular monolith: Next.js (apps/web) → NestJS REST API (apps/api) → PostgreSQL (Prisma) + Redis; BullMQ worker later. Shared pure-TS logic in packages/pricing + shared-js (JS/ESM with JSDoc).

Modules in api: health, auth, users, catalog, recommendations, dealers, test-drives, quotes, orders, payments, notifications, admin.

## One-shot vehicle recommendations

The storefront posts one need (up to 600 characters) to `POST /api/v1/recommendations`. A per-IP limit of 6 requests per minute protects the public endpoint. NestJS calls LongCat server-side with an 8-second timeout and a small token limit; the provider key is never sent to the browser. LongCat returns plain text, which the API parses as a strict allowlisted preference object. Category and powertrain values are validated against currently published catalog values.

The current throttle uses Nest's default in-memory storage per API process and Express `req.ip`. Behind a reverse proxy, configure Express trusted-proxy handling so `req.ip` identifies the client. For multiple API replicas, configure shared throttle storage; the default store does not coordinate limits across processes.

Prisma then filters only `VehicleModel.status = PUBLISHED` and related trims. Budget applies to `VehicleTrim.basePriceVnd`; minimum range applies to `rangeKm`; seating, category, and powertrain apply to model fields. The API returns at most three distinct models with one eligible trim each. Vehicle facts and reason codes are derived from database rows and comparisons, not provider-authored names/specifications. No chat history or raw need/provider content is persisted or logged. A published catalog record does not guarantee dealer stock; displayed price is trim base price, excluding on-road fees/options/discounts/financing.
