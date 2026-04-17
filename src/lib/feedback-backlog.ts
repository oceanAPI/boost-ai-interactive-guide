/**
 * Feedback backlog.
 *
 * In shared mode (Cloudflare worker env vars set): every browser reads
 * and writes the same list. Anyone with the client token can add,
 * read, or delete entries. Admin password optional — grants the same
 * permissions on top.
 *
 * In local mode: falls back to localStorage so development without
 * the worker keeps working.
 */

import { feedDelete, feedGet, feedPost, isSharedBackendEnabled } from "./feed-api";

export type FeedbackAuthor = "me" | "claude" | (string & {});

export type FeedbackLabel = "bug" | "information" | "visual" | "idea";

export const FEEDBACK_LABELS: readonly FeedbackLabel[] = ["bug", "information", "visual", "idea"];

export interface FeedbackMeta {
  url: string;
  pathname: string;
  route: "Admin" | "Guide" | "Slideshow" | "Other";
  params: Record<string, string>;
  viewport: { w: number; h: number };
  devicePixelRatio: number;
  userAgent: string;
  guideState?: unknown;
  /**
   * Scroll position at the moment the modal was triggered. Lets a reviewer
   * know how far down the page the reporter was.
   */
  scroll?: { x: number; y: number };
  /**
   * The id of the section the user was most likely engaged with at
   * trigger time. Detected in priority order: cursor position (most
   * reliable), keyboard focus, then viewport overlap (fallback).
   * Only populated when the page has `div[id]` anchors (guide / slides).
   */
  nearestSection?: string;
  /**
   * All section ids with any overlap with the viewport, ordered by how
   * much of the viewport they cover (most visible first). Useful when the
   * reporter was at the seam between two sections.
   */
  sectionsInView?: string[];
  /**
   * How `nearestSection` was determined. "hover" and "focus" are
   * high-confidence signals — the user was actively engaged with that
   * section. "viewport" is a fallback inference and should be treated
   * as a weaker signal.
   */
  nearestSectionSource?: "hover" | "focus" | "viewport";
  capturedAt: number;
}

export interface FeedbackEntry {
  id: string;
  text: string;
  author: FeedbackAuthor;
  timestamp: number;
  // Optional context added with the section-scoped / labeled flow.
  // All three are additive — older entries simply leave them undefined.
  label?: FeedbackLabel;
  sectionRef?: string;
  meta?: FeedbackMeta;
}

export interface AddFeedbackOptions {
  author?: FeedbackAuthor;
  label?: FeedbackLabel;
  sectionRef?: string;
  meta?: FeedbackMeta;
}

const KEY = "boost.ai:feedback-backlog";
const MAX_ENTRIES = 500;

/* ─── localStorage fallback ─────────────────────────────── */

function readLocal(): FeedbackEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is FeedbackEntry =>
        !!x &&
        typeof x.id === "string" &&
        typeof x.text === "string" &&
        typeof x.author === "string" &&
        typeof x.timestamp === "number",
    );
  } catch {
    return [];
  }
}

function writeLocal(entries: FeedbackEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    // Silent fail
  }
}

/* ─── public API ────────────────────────────────────────── */

export function isShared(): boolean {
  return isSharedBackendEnabled();
}

/**
 * Fetch feedback entries.
 *
 * In shared mode:
 *   - WITH admin password → full server list (everyone's entries)
 *   - WITHOUT admin password → THIS browser's own submissions only,
 *     from localStorage. Means the submitter sees their own entries
 *     without exposing the full shared log to non-admins.
 *
 * In local mode (no worker wired), localStorage is returned as-is.
 */
export async function getFeedback(adminPassword?: string): Promise<FeedbackEntry[]> {
  if (isSharedBackendEnabled() && adminPassword) {
    const data = await feedGet<{ entries: FeedbackEntry[] }>("/feedback", adminPassword);
    const remote = data?.entries || [];
    // Merge in this browser's local mirror to mask KV eventual-consistency
    // delay — freshly-written entries show up immediately instead of
    // needing a lock/unlock cycle to force a re-fetch.
    const localMirror = readLocal();
    const byId = new Map<string, FeedbackEntry>();
    for (const e of remote) byId.set(e.id, e);
    for (const e of localMirror) if (!byId.has(e.id)) byId.set(e.id, e);
    return Array.from(byId.values()).sort((a, b) => a.timestamp - b.timestamp);
  }
  return readLocal();
}

export async function addFeedback(
  text: string,
  options: AddFeedbackOptions = {},
): Promise<FeedbackEntry | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const author = options.author ?? "me";
  const { label, sectionRef, meta } = options;

  // Only attach the fields that are actually defined — avoids littering
  // entries with explicit undefineds (which don't round-trip through JSON
  // but make TS noisier).
  const extras: Partial<Pick<FeedbackEntry, "label" | "sectionRef" | "meta">> = {};
  if (label) extras.label = label;
  if (sectionRef) extras.sectionRef = sectionRef;
  if (meta) extras.meta = meta;

  let entry: FeedbackEntry | null = null;

  if (isSharedBackendEnabled()) {
    const remote = await feedPost<{ entry: FeedbackEntry }>("/feedback", {
      text: trimmed.slice(0, 2000),
      author,
      ...extras,
    });
    if (remote?.entry) entry = remote.entry;
  }

  // Fall back to a purely local entry if the remote post failed (offline,
  // rate-limited, etc.) so the user still sees their submission show up.
  if (!entry) {
    entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: trimmed.slice(0, 2000),
      author,
      timestamp: Date.now(),
      ...extras,
    };
  }

  // Always mirror locally — this is what the submitter's browser shows
  // when they're not unlocked. Keeps "I wrote something → I see it"
  // working without leaking the full shared log.
  writeLocal([...readLocal(), entry]);
  return entry;
}

export async function removeFeedback(id: string, adminPassword?: string): Promise<void> {
  // Always clean the local mirror so the submitter's own view stays in
  // sync after deletes.
  writeLocal(readLocal().filter((e) => e.id !== id));

  if (isSharedBackendEnabled() && adminPassword) {
    await feedDelete(`/feedback/${encodeURIComponent(id)}`, adminPassword);
  }
}
