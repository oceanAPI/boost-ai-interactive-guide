/* ─────────────────────────────────────────────
 *  Extensions barrel — single import surface
 *
 *  The merge agent can import everything from this file and then
 *  follow the splice recipe in integration-guide.md.
 * ───────────────────────────────────────────── */

/*
 * WIRING-CHECKLIST
 *
 * Every item below MUST be spliced into a prod file for its
 * extension content to be live. Grep `WIRING-CHECKLIST` across the
 * repo to find this list, then `npx tsx src/data/extensions/_wiring-check.ts`
 * to verify each item in one shot (pass = all keys present in prod).
 *
 *   [ ] EXTENSION_COMPANY_PATTERNS        → spread into COMPANY_PATTERNS
 *                                           in src/data/company-patterns.ts
 *
 *   [ ] EXTENSION_CUSTOMER_FIXTURES       → spread into CUSTOMER_FIXTURES
 *                                           in src/data/customer-fixtures.ts
 *
 *   [ ] EXTENSION_INDUSTRIES              → append records to INDUSTRIES const
 *                                           in src/data/agents/_types.ts
 *                                           (inline, preserves `as const`)
 *
 *   [ ] EXTENSION_INDUSTRY_VARIANTS       → spread into INDUSTRY_VARIANTS
 *                                           in src/data/agents/_types.ts
 *
 *   [ ] <INDUSTRY>_AGENTS (x4)            → spread into SPECIALIST_AGENTS
 *                                           in src/data/agents/index.ts
 *
 *   [ ] <INDUSTRY>_STANDALONE + TOPIC_GROUPS (x4)
 *                                         → register under new keys in
 *                                           ORCHESTRATOR_BY_INDUSTRY
 *                                           in src/data/agents/index.ts
 *
 * All four <INDUSTRY> concerns for public_sector / telco / logistics /
 * airline must be present for the Orchestrator section to render the
 * new industries end-to-end.
 */

export { EXTENSION_COMPANY_PATTERNS } from "./patterns";
export { EXTENSION_CUSTOMER_FIXTURES } from "./fixtures";
export { EXTENSION_INDUSTRY_VARIANTS } from "./variants";
export { EXTENSION_INDUSTRIES } from "./industries";
export type { ExtensionIndustry } from "./industries";

// Per-industry agent barrels — re-exported for convenience
export {
  PUBLIC_SECTOR_AGENTS,
  PUBLIC_SECTOR_STANDALONE,
  PUBLIC_SECTOR_TOPIC_GROUPS,
} from "./agents/public_sector";
export {
  TELCO_AGENTS,
  TELCO_STANDALONE,
  TELCO_TOPIC_GROUPS,
} from "./agents/telco";
export {
  LOGISTICS_AGENTS,
  LOGISTICS_STANDALONE,
  LOGISTICS_TOPIC_GROUPS,
} from "./agents/logistics";
export {
  AIRLINE_AGENTS,
  AIRLINE_STANDALONE,
  AIRLINE_TOPIC_GROUPS,
} from "./agents/airline";
