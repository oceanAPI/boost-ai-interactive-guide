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

export interface FeedbackEntry {
  id: string;
  text: string;
  author: FeedbackAuthor;
  timestamp: number;
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
 * Fetch the full list.
 *
 * In shared mode the admin password is required — feedback reads are
 * owner-only. Without it we return an empty list so the UI can render
 * an unlock prompt.
 *
 * In local mode (no worker wired), localStorage is returned.
 */
export async function getFeedback(adminPassword?: string): Promise<FeedbackEntry[]> {
  if (isSharedBackendEnabled()) {
    if (!adminPassword) return [];
    const data = await feedGet<{ entries: FeedbackEntry[] }>("/feedback", adminPassword);
    return data?.entries || [];
  }
  return readLocal();
}

export async function addFeedback(
  text: string,
  author: FeedbackAuthor = "me",
): Promise<FeedbackEntry | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (isSharedBackendEnabled()) {
    const remote = await feedPost<{ entry: FeedbackEntry }>("/feedback", {
      text: trimmed.slice(0, 2000),
      author,
    });
    if (remote?.entry) return remote.entry;
    // fall through to local echo if remote failed
  }

  const local: FeedbackEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: trimmed.slice(0, 2000),
    author,
    timestamp: Date.now(),
  };
  writeLocal([...readLocal(), local]);
  return local;
}

export async function removeFeedback(id: string, adminPassword?: string): Promise<void> {
  if (isSharedBackendEnabled()) {
    if (!adminPassword) return;
    const ok = await feedDelete(`/feedback/${encodeURIComponent(id)}`, adminPassword);
    if (ok) return;
  }
  writeLocal(readLocal().filter((e) => e.id !== id));
}
