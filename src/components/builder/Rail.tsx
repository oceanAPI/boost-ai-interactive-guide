"use client";

import { useState, useEffect } from "react";
import { CURRENCY_OPTIONS } from "@/lib/roi-calculator";

/* ─── Section Rail ───
 * Persistent left-side navigator for the journey shell. Shared between
 * the Sales (/admin) and CSM (/cs) workspaces. Extracted verbatim from
 * admin/page.tsx — pure presentational, no business logic. */
export interface RailItemDescriptor {
  id: string;
  number: number;
  title: string;
  preview: string;
  hasContent: boolean;
}

function RailItem(props: {
  item: RailItemDescriptor;
  active: boolean;
  onJump: () => void;
  /** Render-order index — drives stagger delay on first mount.
   *  CSS animation runs once per mount; using `animate-modal-in`
   *  matches the chat-preview rain-in vocabulary (DataFunnelPanel,
   *  globals.css @keyframes modalIn). */
  animationIndex?: number;
}) {
  const { item, active, onJump, animationIndex = 0 } = props;
  return (
    <button
      type="button"
      onClick={onJump}
      className={
        "animate-modal-in relative w-full text-left pl-4 pr-3 py-2 flex items-start gap-2.5 transition-colors " +
        (active ? "bg-boost-surface/80" : "hover:bg-boost-surface/40")
      }
      style={{
        animationDelay: `${Math.min(animationIndex * 80, 1500)}ms`,
        animationFillMode: "both",
      }}
    >
      {active ? (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-boost-purple rounded-r-full"
        />
      ) : null}
      {/* Status indicator — green check when section has content,
          empty circle when added but unfilled. No number prefix. */}
      <span
        className={
          "flex-shrink-0 mt-[2px] flex items-center justify-center w-[18px] h-[18px] rounded-full text-[10px] font-bold leading-none transition-colors " +
          (item.hasContent
            ? "bg-boost-green-light text-white"
            : "bg-white ring-1 ring-inset ring-boost-border text-boost-muted/40")
        }
      >
        {item.hasContent ? "✓" : ""}
      </span>
      <span className="flex-1 min-w-0">
        <span
          className={
            "block text-[12px] font-semibold leading-snug truncate " +
            (active ? "text-boost-dark" : "text-boost-dark/85")
          }
        >
          {item.title}
        </span>
        <span className="block text-[10px] text-boost-muted leading-tight truncate mt-0.5">
          {item.preview}
        </span>
      </span>
    </button>
  );
}

/* ─── Rail customer header ───
 *  Shows the engagement subject at the top of the rail when in editing
 *  stage. Logo cascade: explicit `logoUrl` (curated pattern override)
 *  → Brandfetch CDN derived from `domain` → initials fallback.
 *  Brandfetch returns 404 for unknown domains; the <img onError>
 *  flips to the initials tile so we never show a broken-image icon. */
function RailCustomerHeader(props: {
  name: string;
  logoUrl?: string | null;
  domain?: string;
  category?: string;
}) {
  const { name, logoUrl, domain, category } = props;
  // Brandfetch URL derived from a clean domain (strip protocol/path).
  const cleanDomain = domain
    ? domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim()
    : "";
  const brandfetchUrl = cleanDomain ? `https://cdn.brandfetch.io/${cleanDomain}` : null;
  const finalSrc = logoUrl || brandfetchUrl;
  // Initials: first 2 letters of name, or "?" if no name set.
  const initials = (() => {
    const t = name.trim();
    if (!t) return "?";
    const parts = t.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  })();
  // Skip the header entirely on a brand-new engagement so the rail's
  // counter still feels like the start. Once any identity hint exists
  // (name OR domain), show it.
  if (!name.trim() && !cleanDomain) return null;
  return (
    <div className="px-4 py-3 border-b border-boost-border flex items-center gap-2.5">
      <RailLogoTile src={finalSrc} initials={initials} alt={name || "Customer"} />
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-boost-dark truncate tracking-tight">
          {name.trim() || cleanDomain || "Untitled"}
        </p>
        {category ? (
          <p className="text-[10px] text-boost-muted truncate mt-0.5">{category}</p>
        ) : null}
      </div>
    </div>
  );
}

export function RailLogoTile(props: { src?: string | null; initials: string; alt: string }) {
  const { src, initials, alt } = props;
  const [failed, setFailed] = useState(false);
  // Reset failure state when src changes (e.g., AE swaps prefill).
  useEffect(() => {
    setFailed(false);
  }, [src]);
  const showImage = src && !failed;
  // Square-rounded white tile with thin border — matches the
  // CompanyLogoChip vocabulary used in case studies + dossier card.
  // Real logos look more like trademarks against a clean white frame
  // than against a tinted circle. Initials fall back to the same
  // frame so the rail header rhythm stays consistent.
  return (
    <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-white ring-1 ring-boost-border/70 shadow-sm flex items-center justify-center overflow-hidden p-1">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className="max-w-full max-h-full object-contain"
        />
      ) : (
        <span className="text-[10px] font-bold text-boost-purple/80 tabular-nums tracking-tight">
          {initials}
        </span>
      )}
    </span>
  );
}

export function Rail(props: {
  items: RailItemDescriptor[];
  active: string;
  onJump: (id: string) => void;
  onAddNext?: () => void;
  nextLabel?: string;
  customer?: { name: string; logoUrl?: string | null; domain?: string; category?: string };
  /** Engagement-scoped currency picker. Lives in the rail header
   *  because it's a property of the deck being built, not of the
   *  audience viewing it. CE/PS sessions still see it (they care
   *  about money rendering too) but it's no longer noise on the
   *  purple audience banner. Pass undefined to hide the picker. */
  currency?: string;
  onCurrencyChange?: (next: string | undefined) => void;
  /** Competetive Intel sister-tool link. Sales-only — pass undefined to
   *  hide. Lives in the rail footer now that the engagement chooser
   *  (its old home) is skipped on entry. Opens in a new tab. */
  competitiveIntelHref?: string;
}) {
  const { items, active, onJump, onAddNext, nextLabel, customer, currency, onCurrencyChange, competitiveIntelHref } = props;
  const filled = items.filter((i) => i.hasContent).length;
  return (
    <aside
      className="order-last lg:order-none flex w-full lg:w-[252px] shrink-0 flex-col lg:sticky lg:self-start lg:top-[76px] lg:max-h-[calc(100vh-92px)]"
    >
      <div className="flex flex-col flex-1 min-h-0 rounded-2xl border border-boost-border bg-boost-card shadow-sm overflow-hidden">
        {customer ? (
          <RailCustomerHeader
            name={customer.name}
            logoUrl={customer.logoUrl}
            domain={customer.domain}
            category={customer.category}
          />
        ) : null}
        <div className="px-4 py-3 border-b border-boost-border">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-boost-muted">
              Build engagement
            </p>
            {onCurrencyChange ? (
              <select
                aria-label="Currency"
                value={currency ?? ""}
                onChange={(e) => onCurrencyChange(e.target.value || undefined)}
                className="-mr-1 text-[9px] font-bold uppercase tracking-[0.16em] text-boost-muted hover:text-boost-dark bg-transparent border-0 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-boost-purple/30 rounded px-1 py-0.5 transition-colors"
              >
                <option value="">Auto</option>
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>{opt.label}</option>
                ))}
              </select>
            ) : null}
          </div>
          <p className="text-[12px] font-semibold text-boost-dark mt-0.5 tabular-nums">
            {filled}
            <span className="text-boost-muted/70 font-medium">
              {" "}{filled === 1 ? "section" : "sections"} filled
            </span>
          </p>
          {nextLabel ? (
            <p className="text-[10px] text-boost-muted/80 mt-1.5">
              Next:{" "}
              <span className="text-boost-dark/80 font-medium">{nextLabel}</span>
            </p>
          ) : null}
        </div>
        <nav className="flex-1 overflow-y-auto py-1">
          {items.map((s, i) => (
            <RailItem
              key={s.id}
              item={s}
              active={s.id === active}
              onJump={() => onJump(s.id)}
              animationIndex={i}
            />
          ))}
          {onAddNext ? (
            <button
              type="button"
              onClick={onAddNext}
              className="w-full text-left pl-4 pr-3 py-2 mt-1 flex items-center gap-2.5 text-boost-muted hover:text-boost-purple hover:bg-boost-surface/60 transition-colors animate-modal-in"
              style={{ animationDelay: `${Math.min(items.length * 80, 1500)}ms`, animationFillMode: "both" }}
            >
              <span
                aria-hidden="true"
                className="flex-shrink-0 flex items-center justify-center w-[18px] h-[18px] rounded-full border border-dashed border-boost-border text-[12px] leading-none"
              >
                +
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                Add{nextLabel ? ` ${nextLabel.toLowerCase()}` : " section"}
              </span>
            </button>
          ) : null}
        </nav>
        {competitiveIntelHref ? (
          <a
            href={competitiveIntelHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-4 py-2.5 border-t border-boost-border text-boost-muted hover:text-boost-purple hover:bg-boost-surface/60 transition-colors group"
          >
            <span
              aria-hidden="true"
              className="flex-shrink-0 flex items-center justify-center w-[18px] h-[18px]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              </svg>
            </span>
            <span className="flex-1 text-[11px] font-semibold uppercase tracking-[0.14em]">
              Competetive Intel
            </span>
            <span aria-hidden="true" className="text-[11px] opacity-60 group-hover:opacity-100">↗</span>
          </a>
        ) : null}
      </div>
    </aside>
  );
}
