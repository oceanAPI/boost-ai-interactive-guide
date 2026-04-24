# Integration guide — merging extensions into prod

When the parallel prod work is green and you're ready to land this, perform these edits. Each is a single additive line — no rewrites.

## 1. `src/data/company-patterns.ts`

At the top of the file:
```ts
import { EXTENSION_COMPANY_PATTERNS } from "./extensions/patterns";
```

At the end of the `COMPANY_PATTERNS` array (before the closing `]`):
```ts
  ...EXTENSION_COMPANY_PATTERNS,
```

**Edge case — Country union**: patterns for Íslandsbanki (Iceland) and ING Netherlands use `country: "EU"` because the current union `"SE" | "NO" | "DK" | "FI" | "US" | "UK" | "EU" | "Global"` does not include `"IS"` or `"NL"`. If you want accurate country codes, widen the union first:
```ts
country: "SE" | "NO" | "DK" | "FI" | "IS" | "NL" | "US" | "UK" | "EU" | "Global";
```
then find-and-replace `country: "EU"` with `"IS"` / `"NL"` in the relevant extension pattern files (`islandsbanki.ts`, `ing-nl.ts`).

## 2. `src/data/customer-fixtures.ts`

(Skip if `EXTENSION_CUSTOMER_FIXTURES` is empty — Phase 5 is optional.)

At the top:
```ts
import { EXTENSION_CUSTOMER_FIXTURES } from "./extensions/fixtures";
```

In the `CUSTOMER_FIXTURES` object, spread at the end:
```ts
  ...EXTENSION_CUSTOMER_FIXTURES,
```

## 3. `src/data/agents/_types.ts`

Append the 4 new industry records to the `INDUSTRIES` const (keep the `as const` suffix):
```ts
export const INDUSTRIES = [
  // ... existing 7 entries ...
  { key: "public_sector",  label: "Public Sector",  description: "Government services, case handling, benefits, appeals" },
  { key: "telco",          label: "Telecommunications", description: "Mobile, broadband, TV, billing, device support" },
  { key: "logistics",      label: "Logistics",      description: "Parcel tracking, delivery, claims, freight" },
  { key: "airline",        label: "Airlines",       description: "Flight status, booking, baggage, loyalty" },
] as const;
```

Then spread the variants fragment into `INDUSTRY_VARIANTS`:
```ts
import { EXTENSION_INDUSTRY_VARIANTS } from "./extensions/variants"; // ← NB: path is "./extensions/variants" relative to src/data/agents/_types.ts — wait, _types lives IN agents/, extensions/ is a sibling. Use "../extensions/variants".
```

Correction — since `_types.ts` is at `src/data/agents/_types.ts` and the extensions tree is at `src/data/extensions/`, the relative import is:
```ts
import { EXTENSION_INDUSTRY_VARIANTS } from "../extensions/variants";
```

At the bottom of `INDUSTRY_VARIANTS`:
```ts
export const INDUSTRY_VARIANTS: Record<string, IndustryVariant[]> = {
  // ... existing 7 entries ...
  ...EXTENSION_INDUSTRY_VARIANTS,
};
```

**Note**: `HIDDEN_INDUSTRIES` is a separate `Set` in `_types.ts`. The 4 new industries should remain visible — do not add them to `HIDDEN_INDUSTRIES`.

## 4. `src/data/agents/index.ts`

At the top, alongside the other industry imports:
```ts
import { PUBLIC_SECTOR_STANDALONE, PUBLIC_SECTOR_TOPIC_GROUPS, PUBLIC_SECTOR_AGENTS } from "../extensions/agents/public_sector";
import { TELCO_STANDALONE, TELCO_TOPIC_GROUPS, TELCO_AGENTS } from "../extensions/agents/telco";
import { LOGISTICS_STANDALONE, LOGISTICS_TOPIC_GROUPS, LOGISTICS_AGENTS } from "../extensions/agents/logistics";
import { AIRLINE_STANDALONE, AIRLINE_TOPIC_GROUPS, AIRLINE_AGENTS } from "../extensions/agents/airline";
```

In the `ORCHESTRATOR_BY_INDUSTRY` object, append:
```ts
  public_sector: {
    standaloneAgents: PUBLIC_SECTOR_STANDALONE,
    topicGroups: PUBLIC_SECTOR_TOPIC_GROUPS,
  },
  telco: {
    standaloneAgents: TELCO_STANDALONE,
    topicGroups: TELCO_TOPIC_GROUPS,
  },
  logistics: {
    standaloneAgents: LOGISTICS_STANDALONE,
    topicGroups: LOGISTICS_TOPIC_GROUPS,
  },
  airline: {
    standaloneAgents: AIRLINE_STANDALONE,
    topicGroups: AIRLINE_TOPIC_GROUPS,
  },
```

In the `SPECIALIST_AGENTS` spread at the bottom, append:
```ts
export const SPECIALIST_AGENTS = [
  ...INSURANCE_AGENTS,
  ...BANKING_AGENTS,
  ...PENSION_AGENTS,
  ...WEALTH_MANAGEMENT_AGENTS,
  ...FINTECH_AGENTS,
  ...CREDIT_UNION_AGENTS,
  ...SECURITY_AGENTS,
  ...PUBLIC_SECTOR_AGENTS,
  ...TELCO_AGENTS,
  ...LOGISTICS_AGENTS,
  ...AIRLINE_AGENTS,
];
```

## 5. Verify

Run `npm run build`. Catch any drift via TypeScript errors.

Manually smoke-check the admin Company Search:
- Type `vanguard` → curated hit → apply → Generate guide → Orchestrator renders wealth_management agents.
- Type `sas` → curated hit → apply → Generate guide → Orchestrator renders the new airline agents.
- Type `trygderetten` → curated hit → apply → Generate guide → Orchestrator renders the new public_sector agents.

Expected SearchLogPanel behaviour after merge: these 10 companies move from **Unmatched** to **Matched (curated)** on the next user session.
