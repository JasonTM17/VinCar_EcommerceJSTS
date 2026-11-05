---
title: "LongCat grounded vehicle recommendations"
description: "Add a one-shot LongCat preference parser and database-grounded vehicle recommendations; audit and repair catalog search/filter behavior."
status: completed
priority: P1
effort: ""
tags: [storefront, recommendations, longcat, catalog]
created: 2026-11-04
---

# LongCat grounded vehicle recommendations

## Outcome and success signal

Add a one-shot storefront flow where LongCat extracts bounded, structured customer needs and the API validates them, filters and ranks only published vehicles from the current database, and returns database-backed facts with deterministic explanation codes. Audit catalog search, category filtering, and pagination; repair reproducible defects and cover them with regression tests. The feature, existing catalog behavior, and affected workspace checks pass locally. Direct LongCat accuracy is reported separately and is `NOT_RUN` if no provider credential is available.

## Scope, non-goals, and authority

- In scope: current catalog behavior; literal search semantics; one-shot recommendation endpoint; strict provider-output validation; database-only filtering, ranking, facts, and reason labels; storefront form/results/errors/privacy notice; focused tests/evaluation; setup and product/architecture documentation.
- Data authority: `VehicleModel` with `status=PUBLISHED` and related `VehicleTrim` rows. `VehicleTrim` has no status field. Price is `basePriceVnd` (BigInt VND), range is `rangeKm`; model metadata comes from the database. Never accept model-authored vehicle names, prices, specifications, trim IDs, or prose as recommendation facts.
- Budget means trim `basePriceVnd`; it excludes registration/on-road costs, options, discounts, and financing. State this in the UI.
- No chat history, persistence, market/price forecasts, generated vehicle facts, catalog mutation/deduplication, database cleanup, E2E against the shared database, commit, push, deployment, or external messages.
- User approved this outcome contract on 2026-11-04. Preserve all existing work. Remain on the current `main` worktree; no release actions are authorized.

## Current evidence and assumptions

- Repository is a pnpm monorepo with Next.js 16 storefront, NestJS 11 API, Prisma 6/PostgreSQL; API global prefix is `/api/v1` and global validation rejects unknown DTO fields.
- Existing `GET /api/v1/vehicles` returns published models and supports category, text query, and page/limit. Read-only local API checks observed 7 published rows, all SUV; category filtering and page metadata behaved as expected.
- Reproduced defect: query `_` and `%` each return all 7 rows because Prisma's `contains` becomes SQL `LIKE` wildcard matching. Search should treat these as literal characters.
- Current local data contains six `Nova Test` and one `Nova V8` published rows. They may be prior E2E fixtures; do not delete or suppress them. Test scripts mutate the shared database, so do not run them here.
- LongCat API docs identify `https://api.longcat.chat/openai/v1/chat/completions`, model `LongCat-2.5`, Bearer key, and plain-text chat output. JSON must be parsed and validated by this service. The key was absent at initial audit; after the user supplied one, a bounded product-client evaluation was run and its partial result is recorded below. The local key is in ignored `apps/api/.env`, never in source or plan text.
- OpenCode CLI `v2.2.5` exposed `longcat/LongCat-2.5-Preview`; its completed read-only design review is advisory only and does not prove product provider behavior.
- No AI implementation currently exists. PRD's prior AI-advisor exclusion is superseded only for this approved bounded recommender.

## Contract and rulings

1. Accept one bounded natural-language need (maximum 600 characters) in a single request; do not retain it or log raw user/provider content.
2. Call LongCat server-side with a bounded timeout, no automatic retry, and a small output-token budget. Send a fixed extraction instruction and user text; require a JSON object with an allowlist of optional constraints only. Reject malformed JSON, unknown keys, wrong types, out-of-range values, and unsupported enum values. Never return raw provider output.
3. Filter published `VehicleModel` rows and their trims using validated constraints. Apply budget to `basePriceVnd` and range to `rangeKm`; never use model-provided catalog data. Return one best eligible trim for each of at most three distinct models. Rank by lower base price when a budget exists; otherwise rank by greater range when a minimum range exists; use the other field as the next tie-break, then model slug and trim name. Derive reason codes from validated constraints plus DB facts. If extraction/provider fails, return a safe service error without invented results.
4. Public one-shot endpoint is limited to 6 requests per IP per minute, has request-size bounds and provider timeout, and reads the secret only on the API server. Never expose the key to Next.js/browser.
5. Existing catalog query/filter/pagination remains compatible; literal `%`, `_`, and backslash must not become SQL patterns.
6. Execution ruling: `VehicleTrim` has no status, so eligible trims are related rows of a published model; do not invent a trim status predicate. “Available” means listed/published in the existing catalog, not live stock.

## Affected components and ownership

Single integration owner: controller. Likely files:
- API: `apps/api/src/catalog/catalog.controller.ts` and focused catalog spec; new `apps/api/src/recommendations/` module/controller/service/provider client/spec; `apps/api/src/app.module.ts`; `apps/api/.env.example`.
- Web: `apps/web/src/app/recommend/page.tsx`, `apps/web/src/app/layout.tsx`, and existing API client if its shape is useful.
- Docs: `README.md`, `docs/prd.md`, `docs/architecture.md`.
- Plan/evidence: this directory and `reports/execution-ledger.md`.

Search existing modules, DTO conventions, Nest throttling, and API helpers before editing; adapt exact names/contracts to source. Do not add a dependency unless the repository lacks a suitable existing validator and the need is demonstrated.

## Phases

| # | Phase | Status | Exit signal |
|---|---|---|---|
| 1 | [Audit and literal catalog search](./phase-01-start.md) | Complete | Regression proves `%`, `_`, and backslash are literal; search/category/pagination checks pass; local GET smoke marked NOT_RUN after repair because API was unavailable. |
| 2 | [Grounded recommendation API](./phase-02-grounded-recommendation-api.md) | Complete | Parser/provider/filter/ranking tests and focused API checks pass. |
| 3 | [Storefront flow and docs](./phase-03-storefront-recommendation-flow.md) | Complete | One-shot UI, grounded results, user states, privacy/price copy, docs and web checks pass. |
| 4 | [Evaluation, app health, and review](./phase-04-evaluation-and-app-health.md) | Complete | Local checks/review and direct provider evidence are recorded. The bounded product sample matched 3/4 cases; one combined case remains unconfirmed after a generic client failure. |

### Phase 1 — Audit and catalog search

Inspect catalog controller/schema/tests and reproduce the wildcard defect. Escape SQL LIKE special characters in the search value without changing ordinary substring search; cover `%`, `_`, backslash and ordinary text. Add tests for category and page/limit metadata where existing coverage is absent. Use GET-only requests for smoke checks; do not mutate or restart a shared service/database.

Exit: focused catalog test passes, API typecheck passes, and GET-only local API results agree with test expectations.

### Phase 2 — Grounded recommendation API

Implement a public single-turn endpoint using repository Nest conventions. Keep provider transport, schema parsing, DB selection, and deterministic ranking testable. Validate provider plain-text JSON against an explicit allowlist (e.g. budget, minimum range, seats, category, powertrain); reject malformed values or any unknown key. Query only published models and related trims. Ensure `BigInt` serializes as a decimal string. Add a per-route/IP limit of 6 requests per minute, strict user text bounds, provider timeout, no retries, generic client errors, and no raw input/provider logging. Configure only the key name in `.env.example` and document server-side configuration; never read or print key values.

Exit: mocked tests prove malformed/hostile provider output cannot create vehicle facts or bypass DB filters; provider failures do not leak upstream content; API typecheck and focused tests pass.

### Phase 3 — Storefront and documentation

Add an accessible one-shot needs form and result cards using the API response. Include pending, validation, provider error, and no-match states; show base price basis and that catalog publication does not guarantee stock. Render only returned DB facts and safe reason codes. Do not retain the prompt in local/session storage or add chat UI. Update README setup, PRD scope, and architecture flow.

Exit: web typecheck/build succeeds and code inspection confirms there is no browser key, persisted history, or free-form model text rendered as vehicle facts.

### Phase 4 — Evaluation, health, and review

Use deterministic synthetic cases and mocks for extraction schema, budget/range/seats/category/powertrain filters, rank ties, empty catalog, malformed output, timeout, HTTP errors, and rate/length limits. If `LONGCAT_API_KEY` is configured, run a bounded provider evaluation without exposing its value or logging raw prompts/responses; otherwise mark provider accuracy `NOT_RUN` and leave the required live-evidence blocker open. Run planned workspace tests, typecheck, production builds, `git diff --check`, and read-only review. Never invoke mutating E2E scripts against the shared database.

Exit: acceptance matrix is evidence-backed; in-scope failures repaired within bounded retry policy; review and documentation complete; provider evidence boundary stated honestly.

## Verification checkpoints and budget

1. Phase 1: `pnpm --filter @autonova/api test -- --runInBand` scoped to the focused catalog spec (adapt to Jest script); API typecheck; GET-only `/api/v1/vehicles` smoke checks. Broaden only if affected behavior crosses package boundaries.
2. Phase 2: focused recommendation and catalog specs plus `pnpm --filter @autonova/api typecheck`; rerun only after related edits.
3. Phase 3: `pnpm --filter @autonova/web typecheck` and affected build/package check.
4. Terminal: `pnpm test`, `pnpm typecheck`, `pnpm -r build`, `git diff --check`, and code review. Do not run `pnpm test:e2e` because it mutates the shared local DB. Do not repeat an unchanged passing gate.
5. Live provider call is a separate bounded gate; no credential means `NOT_RUN`, not pass. Unit/mocked tests do not prove provider extraction accuracy.

## Risks, rollback, and recovery

- Provider returns malformed or prompt-injected output: strict schema allowlist, query DB independently, fail closed, and never expose raw text.
- Provider outage/latency/cost: explicit timeout, no retry, token/input bounds, route throttle, generic error; disable the entry point or endpoint if rollback is needed.
- Catalog availability differs from live inventory: label results as published catalog listings; do not imply stock.
- Query escaping can change edge-case catalog matching: regression-test literal special characters and ordinary substring behavior.
- Rollback is limited to reverting only feature-owned code/docs while preserving pre-existing and untracked work; do not delete or mutate DB fixtures.

## Documentation and release impact

README setup describes optional API-side `LONGCAT_API_KEY`; PRD and architecture document the bounded recommendation flow and grounding boundary. No migration, commit, push, CI trigger, or deployment is in scope.

## Remaining live-evidence limitations

- Direct product-client evaluation on 2026-11-04 matched 3 of 4 synthetic cases. The combined-constraint case did not yield a valid confirmed result; one targeted follow-up returned the client's generic unavailable response. This is partial evidence, not a provider-accuracy pass or a reliability claim. Raw provider content and upstream error details were intentionally not retained.
- End-to-end filtering/ranking against live database rows was not run because the API and local database were unavailable (no listeners on ports 3000/4000/5434). Deterministic service tests remain the evidence for DB predicates and ranking.
- The user-provided credential is present only in ignored `apps/api/.env`; it was shared in chat, so rotate/revoke it before continued use and install its replacement through a secure local secret channel. Never add the value to source, docs, logs, or Git.
- Current throttling uses the Nest default in-memory storage per API process. Before a reverse-proxy or multi-replica deployment, configure trusted client-IP handling and shared throttle storage.

## Deferred findings

- Repeated `Nova Test` catalog rows likely originate from prior E2E runs; the current contract does not authorize cleanup or name-based deduplication.
- Real inventory/stock availability, on-road total cost, recommendation analytics/history, and conversational follow-up remain out of scope.

<!-- slug: longcat-vehicle-recommendations -->
