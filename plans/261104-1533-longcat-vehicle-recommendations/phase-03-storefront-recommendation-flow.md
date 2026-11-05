---
title: "Phase 3: Storefront recommendation flow"
status: completed
---

# Phase 3: Storefront recommendation flow

## Overview

Expose the approved one-shot recommender in the storefront and document setup, price basis, privacy, and catalog boundaries.

## Steps

1. Inspect existing layout/navigation, styling, and API client conventions. Keep the new route integrated with current shell.
2. Add `/recommend` form with clear prompt examples, accessible labels, 600-character feedback, submit state, and no chat/history behavior.
3. Show at most three returned results using only response fields: DB vehicle/model/trim facts, base price and range, and application-rendered reason labels. Include empty, input validation, provider-unavailable, and generic failure states.
4. State that the displayed price is trim base price and excludes registration/on-road cost, options, discounts, and financing; published listing does not guarantee stock.
5. Add a navigation entry and update README setup, PRD scope, and architecture flow. Document optional server-only `LONGCAT_API_KEY` without copying values.
6. Run web typecheck/build within the planned checkpoint; inspect browser bundle/source references for absence of key and local/session storage.

## Verification budget

- Web typecheck and affected package build only; broad workspace gates remain for Phase 4.
- Static search for provider key access in `apps/web` and browser persistence APIs in the new flow.

## Exit criteria

- One request submits current text only; page does not store history.
- Loading, validation, no-match, and provider error states are understandable and accessible.
- UI displays only typed API facts/reason labels and includes base-price/catalog availability disclosures.
- Docs and web checks pass.
