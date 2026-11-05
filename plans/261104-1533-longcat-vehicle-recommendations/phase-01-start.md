---
title: "Phase 1: Audit and literal catalog search"
status: completed
---

# Phase 1: Audit and literal catalog search

## Overview

Establish current catalog behavior and repair the confirmed SQL LIKE wildcard issue without changing normal substring search or touching shared database contents.

## Inputs and requirements

- Approved outcome contract and plan in ./plan.md.
- Current catalog controller/schema and existing API test conventions.
- Read-only local API checks showed category and pagination work; `_` and `%` each match all 7 published rows.
- `VehicleModel.status=PUBLISHED`; `VehicleTrim` has no status.

## Steps

1. Read catalog controller, DTO/query construction, Prisma schema, and relevant tests. Identify focused test command and exact generated Prisma matching behavior; do not change files outside plan scope.
2. Escape backslash, `%`, and `_` in the user query before Prisma `contains` so these characters remain literal. Preserve case-insensitive substring matching otherwise.
3. Add focused regression cases for ordinary query, `%`, `_`, backslash, category matching, and page/limit metadata. Ensure the old wildcard behavior would fail the new cases.
4. Run only the catalog spec and API typecheck. Use existing local API only for GET smoke requests; do not restart services or mutate DB.
5. Record exact command/output boundary in `reports/execution-ledger.md` and mark this phase complete only when the focused checks pass.

## Verification budget

- Focused API Jest spec and API typecheck. Rerun if a related source/test edit occurs.
- Read-only GET checks: `q=%`, `q=_`, `q=\`, regular search, category, and pagination. No E2E scripts or writes.

## Exit criteria

- Regression tests demonstrate special query characters are literal and ordinary substring/category/page behavior remains correct.
- Focused test and API typecheck pass; local GET smoke evidence is recorded or explicitly `NOT_RUN` if local API is unavailable.
- No shared data or unrelated files were modified.
