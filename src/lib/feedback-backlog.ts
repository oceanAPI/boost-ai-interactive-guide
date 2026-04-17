/**
 * Feedback backlog — client-side only.
 *
 * A shared jot-pad for "things we want to fix or try" that the AE running
 * this tool and the builder (Claude) can both drop notes into. Stored in
 * localStorage so it's per-browser, not shared cross-device (same
 * limitation as the search log — documented + accepted).
 *
 * Entries are soft-deletable (delete button in the UI) and capped at 500
 * entries, oldest dropping off first.
 */

export type FeedbackAuthor = "me" | "claude" | (string & {});

export interface FeedbackEntry {
  id: string;
  text: string;
  author: FeedbackAuthor;
  timestamp: number;
}

const KEY = "boost.ai:feedback-backlog";
const MAX_ENTRIES = 500;

function read(): FeedbackEntry[] {
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

function write(entries: FeedbackEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = entries.slice(-MAX_ENTRIES);
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // Silent fail — quota exceeded, disabled localStorage, etc.
  }
}

export function getFeedback(): FeedbackEntry[] {
  return read();
}

export function addFeedback(text: string, author: FeedbackAuthor = "me"): FeedbackEntry | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const entry: FeedbackEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: trimmed.slice(0, 2000),
    author,
    timestamp: Date.now(),
  };
  write([...read(), entry]);
  return entry;
}

export function removeFeedback(id: string): void {
  write(read().filter((e) => e.id !== id));
}

export function clearFeedback(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Silent fail
  }
}
