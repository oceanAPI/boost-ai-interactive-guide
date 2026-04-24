/* ─────────────────────────────────────────────
 *  Extension industry variants
 *
 *  INDUSTRY_VARIANTS fragment for the 4 new industries.
 *  Spread into INDUSTRY_VARIANTS in src/data/agents/_types.ts
 *  via the merge step in integration-guide.md.
 *
 *  Key format: "<industry>:<slug>" — same convention as existing
 *  INDUSTRY_VARIANTS keys.
 * ───────────────────────────────────────────── */

import type { IndustryVariant } from "../../agents/_types";

export const EXTENSION_INDUSTRY_VARIANTS: Record<string, IndustryVariant[]> = {
  public_sector: [
    { key: "public_sector:appeals",  label: "Appeals & tribunals",      description: "Social-security tribunals, court-adjacent review bodies" },
    { key: "public_sector:benefits", label: "Benefits & welfare",       description: "Unemployment, sickness, family, pension entitlements" },
    { key: "public_sector:tax",      label: "Tax & revenue",            description: "Tax authority services, filings, refunds" },
    { key: "public_sector:licensing", label: "Licensing & permits",     description: "Driving licences, business registrations, building permits" },
  ],
  telco: [
    { key: "telco:mobile",    label: "Mobile / consumer",  description: "B2C mobile subscribers, prepaid + postpaid" },
    { key: "telco:broadband", label: "Broadband & TV",     description: "Home internet, fibre, IPTV, entertainment bundles" },
    { key: "telco:b2b",       label: "Business / SME",     description: "Corporate mobility, connectivity, dedicated lines" },
  ],
  logistics: [
    { key: "logistics:parcel",        label: "Parcel & courier",   description: "B2C e-commerce parcel delivery, pickups, tracking" },
    { key: "logistics:freight",       label: "Freight & pallet",   description: "B2B freight, groupage, LTL, pallet-level shipping" },
    { key: "logistics:cross_border",  label: "Cross-border",        description: "International shipments, customs, duties, forwarding" },
  ],
  airline: [
    { key: "airline:scheduled",  label: "Scheduled passenger",  description: "Network carrier, scheduled routes, frequent-flyer ecosystem" },
    { key: "airline:low_cost",   label: "Low-cost / leisure",   description: "No-frills carriers, leisure routes, ancillary-heavy revenue" },
    { key: "airline:cargo",      label: "Cargo & charter",      description: "Freight, charter, logistics-adjacent air operations" },
  ],
};
