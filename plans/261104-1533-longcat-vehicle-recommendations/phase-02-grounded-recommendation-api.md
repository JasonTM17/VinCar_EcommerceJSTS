---
title: "Phase 2: Grounded recommendation API"
status: completed
---

# Phase 2: Grounded recommendation API

## Overview

Add a server-only LongCat extraction path and deterministic database-backed selection. No persistence, chat, model-generated facts, or free-form model prose in responses.

## Inputs and requirements

- Phase 1 complete; inspect current Nest module, DTO, Prisma, and throttling conventions.
- LongCat endpoint: https://api.longcat.chat/openai/v1/chat/completions; model LongCat-2.5; API key from server environment only.
- Vehicle facts: published model fields, related trim `basePriceVnd` and `rangeKm`. Base price excludes fees/options/financing.

## Steps

1. Define request and response contract from approved scope, then add a recommendation module/controller/service using existing module conventions.
2. Implement a small provider client with fixed endpoint/model, bounded timeout/output, no retry, no raw prompt/response logging, and generic client-facing errors. Read LONGCAT_API_KEY only at request/runtime config boundary; add only its variable name to .env.example.
3. Parse provider plain-text JSON with strict object/field/type/range/enum validation and reject the entire extraction when it has extra keys. Accept only preference constraints; never accept vehicle identity, price, range, trim, ranking, or explanation from model output.
4. Query only published `VehicleModel` rows and their `VehicleTrim` relations. Apply validated budget to `basePriceVnd`, range/seats/category/powertrain constraints to matching DB fields. Do not assert live inventory availability.
5. Choose one best eligible trim per model and rank at most three distinct models: lower base price first when budget exists; otherwise greater range first when minimum range exists; use the other metric as the next tie-break, then model slug and trim name. Derive reason codes from validated constraints and DB comparisons; render reason strings in application code.
6. Enforce one-shot text length bound, request DTO whitelist, a 6 requests per IP per minute route limit, provider timeout, and no automatic retry. Do not persist or log raw user input/provider payload.
7. Add provider/parser/service tests: valid/invalid schemas, prompt-injection-shaped output, unknown keys, provider timeout/HTTP/malformed body, DB hard filters, empty set, ranking tie, result cap, and no provider-supplied facts.
8. Run focused API specs and API typecheck. Record live key availability by presence only; never print key contents.

## Verification budget

- Focused catalog and recommendation Jest specs.
- `pnpm --filter @autonova/api typecheck`.
- Mock provider and Prisma in tests; live call is reserved for Phase 4 and is not implied by unit tests.

## Exit criteria

- A malformed or hostile provider response cannot create or alter returned vehicle facts or bypass server-side filters.
- Safe generic errors for provider failure; tests cover timeouts and HTTP errors.
- DTO and rate limits are enforced, secrets remain server-side, no raw content is stored/logged, and focused checks pass.
