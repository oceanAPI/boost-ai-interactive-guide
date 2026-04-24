/* ─────────────────────────────────────────────
 *  Extension industries
 *
 *  Net-new industry records — records to be appended to the
 *  INDUSTRIES const in src/data/agents/_types.ts when the merge
 *  agent integrates extensions into prod.
 *
 *  Typed as a plain array (not `as const`) so it can be declared
 *  outside the prod file. The merge step inlines these records
 *  directly into the prod `INDUSTRIES` const to preserve the
 *  IndustryKey literal-union type.
 * ───────────────────────────────────────────── */

export interface ExtensionIndustry {
  key: string;
  label: string;
  description: string;
}

export const EXTENSION_INDUSTRIES: ExtensionIndustry[] = [
  { key: "public_sector", label: "Public Sector",        description: "Government services, case handling, benefits, appeals" },
  { key: "telco",         label: "Telecommunications",   description: "Mobile, broadband, TV, billing, device support" },
  { key: "logistics",     label: "Logistics",            description: "Parcel tracking, delivery, claims, freight" },
  { key: "airline",       label: "Airlines",             description: "Flight status, booking, baggage, loyalty" },
];
