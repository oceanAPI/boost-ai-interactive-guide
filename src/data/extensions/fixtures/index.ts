/* ─────────────────────────────────────────────
 *  Extension customer fixtures
 *
 *  Net-new Customer fixture overlays, keyed by pattern.key.
 *  Merged into CUSTOMER_FIXTURES via a single spread-append in
 *  src/data/customer-fixtures.ts.
 *
 *  Currently empty — rich fixtures are a Phase 5 optional step,
 *  only added for companies the user flags as strategic-demo.
 *  Extensions' orchestrator coverage does not require fixtures.
 * ───────────────────────────────────────────── */

import type { Customer } from "@/lib/types";

export const EXTENSION_CUSTOMER_FIXTURES: Record<string, Partial<Customer>> = {};
