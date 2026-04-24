/* ─────────────────────────────────────────────
 *  Extensions barrel — single import surface
 *
 *  The merge agent can import everything from this file and then
 *  follow the splice recipe in integration-guide.md.
 * ───────────────────────────────────────────── */

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
