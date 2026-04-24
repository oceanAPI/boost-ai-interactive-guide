/* ─────────────────────────────────────────────
 *  Extension company patterns
 *
 *  Net-new CompanyPattern[] entries sourced from the unmatched
 *  search-log queries. Merged into COMPANY_PATTERNS via a single
 *  spread-append in src/data/company-patterns.ts.
 *
 *  See extensions/integration-guide.md for the merge recipe.
 * ───────────────────────────────────────────── */

import type { CompanyPattern } from "../../company-patterns";

import vanguard from "./vanguard";
import sparebankenVest from "./sparebanken-vest";
import islandsbanki from "./islandsbanki";
import ingNl from "./ing-nl";
import sbanken from "./sbanken";
import boostAi from "./boost-ai";
import trygderetten from "./trygderetten";
import telenorDk from "./telenor-dk";
import postnord from "./postnord";
import sas from "./sas";

export const EXTENSION_COMPANY_PATTERNS: CompanyPattern[] = [
  vanguard,
  sparebankenVest,
  islandsbanki,
  ingNl,
  sbanken,
  boostAi,
  trygderetten,
  telenorDk,
  postnord,
  sas,
];
