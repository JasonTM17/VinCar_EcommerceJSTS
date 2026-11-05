# Execution ledger
plans/261104-1533-longcat-vehicle-recommendations/plan.md

## Active plan and current step

- Plan status: completed; active-plan pointer selected for this worktree.
- Current phase: Phase 4 — Evaluation, app health, and review (complete for approved local scope).
- Next unfinished implementation step: none in the approved scope. Direct provider evidence is partial; live database filtering remains unverified while API/DB are unavailable.
- Exit criterion met: local checks, visual render, documentation, and scoped source review have evidence; the bounded live provider result and its limitation are recorded below without being reported as a pass.

## Completed evidence

- User approved the LongCat one-shot recommendation Outcome Contract on 2026-11-04. They selected LongCat extraction with backend-only filtering/ranking over real catalog records.
- Read project README, `.agentkit/config.yaml`, project instructions, and the relevant local AgentKit workflow/plan-lock guidance before work.
- Initial Git inspection: branch `main` at `35da93f24097e60097906cc75c71db4114fc60d2`; `origin/main` tracked; only `plans/` was untracked. No tracked user changes were present at recovery.
- Existing catalog GET checks (2026-11-04, `/api/v1/vehicles`): 7 published rows; category `SUV` returned all 7; unknown category returned 0; query `Nov` returned 7; page 1/limit 1 returned 1 of 7 with 7 pages. Query `_` and `%` each returned all 7 (confirmed wildcard defect); SQL-injection-shaped query returned 0.
- Existing local catalog included six `Nova Test` and one `Nova V8` rows. Likely prior E2E fixtures; no cleanup/deduplication is authorized. The E2E suite mutates DB data and must not run against this shared database.
- Source evidence: `VehicleModel.status` is used for publication; `VehicleTrim` has no status; trim price/range fields are `basePriceVnd` (BigInt VND) and `rangeKm`.
- Phase 1 source inspection: `CatalogController.list()` passed raw `q` into Prisma `contains`; `apps/api` had no catalog spec. Added `escapeLikePattern()` which escapes backslash, `%`, and `_`, preserving ordinary case-insensitive substring search.
- Phase 1 regression: `pnpm --filter @autonova/api test -- --runInBand src/catalog/catalog.controller.spec.ts` — PASS, 1 suite / 5 tests (ordinary query, `%`, `_`, backslash, category and page metadata).
- Phase 4 edge-case sweep found that fractional/non-finite `page` or `limit` values could reach Prisma as invalid pagination arguments, and an extreme safe page could produce an unsafe offset. Updated `CatalogController.list()` to use safe integers/defaults and avoid calling Prisma with an unsafe offset; `apps/api/src/catalog/catalog.controller.spec.ts` now has 8 cases covering these boundaries.
- Pagination repair regression: `pnpm --filter @autonova/api test -- --runInBand src/catalog/catalog.controller.spec.ts` — PASS, 1 suite / 8 tests.
- Phase 1 API typecheck: `pnpm --filter @autonova/api typecheck` — PASS (`tsc --noEmit`).
- Post-fix local GET smoke: `NOT_RUN`; final process reconciliation observed no listeners on API ports 3000/4000 or local database port 5434. Starting/restarting shared services is outside this phase. The earlier GET audit is pre-fix baseline only.
- Phase 2 implementation: new API-only LongCat client, strict allowlist parser, published-catalog filtering and deterministic ranking; route is limited to 6/IP/minute; provider request has an 8-second timeout, 160-token output cap, and 16 KiB response-body cap. Client errors are generic; prompt/output are not logged or persisted.
- Phase 2 tests after response-body-size coverage: `pnpm --filter @autonova/api test -- --runInBand recommendations` — PASS, 4 suites / 32 tests. Includes parser bounds/unknown keys, fake vehicle facts, provider timeout/HTTP/malformed/oversized responses, DB filters, ranking/ties/cap, empty data, input bound, DTO whitelist, and throttle metadata.
- Phase 2 API typecheck after last backend edit: `pnpm --filter @autonova/api typecheck` — PASS (`tsc --noEmit`).
- Phase 3 UI: one-shot `/recommend` form, typed database result cards, fixed reason-code labels, empty/error/loading states, API navigation, and price/catalog/privacy notices. Docs updated in README, PRD, and architecture; `.env.example` contains only the optional `LONGCAT_API_KEY=` name.
- Phase 3 web typecheck: `pnpm --filter @autonova/web typecheck` — PASS (`tsc --noEmit`). Static scan found no provider key or browser storage in the recommendation page.
- Phase 3 web production build: first default output attempt failed with `EBUSY` because pre-existing PID 28404 (`node .next/standalone/apps/web/server.js`) held the output tree. It was left running. Retry with temporary `distDir=.next-validation-codex-261104` passed and listed `/recommend` in the production routes. `next.config.mjs`, `tsconfig.json`, and `next-env.d.ts` were restored to their original content afterward.
- Build cleanup limitation: the generated `apps/web/.next-validation-codex-261104/` directory remains untracked. Removal was attempted only after verifying it resolved inside `apps/web`, but the execution tool policy rejected recursive deletion; no bypass was attempted.
- For visual review, copied the generated build's `static/` assets into the matching standalone `distDir` under that same temporary artifact, then served the preview at `127.0.0.1:4173`. The feature route and CSS returned HTTP 200; screenshots were inspected at 390×844, 768×1024, and 1440×900. No recommendation request was submitted. The extra preview assets remain inside the already-untracked temporary build directory because cleanup is still denied by the tool policy.
- Provider capability check: OpenCode CLI 2.2.5 listed `longcat/LongCat-2.5-Preview`; read-only design review completed. Direct LongCat API product model is `LongCat-2.5`; the key was absent at initial audit. The user later supplied a key and it was configured only in ignored `apps/api/.env` for the bounded evaluation recorded below. No key value is recorded.
- OpenCode LongCat preview extraction sample: one batch of four synthetic cases returned the exact expected budget/range/seats/category/powertrain constraints with no extra keys (4/4). The four outputs also passed the built `parseVehiclePreferences()` implementation with the current allowlisted categories/powertrains. This is preview-only evidence, not product API/runtime evidence.
- Focused independent source review: OpenCode `longcat/LongCat-2.5-Preview` received the frozen source inline, no workspace tools, and returned `NOT_FALSIFIED` with no material findings for the claim that model output cannot create vehicle facts or bypass published catalog constraints. It cited the allowlist parser, published facets, Prisma predicates, DB-only response mapping, fail-closed handling, and response caps. Current SHA256 over the 10 reviewed source files: `3836e614d599da01465ca563e7bbadaa28a7f0acb24af4d9463750dcce893a99` (code has not changed since review; later changes only clarified docs/plan). Limitations: static source only; no live provider/DB/runtime; not a complete deployment review.
- Rate-limit wiring cross-check: current `RecommendationsController` installs `ThrottlerGuard` and 6/60,000 ms metadata; `AppModule` registers the module and global Nest throttler; the installed Nest Throttler default storage is in-memory and default tracker uses Express `req.ip`. README and architecture now state that proxy deployments need trusted client-IP handling and multi-replica deployments need shared storage. No multi-replica deployment was in scope or tested.
- Plan artifact created with four linked phases; `ak plan validate plans/261104-1533-longcat-vehicle-recommendations --json` returned `valid: true` after final status updates.
- One bounded plan consistency sweep resolved contract wording: unknown provider keys reject the full extraction; route cap is fixed at 6 requests/IP/minute; trim eligibility is based on its published parent model because no trim status exists. No unresolved plan contradiction remains.
- Active selection: `node .agentkit/scripts/set-active-plan.cjs plans/261104-1533-longcat-vehicle-recommendations` validated the plan but warned that `CK_SESSION_ID` is absent, so session-bound state will not persist. `ak plan use ...` selected the worktree pointer; `ak plan update VinCar_EcommerceJSTS/261104-0833 --status in-progress --current-phase 1` succeeded.
- Process reconciliation at recovery: no listener on ports 3000/4000 and no owned app server to stop. Observed OpenCode processes were unrelated jobs in `D:\CampusUTE_EcoSystem`; they were left untouched. Do not treat them as VinCar workers.
- A prior OpenCode long-context plan request was interrupted after hanging; a shorter plan advisory completed. Earlier AgentKit researcher/planner dispatch attempts failed (unsupported pinned model / command line too long). These were workflow-tool failures, not product evidence; no worker is currently assigned.

## Authorized rulings and constraints

- Budget filter uses trim base price and explicitly excludes on-road fees, options, discounts, and financing.
- “Available” means listed under a published model; live inventory is not represented.
- Ranking execution ruling: one eligible trim per distinct model; lowest base price first when a budget is stated, otherwise greatest range first when range is stated; opposite metric then model slug/trim name are deterministic tie-breaks.
- Keep all current data and untracked plans. No DB cleanup, E2E against shared DB, commit, push, deploy, CI trigger, or external messages.
- Provider key may be checked for presence only; never print, expose, or persist its value.

## Current environment limitation

- The local API was not listening on 3000/4000 during process recovery. Previously captured GET results remain dated read-only evidence; do not start/restart a user service just to repeat them. Local smoke may be `NOT_RUN` if it remains unavailable at Phase 1 exit.
- Direct LongCat accuracy evaluation is blocked unless the API environment already has a usable key configured by Phase 4.

## Phase 4 spec-compliance checklist

| Requirement | Status | Evidence / limit |
|---|---|---|
| One-shot needs input, bounded to 600 chars | PASS | DTO validation + service guard; controller/service tests. |
| LongCat extracts only strict preferences | PASS | Parser allowlist, numeric limits, DB-supported category/powertrain checks; unknown/extra fields fail closed. |
| Results are published catalog facts only | PASS | Prisma query constrains `status=PUBLISHED`; trim budget/range filters use `basePriceVnd`/`rangeKm`; response maps selected DB fields only. |
| Stable ranking and max three distinct models | PASS | Comparator and trim ordering; service tests for budget/range/tie/cap. |
| Server-only key, timeout, output bound, safe provider failures, rate limit | PASS | API client/controller source plus provider/controller tests. |
| No app chat history or raw need/provider logging | PASS | No persistence/logging path; UI state is in-memory for one submission; static web scan found no browser storage or key access. |
| Storefront states, reason labels, price/privacy/catalog notices | PASS | `/recommend` page and successful production route build. |
| Catalog `%`, `_`, and backslash search is literal | PASS | Focused controller regression and API tests. Post-fix direct GET smoke is `NOT_RUN` because API was unavailable. |
| OpenCode preview extraction sample | PASS (advisory) | LongCat-2.5-Preview 4/4 synthetic constraints; outputs passed the compiled parser. Does not prove the product API model/path. |
| Product API LongCat extraction accuracy | PARTIAL (3/4) | Three synthetic cases matched exact expected constraints; the combined-constraint case failed at client/parser boundary and a targeted diagnostic returned a generic unavailable error. See follow-up evaluation; this is not an accuracy pass. |
| Live database filtering/ranking | NOT_RUN | API ports 3000/4000 and DB port 5434 had no listeners; service tests cover Prisma predicates and ranking. |
| Scoped independent source review | NOT_FALSIFIED | No material finding against the model-authority/data-grounding claim in supplied source; static review only. |
| Per-IP throttle wiring | PASS (single process) | Route guard/limit metadata and package default verified; shared storage and trusted proxy behavior are deployment work, now documented. |
| Build artifact cleanup | BLOCKED | Tool policy rejected recursive deletion of our verified isolated build output; folder path is recorded above. |

## Deferred findings

- Repeated `Nova Test` rows, real inventory/stock availability, price-on-road calculation, analytics/history, and conversational follow-up are outside the approved scope.

## OpenCode LongCat preview extraction sample (2026-11-04)

- OpenCode CLI v2.2.5 listed and ran `longcat/LongCat-2.5-Preview` for one batch of four synthetic preference-extraction cases. The model returned four strict JSON objects with the expected budget/range/seats/category/powertrain values; exact case match was 4/4 and no extra keys were present.
- This is advisory evidence for the preview model via OpenCode only. It is not the product API call (`https://api.longcat.chat/openai/v1/chat/completions`, model `LongCat-2.5`) and does not exercise backend DB filters. Product API evidence is recorded separately below. Raw synthetic prompts and output are not stored here.

## Resume point

Approved local implementation and review scope are complete. User accepted local review evidence on 2026-11-04; the focused OpenCode review returned `NOT_FALSIFIED` for the model-authority/data-grounding claim. The Codex code-reviewer dispatcher selected unsupported `gpt-5.5`; Wukong did not return within its bounded wait; earlier OpenCode scout and broad review attempts timed out. These are `NOT_RUN`, not passes. A later bounded product-client sample matched 3/4 synthetic cases; one targeted diagnostic for the combined case returned a generic unavailable error. Live DB filtering and post-fix GET smoke remain `NOT_RUN`; temp build-artifact cleanup remains blocked by tool policy. Do not rerun provider calls in this plan, run mutating E2E, stop PID 28404, or commit/push/deploy. If deployment changes to proxy/multiple replicas, plan shared throttle storage and trusted-IP setup.

## Final Phase 4 verification (2026-11-04)

- `pnpm test` — PASS: API 6 suites / 41 tests; web 2; pricing 4; shared-js 2 (49 total). Web emitted a non-failing `MODULE_TYPELESS_PACKAGE_JSON` warning for existing package metadata.
- `pnpm typecheck` — PASS across 6 workspace projects after the pagination repair.
- `pnpm --filter @autonova/api build` — PASS after the pagination repair.
- `pnpm -r build` — PASS earlier in Phase 4 with the isolated temporary Next `distDir`; route table included `/recommend`. No web source changed after that build.
- `git diff --check` — PASS; Git printed LF-to-CRLF advisory warnings only.
- `rg -n "[ \t]+$" ...` across changed source/docs/plan paths — no matches (expected exit code 1).
- Browser visual check — PASS for route shell/layout at 390×844, 768×1024, and 1440×900. CSS returned HTTP 200 after placing generated assets under the standalone build's configured `distDir`. The API was not called from the browser.
- OpenCode preview extraction — PASS (advisory) for 4/4 synthetic cases. Running those four objects through compiled `parseVehiclePreferences()` also succeeded with the expected values and allowed enums.
- Independent source review — `NOT_FALSIFIED` for the scoped claim that model content cannot fabricate vehicle data or bypass published-model filters. OpenCode CLI v2.2.5 / `longcat/LongCat-2.5-Preview`; no workspace tools/provider API/DB/tests; no material finding. This does not prove deployed runtime or actual API model behavior.
- Rate-limit wiring — source and installed package inspected: default Nest storage is in-memory per process and the tracker uses `req.ip`; docs now describe proxy and multi-replica setup needed before production scaling.
- Direct LongCat evaluation — initial bounded batch against product model `LongCat-2.5`: 3/4 synthetic cases exactly matched expected constraints (budget/category, range/powertrain, and seats). The combined-constraint case failed at the provider-client/parser boundary. One targeted follow-up returned the client’s generic unavailable response; because raw responses/upstream details are suppressed, the exact cause is unknown. Report partial evidence, not a pass.
- Post-fix catalog GET smoke — `NOT_RUN`; local API remained unavailable. Pre-fix read-only catalog audit is not evidence of repaired production behavior.
- Other review attempts — AgentKit code-reviewer `NOT_RUN` because dispatcher selected unsupported `gpt-5.5`; Wukong `NOT_RUN` after bounded timeout; earlier OpenCode scout and broad code review `NOT_RUN` after timeouts. These were not treated as passes. The later focused OpenCode source review is the `NOT_FALSIFIED` evidence above.
- Process cleanup — closed browser session `vincar-review` and stopped only temporary preview PID 43044 on port 4173. Pre-existing PID 28404 remains untouched. No preview server remains on port 4173.
- Final context-recovery process check (2026-11-04): no listeners on ports 3000, 4000, 4173, or 5434; temporary preview PID 43044 was absent; pre-existing PID 28404 remained untouched. No project service was started or stopped during this check.

## Follow-up direct product-provider evaluation (2026-11-04)

- User supplied a LongCat API credential after the original local review. It was added to the gitignored `apps/api/.env` only; the value is deliberately absent from this ledger, source, docs, and command output. Since it was shared in chat, rotate/revoke before continued use and replace it through a secure local channel.
- The first evaluation-harness launch stopped before making a provider request because `dotenv` did not resolve from the API package. It was corrected by loading the ignored local env entry into the short-lived child process without printing it; no dependency or source change was made.
- The compiled product `LongCatClient` (`LongCat-2.5`) and `parseVehiclePreferences()` were invoked from the API package with four synthetic Vietnamese cases. Output was restricted to validated constraint objects and case status; prompts and raw provider responses were not logged or persisted.
- Exact match: 3/4 — budget + SUV, 400 km + electric, and minimum 6 seats. The combined budget/range/seats/category/powertrain case did not produce a confirmed valid result.
- One focused diagnostic call for that combined case returned the client’s generic unavailable response. The client deliberately suppresses upstream status/body and parser context, so the exact cause cannot be distinguished without changing safe-error behavior; no further live requests were made.
- This measures extraction only. The live API route and catalog query/filter/ranking were not exercised because API/DB ports 3000/4000/5434 had no listeners. Existing mocked service tests remain the evidence for published-only DB filters and ranking.
