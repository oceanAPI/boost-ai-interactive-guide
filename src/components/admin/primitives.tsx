"use client";

import type { ReactNode } from "react";

/**
 * Shared primitives for the admin page card bodies.
 *
 * The admin sections all follow the same grammar — a tracked-uppercase
 * question, a muted helper sentence, and (often) a row of chip toggles.
 * Hoisting these into components keeps the section bodies readable and
 * any future visual tweak lands in one place instead of ~15.
 */

/* ─── AdminPrompt ───────────────────────────────────────────
 *  A tracked-uppercase question + optional helper subtitle.
 *  Use `divider` when stacking multiple prompts inside the
 *  same card (Sections 4, 5, 6, 10). Pass a node via `action`
 *  to render a small right-aligned control (e.g. Clear).
 */
export function AdminPrompt({
  question,
  helper,
  divider = false,
  action,
}: {
  question: string;
  helper?: ReactNode;
  divider?: boolean;
  action?: ReactNode;
}) {
  return (
    <div
      className={
        divider
          ? "mb-3 pt-5 mt-5 border-t border-boost-border/60"
          : "mb-3"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-boost-muted uppercase tracking-[0.18em]">
            {question}
          </p>
          {helper && (
            <p className="text-xs text-boost-muted/80 mt-1">{helper}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

/* ─── AdminChipRow ──────────────────────────────────────────
 *  Thin flex-wrap container with the standard 6-px gap used
 *  across admin chip groups. Purely a layout helper — the
 *  actual chip visuals live on AdminChip.
 */
export function AdminChipRow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`flex flex-wrap gap-1.5 ${className}`}>{children}</div>;
}

/* ─── AdminChip ─────────────────────────────────────────────
 *  A single toggle chip in the shared admin vocabulary:
 *  tracked-uppercase text, colored dot, active state is a
 *  solid fill. Tone controls the active colour:
 *
 *   - "primary" (default) — boost-green-light fill, white dot.
 *     Used for primary selections (industries, pricing,
 *     departments, integrations, channels).
 *   - "secondary" — boost-purple fill, green-light dot.
 *     Used for secondary selections (industry variants,
 *     feedback labels) — matches the Feed me log chip grammar.
 */
export type AdminChipTone = "primary" | "secondary";

export function AdminChip({
  active,
  onClick,
  title,
  tone = "primary",
  children,
}: {
  active: boolean;
  onClick: () => void;
  title?: string;
  tone?: AdminChipTone;
  children: ReactNode;
}) {
  const activeBg =
    tone === "secondary" ? "bg-boost-purple text-white" : "bg-boost-green-light text-white";
  const activeDot = tone === "secondary" ? "bg-boost-green-light" : "bg-white/80";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={title}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors ${
        active
          ? activeBg
          : "text-boost-muted hover:text-boost-dark bg-boost-surface/40 hover:bg-boost-surface ring-1 ring-inset ring-boost-border/50"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? activeDot : "bg-boost-muted/40"}`}
      />
      {children}
    </button>
  );
}

/* ─── AdminMiniLabel ────────────────────────────────────────
 *  A small tracked-uppercase label used above individual form
 *  fields (volumes, FTEs, custom section inputs). Tighter
 *  tracking than AdminPrompt since it sits closer to its
 *  input.
 */
export function AdminMiniLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[10px] font-semibold text-boost-muted uppercase tracking-[0.14em] ${className}`}
    >
      {children}
    </p>
  );
}
