"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  addFeedback,
  getFeedback,
  isShared,
  removeFeedback,
  type FeedbackEntry,
} from "@/lib/feedback-backlog";
import { assetPath } from "@/lib/asset-path";

/** Shared sessionStorage key with SearchLogPanel — unlock once, read both. */
const ADMIN_PASSWORD_KEY = "boost.ai:admin-password";

/* ─── Pac-Man icon ─── */
function PacManSvg({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assetPath("/images/pac-man.svg")}
      alt=""
      aria-hidden="true"
      className={className}
      style={{ filter: "brightness(0) invert(1)" }}
    />
  );
}

/* ─── Pac-Man button ─── */
export function PacManFeedbackButton({
  onClick,
  ariaLabel = "Open feed me log",
}: {
  onClick: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={ariaLabel}
      className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 bg-boost-green-light hover:scale-110 hover:bg-boost-green transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light/50"
    >
      <PacManSvg className="w-5 h-5" />
    </button>
  );
}

/* ─── Feedback modal ─── */
function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const shared = isShared();
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showUnlock, setShowUnlock] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Restore admin password from sessionStorage (shared with search log panel)
  useEffect(() => {
    if (!shared) return;
    try {
      const saved = window.sessionStorage.getItem(ADMIN_PASSWORD_KEY);
      if (saved) setAdminPassword(saved);
    } catch {
      // ignore
    }
  }, [shared]);

  const refresh = useCallback(async () => {
    if (shared && !adminPassword) {
      setEntries([]);
      return;
    }
    setLoading(true);
    try {
      const next = await getFeedback(shared ? adminPassword : undefined);
      setEntries(next);
    } finally {
      setLoading(false);
    }
  }, [adminPassword, shared]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    setTimeout(() => textareaRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      previousFocus.current?.focus();
    };
  }, [open, onClose]);

  useEffect(() => {
    if (showUnlock) {
      setTimeout(() => passwordInputRef.current?.focus(), 50);
    }
  }, [showUnlock]);

  const handleSubmit = async () => {
    if (submitting) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const entry = await addFeedback(trimmed);
      if (entry) {
        setText("");
        await refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleRemove = async (id: string) => {
    await removeFeedback(id, shared ? adminPassword : undefined);
    await refresh();
  };

  const handleUnlock = async () => {
    const pw = passwordInput.trim();
    if (!pw) return;
    setAdminPassword(pw);
    try {
      window.sessionStorage.setItem(ADMIN_PASSWORD_KEY, pw);
    } catch {
      // ignore
    }
    setPasswordInput("");
    setShowUnlock(false);
  };

  const handleLock = () => {
    setAdminPassword("");
    setEntries([]);
    try {
      window.sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
    } catch {
      // ignore
    }
  };

  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);
  const locked = shared && !adminPassword;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-8" role="presentation">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
        tabIndex={-1}
        className="relative bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-boost-border max-w-xl w-full h-full sm:h-auto sm:max-h-[calc(100vh-4rem)] overflow-y-auto focus:outline-none"
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 sm:rounded-t-2xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(75,30,82,0.97) 0%, rgba(55,22,62,1) 100%)",
          }}
        >
          <div className="px-5 sm:px-7 pt-5 pb-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-boost-green-light">
                  <span className="inline-block">
                    <PacManSvg className="w-3.5 h-3.5" />
                  </span>
                  Feed me log
                  {shared && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/50 bg-white/10 rounded px-1.5 py-0.5">
                      <span className="w-1 h-1 rounded-full bg-boost-green-light" />
                      Shared
                    </span>
                  )}
                </p>
                <h3
                  id="feedback-modal-title"
                  className="mt-1.5 text-xl sm:text-2xl font-bold text-white leading-tight"
                >
                  Nom nom nom — tell me how to grow
                </h3>
                <p className="text-[12px] text-white/55 mt-1.5">
                  {shared
                    ? "Drop bugs, ideas, or polish notes. Anyone on the team can feed me — only the owner reads the log."
                    : "Feed me bugs, ideas, polish notes. Stored on this browser until the shared backend is wired."}
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white/90 transition-colors flex-shrink-0 -mt-0.5"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Compose — always accessible, even when log is locked */}
        <div className="px-5 sm:px-7 py-5 border-b border-boost-border/60">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What should we fix or try next?"
            rows={3}
            className="w-full px-3 py-2.5 bg-white border border-boost-border rounded-lg text-boost-dark placeholder-boost-muted/70 focus:outline-none focus:border-boost-muted/50 transition-colors text-[13px] leading-relaxed resize-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-boost-muted">
              Tip: {typeof navigator !== "undefined" && /Mac/i.test(navigator.platform) ? "⌘" : "Ctrl"}+Enter to feed
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!text.trim() || submitting}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-boost-green-light text-white hover:bg-boost-green disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Feeding…" : "Feed it"}
            </button>
          </div>
        </div>

        {/* Log view — locked by default in shared mode */}
        <div className="px-5 sm:px-7 py-5">
          {locked && !showUnlock ? (
            <div className="text-center py-6">
              <p className="text-[13px] text-boost-muted mb-3">
                Log is private to the owner.
              </p>
              <button
                type="button"
                onClick={() => setShowUnlock(true)}
                className="text-[11px] font-semibold text-boost-dark hover:text-boost-green transition-colors inline-flex items-center gap-1.5"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Unlock with admin password
              </button>
            </div>
          ) : locked && showUnlock ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUnlock();
              }}
              className="max-w-sm mx-auto py-3"
            >
              <input
                ref={passwordInputRef}
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Admin password"
                className="w-full px-3 py-2 bg-white border border-boost-border rounded-lg text-boost-dark placeholder-boost-muted/70 focus:outline-none focus:border-boost-dark/40 text-sm"
              />
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!passwordInput.trim()}
                  className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg bg-boost-dark text-white hover:bg-boost-dark/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Unlock
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUnlock(false);
                    setPasswordInput("");
                  }}
                  className="px-3 py-2 text-sm font-semibold rounded-lg text-boost-muted hover:text-boost-dark hover:bg-boost-surface transition-colors"
                >
                  Cancel
                </button>
              </div>
              <p className="text-[10px] text-boost-muted/60 mt-2 text-center">
                Stored in this tab's sessionStorage. Close the tab to clear.
              </p>
            </form>
          ) : (
            <>
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-[10px] font-bold text-boost-muted uppercase tracking-widest">
                  {loading
                    ? "Loading…"
                    : entries.length > 0
                      ? `${entries.length} entr${entries.length === 1 ? "y" : "ies"}`
                      : "No entries yet"}
                </p>
                {shared && adminPassword && (
                  <button
                    type="button"
                    onClick={handleLock}
                    className="text-[10px] font-semibold text-boost-muted hover:text-boost-dark transition-colors"
                  >
                    Lock
                  </button>
                )}
              </div>
              <div className="space-y-2.5">
                {sorted.map((e) => (
                  <div
                    key={e.id}
                    className="group flex items-start gap-3 py-2.5 px-3 rounded-lg bg-boost-surface/50 border-l-2 border-boost-green-light/40"
                  >
                    <p className="flex-1 text-[13px] text-boost-dark leading-relaxed whitespace-pre-wrap">
                      {e.text}
                    </p>
                    <span className="text-[10px] text-boost-muted tabular-nums shrink-0 mt-1">
                      {formatRelative(e.timestamp)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(e.id)}
                      className="opacity-0 group-hover:opacity-100 text-boost-muted/60 hover:text-boost-dark transition-opacity shrink-0 mt-0.5"
                      aria-label="Delete entry"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
