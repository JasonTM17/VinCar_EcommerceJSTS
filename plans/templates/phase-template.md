---
phase: 1
title: "[Phase Name]"
status: pending
priority: P2
effort: TBD
dependencies: []
---

# Phase 1: [Phase Name]

## Overview
[One or two sentences describing the independently verifiable delivery.]

## Requirements
- **Functional**: [Required behavior]
- **Non-functional**: [Required quality, reliability, or security property]

## Architecture
[Data flow, state transition, trust boundary, and affected contracts.]

## Related Code Files
- **Create**: `path/to/new-file`
- **Modify**: `path/to/existing-file`
- **Delete**: [None unless explicitly required]

## Implementation Steps
1. [Bounded step with owner/file boundary]
2. [Bounded step with owner/file boundary]

## Success Criteria
- [ ] [Observable acceptance criterion]
- [ ] [Exact test, artifact, or evidence that proves it]

## Risk Assessment
- **Risk**: [Failure mode]
- **Mitigation**: [Preventive or detective control]
- **Rollback/recovery**: [Safe reversal or recovery step]

## Evidence and Handoff
- **Required gate**: [Command/reviewer/evidence]
- **Owner**: [Single accountable role]
- **Next phase dependency**: [What this phase must prove before the next begins]

## Additive Execution Lock

- **Next incomplete step**: [Single plan step to execute now]
- **Execution ledger**: `plans/<plan-id>/reports/execution-ledger.md`
- **Allowed escalation**: [Required workflow role or exact Advisor/Kongming/Wukong/specialist trigger]
- **Verification budget**: [Focused inline check; named checkpoint gate; rerun condition]
- **Repair ceiling**: [Two focused attempts plus at most one specialist-guided attempt]
- **Deferred findings**: [Record here; do not widen this phase]
