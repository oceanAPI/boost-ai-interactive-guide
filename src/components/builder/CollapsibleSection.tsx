"use client";

import { useState, useEffect } from "react";

/* ─── Collapsible Section ───
 * Shared builder leaf. Extracted verbatim from admin/page.tsx so the
 * Sales (/admin) and CSM (/cs) workspaces compose the same section
 * chrome. Pure presentational + local open/closed state — no business
 * logic. data-testids and markup unchanged (Pac-Man depends on them). */
export function CollapsibleSection({
  number,
  title,
  subtitle,
  hasContent,
  defaultOpen,
  autoOpenOnContent = true,
  openSignal,
  children,
  /** Optional override for the status badge (e.g. the Pac-Man feedback button) */
  customBadge,
}: {
  number: number;
  title: string;
  subtitle?: string;
  hasContent: boolean;
  defaultOpen?: boolean;
  /** When false, the section stays collapsed even if hasContent flips true. Useful for settings-style sections users should open deliberately. */
  autoOpenOnContent?: boolean;
  /** Incrementing this value forces the section open. Parent uses it to programmatically expand from elsewhere in the UI (e.g. the Generate-time preset nudge that points the user here). */
  openSignal?: number;
  children: React.ReactNode;
  customBadge?: React.ReactNode;
}) {
  // Default to open: in the journey shell only ONE section is mounted
  // at a time (single-active render). Forcing the user to click again
  // to expand is unnecessary friction. Sections can still pass
  // `defaultOpen={false}` to start collapsed if a future use case
  // demands it.
  const [open, setOpen] = useState(defaultOpen ?? true);

  useEffect(() => {
    if (autoOpenOnContent && hasContent) setOpen(true);
  }, [hasContent, autoOpenOnContent]);

  // External open trigger (e.g. from the Generate preset nudge)
  useEffect(() => {
    if (openSignal !== undefined && openSignal > 0) setOpen(true);
  }, [openSignal]);

  const eyebrow = `Section ${String(number).padStart(2, "0")}`;

  return (
    <section
      className={`relative bg-white rounded-xl border border-boost-border shadow-sm overflow-hidden transition-shadow ${
        open ? "shadow-lg" : "hover:shadow-md"
      }`}
    >
      {/* Left accent stripe — boost-green-light when the card has content,
          transparent otherwise. Adds rhythm to the section stack and gives
          completed cards a premium signal without a heavy gradient. */}
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 bottom-0 w-[3px] z-10 transition-colors ${
          hasContent ? "bg-boost-green-light" : "bg-transparent"
        }`}
      />

      {/* Role=button instead of <button> so we can nest real interactive
          elements (like the Pac-Man feedback trigger) inside without
          breaking HTML button-nesting rules. */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!open);
          }
        }}
        style={
          open
            ? {
                background:
                  "linear-gradient(135deg, rgba(75,30,82,0.97) 0%, rgba(55,22,62,1) 100%)",
              }
            : undefined
        }
        className={`w-full flex items-center gap-4 p-5 text-left cursor-pointer select-none transition-colors ${
          open ? "" : "hover:bg-boost-surface/40"
        }`}
      >
        {customBadge ? (
          customBadge
        ) : (
          <span
            className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm flex-shrink-0 transition-all ${
              hasContent
                ? open
                  ? "bg-boost-green-light text-white shadow-sm shadow-boost-green-light/40"
                  : "bg-boost-green-light text-white shadow-sm shadow-boost-green-light/30"
                : open
                  ? "bg-white/10 text-white ring-1 ring-inset ring-white/20"
                  : "bg-white text-boost-purple/80 ring-1 ring-inset ring-boost-border"
            }`}
          >
            {hasContent ? "✓" : number}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p
            className={`text-[10px] font-semibold uppercase tracking-[0.18em] mb-1 ${
              open ? "text-boost-green-light" : "text-boost-muted/80"
            }`}
          >
            {eyebrow}
          </p>
          <h2
            className={`text-lg font-semibold leading-tight tracking-tight ${
              open ? "text-white" : "text-boost-dark"
            }`}
          >
            {title}
          </h2>
          {subtitle && !open && (
            <p className="text-[11px] text-boost-muted/90 truncate mt-1 leading-snug">
              {subtitle}
            </p>
          )}
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform duration-200 flex-shrink-0 ${
            open ? "rotate-180 text-white/70" : "text-boost-muted"
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && <div className="px-5 pb-5 pt-5">{children}</div>}
    </section>
  );
}
