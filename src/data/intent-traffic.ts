/* ──────────────────────────────────────────────────────────────
 *  Intent-traffic export parser
 *
 *  Turns a raw boost.ai intent-traffic CSV (the analytics
 *  "intent_traffic" tab — thousands of rows) into the compact
 *  IntentTrafficSummary the Customer record persists. The raw export
 *  is far past the URL-fragment ceiling, so the builder parses it
 *  client-side and stores only the rollup: aggregate totals + the
 *  per-root breakdown with each root's top-N child intents.
 *
 *  Robust to column reordering: columns are mapped by header name
 *  (exact, case-insensitive) rather than position, so the "%" variant
 *  columns never collide with their count columns.
 * ────────────────────────────────────────────────────────────── */

import type {
  IntentTrafficSummary,
  IntentTrafficRoot,
  IntentTrafficIntent,
  IntentTrafficStats,
  IntentTrafficTotals,
} from "@/lib/types";

/** Roots that are export artefacts, not real categories — dropped. */
const JUNK_ROOTS = new Set(["", "#n/a", "z-testing"]);

/** Default cap on child intents kept per root (payload control). */
export const DEFAULT_TOP_INTENTS = 6;

/** Parse one CSV line, honouring double-quoted fields (some intent
 *  names contain commas). Returns the raw cell strings. */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cell);
      cell = "";
    } else {
      cell += ch;
    }
  }
  out.push(cell);
  return out;
}

/** Strip thousands separators / stray chars and coerce to a number. */
function num(v: string | undefined): number {
  if (!v) return 0;
  const n = Number(v.replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const norm = (s: string) => s.trim().toLowerCase();

interface ColMap {
  root: number;
  intent: number;
  traffic: number;
  reviewed: number;
  automated: number;
  escalated: number;
  unsolved: number;
  handover: number;
  noPrediction: number;
  immediateUnknown: number;
  positiveFeedback: number;
  negativeFeedback: number;
}

/** Build a header→index map by exact (case-insensitive) header text,
 *  so "% of Traffic" never shadows "Traffic". */
function mapColumns(header: string[]): ColMap | null {
  const idx = (name: string) => header.findIndex((h) => norm(h) === name);
  const map: ColMap = {
    root: idx("root intent"),
    intent: idx("intent"),
    traffic: idx("traffic"),
    reviewed: idx("reviewed"),
    automated: idx("automated"),
    escalated: idx("escalated"),
    unsolved: idx("unsolved"),
    handover: idx("handover"),
    noPrediction: idx("no prediction"),
    immediateUnknown: idx("immediate unknown"),
    positiveFeedback: idx("positive conversation feedback"),
    negativeFeedback: idx("negative conversation feedback"),
  };
  // Minimum viable columns to make sense of the export.
  if (map.root < 0 || map.intent < 0 || map.traffic < 0 || map.reviewed < 0) {
    return null;
  }
  return map;
}

const addStats = (a: IntentTrafficStats, b: IntentTrafficStats): void => {
  a.traffic += b.traffic;
  a.reviewed += b.reviewed;
  a.automated += b.automated;
  a.escalated += b.escalated;
  a.unsolved += b.unsolved;
  a.handover += b.handover;
  a.noPrediction += b.noPrediction;
};

const emptyStats = (): IntentTrafficStats => ({
  traffic: 0,
  reviewed: 0,
  automated: 0,
  escalated: 0,
  unsolved: 0,
  handover: 0,
  noPrediction: 0,
});

export interface ParseResult {
  summary: IntentTrafficSummary | null;
  /** Human-readable parse error, or null on success. */
  error: string | null;
}

/** Parse a raw intent-traffic CSV into the compact summary. */
export function parseIntentTrafficCsv(
  text: string,
  opts: { source?: string; topIntents?: number } = {},
): ParseResult {
  const topN = opts.topIntents ?? DEFAULT_TOP_INTENTS;
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    return { summary: null, error: "The file is empty." };
  }

  // The first row may be a "Timeline: …" banner; find the header row.
  let period: string | undefined;
  let headerRow = -1;
  let cols: ColMap | null = null;
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const cells = parseCsvLine(lines[i]);
    const first = cells[0] ?? "";
    if (/timeline/i.test(first)) {
      period = first.replace(/timeline:\s*/i, "").trim() || undefined;
      continue;
    }
    const maybe = mapColumns(cells);
    if (maybe) {
      headerRow = i;
      cols = maybe;
      break;
    }
  }

  if (!cols || headerRow < 0) {
    return {
      summary: null,
      error:
        "Couldn't find the expected columns (Root intent, Intent, Traffic, Reviewed). Is this a boost.ai intent-traffic export?",
    };
  }

  const totals: IntentTrafficTotals = {
    ...emptyStats(),
    positiveFeedback: 0,
    negativeFeedback: 0,
    immediateUnknown: 0,
  };
  const byRoot = new Map<
    string,
    { stats: IntentTrafficStats; intents: IntentTrafficIntent[] }
  >();
  let intentCount = 0;

  for (let i = headerRow + 1; i < lines.length; i++) {
    const c = parseCsvLine(lines[i]);
    const rootName = (c[cols.root] ?? "").trim();
    if (JUNK_ROOTS.has(norm(rootName))) continue;
    const intentName = (c[cols.intent] ?? "").trim();
    if (!intentName) continue;

    const stats: IntentTrafficStats = {
      traffic: num(c[cols.traffic]),
      reviewed: num(c[cols.reviewed]),
      automated: num(c[cols.automated]),
      escalated: num(c[cols.escalated]),
      unsolved: num(c[cols.unsolved]),
      handover: num(c[cols.handover]),
      noPrediction: num(c[cols.noPrediction]),
    };
    if (stats.traffic <= 0) continue;

    intentCount++;
    addStats(totals, stats);
    if (cols.immediateUnknown >= 0)
      totals.immediateUnknown += num(c[cols.immediateUnknown]);
    if (cols.positiveFeedback >= 0)
      totals.positiveFeedback += num(c[cols.positiveFeedback]);
    if (cols.negativeFeedback >= 0)
      totals.negativeFeedback += num(c[cols.negativeFeedback]);

    let bucket = byRoot.get(rootName);
    if (!bucket) {
      bucket = { stats: emptyStats(), intents: [] };
      byRoot.set(rootName, bucket);
    }
    addStats(bucket.stats, stats);
    bucket.intents.push({ intent: intentName, ...stats });
  }

  if (intentCount === 0) {
    return {
      summary: null,
      error: "No intent rows with traffic were found in the file.",
    };
  }

  const roots: IntentTrafficRoot[] = [...byRoot.entries()]
    .map(([root, { stats, intents }]) => ({
      root,
      ...stats,
      topIntents: intents
        .sort((a, b) => b.traffic - a.traffic)
        .slice(0, topN),
    }))
    .sort((a, b) => b.traffic - a.traffic);

  return {
    summary: { period, source: opts.source, intentCount, totals, roots },
    error: null,
  };
}

/* ─── Render helpers (shared by section + builder preview) ──────── */

/** Safe percentage (0 when denominator is 0). */
export function pct(part: number, whole: number): number {
  return whole > 0 ? (100 * part) / whole : 0;
}

/** automated / escalated / unsolved as % of reviewed. */
export function reviewSplit(s: IntentTrafficStats): {
  automated: number;
  escalated: number;
  unsolved: number;
} {
  return {
    automated: pct(s.automated, s.reviewed),
    escalated: pct(s.escalated, s.reviewed),
    unsolved: pct(s.unsolved, s.reviewed),
  };
}
