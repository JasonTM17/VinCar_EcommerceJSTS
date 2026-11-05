---
title: "Phase 4: Evaluation, app health, and review"
status: completed
---

# Phase 4: Evaluation, app health, and review

## Overview

Prove accepted behavior using bounded local checks, synthetic evaluation cases, and final review. Separate mocked evidence from live LongCat evidence.

## Steps

1. Build a deterministic synthetic case matrix for budget, range, seats, category, powertrain, combinations, ties, empty matches, unknown keys, malformed JSON, timeout, provider HTTP errors, input bounds, and throttling.
2. Run exact final `pnpm test`, `pnpm typecheck`, `pnpm -r build`, and `git diff --check` checkpoints. Never run `pnpm test:e2e` against the shared local DB because it mutates fixtures.
3. If API key presence is confirmed safely, run bounded live LongCat extraction cases and compare parsed constraints with expected values. Record model/endpoint, date, and pass rate without credential or raw content. If absent/unavailable, mark direct provider evaluation `NOT_RUN/BLOCKED`.
4. Review changed diff for provenance, safe failure, request/rate bounds, privacy, docs, and compatibility. Repair in-scope failures within bounded repair policy and rerun only affected gates.
5. Update execution ledger with exact environment, commands, observed results, limitations, and resume/terminal state.

## Verification budget

- One terminal run of the four planned workspace checks; rerun only gates covering changes after failure repair.
- One bounded direct provider run only if credentials are already configured; do not ask user to disclose keys in chat.
- No E2E, database mutation, commit, push, CI trigger, or deploy.

## Exit criteria

- Local tests, typecheck, builds, diff check, responsive render check, and scoped independent source review have recorded evidence; remaining review/provider limitations are specific and explicit.
- Provider accuracy is called PASS only with direct provider results; without credentials it is explicitly `NOT_RUN/BLOCKED` and remains a live-evidence limitation.
- Handoff names files, checks, Git/release boundary, limitations, and next safe action.
