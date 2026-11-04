# Architecture (C003)

Modular monolith: Next.js (apps/web) → NestJS REST API (apps/api) → PostgreSQL (Prisma) + Redis; BullMQ worker later. Shared pure-TS logic in packages/pricing + shared-js (JS/ESM with JSDoc).

Modules in api: health, auth, users, catalog, dealers, test-drives, quotes, orders, payments, notifications, admin.
