# Extensions — search-log gap pack

New patterns / fixtures / industries / variants built in isolation so another Claude session can merge them in without rebase pain.

**Source of the gap list**: `SearchLogPanel` unmatched-queries export, 2026-04. 10 targets across 4 new industries.

## What's here

```
extensions/
  patterns/     CompanyPattern[] additions (existing-industry + new-industry companies)
  fixtures/     Customer fixture overlays, keyed by pattern.key
  agents/
    public_sector/   case status, appeals, benefits — Trygderetten flagship
    telco/           billing, plans, devices, network — Telenor DK flagship
    logistics/       tracking, delivery, claims — PostNord flagship
    airline/         flight status, booking, baggage — SAS flagship
  industries/   new industry records for INDUSTRIES append + ORCHESTRATOR_BY_INDUSTRY merge
  variants/     INDUSTRY_VARIANTS fragment for the 4 new industries
  index.ts      barrel — single import for the merge agent
```

## Rules while working inside this tree

- **Import types only from `src/data/agents/_types`, `src/data/company-patterns`, `src/lib/types`**. Do not fork types.
- **Do not import anything from this tree into `src/app`, `src/components`, `src/lib`, or `src/data/*` outside `extensions/`.** Grep check in Phase 6 catches violations.
- Prefill depth mirrors the 53 existing patterns in `src/data/company-patterns.ts` (Folksam / SEB / Tryg as references).
- Agent depth mirrors `src/data/agents/banking/account-services.ts` — full 5-section `flow` for primary agents, reduced for addon/light tiers.
- Reuse `BoostIcon` names already present in existing agents. Do not invent icons.

## Non-goals

- No UI changes. Extensions is data-only.
- No registry/discovery infrastructure in prod. Merge stays explicit.
- No fixture at H&M depth unless user calls a company "strategic".

## Merge procedure

See `integration-guide.md`. It's 3–5 one-line splices.
