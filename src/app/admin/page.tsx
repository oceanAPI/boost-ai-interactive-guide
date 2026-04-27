"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { assetPath } from "@/lib/asset-path";
import { INTEGRATION_CATEGORIES } from "@/data/integrations";
import { INDUSTRIES, INDUSTRY_CATEGORIES, HIDDEN_INDUSTRIES, SUPPORTING_DEPARTMENTS, INDUSTRY_VARIANTS } from "@/data/agents";
import { encodeGuideData, decodeGuideData } from "@/lib/url-encoding";
import { CURRENCY_OPTIONS } from "@/lib/roi-calculator";
import {
  ENVIRONMENT_ADDONS,
  INTEGRATION_TIERS,
  SUCCESS_PACKAGES,
  HUMAN_CHAT_BASE_PRICE,
  HUMAN_CHAT_INCLUDED_SEATS,
  HUMAN_CHAT_PRICE_PER_EXTRA_SEAT,
  VAN_PRICE,
} from "@/data/pricing-2026";
import { pricingConfigHasContent } from "@/lib/pricing-calculator";
import {
  createEmptyMarket,
  rollupMarketVolumes,
  slugifyMarketKey,
} from "@/lib/market-volumes";
import { generateSOWPdf } from "@/lib/generate-sow-pdf";
import SalesforceImportModal from "@/components/SalesforceImportModal";
import HubSpotImportModal from "@/components/HubSpotImportModal";
import CompanySearch from "@/components/CompanySearch";
import SearchLogPanel from "@/components/SearchLogPanel";
import { CustomerDossierCard } from "@/components/admin/CustomerDossierCard";
import {
  AdminChip,
  AdminChipRow,
  AdminMiniLabel,
  AdminPrompt,
} from "@/components/admin/primitives";
import type { DetectionResult } from "@/lib/company-detect";
import {
  SLIDE_SECTIONS,
  SECTION_GROUPS,
  SECTION_PRESETS,
  estimateMinutes,
  type SectionGroup,
  type SectionPreset,
} from "@/lib/slide-sections";
import { AUDIENCE_DEFAULTS } from "@/data/audience-sections";
import { CASE_STUDIES } from "@/data/case-studies";
import type { GuideFormData, ChannelVolumes, MarketVolumes, IntegrationSelections, PricingModel, ResourceAllocation, Audience } from "@/lib/types";

/* ─── Collapsible Section ─── */
function CollapsibleSection({
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

/* ─── Section Rail ───
 * Persistent left-side navigator for the journey shell. */
interface RailItemDescriptor {
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

function RailLogoTile(props: { src?: string | null; initials: string; alt: string }) {
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

function Rail(props: {
  items: RailItemDescriptor[];
  active: string;
  onJump: (id: string) => void;
  onAddNext?: () => void;
  nextLabel?: string;
  customer?: { name: string; logoUrl?: string | null; domain?: string; category?: string };
}) {
  const { items, active, onJump, onAddNext, nextLabel, customer } = props;
  const filled = items.filter((i) => i.hasContent).length;
  return (
    <aside
      className="hidden lg:flex w-[252px] shrink-0 flex-col sticky self-start"
      style={{ top: "76px", maxHeight: "calc(100vh - 92px)" }}
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
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-boost-muted">
            Build engagement
          </p>
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
      </div>
    </aside>
  );
}

/* ─── Helpers ─── */
function FieldLabel({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-boost-text-secondary mb-1">
      {children}
      {optional && <span className="text-boost-muted ml-1">(optional)</span>}
    </label>
  );
}

const inputClass =
  "w-full px-3 py-2 bg-white border border-boost-border rounded-lg text-boost-dark placeholder-boost-lavender focus:outline-none focus:ring-2 focus:ring-boost-green-light focus:border-transparent transition-colors";

/** Inline SVG icons per preset — matches the sales context each preset targets. */
const PRESET_ICONS: Record<string, React.ReactNode> = {
  full: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  executive: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  technical: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  commercial: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  demo: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
};

const PRICING_MODELS: { key: PricingModel; label: string; description: string }[] = [
  {
    key: "fixed",
    label: "Fixed Price",
    description: "Predictable monthly fee based on expected volume",
  },
  {
    key: "usage",
    label: "Pay by Usage",
    description: "Per-conversation pricing that scales with demand",
  },
  {
    key: "outcome",
    label: "Pay by Outcome",
    description: "Only pay for successfully resolved conversations",
  },
];

/* ─── Brand sparkle ───
 * Small 4-point star, mirrors the new boost.ai customer-deck
 * decoration. Used as soft chrome around hero areas in the journey
 * stages. */
function Sparkle(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={props.className}
      aria-hidden="true"
    >
      <path d="M12 2 L13.4 10.6 L22 12 L13.4 13.4 L12 22 L10.6 13.4 L2 12 L10.6 10.6 Z" />
    </svg>
  );
}

/* ─── Choose stage ───
 * Entry point of the engagement journey. Two faded-purple-glyph cards:
 * "Pick a known company" (prefill) recommended, "Start from scratch"
 * (custom). User taps one to advance. */
function ChooseStage(props: {
  onPickPrefill: () => void;
  onPickCustom: () => void;
}) {
  const { onPickPrefill, onPickCustom } = props;
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-10">
      <div className="w-full max-w-3xl">
        <div className="relative text-center mb-10 sm:mb-12">
          <Sparkle className="absolute left-[20%] -top-2 w-4 h-4 text-boost-green-light/35" />
          <Sparkle className="absolute right-[18%] top-7 w-3 h-3 text-boost-green-light/45" />
          <Sparkle className="absolute right-[6%] top-12 w-2.5 h-2.5 text-boost-green-light/30" />
          <p className="text-[11px] font-bold text-boost-muted uppercase tracking-[0.2em] mb-3">
            New engagement
          </p>
          <h1 className="text-3xl sm:text-[40px] font-bold text-boost-dark tracking-[-0.02em] leading-[1.05]">
            Where are you starting from?
          </h1>
          <p className="text-sm sm:text-base text-boost-muted mt-4 max-w-lg mx-auto">
            Begin with a curated prefill, or open a blank engagement and
            type the essentials yourself.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ChoiceCard
            onClick={onPickPrefill}
            kicker="Prefill"
            title="Pick a known company"
            bullets={[
              "Search 40+ curated patterns",
              "Industry, contact, defaults populate",
              "Edit anything after",
            ]}
            cta="Search prefills"
            recommended
            glyph={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
                <circle cx="11" cy="11" r="6" />
                <line x1="21" y1="21" x2="15.5" y2="15.5" />
              </svg>
            }
          />
          <ChoiceCard
            onClick={onPickCustom}
            kicker="Custom"
            title="Start from scratch"
            bullets={[
              "Type the company name",
              "Add domain + industry if known",
              "Everything else stays optional",
            ]}
            cta="Open blank"
            glyph={<span className="text-[28px] font-thin leading-none">+</span>}
          />
        </div>
      </div>
    </main>
  );
}

function ChoiceCard(props: {
  onClick: () => void;
  kicker: string;
  title: string;
  bullets: string[];
  cta: string;
  glyph: React.ReactNode;
  recommended?: boolean;
}) {
  const { onClick, kicker, title, bullets, cta, glyph, recommended } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative block text-left rounded-xl border border-boost-border bg-boost-card shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2"
    >
      <span
        aria-hidden="true"
        className={
          "absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-1.5 " +
          (recommended ? "bg-boost-green-light" : "bg-boost-lavender")
        }
      />
      <div className="p-6 sm:p-7">
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-boost-purple/8 text-boost-purple/60 mb-5 transition-all duration-300 group-hover:bg-boost-purple/12 group-hover:text-boost-purple/80 group-hover:scale-[1.04]">
          {glyph}
        </span>
        <div className="flex items-baseline gap-2.5 mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-boost-purple">{kicker}</p>
          {recommended ? (
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-boost-green">
              Recommended
            </span>
          ) : null}
        </div>
        <h3 className="text-lg font-semibold text-boost-dark mb-3 tracking-tight">{title}</h3>
        <ul className="space-y-1.5 mb-5">
          {bullets.map((b, i) => (
            <li key={i} className="text-xs text-boost-text-secondary flex items-start gap-2">
              <span
                aria-hidden="true"
                className={
                  "mt-1 w-1 h-1 rounded-full flex-shrink-0 " +
                  (recommended ? "bg-boost-green-light" : "bg-boost-muted/60")
                }
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between pt-3 border-t border-boost-border/60">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">{cta}</span>
          <span aria-hidden="true" className="text-boost-muted group-hover:text-boost-purple group-hover:translate-x-0.5 transition-all">→</span>
        </div>
      </div>
    </button>
  );
}

/* ─── Custom-entry stage ───
 * Minimal essentials when AE wants to start blank — no prefill match
 * or no need for one. Writes directly into the form's identity fields,
 * then transitions to editing.
 *
 * Industry is picked from the same chip list as Section 2's Areas of
 * Interest (single-select on entry, AE can add more later in editing).
 * Either company_name OR industryKey must be present to enter editing
 * — neither = nothing to generate against. */
function CustomEntryStage(props: {
  industries: ReadonlyArray<{ readonly key: string; readonly label: string }>;
  onCreate: (fields: { name: string; domain: string; industryKey: string | null }) => void;
  onBack: () => void;
}) {
  const { industries, onCreate, onBack } = props;
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [industryKey, setIndustryKey] = useState<string | null>(null);
  // Either name OR industry must be set — the generate gate later
  // reads `hasCompanyInfo || hasAreas`, so requiring one of those at
  // entry time makes the rule transparent up-front.
  const ready = name.trim().length > 0 || industryKey !== null;
  return (
    <main className="flex-1 px-6 sm:px-10 py-12">
      <div className="max-w-[560px] mx-auto">
        <div className="text-center mb-8">
          <p className="text-[11px] font-semibold text-boost-muted uppercase tracking-[0.18em] mb-3">
            Pick a starting point
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-boost-dark tracking-tight">
            Open a blank engagement
          </h1>
          <p className="text-sm text-boost-muted mt-3 max-w-md mx-auto">
            Company name or industry — at least one. Everything else stays optional.
          </p>
        </div>
        <div className="bg-boost-card border border-boost-border rounded-xl shadow-sm p-5 sm:p-6">
          <div className="space-y-4">
            <CustomEntryField
              label="Company name"
              value={name}
              onChange={setName}
              placeholder="e.g. Acme Insurance"
              autoFocus
              optional
            />
            <CustomEntryField
              label="Domain"
              value={domain}
              onChange={setDomain}
              placeholder="acme.com"
              optional
            />
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-boost-muted mb-2">
                Industry
                <span className="ml-1.5 text-boost-muted/60 normal-case font-medium tracking-normal">
                  optional · pick one to start
                </span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {industries.map((ind) => {
                  const active = industryKey === ind.key;
                  return (
                    <button
                      key={ind.key}
                      type="button"
                      onClick={() => setIndustryKey(active ? null : ind.key)}
                      className={
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors border " +
                        (active
                          ? "bg-boost-purple text-white border-boost-purple shadow-sm"
                          : "bg-white text-boost-dark border-boost-border hover:border-boost-purple/40")
                      }
                    >
                      {active ? <span aria-hidden="true" className="-ml-0.5">●</span> : null}
                      {ind.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-boost-muted mt-2">
                You can add more industries (and edit anything) once you&apos;re in.
              </p>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-boost-border/60 flex justify-between items-center">
            <button
              type="button"
              onClick={onBack}
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted hover:text-boost-dark transition-colors"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => ready && onCreate({ name: name.trim(), domain: domain.trim(), industryKey })}
              disabled={!ready}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-boost-purple-deeper text-white rounded-lg text-[12px] font-semibold uppercase tracking-[0.14em] hover:bg-boost-purple transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function CustomEntryField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  optional?: boolean;
}) {
  const { label, value, onChange, placeholder, autoFocus, optional } = props;
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-boost-muted mb-1.5">
        {label}
        {optional ? (
          <span className="ml-1.5 text-boost-muted/60 normal-case font-medium tracking-normal">
            optional
          </span>
        ) : null}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full px-3.5 py-2.5 text-[14px] bg-white border border-boost-border rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light/40 focus-visible:border-boost-green-light/40 placeholder:text-boost-muted/60"
      />
    </div>
  );
}

/* ─── Generate menu ───
 * Traffic-light picker shown when AE clicks Generate Engagement in
 * the rail. Three ready outputs (green) wire to existing handlers:
 *   Presentation         → handleStartPresentation (navigates to /slides)
 *   SoW PDF              → handleDownloadSOW (PDF download)
 *   Interactive Engagement → handleSubmit (navigates to /guide via
 *                            preset-nudge-aware proceedWithGenerate)
 *
 * Two orange options (Push to SF, Push to HS) and one grey (Save) are
 * placeholders for the future-tables work. They render dimmed and
 * fire no-op handlers — clear visual signal that they're known-future
 * work, not broken. */
type GenerateOutputStatus = "ready" | "soon-orange" | "soon-grey";

interface GenerateOutputOption {
  id: string;
  title: string;
  hint: string;
  status: GenerateOutputStatus;
  glyph: string;
  onPick?: () => void;
  /** When true, the option renders with a "Recommended" tracked-
   *  uppercase label next to the title. Visual hint that this is the
   *  default expected choice; doesn't change behavior. */
  recommended?: boolean;
}

function generateStatusToken(status: GenerateOutputStatus) {
  switch (status) {
    case "ready":
      // No label — the green dot is enough. Reduces visual noise on
      // the most common case so the "Coming soon" / "Future" labels
      // stand out as warnings about availability.
      return { dot: "bg-boost-green-light", label: null, labelColor: "" };
    case "soon-orange":
      return { dot: "bg-boost-orange", label: "Coming soon", labelColor: "text-boost-orange" };
    case "soon-grey":
      return { dot: "bg-boost-muted/60", label: "Future", labelColor: "text-boost-muted/80" };
  }
}

function GenerateMenu(props: {
  options: GenerateOutputOption[];
  onClose: () => void;
}) {
  const { options, onClose } = props;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Generate engagement"
      className="fixed inset-0 z-30 flex items-start justify-center bg-boost-dark/35 backdrop-blur-[2px] p-6 pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[600px] bg-boost-card rounded-xl border border-boost-border shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-4 border-b border-boost-border flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-boost-muted">
              Generate engagement
            </p>
            <h3 className="text-[15px] font-semibold text-boost-dark mt-0.5 tracking-tight">
              Pick an output
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-boost-muted hover:text-boost-dark text-lg leading-none px-2 py-1 rounded-md hover:bg-boost-surface"
          >
            ✕
          </button>
        </header>
        <ul className="p-2 max-h-[60vh] overflow-y-auto">
          {options.map((opt) => {
            const tok = generateStatusToken(opt.status);
            const dim = opt.status !== "ready";
            const handleClick = () => {
              if (opt.onPick) {
                opt.onPick();
                onClose();
              }
            };
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={handleClick}
                  disabled={!opt.onPick}
                  className={
                    "w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-colors " +
                    (dim
                      ? "hover:bg-boost-surface/60 disabled:cursor-not-allowed"
                      : "hover:bg-boost-surface")
                  }
                >
                  <span
                    className={
                      "flex-shrink-0 relative w-9 h-9 rounded-full bg-boost-purple/8 text-boost-purple/70 flex items-center justify-center text-[14px] " +
                      (dim ? "opacity-70" : "")
                    }
                  >
                    {opt.glyph}
                    <span
                      className={
                        "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-boost-card " +
                        tok.dot
                      }
                    />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-baseline gap-2">
                      <span
                        className={
                          "block text-[13px] font-semibold tracking-tight " +
                          (dim ? "text-boost-dark/75" : "text-boost-dark")
                        }
                      >
                        {opt.title}
                      </span>
                      {opt.recommended ? (
                        <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-boost-green">
                          Recommended
                        </span>
                      ) : null}
                      {tok.label ? (
                        <span
                          className={
                            "text-[9px] font-semibold uppercase tracking-[0.16em] " +
                            tok.labelColor
                          }
                        >
                          {tok.label}
                        </span>
                      ) : null}
                    </span>
                    <span className="block text-[11px] text-boost-muted mt-0.5">{opt.hint}</span>
                  </span>
                  <span aria-hidden="true" className={"text-boost-muted/60 " + (dim ? "opacity-50" : "")}>
                    →
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function AdminPage() {
  const router = useRouter();
  const [form, setForm] = useState<GuideFormData>({
    company_name: "",
    company_url: "",
    contact_name: "",
    contact_role: "",
    start_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    areas_of_interest: [],
    specific_requirements: "",
    channel_volumes: {},
    conversation_cost: "",
    pricing_model: "fixed",
    deployment_markets: 1,
    resources: {
      stakeholder_owners: undefined,
      ai_trainers: undefined,
      technical_resources: undefined,
      supporting_departments: [],
      knowledge_management: false,
    },
    integrations: {},
    custom_notes: "",
    selected_case_studies: [],
    selected_variants: [],
    custom_section: { title: "", body: "" },
  });

  const updateField = <K extends keyof GuideFormData>(key: K, value: GuideFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /** Patch the nested `pricing_config` object. Always writes through
   *  the existing object so partial updates don't wipe sibling keys.
   *
   *  COHERENCE: when the AE types a chat/voice expected volume into
   *  Section 3, mirror it into `channel_volumes` so ROI / Impact /
   *  SoW (which still read channel_volumes) agree with the invoice.
   *  The reverse mirror is handled inline where `channel_volumes` is
   *  edited in Section 5. */
  const updatePricingConfig = <K extends keyof NonNullable<GuideFormData["pricing_config"]>>(
    key: K,
    value: NonNullable<GuideFormData["pricing_config"]>[K],
  ) => {
    setForm((prev) => {
      const nextPricing = { ...(prev.pricing_config ?? {}), [key]: value };
      let nextVolumes = prev.channel_volumes;
      if (key === "chat_expected_monthly" && typeof value === "number") {
        nextVolumes = { ...prev.channel_volumes, chat: value };
      } else if (key === "voice_expected_monthly" && typeof value === "number") {
        nextVolumes = { ...prev.channel_volumes, voice: value };
      }
      return { ...prev, pricing_config: nextPricing, channel_volumes: nextVolumes };
    });
  };

  /* ─── Audience detection (?audience=sales|customer-excellence|professional-services) ───
   *  Lifted from the URL on mount. Null until read so the banner never
   *  flashes during SSR hydration. `"sales"` and `null` both render the
   *  existing Sales admin with zero visual change. */
  const [audience, setAudience] = useState<Audience | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = new URLSearchParams(window.location.search).get("audience");
    if (raw === "sales" || raw === "customer-excellence" || raw === "professional-services") {
      setAudience(raw);
    }
  }, []);

  /* ─── URL-based prefill ───
   *  Two paths into form hydration:
   *    1. ?prefill=<base64> — legacy query-string prefill (CRM links).
   *       Decoded once on mount, then stripped from the URL so reloads
   *       don't keep re-applying.
   *    2. #data=<base64>... — bookmark continuation. Same decode, but
   *       hash is preserved so reload stays in editing stage. The stage
   *       useState above already initialized to "editing" if hash data
   *       was present at mount. */
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Path 1: query-string prefill
    const params = new URLSearchParams(window.location.search);
    const prefillQuery = params.get("prefill");
    if (prefillQuery) {
      const decoded = decodeGuideData(prefillQuery);
      if (decoded) {
        setForm((prev) => ({ ...prev, ...decoded }));
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, "", cleanUrl);
      }
      return;
    }
    // Path 2: hash bookmark
    const m = window.location.hash.match(/data=([^&]+)/);
    if (m) {
      const decoded = decodeGuideData(decodeURIComponent(m[1]));
      if (decoded) {
        setForm((prev) => ({ ...prev, ...decoded }));
      }
    }
  }, []);

  const updateResource = <K extends keyof ResourceAllocation>(key: K, value: ResourceAllocation[K]) => {
    setForm((prev) => ({
      ...prev,
      resources: { ...prev.resources, [key]: value },
    }));
  };

  const toggleArea = (key: string) => {
    setForm((prev) => {
      const areas = prev.areas_of_interest.includes(key)
        ? prev.areas_of_interest.filter((a) => a !== key)
        : [...prev.areas_of_interest, key];
      // If removing an industry, drop any of its variants too
      const variantsForRemoved = !areas.includes(key)
        ? (INDUSTRY_VARIANTS[key] || []).map((v) => v.key)
        : [];
      const nextVariants = (prev.selected_variants || []).filter(
        (v) => !variantsForRemoved.includes(v),
      );
      return { ...prev, areas_of_interest: areas, selected_variants: nextVariants };
    });
  };

  const [lastPrefilled, setLastPrefilled] = useState<string | null>(null);
  /** Captured from result.match.logoUrl at prefill time — feeds the Customer Dossier card. */
  const [prefilledLogo, setPrefilledLogo] = useState<string | null>(null);
  /** Short description for the Customer Dossier card — match.summary, fallback to match.category. */
  const [prefilledSummary, setPrefilledSummary] = useState<string | null>(null);

  const applyCompanyPattern = (result: DetectionResult) => {
    const prefill = result.prefill || {};
    setForm((prev) => ({
      ...prev,
      ...prefill,
      // Preserve nested objects sensibly
      channel_volumes: {
        ...prev.channel_volumes,
        ...(prefill.channel_volumes || {}),
      },
      resources: {
        ...prev.resources,
        ...(prefill.resources || {}),
      },
      integrations: {
        ...prev.integrations,
        ...(prefill.integrations || {}),
      },
    }));
    const label = result.match?.name || "company";
    setLastPrefilled(
      result.source === "web" ? `${label} (web best-guess)` : label,
    );
    setPrefilledLogo(result.match?.logoUrl || null);
    setPrefilledSummary(result.match?.summary || result.match?.category || null);
  };

  const dismissPrefillChip = () => {
    setLastPrefilled(null);
    // Keep prefilledLogo/Summary so the dossier visuals remain — only the
    // "prefilled from X" chip disappears. The AE can still edit every field.
  };

  const toggleVariant = (key: string) => {
    setForm((prev) => {
      const current = prev.selected_variants || [];
      const updated = current.includes(key)
        ? current.filter((v) => v !== key)
        : [...current, key];
      return { ...prev, selected_variants: updated };
    });
  };

  const toggleDepartment = (dept: string) => {
    setForm((prev) => {
      const current = prev.resources.supporting_departments || [];
      const updated = current.includes(dept)
        ? current.filter((d) => d !== dept)
        : [...current, dept];
      return {
        ...prev,
        resources: { ...prev.resources, supporting_departments: updated },
      };
    });
  };

  const updateVolume = (channel: keyof ChannelVolumes, value: string) => {
    setForm((prev) => {
      const parsed = value ? parseInt(value) : undefined;
      const nextVolumes = { ...prev.channel_volumes, [channel]: parsed };
      // COHERENCE: mirror chat/voice volumes into pricing_config's
      // "expected monthly" so the invoice + the ROI agree even when
      // the AE only filled Section 5 (channel volumes) and not the
      // full 2026 pricing builder. Other channels (email / social)
      // don't have a pricing counterpart.
      let nextPricing = prev.pricing_config;
      if (channel === "chat") {
        nextPricing = { ...(prev.pricing_config ?? {}), chat_expected_monthly: parsed };
      } else if (channel === "voice") {
        nextPricing = { ...(prev.pricing_config ?? {}), voice_expected_monthly: parsed };
      }
      return { ...prev, channel_volumes: nextVolumes, pricing_config: nextPricing };
    });
  };

  /* F11 — per-market volumes mutators.
     `market_volumes` is the source of truth when set; the rollup
     `channel_volumes` and the count `deployment_markets` are
     auto-synced so all existing consumers stay untouched. */
  const syncRollupFromMarkets = (
    markets: MarketVolumes[],
    prev: GuideFormData,
  ): Partial<GuideFormData> => {
    const rollup = rollupMarketVolumes(markets);
    let nextPricing = prev.pricing_config;
    if (rollup.chat != null || prev.pricing_config?.chat_expected_monthly != null) {
      nextPricing = {
        ...(prev.pricing_config ?? {}),
        chat_expected_monthly: rollup.chat,
      };
    }
    if (rollup.voice != null || prev.pricing_config?.voice_expected_monthly != null) {
      nextPricing = {
        ...(nextPricing ?? prev.pricing_config ?? {}),
        voice_expected_monthly: rollup.voice,
      };
    }
    return {
      market_volumes: markets,
      channel_volumes: rollup,
      deployment_markets: Math.max(1, markets.length),
      pricing_config: nextPricing,
    };
  };

  const enablePerMarket = () => {
    setForm((prev) => {
      // First market seeded with the existing flat rollup so we
      // don't lose the AE's current input on toggle-on.
      const seedName = prev.company_name || "Primary market";
      const seed: MarketVolumes = {
        key: slugifyMarketKey(seedName),
        name: seedName,
        volumes: { ...prev.channel_volumes },
      };
      return { ...prev, ...syncRollupFromMarkets([seed], prev) };
    });
  };

  const disablePerMarket = () => {
    setForm((prev) => ({ ...prev, market_volumes: undefined }));
  };

  const addMarket = () => {
    setForm((prev) => {
      const next = [...(prev.market_volumes ?? []), createEmptyMarket()];
      return { ...prev, ...syncRollupFromMarkets(next, prev) };
    });
  };

  const removeMarket = (key: string) => {
    setForm((prev) => {
      const next = (prev.market_volumes ?? []).filter((m) => m.key !== key);
      if (next.length === 0) {
        return { ...prev, market_volumes: undefined };
      }
      return { ...prev, ...syncRollupFromMarkets(next, prev) };
    });
  };

  const updateMarketField = (
    key: string,
    field: "name" | "country",
    value: string,
  ) => {
    setForm((prev) => {
      const next = (prev.market_volumes ?? []).map((m) =>
        m.key === key ? { ...m, [field]: value || undefined } : m,
      );
      return { ...prev, market_volumes: next };
    });
  };

  const updateMarketVolume = (
    key: string,
    channel: keyof ChannelVolumes,
    value: string,
  ) => {
    setForm((prev) => {
      const parsed = value ? parseInt(value) : undefined;
      const next = (prev.market_volumes ?? []).map((m) =>
        m.key === key ? { ...m, volumes: { ...m.volumes, [channel]: parsed } } : m,
      );
      return { ...prev, ...syncRollupFromMarkets(next, prev) };
    });
  };

  const toggleIntegration = (category: string, name: string) => {
    setForm((prev) => {
      const cat = (prev.integrations[category as keyof IntegrationSelections] || []) as string[];
      const updated = cat.includes(name)
        ? cat.filter((n) => n !== name)
        : [...cat, name];
      return {
        ...prev,
        integrations: { ...prev.integrations, [category]: updated },
      };
    });
  };

  /** Toggle the "Other" free-text slot for a category. Active when the
   *  field has any content; clicking the chip clears it. First click
   *  initialises to empty string so the revealed input is focusable
   *  and typing immediately lands in state. */
  const toggleIntegrationOther = (category: string) => {
    setForm((prev) => {
      const current = prev.integrations.other?.[category as keyof IntegrationSelections extends string ? never : never];
      void current;
      const existing = prev.integrations.other ?? {};
      const key = category as "channel" | "human_handover" | "openid" | "utility" | "voice";
      const isActive = existing[key] !== undefined;
      const nextOther = { ...existing };
      if (isActive) {
        delete nextOther[key];
      } else {
        nextOther[key] = "";
      }
      return {
        ...prev,
        integrations: { ...prev.integrations, other: nextOther },
      };
    });
  };

  const setIntegrationOther = (category: string, value: string) => {
    setForm((prev) => {
      const existing = prev.integrations.other ?? {};
      const key = category as "channel" | "human_handover" | "openid" | "utility" | "voice";
      return {
        ...prev,
        integrations: {
          ...prev.integrations,
          other: { ...existing, [key]: value },
        },
      };
    });
  };

  /** Actual generate — called after any pre-checks (e.g. preset nudge) pass.
   *  Threads the current `audience` through to the guide route so the
   *  guide renderer can filter sections by audience defaults. Sales
   *  (no audience param) generates the same URL as before —
   *  bookmark-compatible. */
  const proceedWithGenerate = () => {
    const encoded = encodeGuideData(form);
    // Bulky payload (`data`, `sections`) lives in the URL FRAGMENT so
    // GitHub Pages' Varnish CDN never sees it — Varnish rejects URIs
    // past ~8KB, and a fully-populated PS fixture encodes to ~32KB.
    // Fragments are client-only, so there is no practical size cap.
    // `audience` stays as a query param: it's tiny and we may want it
    // for logging / analytics / server-side hints in the future.
    const fragment = new URLSearchParams();
    fragment.set("data", encoded);
    fragment.set("sections", selectedSectionIds.join(","));
    const qs = audience ? `?audience=${encodeURIComponent(audience)}` : "";
    router.push(`/guide${qs}#${fragment.toString()}`);
  };

  const handleSubmit = () => {
    // Soft nudge: if the user has never picked a preset card AND has
    // never manually touched a section toggle/reorder, they're about
    // to send the full default guide — often unintentionally. Ask
    // once, don't block.
    if (lastAppliedPresetKey === null && !hasTouchedSections) {
      setShowPresetNudge(true);
      return;
    }
    proceedWithGenerate();
  };

  const handleStartPresentation = () => {
    const encoded = encodeGuideData(form);
    const sections = selectedSectionIds.join(",");
    // Fragment-encoded for the same CDN-limit reason as proceedWithGenerate.
    router.push(`/slides#data=${encoded}&sections=${encodeURIComponent(sections)}`);
  };

  /* ─── Salesforce import ─── */
  const [showSalesforce, setShowSalesforce] = useState(false);
  const [showHubspot, setShowHubspot] = useState(false);
  const [showSearchLog, setShowSearchLog] = useState(false);
  /** Preset-nudge modal: shown when user hits Generate on an untouched default guide. */
  const [showPresetNudge, setShowPresetNudge] = useState(false);
  /** Used to programmatically open Guide Sections from the preset nudge. Incrementing forces CollapsibleSection to expand. */
  const [guideSectionsOpenSignal, setGuideSectionsOpenSignal] = useState(0);
  const guideSectionsRef = useRef<HTMLDivElement>(null);

  /* ─── Guide sections (inline picker) ─── */
  const [sectionItems, setSectionItems] = useState(() =>
    SLIDE_SECTIONS.map((s) => ({ ...s, enabled: s.defaultEnabled ?? true })),
  );
  /** Remembers which preset the user last applied so we can show
   * "Edited from X" even after they've tweaked individual toggles.
   * `null` means the user has not deliberately picked a preset yet —
   * the sections are still at their default values. We use that to
   * decide whether to nudge at Generate time. */
  const [lastAppliedPresetKey, setLastAppliedPresetKey] = useState<string | null>(null);
  /** Flips true the first time the user manually mutates the section
   * list (toggle, reorder, bulk action). Combined with
   * lastAppliedPresetKey for the Generate-time nudge. */
  const [hasTouchedSections, setHasTouchedSections] = useState(false);

  /* Apply per-audience defaults once the audience is read from the URL.
   * Runs exactly once per audience transition (null → set) because
   * audience is read on mount and never mutated after.
   *
   * Bare /admin (no ?audience=) skips this block and keeps today's
   * SLIDE_SECTIONS-based defaults — zero change for existing bookmarks. */
  useEffect(() => {
    if (!audience) return;
    const defaults = new Set(AUDIENCE_DEFAULTS[audience]);
    setSectionItems((prev) =>
      prev.map((item) => ({ ...item, enabled: defaults.has(item.id) })),
    );
  }, [audience]);

  const toggleSection = (id: string) => {
    setHasTouchedSections(true);
    setSectionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)),
    );
  };

  const moveSectionUp = (index: number) => {
    if (index <= 0) return;
    setHasTouchedSections(true);
    setSectionItems((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveSectionDown = (index: number) => {
    if (index >= sectionItems.length - 1) return;
    setHasTouchedSections(true);
    setSectionItems((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  /* ── Bulk actions on sections ── */
  const applyPreset = (preset: SectionPreset) => {
    const enabledSet = new Set(preset.enable);
    setSectionItems((prev) => prev.map((item) => ({ ...item, enabled: enabledSet.has(item.id) })));
    setLastAppliedPresetKey(preset.key);
    setHasTouchedSections(true);
  };

  const setAllEnabled = (enabled: boolean) => {
    setHasTouchedSections(true);
    setSectionItems((prev) => prev.map((item) => ({ ...item, enabled })));
  };

  const toggleGroupEnabled = (group: SectionGroup, enabled: boolean) => {
    setHasTouchedSections(true);
    setSectionItems((prev) => prev.map((item) => (item.group === group ? { ...item, enabled } : item)));
  };

  /** Which preset (if any) does the current state exactly match? Lets us highlight the active preset pill. */
  const activePresetKey = (() => {
    const currentlyEnabled = new Set(sectionItems.filter((s) => s.enabled).map((s) => s.id));
    for (const p of SECTION_PRESETS) {
      const preset = new Set(p.enable);
      if (
        preset.size === currentlyEnabled.size &&
        [...preset].every((id) => currentlyEnabled.has(id))
      ) {
        return p.key;
      }
    }
    return null;
  })();

  const estimatedReadTime = estimateMinutes(sectionItems.filter((s) => s.enabled).map((s) => s.id));

  const toggleCaseStudy = (id: string) => {
    setForm((prev) => {
      const current = prev.selected_case_studies || [];
      const updated = current.includes(id)
        ? current.filter((s) => s !== id)
        : [...current, id];
      return { ...prev, selected_case_studies: updated };
    });
  };

  const hasCustomCaseStudies = (form.selected_case_studies?.length ?? 0) > 0;

  const selectedSectionIds = sectionItems.filter((i) => i.enabled).map((i) => i.id);
  // Reflects actual user touch (manual toggle / reorder) or applied
  // preset — not the inherent "some defaults are off" state. Otherwise
  // 15 SLIDE_SECTIONS that default to disabled would force the
  // hasSectionChanges flag true on every fresh load and spuriously
  // auto-add the Guide Sections row to the rail.
  const hasSectionChanges = hasTouchedSections || lastAppliedPresetKey !== null;

  /* ─── SOW PDF download ─── */
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleDownloadSOW = async () => {
    setGeneratingPdf(true);
    try {
      const encoded = encodeGuideData(form);
      const base = window.location.href.split('/admin')[0];
      // Fragment URL — see proceedWithGenerate for the CDN-limit rationale.
      const guideUrl = `${base}/guide#data=${encoded}`;
      await generateSOWPdf(form, guideUrl);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const totalIntegrations = Object.values(form.integrations).reduce(
    (sum, arr) => sum + (arr?.length || 0),
    0,
  );

  /* ─── Content detection for accordion state ─── */
  // start_date is intentionally excluded — it has a default value
  // (today + 14 days) so including it would make hasCompanyInfo
  // always-true on fresh load and trigger spurious rail auto-add.
  const hasCompanyInfo = !!(
    form.company_name ||
    form.company_url ||
    form.contact_name ||
    form.contact_role
  );
  const hasAreas = form.areas_of_interest.length > 0;
  const hasPricing = !!(form.conversation_cost);
  const hasPricingConfig = pricingConfigHasContent(form.pricing_config);
  const hasDeployment =
    form.deployment_markets > 1 ||
    !!form.resources.stakeholder_owners ||
    !!form.resources.ai_trainers ||
    !!form.resources.technical_resources ||
    (form.resources.supporting_departments?.length ?? 0) > 0 ||
    !!form.resources.knowledge_management;
  const hasRequirements = !!(
    form.specific_requirements ||
    Object.values(form.channel_volumes).some((v) => v)
  );
  const hasIntegrations = totalIntegrations > 0;
  const hasNotes = !!form.custom_notes;

  /** Generate gate: at minimum we need a customer label — either the
   *  company name OR a selected industry (Areas of Interest). If both
   *  are empty there's nothing to generate against. Guide Sections has
   *  reasonable defaults from SLIDE_SECTIONS so it doesn't gate. */
  const canGenerate = hasCompanyInfo || hasAreas;

  /* ─── Journey state (dormant in this commit) ───
   * Foundation for the engagement-journey shell migration.
   *
   * Today the page renders the same as before — all 12 CollapsibleSection
   * cards in a vertical scroll. The state below is in place so subsequent
   * commits can drive a rail + active-section UX without further
   * architectural moves. Each entry maps 1:1 to one of today's sections.
   *
   * `stage` defaults to "editing" so the legacy scroll renders unchanged
   * when no journey UI is rendered yet. Stages "choose" / "search" /
   * "custom-entry" become active in commit 4. */
  type Stage = "choose" | "search" | "custom-entry" | "editing";
  type SectionId =
    | "company"
    | "areas"
    | "pricing"
    | "invoice"
    | "deployment"
    | "requirements"
    | "integrations"
    | "notes"
    | "sections"
    | "cases"
    | "custom"
    | "demos";

  interface SectionMeta {
    id: SectionId;
    /** Existing CollapsibleSection number (1-12). Stable for back-compat. */
    number: number;
    title: string;
    /** Brief one-liner shown in rail row. Dynamic where possible. */
    preview: string;
    /** True if the section has any user-entered content. Drives the green-
     *  check on rail rows and the bookmark auto-add logic in commit 4. */
    hasContent: boolean;
  }

  const SECTIONS_REGISTRY: SectionMeta[] = [
    {
      id: "company",
      number: 1,
      title: "Company Information",
      preview: form.company_name || "Identity, contact, kickoff",
      hasContent: hasCompanyInfo,
    },
    {
      id: "areas",
      number: 2,
      title: "Areas of Interest",
      preview: hasAreas
        ? `${form.areas_of_interest.length} area${form.areas_of_interest.length === 1 ? "" : "s"} selected`
        : "Industry verticals & sub-areas",
      hasContent: hasAreas,
    },
    {
      id: "pricing",
      number: 3,
      title: "Pricing Model & ROI",
      preview: hasPricing
        ? `${form.pricing_model} · ${form.conversation_cost}`
        : "Cost / conv, FTE capacity, ramp",
      hasContent: hasPricing,
    },
    {
      id: "invoice",
      number: 4,
      title: "Commercial Invoice Builder",
      preview: hasPricingConfig ? "2026 invoice populated" : "2026 line-item invoice",
      hasContent: hasPricingConfig,
    },
    {
      id: "deployment",
      number: 5,
      title: "Deployment & Resources",
      preview: hasDeployment
        ? `${form.deployment_markets} market${form.deployment_markets === 1 ? "" : "s"}`
        : "Markets, team, capacity",
      hasContent: hasDeployment,
    },
    {
      id: "requirements",
      number: 6,
      title: "Requirements & Volumes",
      preview: form.market_volumes
        ? `${form.market_volumes.length} markets, per-market`
        : hasRequirements
          ? "Volumes added"
          : "Per-market or rollup",
      hasContent: hasRequirements,
    },
    {
      id: "integrations",
      number: 7,
      title: "Backend Integrations",
      preview: hasIntegrations
        ? `${totalIntegrations} integration${totalIntegrations === 1 ? "" : "s"} selected`
        : "Auth, channels, CRM",
      hasContent: hasIntegrations,
    },
    {
      id: "notes",
      number: 8,
      title: "Additional Notes",
      preview: hasNotes ? "Notes added" : "Optional context",
      hasContent: hasNotes,
    },
    {
      id: "sections",
      number: 9,
      title: "Guide Sections",
      preview: `${selectedSectionIds.length} of ${sectionItems.length} · ~${estimatedReadTime} min`,
      hasContent: hasSectionChanges,
    },
    {
      id: "cases",
      number: 10,
      title: "Case Study Selection",
      preview: hasCustomCaseStudies
        ? `${form.selected_case_studies?.length} stor${(form.selected_case_studies?.length ?? 0) === 1 ? "y" : "ies"} selected`
        : "Industry-relevant default",
      hasContent: hasCustomCaseStudies,
    },
    {
      id: "custom",
      number: 11,
      title: "Custom Section",
      preview: form.custom_section?.title || "Optional bespoke section",
      hasContent: !!form.custom_section?.title,
    },
    {
      id: "demos",
      number: 12,
      title: "Demos",
      preview:
        form.demo_mode === "live"
          ? "Live shared tenant"
          : form.demo_mode === "custom_live"
            ? form.demo_tenant || "Live custom tenant"
            : "Default scripted demo",
      hasContent: form.demo_mode !== undefined && form.demo_mode !== "simulated",
    },
  ];

  /** Stage init: read #data= from URL on first render. If present,
   *  start in editing stage (bookmark continuation). Otherwise default
   *  to choose so empty /admin lands on the journey entry. SSR-safe via
   *  typeof window guard. */
  const [stage, setStage] = useState<Stage>(() => {
    if (typeof window === "undefined") return "choose";
    const m = window.location.hash.match(/data=([^&]+)/);
    return m ? "editing" : "choose";
  });
  /** Recommended order for progressive add. Sequence aligns with the
   *  AE's natural authoring path: identity → industry framing → which
   *  slides → pricing → packaging → delivery → narrative bits. The
   *  + Add next button below the active panel walks this list,
   *  skipping already-added entries. */
  const SECTION_ORDER: SectionId[] = [
    "company",
    "areas",
    "sections",
    "pricing",
    "invoice",
    "deployment",
    "requirements",
    "integrations",
    "notes",
    "cases",
    "custom",
    "demos",
  ];

  /** Which section ids are currently visible in the rail. Starts
   *  minimal (just `company`); the useEffect below auto-merges any
   *  section whose hasContent flag is true (so prefill / bookmark
   *  hydration "rains in" the relevant sections). User can also add
   *  manually via the + Add next button. We never auto-remove —
   *  removal stays a deliberate action. */
  const [addedSections, setAddedSections] = useState<SectionId[]>(["company"]);
  /** Active section in the editing rail. Used by commit 3+ to drive the
   *  single-active-panel render. */
  const [activeSection, setActiveSection] = useState<SectionId>("company");
  /** Generate menu open state — drives the traffic-light picker in commit 5. */
  const [showGenerateMenu, setShowGenerateMenu] = useState(false);
  /** Add-section picker open state — drives the rail's "+ Add" affordance
   *  in commit 8. */
  const [showAddPicker, setShowAddPicker] = useState(false);
  // Suppress unused-var warnings while these hooks are still partly
  // dormant. Drops as each commit consumes them. Commit 6 consumes
  // addedSections / setAddedSections (progressive rail).
  void showAddPicker;
  void setShowAddPicker;

  /* ─── Auto-populate addedSections from hasContent ───
   *  Any section whose hasContent flag flips true gets added to the
   *  rail. Source-of-truth for prefill (Pick known company), bookmark
   *  hydration (#data=...), and audience defaults that fill via
   *  side-effects. Never removes — explicit action only. */
  useEffect(() => {
    setAddedSections((prev) => {
      const inferred = SECTIONS_REGISTRY.filter((s) => s.hasContent).map((s) => s.id);
      let changed = false;
      const next = [...prev];
      for (const id of inferred) {
        if (!next.includes(id)) {
          next.push(id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    // SECTIONS_REGISTRY references the hasContent flags directly so
    // this effect implicitly tracks every flag change. Listing them
    // here is belt-and-braces in case a flag formula changes.
  }, [
    hasCompanyInfo,
    hasAreas,
    hasPricing,
    hasPricingConfig,
    hasDeployment,
    hasRequirements,
    hasIntegrations,
    hasNotes,
    hasSectionChanges,
    hasCustomCaseStudies,
    form.custom_section?.title,
    form.demo_mode,
  ]);

  /** Adds the next unfilled section in SECTION_ORDER. Returns the
   *  added id (for callers that want to setActiveSection).
   *
   *  Pro shortcut: once the AE has accumulated more than 3 sections
   *  (the recommended minimum: Company, Areas, Guide Sections) the
   *  next + click reveals ALL remaining sections at once instead of
   *  one-by-one. The rain-in animation staggers them across ~1s so
   *  the screen doesn't dump. Slow path stays one-at-a-time for
   *  newcomers who want to learn the catalogue. */
  const addNextSection = (): SectionId | null => {
    const remaining = SECTION_ORDER.filter((id) => !addedSections.includes(id));
    if (remaining.length === 0) return null;
    if (addedSections.length > 3) {
      // Reveal all remaining at once
      setAddedSections((prev) => [...prev, ...remaining]);
      setActiveSection(remaining[0]);
      return remaining[0];
    }
    // Reveal next one at a time
    const next = remaining[0];
    setAddedSections((prev) => [...prev, next]);
    setActiveSection(next);
    return next;
  };
  /** Suggested-next label shown in rail counter. */
  const nextSectionDef = SECTION_ORDER.map((id) =>
    SECTIONS_REGISTRY.find((s) => s.id === id),
  ).find((s) => s && !addedSections.includes(s.id));
  /** When the pro shortcut would trigger, the + button's label
   *  reflects that it's an "add the rest" action, not a single add. */
  const remainingCount = SECTION_ORDER.filter(
    (id) => !addedSections.includes(id),
  ).length;
  // Label fragment shown after the "+ Add " prefix in the rail. The
  // rail renders "Add {nextLabel}" so don't prefix with another "Add".
  const addNextLabel =
    addedSections.length > 3 && remainingCount > 1
      ? `${remainingCount} more`
      : nextSectionDef?.title;

  /* Rail items derived from SECTIONS_REGISTRY, filtered by
     addedSections. Pre-computed outside JSX so the layout block
     stays parser-clean. */
  const railItems: RailItemDescriptor[] = SECTIONS_REGISTRY.filter((s) =>
    addedSections.includes(s.id),
  ).map((s) => ({
    id: s.id,
    number: s.number,
    title: s.title,
    preview: s.preview,
    hasContent: s.hasContent,
  }));
  const handleJumpSection = (id: string) => {
    setActiveSection(id as SectionId);
  };

  return (
    <div className="min-h-screen bg-boost-surface">
      {/* Audience banner — renders for any audience routed from the
          landing page (Sales / CE / PS). Bare /admin without any
          ?audience param stays banner-free, preserving every existing
          bookmark. The strip is non-sticky so it scrolls away on
          content; the "Change mode" link is always reachable by
          scrolling back to top or re-visiting /. */}
      {audience ? (
        <div className="bg-boost-purple text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 rounded-full bg-boost-green-light flex-shrink-0"
              />
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] truncate">
                {audience === "sales"
                  ? "Sales mode"
                  : audience === "customer-excellence"
                  ? "Customer Excellence mode"
                  : "Professional Services mode"}
                <span className="text-white/50 mx-2">·</span>
                <span className="text-white/70 normal-case tracking-normal font-normal">
                  {audience === "sales"
                    ? "Prospect-facing guide assembly."
                    : audience === "customer-excellence"
                    ? "Post-sale reviews, success planning, inspiration."
                    : "Scoping, architecture, delivery."}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Global currency picker — drives every money display
                  across ROI / Impact / Commercial / SoW. Separate
                  from per-conversation cost so Nordic tenants get
                  "kr" where they expect it. */}
              <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">
                <span>Currency</span>
                <select
                  aria-label="Currency"
                  value={form.currency ?? ""}
                  onChange={(e) =>
                    updateField(
                      "currency",
                      (e.target.value || undefined) as GuideFormData["currency"],
                    )
                  }
                  className="bg-white/10 text-white text-[11px] font-semibold uppercase tracking-[0.14em] rounded-sm px-2 py-0.5 border border-white/20 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 focus-visible:ring-offset-boost-purple"
                >
                  <option value="" className="text-boost-dark">Auto</option>
                  {CURRENCY_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code} className="text-boost-dark">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <Link
                href="/"
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 focus-visible:ring-offset-boost-purple rounded-sm px-2 py-0.5 whitespace-nowrap"
              >
                ← Change mode
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* Header */}
      <header className="border-b border-boost-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/"
              aria-label="Back to workspace picker"
              className="flex-shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 hover:opacity-80 transition-opacity"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={assetPath("/brand/boost_logo_purple-_main.svg")}
                alt="boost.ai"
                className="h-5 sm:h-6 w-auto"
              />
            </Link>
          </div>
          {/* Top-bar action — single Generate Engagement button. Gate:
              renders only on editing stage AND when canGenerate is true
              (company name or areas of interest filled). All output
              variants (Presentation / SoW PDF / Interactive Engagement)
              live in the picker that opens from this button. CRM
              imports (Salesforce / HubSpot) moved into Company
              Information's body. Choose / custom-entry stages hide
              this entirely so the chrome stays quiet during entry. */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {stage === "editing" && canGenerate ? (
              <button
                type="button"
                onClick={() => setShowGenerateMenu(true)}
                className="px-3 sm:px-4 py-2 bg-boost-purple-deeper text-white text-[11px] font-bold uppercase tracking-[0.16em] rounded-lg hover:bg-boost-purple transition-colors shadow-sm flex items-center gap-1.5"
              >
                <span>Generate engagement</span>
                <span aria-hidden="true">→</span>
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {stage === "choose" ? (
        <ChooseStage
          onPickPrefill={() => setStage("editing")}
          onPickCustom={() => setStage("custom-entry")}
        />
      ) : null}

      {stage === "custom-entry" ? (
        <CustomEntryStage
          industries={INDUSTRIES.filter((i) => !HIDDEN_INDUSTRIES.has(i.key))}
          onCreate={(fields) => {
            setForm((prev) => ({
              ...prev,
              company_name: fields.name,
              company_url: fields.domain,
              areas_of_interest: fields.industryKey
                ? Array.from(new Set([...(prev.areas_of_interest || []), fields.industryKey]))
                : prev.areas_of_interest,
            }));
            setStage("editing");
            // If they picked an industry but no name, land them on areas
            // so the rail makes the customer-label fallback obvious.
            setActiveSection(fields.name ? "company" : (fields.industryKey ? "areas" : "company"));
          }}
          onBack={() => setStage("choose")}
        />
      ) : null}

      {stage === "editing" ? (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex gap-6 items-start">
        <Rail
          items={railItems}
          active={activeSection}
          onJump={handleJumpSection}
          onAddNext={nextSectionDef ? addNextSection : undefined}
          nextLabel={addNextLabel}
          customer={{
            name: form.company_name,
            logoUrl: prefilledLogo,
            domain: form.company_url,
            // Category line: prefill summary if available (e.g.
            // "Insurance · mutual"), otherwise the first selected
            // industry's label, otherwise undefined (header skips line).
            category:
              prefilledSummary ||
              (form.areas_of_interest?.length
                ? INDUSTRIES.find((i) => i.key === form.areas_of_interest[0])?.label
                : undefined) ||
              undefined,
          }}
        />
      <main className="flex-1 min-w-0 space-y-4">
        {/* Sections 1 + 2 are SHARED customer metadata \u2014 rendered
            for every audience. Company identity, contact, start date,
            and the customer's vertical drive block defaults (agenda
            mentions the company name; SWOT frames around the industry;
            benchmarking cohort filters by vertical). Without these
            fields populated the CE blocks pre-fill with placeholders
            and the generated guide reads generic. */}

        {/* 1 — Company Info */}
        {activeSection === "company" ? (
        <CollapsibleSection
          number={1}
          title="Company Information"
          hasContent={hasCompanyInfo}
          defaultOpen={true}
        >
          {/* Pattern-library quick prefill */}
          <div className="mb-5 pb-5 border-b border-boost-border">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <CompanySearch onApply={applyCompanyPattern} />
              </div>
              <button
                type="button"
                onClick={() => setShowSearchLog(true)}
                className="text-[11px] text-boost-muted hover:text-boost-dark transition-colors flex-shrink-0 mt-2.5 px-2 py-1 rounded hover:bg-boost-surface"
                title="Review company searches made on this browser"
              >
                <span className="inline-flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3h18v18H3z M3 9h18 M9 21V9" />
                  </svg>
                  Search log
                </span>
              </button>
            </div>
            {/* CRM imports — pull customer data from Salesforce or
                HubSpot into the form. Push (export back to CRM) lives
                in the Generate menu. Two-way split is intentional:
                pull-from is metadata-stage, push-to is delivery-stage. */}
            <div className="flex items-center gap-2 flex-wrap mt-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-boost-muted/80">
                Import from
              </span>
              <button
                type="button"
                onClick={() => setShowSalesforce(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-boost-border/80 bg-white text-boost-muted text-[10px] font-semibold uppercase tracking-[0.14em] hover:text-boost-dark hover:border-boost-purple/40 transition-colors"
              >
                <span aria-hidden="true" className="w-1 h-1 rounded-full bg-boost-orange/70" />
                Salesforce
              </button>
              <button
                type="button"
                onClick={() => setShowHubspot(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-boost-border/80 bg-white text-boost-muted text-[10px] font-semibold uppercase tracking-[0.14em] hover:text-boost-dark hover:border-boost-purple/40 transition-colors"
              >
                <span aria-hidden="true" className="w-1 h-1 rounded-full bg-boost-orange/70" />
                HubSpot
              </button>
            </div>
          </div>

          {/* Customer Dossier — visual brief that builds itself from prefill or manual entry */}
          <CustomerDossierCard
            companyName={form.company_name}
            companyUrl={form.company_url}
            contactName={form.contact_name}
            contactRole={form.contact_role}
            startDate={form.start_date}
            logoUrl={prefilledLogo}
            summary={prefilledSummary}
            prefilledLabel={lastPrefilled}
            onDismissPrefill={dismissPrefillChip}
          />

          {/* Edit details — raw text inputs. Open by default when form is empty
              (newbies land here), closed by default when a prefill has run.
              `open` is uncontrolled after mount: if we kept it bound to
              `!form.company_name`, the disclosure would auto-close on the
              first keystroke and yank focus from the input. Plain `open`
              attribute (boolean, no value) sets initial state only —
              browser handles toggle from there. */}
          <details
            className="group mt-4 rounded-lg border border-boost-border/60 bg-boost-surface/20"
            open
          >
            <summary className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium text-boost-dark/80 cursor-pointer hover:text-boost-dark select-none list-none">
              <span className="inline-flex items-center gap-2">
                <svg
                  className="w-3.5 h-3.5 text-boost-muted transition-transform group-open:rotate-90"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                Edit details
              </span>
              <span className="text-[11px] font-normal text-boost-muted">
                Company, contact, kickoff date
              </span>
            </summary>
            <div className="p-4 border-t border-boost-border/60 bg-white rounded-b-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Company Name *</FieldLabel>
                  <input
                    type="text"
                    value={form.company_name}
                    onChange={(e) => updateField("company_name", e.target.value)}
                    placeholder="e.g. Hartford Insurance"
                    className={inputClass}
                  />
                </div>
                <div>
                  <FieldLabel optional>Company Website</FieldLabel>
                  <input
                    type="url"
                    value={form.company_url}
                    onChange={(e) => updateField("company_url", e.target.value)}
                    placeholder="https://example.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <FieldLabel optional>Contact Name</FieldLabel>
                  <input
                    type="text"
                    value={form.contact_name}
                    onChange={(e) => updateField("contact_name", e.target.value)}
                    placeholder="e.g. Jane Smith"
                    className={inputClass}
                  />
                </div>
                <div>
                  <FieldLabel optional>Contact Role</FieldLabel>
                  <input
                    type="text"
                    value={form.contact_role}
                    onChange={(e) => updateField("contact_role", e.target.value)}
                    placeholder="e.g. VP Customer Experience"
                    className={inputClass}
                  />
                </div>
                <div>
                  <FieldLabel>Projected Start Date</FieldLabel>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => updateField("start_date", e.target.value)}
                    className={`${inputClass} max-w-xs`}
                  />
                  <p className="text-xs text-boost-muted mt-1">
                    Sets the starting point for the implementation roadmap
                  </p>
                </div>
              </div>
            </div>
          </details>
        </CollapsibleSection>
        ) : null}

        {/* 2 — Areas of Interest */}
        {activeSection === "areas" ? (
        <CollapsibleSection
          number={2}
          title="Areas of Interest"
          subtitle={
            hasAreas
              ? `${form.areas_of_interest.length} area${form.areas_of_interest.length > 1 ? "s" : ""} selected`
              : "If none selected, all will be shown"
          }
          hasContent={hasAreas}
        >
          <AdminPrompt
            question="Which industries does this customer operate in?"
            helper="Grouped by vertical. Leave empty for a general financial-services guide."
          />

          <div className="space-y-1.5">
            {INDUSTRY_CATEGORIES.map((cat) => {
              const industriesInCat = INDUSTRIES.filter(
                (ind) => ind.category === cat.key && !HIDDEN_INDUSTRIES.has(ind.key),
              );
              if (industriesInCat.length === 0) return null;
              const selectedInCat = industriesInCat.filter((ind) =>
                form.areas_of_interest.includes(ind.key),
              );
              const shouldOpen = cat.defaultOpen || selectedInCat.length > 0;
              return (
                <details
                  key={cat.key}
                  open={shouldOpen}
                  className="group rounded-lg border border-boost-border/60 bg-boost-surface/20"
                >
                  <summary className="flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer hover:bg-boost-surface/40 rounded-lg transition-colors select-none list-none">
                    <span className="inline-flex items-center gap-2 min-w-0">
                      <svg
                        className="w-3 h-3 text-boost-muted transition-transform group-open:rotate-90 flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                      <span className="text-[10px] font-semibold text-boost-muted uppercase tracking-[0.18em] truncate">
                        {cat.label}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      {selectedInCat.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-boost-green uppercase tracking-[0.14em]">
                          <span className="w-1 h-1 rounded-full bg-boost-green-light" />
                          {selectedInCat.length} picked
                        </span>
                      )}
                      <span className="text-[10px] text-boost-muted/70 tabular-nums">
                        {selectedInCat.length}/{industriesInCat.length}
                      </span>
                    </span>
                  </summary>
                  <div className="px-3 pb-3 pt-1">
                    <AdminChipRow>
                      {industriesInCat.map((ind) => (
                        <AdminChip
                          key={ind.key}
                          active={form.areas_of_interest.includes(ind.key)}
                          onClick={() => toggleArea(ind.key)}
                          title={ind.description}
                        >
                          {ind.label}
                        </AdminChip>
                      ))}
                    </AdminChipRow>
                  </div>
                </details>
              );
            })}
          </div>

          {/* Variant chips per active industry — secondary tone (purple). */}
          {form.areas_of_interest
            .filter((areaKey) => INDUSTRY_VARIANTS[areaKey]?.length)
            .map((areaKey) => {
              const industry = INDUSTRIES.find((i) => i.key === areaKey);
              const variants = INDUSTRY_VARIANTS[areaKey] || [];
              const selectedForIndustry = (form.selected_variants || []).filter((v) =>
                variants.some((iv) => iv.key === v),
              );
              return (
                <div key={`variants-${areaKey}`}>
                  <AdminPrompt
                    divider
                    question={`${industry?.label} · Variant`}
                    action={
                      selectedForIndustry.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            updateField(
                              "selected_variants",
                              (form.selected_variants || []).filter(
                                (v) => !variants.some((iv) => iv.key === v),
                              ),
                            )
                          }
                          className="text-[10px] text-boost-muted hover:text-boost-dark transition-colors uppercase tracking-[0.14em]"
                        >
                          Clear
                        </button>
                      )
                    }
                  />
                  <AdminChipRow>
                    {variants.map((v) => (
                      <AdminChip
                        key={v.key}
                        active={(form.selected_variants || []).includes(v.key)}
                        onClick={() => toggleVariant(v.key)}
                        title={v.description}
                        tone="secondary"
                      >
                        {v.label}
                      </AdminChip>
                    ))}
                  </AdminChipRow>
                </div>
              );
            })}
        </CollapsibleSection>
        ) : null}

        {/* 3 — Pricing & Costs */}
        {activeSection === "pricing" ? (
        <CollapsibleSection
          number={3}
          title="Pricing Model & ROI Inputs"
          subtitle={
            hasPricing
              ? `${PRICING_MODELS.find((p) => p.key === form.pricing_model)?.label} · ${form.conversation_cost}`
              : "Pricing model, conversation cost, FTE capacity — feeds the ROI math"
          }
          hasContent={hasPricing}
        >
          <AdminPrompt
            question="How are they priced today?"
            helper="Shapes the ROI story we show the customer."
          />
          <AdminChipRow>
            {PRICING_MODELS.map((pm) => (
              <AdminChip
                key={pm.key}
                active={form.pricing_model === pm.key}
                onClick={() => updateField("pricing_model", pm.key)}
                title={pm.description}
              >
                {pm.label}
              </AdminChip>
            ))}
          </AdminChipRow>

          <AdminPrompt
            divider
            question="What does one conversation cost today?"
            helper="Current average, including agent time and overhead. Used as the ROI baseline."
          />
          <input
            type="text"
            value={form.conversation_cost}
            onChange={(e) => updateField("conversation_cost", e.target.value)}
            placeholder="e.g. $8.50, 55 NOK, €6.20"
            className={`${inputClass} max-w-xs`}
          />

          <AdminPrompt
            divider
            question="How many conversations does one human FTE handle per month?"
            helper="Tunes the FTE-equivalent figure in ROI to the customer's own productivity. Leave blank to use the 1,500/mo industry average."
          />
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              min={100}
              step={100}
              value={form.fte_capacity_per_month ?? ""}
              onChange={(e) =>
                updateField(
                  "fte_capacity_per_month",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              placeholder="1,500"
              className={`${inputClass} max-w-[160px]`}
            />
            <span className="text-[11px] text-boost-muted">conversations / FTE / month</span>
          </div>

          <AdminPrompt
            divider
            question="Months to reach target automation rate?"
            helper="Linear ramp from 0% to the target. Impact will show the Year-1 weighted average instead of steady-state. Leave blank for an immediate steady-state story."
          />
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              min={0}
              max={24}
              step={1}
              value={form.automation_ramp_months ?? ""}
              onChange={(e) =>
                updateField(
                  "automation_ramp_months",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              placeholder="0"
              className={`${inputClass} max-w-[160px]`}
            />
            <span className="text-[11px] text-boost-muted">months to reach target</span>
          </div>

          <p className="mt-6 text-[11px] text-boost-muted leading-relaxed">
            The line-item Commercial invoice (Chat tiers, Voice, Success Package, add-ons, integrations) lives in
            <span className="font-semibold text-boost-dark"> Section 4 · Commercial Invoice Builder</span>.
          </p>
        </CollapsibleSection>
        ) : null}

        {/* 4 — Commercial Invoice Builder (2026) */}
        {activeSection === "invoice" ? (
        <CollapsibleSection
          number={4}
          title="Commercial Invoice Builder (2026)"
          subtitle={
            hasPricingConfig
              ? "Populated — Commercial section will render a line-item invoice"
              : "Optional — populate to render the 2026 line-item invoice"
          }
          hasContent={hasPricingConfig}
          autoOpenOnContent={false}
        >
          <p className="text-[11px] text-boost-muted leading-relaxed mb-5 max-w-prose">
            Each block below is independent — leave empty to skip that line on the invoice.
            Prices flow from <code className="px-1 py-0.5 rounded bg-boost-surface text-[10px]">src/data/pricing-2026.ts</code>;
            updating that file updates every label here.
          </p>

          {/* Chat VAs */}
          <AdminMiniLabel>Virtual agents</AdminMiniLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 mb-6">
            <div>
              <p className="text-[10px] text-boost-muted">External chat VAs</p>
              <input
                type="number"
                min={0}
                value={form.pricing_config?.chat_va_external ?? ""}
                onChange={(e) => updatePricingConfig("chat_va_external", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0"
                className={`${inputClass} mt-1`}
              />
            </div>
            <div>
              <p className="text-[10px] text-boost-muted">Internal chat VAs</p>
              <input
                type="number"
                min={0}
                value={form.pricing_config?.chat_va_internal ?? ""}
                onChange={(e) => updatePricingConfig("chat_va_internal", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0"
                className={`${inputClass} mt-1`}
              />
            </div>
            <div>
              <p className="text-[10px] text-boost-muted">Voice VAs</p>
              <input
                type="number"
                min={0}
                value={form.pricing_config?.voice_va ?? ""}
                onChange={(e) => updatePricingConfig("voice_va", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0"
                className={`${inputClass} mt-1`}
              />
            </div>
          </div>

          {/* Chat volume */}
          <AdminMiniLabel>Chat volumes</AdminMiniLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 mb-6">
            <div>
              <p className="text-[10px] text-boost-muted">Expected monthly conversations</p>
              <input
                type="number"
                min={0}
                value={form.pricing_config?.chat_expected_monthly ?? ""}
                onChange={(e) => updatePricingConfig("chat_expected_monthly", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="25,000"
                className={`${inputClass} mt-1`}
              />
            </div>
            <div>
              <p className="text-[10px] text-boost-muted">Committed monthly (10% discount)</p>
              <input
                type="number"
                min={0}
                value={form.pricing_config?.chat_committed_monthly ?? ""}
                onChange={(e) => updatePricingConfig("chat_committed_monthly", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="20,000"
                className={`${inputClass} mt-1`}
              />
            </div>
          </div>

          {/* Voice service + volume */}
          <AdminMiniLabel>Voice volumes & service</AdminMiniLabel>
          <div className="mt-2 mb-6 space-y-3">
            <AdminChipRow>
              {(["enterprise", "express"] as const).map((svc) => (
                <AdminChip
                  key={svc}
                  active={(form.pricing_config?.voice_service ?? "enterprise") === svc}
                  onClick={() => updatePricingConfig("voice_service", svc)}
                >
                  {svc === "enterprise" ? "Enterprise" : "Express"}
                </AdminChip>
              ))}
            </AdminChipRow>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-boost-muted">Expected monthly minutes</p>
                <input
                  type="number"
                  min={0}
                  value={form.pricing_config?.voice_expected_monthly ?? ""}
                  onChange={(e) => updatePricingConfig("voice_expected_monthly", e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="100,000"
                  className={`${inputClass} mt-1`}
                />
              </div>
              <div>
                <p className="text-[10px] text-boost-muted">Committed monthly (10% discount)</p>
                <input
                  type="number"
                  min={0}
                  value={form.pricing_config?.voice_committed_monthly ?? ""}
                  onChange={(e) => updatePricingConfig("voice_committed_monthly", e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="80,000"
                  className={`${inputClass} mt-1`}
                />
              </div>
            </div>
          </div>

          {/* Success package */}
          <AdminMiniLabel>Enterprise Success Package</AdminMiniLabel>
          <div className="mt-2 mb-6">
            <AdminChipRow>
              {SUCCESS_PACKAGES.map((pkg) => (
                <AdminChip
                  key={pkg.key}
                  active={(form.pricing_config?.success_package ?? "none") === pkg.key}
                  onClick={() => updatePricingConfig("success_package", pkg.key)}
                  title={pkg.blurb}
                >
                  {pkg.key === "none"
                    ? "None"
                    : `${pkg.label.replace(" Success Package", "")} · $${pkg.monthlyPrice.toLocaleString()}/mo`}
                </AdminChip>
              ))}
            </AdminChipRow>
          </div>

          {/* Environments */}
          <AdminMiniLabel>Environments</AdminMiniLabel>
          <div className="mt-2 mb-6">
            <AdminChipRow>
              {ENVIRONMENT_ADDONS.map((env) => {
                const current = form.pricing_config?.environments ?? [];
                const active = current.includes(env.key);
                return (
                  <AdminChip
                    key={env.key}
                    active={active}
                    onClick={() => {
                      const next = active
                        ? current.filter((k) => k !== env.key)
                        : [...current, env.key];
                      updatePricingConfig("environments", next);
                    }}
                    title={env.blurb}
                  >
                    {`${env.label} · $${env.monthlyPrice.toLocaleString()}/mo`}
                  </AdminChip>
                );
              })}
            </AdminChipRow>
          </div>

          {/* Human Chat + VAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <AdminMiniLabel>Human Chat</AdminMiniLabel>
              <div className="mt-2 flex items-center gap-2">
                <AdminChip
                  active={!!form.pricing_config?.human_chat_enabled}
                  onClick={() => updatePricingConfig("human_chat_enabled", !form.pricing_config?.human_chat_enabled)}
                >
                  {form.pricing_config?.human_chat_enabled ? "Enabled" : "Off"}
                </AdminChip>
                {form.pricing_config?.human_chat_enabled && (
                  <input
                    type="number"
                    min={HUMAN_CHAT_INCLUDED_SEATS}
                    value={form.pricing_config?.human_chat_users ?? HUMAN_CHAT_INCLUDED_SEATS}
                    onChange={(e) => updatePricingConfig("human_chat_users", e.target.value ? Number(e.target.value) : HUMAN_CHAT_INCLUDED_SEATS)}
                    placeholder="users"
                    className={`${inputClass} max-w-[110px]`}
                  />
                )}
              </div>
              <p className="text-[10px] text-boost-muted mt-1.5">
                ${HUMAN_CHAT_BASE_PRICE.toLocaleString()} base ({HUMAN_CHAT_INCLUDED_SEATS} seats) + ${HUMAN_CHAT_PRICE_PER_EXTRA_SEAT}/extra seat
              </p>
            </div>
            <div>
              <AdminMiniLabel>VA Orchestration (VAN)</AdminMiniLabel>
              <div className="mt-2">
                <AdminChip
                  active={!!form.pricing_config?.van_enabled}
                  onClick={() => updatePricingConfig("van_enabled", !form.pricing_config?.van_enabled)}
                >
                  {form.pricing_config?.van_enabled ? `Enabled · $${VAN_PRICE.toLocaleString()}/mo` : "Off"}
                </AdminChip>
              </div>
            </div>
          </div>

          {/* Integrations by tier */}
          <AdminMiniLabel>Integrations by tier (count per type)</AdminMiniLabel>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
            {INTEGRATION_TIERS.map((it) => (
              <div key={it.key} className="rounded-lg border border-boost-border bg-white p-3">
                <p className="text-[10px] font-semibold text-boost-dark">{it.label}</p>
                <p className="text-[9px] text-boost-muted mt-0.5">${it.monthlyPrice}/mo each</p>
                <input
                  type="number"
                  min={0}
                  value={form.pricing_config?.integrations_by_tier?.[it.key] ?? ""}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined;
                    updatePricingConfig("integrations_by_tier", {
                      ...(form.pricing_config?.integrations_by_tier ?? {}),
                      [it.key]: val,
                    });
                  }}
                  placeholder="0"
                  className={`${inputClass} mt-2`}
                />
              </div>
            ))}
          </div>
        </CollapsibleSection>
        ) : null}

        {/* 5 — Deployment & Resources */}
        {activeSection === "deployment" ? (
        <CollapsibleSection
          number={5}
          title="Deployment & Resources"
          subtitle={
            hasDeployment
              ? `${form.deployment_markets} market${form.deployment_markets > 1 ? "s" : ""} · ${
                  (form.resources.stakeholder_owners || 0) +
                  (form.resources.ai_trainers || 0) +
                  (form.resources.technical_resources || 0)
                } FTEs`
              : "Markets, team capacity and stakeholders"
          }
          hasContent={hasDeployment}
        >
          <AdminPrompt
            question="How many markets do they cover?"
            helper="Drives timeline and localisation scope in the roadmap."
          />
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={30}
              value={form.deployment_markets}
              onChange={(e) =>
                updateField("deployment_markets", parseInt(e.target.value))
              }
              className="flex-1 accent-boost-green-light"
            />
            <span className="inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-md text-sm font-bold tabular-nums bg-boost-green-light text-white">
              {form.deployment_markets}
            </span>
          </div>

          <AdminPrompt
            divider
            question="Who's available internally?"
            helper="Count real FTEs the customer can dedicate — not aspiration."
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {([
              {
                key: "stakeholder_owners" as const,
                label: "Stakeholder owners",
                hint: "Executive sponsors, project owners",
              },
              {
                key: "ai_trainers" as const,
                label: "AI trainers",
                hint: "Work in the platform daily",
              },
              {
                key: "technical_resources" as const,
                label: "Technical resources",
                hint: "Developers, integration engineers",
              },
            ]).map((r) => (
              <div key={r.key}>
                <AdminMiniLabel>{r.label}</AdminMiniLabel>
                <input
                  type="number"
                  min={0}
                  value={form.resources[r.key] ?? ""}
                  onChange={(e) =>
                    updateResource(
                      r.key,
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  placeholder="0"
                  className={`${inputClass} mt-1.5 tabular-nums`}
                />
                <p className="text-[11px] text-boost-muted/70 mt-1 leading-snug">
                  {r.hint}
                </p>
              </div>
            ))}
          </div>

          <AdminPrompt
            divider
            question="Which departments are involved?"
            helper="Optional — signals how cross-functional the rollout will be."
          />
          <AdminChipRow>
            {SUPPORTING_DEPARTMENTS.map((dept) => (
              <AdminChip
                key={dept}
                active={form.resources.supporting_departments?.includes(dept) ?? false}
                onClick={() => toggleDepartment(dept)}
              >
                {dept}
              </AdminChip>
            ))}
          </AdminChipRow>

          <AdminPrompt
            divider
            question="Do they have a knowledge-base lead?"
            helper="Dedicated person(s) managing KB content — a strong signal for self-improvement adoption."
          />
          <label className="inline-flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              onClick={() =>
                updateResource(
                  "knowledge_management",
                  !form.resources.knowledge_management,
                )
              }
              aria-pressed={form.resources.knowledge_management ?? false}
              className={`w-10 h-6 rounded-full transition-colors relative p-0 border-0 shrink-0 ${
                form.resources.knowledge_management
                  ? "bg-boost-green-light"
                  : "bg-boost-border"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  form.resources.knowledge_management
                    ? "translate-x-4"
                    : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm font-medium text-boost-dark">
              {form.resources.knowledge_management ? "Yes, KB owner in place" : "No dedicated KB owner"}
            </span>
          </label>
        </CollapsibleSection>
        ) : null}

        {/* 5 — Requirements & Volumes */}
        {activeSection === "requirements" ? (
        <CollapsibleSection
          number={6}
          title="Requirements & Volumes"
          subtitle={
            hasRequirements
              ? "Data added"
              : "Optional — channel volumes and specific needs"
          }
          hasContent={hasRequirements}
        >
          <AdminPrompt
            question="How much do they handle each month?"
            helper="Total monthly conversation volume per channel. Use single rollup for one market or a quick estimate; switch to per-market when the customer spans multiple regions and you want each one named in the deck."
            action={
              <div className="flex items-center gap-1 rounded-full border border-boost-border bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => form.market_volumes && disablePerMarket()}
                  className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] rounded-full transition-colors ${
                    !form.market_volumes
                      ? "bg-boost-purple text-white"
                      : "text-boost-muted hover:text-boost-dark"
                  }`}
                >
                  Single rollup
                </button>
                <button
                  type="button"
                  onClick={() => !form.market_volumes && enablePerMarket()}
                  className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] rounded-full transition-colors ${
                    form.market_volumes
                      ? "bg-boost-purple text-white"
                      : "text-boost-muted hover:text-boost-dark"
                  }`}
                >
                  Per-market
                </button>
              </div>
            }
          />

          {!form.market_volumes ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {([
                { key: "chat" as const, label: "Chat" },
                { key: "voice" as const, label: "Voice" },
                { key: "email" as const, label: "Email" },
                { key: "social" as const, label: "Social" },
              ]).map((ch) => (
                <div key={ch.key}>
                  <AdminMiniLabel>{ch.label}</AdminMiniLabel>
                  <div className="relative mt-1.5">
                    <input
                      type="number"
                      value={form.channel_volumes[ch.key] || ""}
                      onChange={(e) => updateVolume(ch.key, e.target.value)}
                      placeholder="0"
                      className={`${inputClass} tabular-nums pr-10`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-boost-muted/70 uppercase tracking-[0.14em] pointer-events-none">
                      /mo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {form.market_volumes.map((market, idx) => (
                <div
                  key={market.key}
                  className="rounded-xl border border-boost-border bg-white p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-boost-surface text-boost-muted text-[10px] font-bold tabular-nums">
                      {idx + 1}
                    </span>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-2">
                      <input
                        type="text"
                        value={market.name}
                        onChange={(e) => updateMarketField(market.key, "name", e.target.value)}
                        placeholder="Market name (e.g. Sweden)"
                        className={`${inputClass}`}
                      />
                      <input
                        type="text"
                        value={market.country ?? ""}
                        onChange={(e) =>
                          updateMarketField(market.key, "country", e.target.value.toUpperCase().slice(0, 2))
                        }
                        placeholder="ISO (SE)"
                        maxLength={2}
                        className={`${inputClass} tabular-nums uppercase tracking-wide`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMarket(market.key)}
                      aria-label={`Remove ${market.name || "market"}`}
                      className="mt-1 w-8 h-8 rounded-full text-boost-muted hover:bg-boost-surface hover:text-boost-dark transition-colors flex items-center justify-center text-[14px]"
                      title="Remove market"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pl-9">
                    {([
                      { key: "chat" as const, label: "Chat" },
                      { key: "voice" as const, label: "Voice" },
                      { key: "email" as const, label: "Email" },
                      { key: "social" as const, label: "Social" },
                    ]).map((ch) => (
                      <div key={ch.key}>
                        <p className="text-[9px] font-semibold text-boost-muted uppercase tracking-[0.14em]">{ch.label}</p>
                        <div className="relative mt-1">
                          <input
                            type="number"
                            value={market.volumes[ch.key] || ""}
                            onChange={(e) => updateMarketVolume(market.key, ch.key, e.target.value)}
                            placeholder="0"
                            className={`${inputClass} tabular-nums pr-9 text-[13px]`}
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-boost-muted/70 uppercase tracking-[0.14em] pointer-events-none">
                            /mo
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={addMarket}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-boost-border text-boost-purple hover:bg-boost-purple hover:text-white hover:border-boost-purple transition-colors text-[11px] font-semibold uppercase tracking-[0.14em]"
                >
                  <span aria-hidden>+</span>
                  Add market
                </button>

                <div className="text-right">
                  <p className="text-[9px] font-semibold text-boost-muted uppercase tracking-[0.16em]">
                    Rollup
                  </p>
                  <p className="text-[11px] text-boost-dark tabular-nums">
                    {(["chat", "voice", "email", "social"] as const)
                      .map((ch) => {
                        const v = form.channel_volumes[ch];
                        if (!v) return null;
                        return `${ch} ${v.toLocaleString()}`;
                      })
                      .filter(Boolean)
                      .join(" · ") || "0"}
                    {" /mo"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <AdminPrompt
            divider
            question="Anything specific they've asked for?"
            helper="Optional — regulatory asks, specific channels, languages, timelines, deal-breakers."
          />
          <textarea
            value={form.specific_requirements}
            onChange={(e) =>
              updateField("specific_requirements", e.target.value)
            }
            placeholder="e.g. Needs GDPR audit package by Q3, Norwegian language on day one, Genesys voice handover from week 2…"
            rows={3}
            className={`${inputClass} resize-none leading-relaxed`}
          />
        </CollapsibleSection>
        ) : null}

        {/* 6 — Integrations */}
        {activeSection === "integrations" ? (
        <CollapsibleSection
          number={7}
          title="Backend Systems & Integrations"
          subtitle={
            hasIntegrations
              ? `${totalIntegrations} selected`
              : "Optional — select known integrations"
          }
          hasContent={hasIntegrations}
        >
          <AdminPrompt
            question="Which systems do they already use?"
            helper="Integrations we map for the SOW. Categories are collapsed — expand what applies."
          />

          {/* Compact summary strip: total selected across all categories */}
          {totalIntegrations > 0 && (
            <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em]">
              <span className="w-1.5 h-1.5 rounded-full bg-boost-green-light" />
              <span className="text-boost-dark tabular-nums">{totalIntegrations}</span>
              <span className="text-boost-muted">selected</span>
            </div>
          )}

          <div className="space-y-1.5">
            {INTEGRATION_CATEGORIES.map((cat) => {
              const selected = (form.integrations[
                cat.key as keyof IntegrationSelections
              ] || []) as string[];
              const total = cat.items.length;
              return (
                <details
                  key={cat.key}
                  open={selected.length > 0}
                  className="group rounded-lg border border-boost-border/60 bg-boost-surface/20"
                >
                  <summary className="flex items-center justify-between gap-2 px-3 py-2.5 cursor-pointer hover:bg-boost-surface/40 rounded-lg transition-colors select-none list-none">
                    <span className="inline-flex items-center gap-2 min-w-0">
                      <svg
                        className="w-3 h-3 text-boost-muted transition-transform group-open:rotate-90 flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                      <span className="text-[10px] font-semibold text-boost-muted uppercase tracking-[0.18em] truncate">
                        {cat.label}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      {selected.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-boost-green uppercase tracking-[0.14em]">
                          <span className="w-1 h-1 rounded-full bg-boost-green-light" />
                          {selected.length} picked
                        </span>
                      )}
                      <span className="text-[10px] text-boost-muted/70 tabular-nums">
                        {selected.length}/{total}
                      </span>
                    </span>
                  </summary>
                  <div className="px-3 pb-3 pt-1 space-y-2">
                    <AdminChipRow>
                      {cat.items.map((item) => {
                        const active = selected.includes(item.name);
                        return (
                          <AdminChip
                            key={item.name}
                            active={active}
                            onClick={() => toggleIntegration(cat.key, item.name)}
                            title={item.description}
                          >
                            {item.name}
                            {item.tags?.includes("beta") && (
                              <span className={`ml-0.5 text-[9px] font-bold ${active ? "text-white/70" : "text-boost-muted/60"}`}>
                                β
                              </span>
                            )}
                          </AdminChip>
                        );
                      })}
                      {(() => {
                        const otherVal =
                          form.integrations.other?.[
                            cat.key as "channel" | "human_handover" | "openid" | "utility" | "voice"
                          ];
                        const otherActive = otherVal !== undefined;
                        return (
                          <AdminChip
                            active={otherActive}
                            onClick={() => toggleIntegrationOther(cat.key)}
                            title={
                              otherActive
                                ? "Remove the free-text field"
                                : "Add a free-text field for tools not in this list"
                            }
                          >
                            Other…
                          </AdminChip>
                        );
                      })()}
                    </AdminChipRow>
                    {(() => {
                      const key = cat.key as
                        | "channel"
                        | "human_handover"
                        | "openid"
                        | "utility"
                        | "voice";
                      const otherVal = form.integrations.other?.[key];
                      if (otherVal === undefined) return null;
                      return (
                        <input
                          type="text"
                          value={otherVal}
                          onChange={(e) => setIntegrationOther(cat.key, e.target.value)}
                          placeholder={`Other ${cat.label.toLowerCase()} — comma-separated, free text`}
                          className={`${inputClass} text-[12px]`}
                          autoFocus
                        />
                      );
                    })()}
                  </div>
                </details>
              );
            })}
          </div>
        </CollapsibleSection>
        ) : null}

        {/* 7 — Notes */}
        {activeSection === "notes" ? (
        <CollapsibleSection
          number={8}
          title="Additional Notes"
          subtitle={hasNotes ? "Notes added" : "Optional — extra context"}
          hasContent={hasNotes}
        >
          <AdminPrompt
            question="What else should I know about this deal?"
            helper="Optional — incumbent vendors, political sensitivities, champion context, anything that didn't fit above."
          />
          <textarea
            value={form.custom_notes}
            onChange={(e) => updateField("custom_notes", e.target.value)}
            placeholder="e.g. Procurement runs a 90-day cycle, champion is the CTO, previous bot vendor was Intercom and it underperformed…"
            rows={4}
            className={`${inputClass} resize-none leading-relaxed`}
          />
        </CollapsibleSection>
        ) : null}

        {/* 8 — Guide Sections */}
        {activeSection === "sections" ? (
        <div ref={guideSectionsRef} className="scroll-mt-20">
        <CollapsibleSection
          number={9}
          title="Guide Sections"
          subtitle={
            hasSectionChanges
              ? `${selectedSectionIds.length} of ${sectionItems.length} sections · ~${estimatedReadTime} min`
              : `${sectionItems.length} sections · ~${estimatedReadTime} min`
          }
          hasContent={hasSectionChanges}
          autoOpenOnContent={false}
          openSignal={guideSectionsOpenSignal}
        >
          {/* Preset row — single source of truth for the "shape" of
              the deck. Each card carries icon + name + count.
              No description chrome, no preview chip cluster, no
              layered active state — those overdrew the picker.

              The active preset's description renders below the row
              as one quiet line, only when a preset matches the
              current toggles (so it disappears the moment the user
              edits anything individually). */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-2">
            {SECTION_PRESETS.map((preset) => {
              const active = activePresetKey === preset.key;
              const presetMinutes = estimateMinutes(preset.enable);
              const icon = PRESET_ICONS[preset.key] ?? PRESET_ICONS.full;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`text-left px-3 py-2.5 rounded-lg border transition-colors ${
                    active
                      ? "border-boost-green-light bg-boost-green-light/[0.05]"
                      : "border-boost-border bg-white hover:border-boost-dark/20 hover:bg-boost-surface/40"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`flex items-center justify-center w-4 h-4 ${
                        active ? "text-boost-green-light" : "text-boost-muted/80"
                      }`}
                    >
                      {icon}
                    </span>
                    <span className="text-[13px] font-semibold text-boost-dark truncate">
                      {preset.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-boost-muted tabular-nums">
                    {preset.enable.length} sections · ~{presetMinutes} min
                  </p>
                </button>
              );
            })}
          </div>
          {activePresetKey && (
            <p className="text-[11px] text-boost-muted leading-relaxed mb-3 px-1">
              {SECTION_PRESETS.find((p) => p.key === activePresetKey)?.description}
            </p>
          )}

          {/* ── Advanced: customise individual sections (hidden by default) ── */}
          <details className="group mt-4 rounded-lg border border-boost-border/60 bg-boost-surface/20">
            <summary className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium text-boost-dark/80 cursor-pointer hover:text-boost-dark select-none list-none">
              <span className="inline-flex items-center gap-2">
                <svg
                  className="w-3.5 h-3.5 text-boost-muted transition-transform group-open:rotate-90"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                Customise sections
              </span>
              <span className="text-[11px] font-normal text-boost-muted">
                Toggle, reorder, or hide individual sections
              </span>
            </summary>
            <div className="p-3 border-t border-boost-border/60 bg-white rounded-b-lg">
              <div className="mb-3 flex items-center justify-end gap-2.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setAllEnabled(true)}
                  className="text-boost-muted hover:text-boost-dark transition-colors"
                >
                  Enable all
                </button>
                <span className="text-boost-border" aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setAllEnabled(false)}
                  className="text-boost-muted hover:text-boost-dark transition-colors"
                >
                  Disable all
                </button>
                <span className="text-boost-border" aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => {
                    setHasTouchedSections(true);
                    setLastAppliedPresetKey(null);
                    setSectionItems(SLIDE_SECTIONS.map((s) => ({ ...s, enabled: s.defaultEnabled ?? true })));
                  }}
                  className="text-boost-muted hover:text-boost-dark transition-colors"
                >
                  Reset order
                </button>
              </div>

              {/* ── Section list with group headers ── */}
              <div className="space-y-0">
            {(() => {
              // Track which groups have already had their header rendered.
              // Using a Set (instead of just "lastGroup") means a group header
              // only renders ONCE — at the first occurrence of that group —
              // even if reordering has scattered items across the list.
              const renderedGroups = new Set<SectionGroup>();
              const rows: React.ReactNode[] = [];

              sectionItems.forEach((item, index) => {
                if (item.group && !renderedGroups.has(item.group)) {
                  renderedGroups.add(item.group);
                  const groupLabel = SECTION_GROUPS.find((g) => g.key === item.group)?.label ?? item.group;
                  const groupItems = sectionItems.filter((s) => s.group === item.group);
                  const groupEnabledCount = groupItems.filter((s) => s.enabled).length;
                  rows.push(
                    <div
                      key={`group-${item.group}`}
                      className="flex items-baseline gap-2 mt-4 first:mt-0 mb-1 px-2"
                    >
                      <p className="text-[9px] font-bold text-boost-muted/80 uppercase tracking-[0.16em]">
                        {groupLabel}
                      </p>
                      <span className="text-[9px] text-boost-muted/50 tabular-nums">
                        {groupEnabledCount}/{groupItems.length}
                      </span>
                    </div>,
                  );
                }

                rows.push(
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", String(index));
                      (e.currentTarget as HTMLElement).style.opacity = "0.4";
                    }}
                    onDragEnd={(e) => {
                      (e.currentTarget as HTMLElement).style.opacity = "1";
                      e.currentTarget.parentElement?.querySelectorAll("[data-drop-indicator]").forEach(
                        (el) => ((el as HTMLElement).style.opacity = "0"),
                      );
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      const rect = e.currentTarget.getBoundingClientRect();
                      const midY = rect.top + rect.height / 2;
                      const indicator = e.currentTarget.querySelector("[data-drop-indicator]") as HTMLElement;
                      if (indicator) {
                        indicator.style.opacity = "1";
                        indicator.style.top = e.clientY < midY ? "-1px" : `${rect.height - 1}px`;
                      }
                    }}
                    onDragLeave={(e) => {
                      const indicator = e.currentTarget.querySelector("[data-drop-indicator]") as HTMLElement;
                      if (indicator) indicator.style.opacity = "0";
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
                      const rect = e.currentTarget.getBoundingClientRect();
                      const midY = rect.top + rect.height / 2;
                      let toIndex = e.clientY < midY ? index : index + 1;
                      if (fromIndex < toIndex) toIndex--;
                      if (fromIndex !== toIndex && !isNaN(fromIndex)) {
                        setHasTouchedSections(true);
                        setSectionItems((prev) => {
                          const next = [...prev];
                          const [moved] = next.splice(fromIndex, 1);
                          next.splice(toIndex, 0, moved);
                          return next;
                        });
                      }
                      e.currentTarget.parentElement?.querySelectorAll("[data-drop-indicator]").forEach(
                        (el) => ((el as HTMLElement).style.opacity = "0"),
                      );
                    }}
                    className={`group relative flex items-center gap-3 py-2 px-2 rounded-lg transition-colors cursor-grab active:cursor-grabbing ${
                      item.enabled ? "bg-white hover:bg-boost-surface/30" : "bg-boost-surface/40"
                    }`}
                  >
                    {/* Drop indicator line */}
                    <div
                      data-drop-indicator
                      className="absolute left-2 right-2 h-[2px] bg-boost-green-light rounded-full pointer-events-none transition-opacity"
                      style={{ opacity: 0, top: "-1px" }}
                    />

                    {/* Drag handle — quieter (smaller dot grid, lower
                        contrast). Surfaces on hover so it's still
                        discoverable, recedes by default. */}
                    <span className="flex-shrink-0 text-boost-muted/30 group-hover:text-boost-muted/70 transition-colors touch-none select-none">
                      <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
                        <circle cx="3" cy="3" r="1" /><circle cx="7" cy="3" r="1" />
                        <circle cx="3" cy="7" r="1" /><circle cx="7" cy="7" r="1" />
                        <circle cx="3" cy="11" r="1" /><circle cx="7" cy="11" r="1" />
                      </svg>
                    </span>

                    {/* Toggle switch */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSection(item.id); }}
                      aria-pressed={item.enabled}
                      title={item.hint ?? undefined}
                      className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-colors p-0 border-0 ${
                        item.enabled ? "bg-boost-green-light" : "bg-boost-border"
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          item.enabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>

                    {/* Label only — minutes + help icon dropped, the
                        hint string is reachable via the toggle's
                        native tooltip. Less per-row noise. */}
                    <span
                      className={`flex-1 min-w-0 text-sm select-none truncate ${
                        item.enabled ? "text-boost-dark font-medium" : "text-boost-muted"
                      }`}
                      title={item.hint ?? undefined}
                    >
                      {item.label}
                    </span>
                  </div>,
                );
              });
              return rows;
            })()}
              </div>
            </div>
          </details>
        </CollapsibleSection>
        </div>
        ) : null}

        {/* 9 — Case Study Selection */}
        {activeSection === "cases" ? (
        <CollapsibleSection
          number={10}
          title="Case Study Selection"
          subtitle={
            hasCustomCaseStudies
              ? `${form.selected_case_studies!.length} ${form.selected_case_studies!.length === 1 ? "story" : "stories"} selected`
              : "None selected — all shown by industry relevance"
          }
          hasContent={hasCustomCaseStudies}
        >
          <AdminPrompt
            question="Which stories do you want to feature?"
            helper="Leave empty to show all, sorted by industry match. Otherwise, pick the ones most relevant to this deal."
            action={
              hasCustomCaseStudies && (
                <button
                  type="button"
                  onClick={() => updateField("selected_case_studies", [])}
                  className="text-[10px] text-boost-muted hover:text-boost-dark transition-colors uppercase tracking-[0.14em]"
                >
                  Clear
                </button>
              )
            }
          />
          <div className="space-y-1.5">
            {CASE_STUDIES.map((cs) => {
              const isSelected = form.selected_case_studies?.includes(cs.id) ?? false;
              const isRelevant = cs.relevantIndustries.some((ind) =>
                form.areas_of_interest.includes(ind),
              );
              return (
                <button
                  key={cs.id}
                  type="button"
                  onClick={() => toggleCaseStudy(cs.id)}
                  aria-pressed={isSelected}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                    isSelected
                      ? "bg-boost-green-light/10 ring-1 ring-boost-green-light/30"
                      : "bg-boost-surface/40 hover:bg-boost-surface"
                  }`}
                >
                  {/* Checkbox */}
                  <span
                    className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-boost-green-light border-boost-green-light"
                        : "border-boost-border"
                    }`}
                  >
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-boost-dark truncate">{cs.headline}</span>
                      {isRelevant && (
                        <span className="inline-flex items-center gap-1 shrink-0 text-[9px] font-semibold text-boost-green-light uppercase tracking-[0.14em]">
                          <span className="w-1 h-1 rounded-full bg-boost-green-light" />
                          Match
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-boost-muted truncate">
                      {cs.companyType} · {cs.companyDescription} · {cs.channel === "both" ? "Chat + Voice" : cs.channel}
                    </p>
                  </div>

                  {/* Key stat */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-boost-green tabular-nums">{cs.results[0].value}</p>
                    <p className="text-[10px] text-boost-muted">{cs.results[0].metric}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CollapsibleSection>
        ) : null}

        {/* 10 — Custom Section Content */}
        {activeSection === "custom" ? (
        <CollapsibleSection
          number={11}
          title="Custom Section Content"
          subtitle={
            form.custom_section?.title
              ? form.custom_section.title
              : "Optional — add a custom section to the guide"
          }
          hasContent={!!form.custom_section?.title}
        >
          <AdminPrompt
            question="Want a bespoke section just for this customer?"
            helper={
              <>
                Appears at the end of the guide labelled &ldquo;Other&rdquo;. Image + video are optional.
              </>
            }
          />
          <div className="space-y-5">
            <div>
              <AdminMiniLabel>Section title</AdminMiniLabel>
              <input
                type="text"
                value={form.custom_section?.title || ""}
                onChange={(e) =>
                  updateField("custom_section", {
                    ...form.custom_section!,
                    title: e.target.value,
                    body: form.custom_section?.body || "",
                  })
                }
                placeholder="e.g. Partnership Vision"
                className={`${inputClass} mt-1.5`}
              />
            </div>
            <div>
              <AdminMiniLabel>Body content</AdminMiniLabel>
              <textarea
                value={form.custom_section?.body || ""}
                onChange={(e) =>
                  updateField("custom_section", {
                    ...form.custom_section!,
                    title: form.custom_section?.title || "",
                    body: e.target.value,
                  })
                }
                placeholder="Write the section content here. Double line-breaks = new paragraphs."
                rows={5}
                className={`${inputClass} mt-1.5 resize-none leading-relaxed`}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <AdminMiniLabel>
                  Image URL <span className="opacity-60">(optional)</span>
                </AdminMiniLabel>
                <input
                  type="url"
                  value={form.custom_section?.image_url || ""}
                  onChange={(e) =>
                    updateField("custom_section", {
                      ...form.custom_section!,
                      title: form.custom_section?.title || "",
                      body: form.custom_section?.body || "",
                      image_url: e.target.value || undefined,
                    })
                  }
                  placeholder="https://example.com/image.jpg"
                  className={`${inputClass} mt-1.5`}
                />
              </div>
              <div>
                <AdminMiniLabel>
                  Video URL <span className="opacity-60">(optional)</span>
                </AdminMiniLabel>
                <input
                  type="url"
                  value={form.custom_section?.video_url || ""}
                  onChange={(e) =>
                    updateField("custom_section", {
                      ...form.custom_section!,
                      title: form.custom_section?.title || "",
                      body: form.custom_section?.body || "",
                      video_url: e.target.value || undefined,
                    })
                  }
                  placeholder="YouTube or Vimeo URL"
                  className={`${inputClass} mt-1.5`}
                />
              </div>
            </div>
          </div>
        </CollapsibleSection>
        ) : null}

        {activeSection === "demos" ? (
        <CollapsibleSection
          number={12}
          title="Demos"
          subtitle={
            form.demo_mode === "live"
              ? "Live demo — shared tenant"
              : form.demo_mode === "custom_live"
              ? form.demo_tenant
                ? `Live demo — ${form.demo_tenant}`
                : "Live demo — custom tenant (needs configuration)"
              : "Simulated — scripted demo with AI Review"
          }
          hasContent={!!form.demo_mode && form.demo_mode !== "simulated"}
        >
          <AdminPrompt
            question="How should the Chat Preview behave for this customer?"
            helper={
              <>
                The Chat Preview is section 08 in the guide. Default is the
                simulated scripted demo with the AI Review panel — that works
                on every share URL without any setup. Switch to live when you
                want the prospect to chat with a real boost.ai virtual agent.
              </>
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {([
              {
                key: "simulated",
                label: "Simulated",
                desc: "Existing scripted demo + AI Review analyzer. Works everywhere, no setup.",
              },
              {
                key: "live",
                label: "Live demo",
                desc: "Real chat against our shared demo tenant (financewizard.boost.ai).",
              },
              {
                key: "custom_live",
                label: "Custom live demo",
                desc: "Real chat against the customer's own boost.ai tenant — enter the domain below.",
              },
            ] as const).map((opt) => {
              const active = (form.demo_mode ?? "simulated") === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => updateField("demo_mode", opt.key)}
                  className={`text-left rounded-xl border px-4 py-3 transition-all ${
                    active
                      ? "border-boost-purple bg-boost-purple/5 shadow-sm"
                      : "border-boost-border bg-white hover:border-boost-purple/40 hover:shadow-sm"
                  }`}
                  data-testid={`demo-mode-${opt.key}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      aria-hidden="true"
                      className={`w-1.5 h-1.5 rounded-full ${
                        active ? "bg-boost-green-light" : "bg-boost-border"
                      }`}
                    />
                    <p
                      className={`text-sm font-semibold ${
                        active ? "text-boost-purple" : "text-boost-dark"
                      }`}
                    >
                      {opt.label}
                    </p>
                  </div>
                  <p className="text-xs text-boost-muted leading-relaxed">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
          {form.demo_mode === "custom_live" && (
            <div className="mt-5 rounded-xl border border-boost-border bg-boost-surface/40 p-4">
              <AdminMiniLabel>Tenant domain</AdminMiniLabel>
              <input
                type="text"
                value={form.demo_tenant ?? ""}
                onChange={(e) => updateField("demo_tenant", e.target.value.trim())}
                placeholder="e.g. acme.boost.ai"
                className={`${inputClass} mt-1.5 font-mono text-sm`}
                data-testid="demo-tenant-input"
              />
              <p className="text-[11px] text-boost-muted mt-2 leading-relaxed">
                Enter the short boost.ai domain (without <code>adminpanel-</code>{" "}
                prefix and without <code>https://</code>). The customer's boost.ai
                tenant must whitelist the domain{" "}
                <code className="text-boost-dark/70">
                  {typeof window !== "undefined" ? window.location.origin : ""}
                </code>{" "}
                for CORS, otherwise the chat will fail to connect.
              </p>
            </div>
          )}
          {form.demo_mode === "live" && (
            <div className="mt-5 rounded-xl border border-boost-green-light/30 bg-boost-green-light/5 p-4">
              <p className="text-xs text-boost-dark leading-relaxed">
                Points at <code className="font-mono text-boost-purple">financewizard.boost.ai</code>.
                No further setup needed — CORS is already whitelisted for this guide's origin.
                Prospects can type freely and get real intent-driven answers.
              </p>
            </div>
          )}
          {(!form.demo_mode || form.demo_mode === "simulated") && (
            <div className="mt-5 rounded-xl border border-boost-border bg-white/70 p-4">
              <p className="text-xs text-boost-muted leading-relaxed">
                Simulated mode is the safest default — the chat plays a
                pre-scripted conversation keyed off the selected areas of
                interest and ends with the AI Review analyzer panel. Zero
                external dependencies; every shared guide URL works immediately.
              </p>
            </div>
          )}
        </CollapsibleSection>
        ) : null}
      </main>
      </div>
      ) : null}

      {/* Salesforce import modal */}
      <SalesforceImportModal
        open={showSalesforce}
        onClose={() => setShowSalesforce(false)}
        currentForm={form}
        onApply={(merged) => setForm(merged)}
      />

      {/* HubSpot import modal */}
      <HubSpotImportModal
        open={showHubspot}
        onClose={() => setShowHubspot(false)}
        currentForm={form}
        onApply={(merged) => setForm(merged)}
      />

      {/* Search log review panel */}
      <SearchLogPanel
        open={showSearchLog}
        onClose={() => setShowSearchLog(false)}
      />

      {/* Feedback backlog modal is mounted globally by <FeedbackProvider /> in root layout. */}

      {/* Generate menu — traffic-light picker for engagement output */}
      {showGenerateMenu ? (
        <GenerateMenu
          onClose={() => setShowGenerateMenu(false)}
          options={[
            {
              id: "interactive",
              title: "Interactive Engagement",
              hint: "Shareable URL the customer can browse on their own.",
              status: "ready",
              glyph: "✦",
              onPick: handleSubmit,
              recommended: true,
            },
            {
              id: "presentation",
              title: "Presentation",
              hint: "Full-screen slide deck for live walk-throughs.",
              status: "ready",
              glyph: "▷",
              onPick: handleStartPresentation,
            },
            {
              id: "sow-pdf",
              title: "SoW PDF",
              hint: "Procurement-friendly downloadable scope.",
              status: "ready",
              glyph: "↓",
              onPick: handleDownloadSOW,
            },
            {
              id: "push-salesforce",
              title: "Push to Salesforce",
              hint: "Sync engagement back into the opportunity record.",
              status: "soon-orange",
              glyph: "◆",
            },
            {
              id: "push-hubspot",
              title: "Push to HubSpot",
              hint: "Sync engagement back into the deal pipeline.",
              status: "soon-orange",
              glyph: "◆",
            },
            {
              id: "save",
              title: "Save engagement",
              hint: "Stash a draft you can return to or share with a teammate.",
              status: "soon-grey",
              glyph: "✓",
            },
          ]}
        />
      ) : null}

      {/* Preset nudge — soft speed-bump when generating an untouched default guide */}
      {showPresetNudge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPresetNudge(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="preset-nudge-title"
            className="relative bg-white rounded-2xl shadow-2xl border border-boost-border max-w-md w-full p-6"
          >
            <h3 id="preset-nudge-title" className="text-lg font-bold text-boost-dark leading-tight">
              Send the full guide?
            </h3>
            <p className="text-sm text-boost-muted mt-2 leading-relaxed">
              You haven't picked a focused preset. This will send all {sectionItems.length} sections
              (~{estimatedReadTime} min to read). A focused preset like Executive or Commercial is
              often a tighter fit for a specific meeting.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPresetNudge(false);
                  proceedWithGenerate();
                }}
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-boost-dark text-white hover:bg-boost-dark/90 transition-colors"
              >
                Use full guide
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPresetNudge(false);
                  // Force Guide Sections open, then scroll it into view
                  setGuideSectionsOpenSignal((n) => n + 1);
                  requestAnimationFrame(() => {
                    guideSectionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  });
                }}
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-white border border-boost-border text-boost-dark hover:bg-boost-surface transition-colors"
              >
                Pick a preset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
