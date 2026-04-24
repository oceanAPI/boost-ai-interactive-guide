"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { assetPath } from "@/lib/asset-path";
import { INTEGRATION_CATEGORIES } from "@/data/integrations";
import { INDUSTRIES, HIDDEN_INDUSTRIES, SUPPORTING_DEPARTMENTS, INDUSTRY_VARIANTS } from "@/data/agents";
import { encodeGuideData, decodeGuideData } from "@/lib/url-encoding";
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
import type { GuideFormData, ChannelVolumes, IntegrationSelections, PricingModel, ResourceAllocation, Audience } from "@/lib/types";

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
  const [open, setOpen] = useState(defaultOpen ?? false);

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

  /* ─── URL-based prefill (?prefill=<base64>) ─── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const prefill = params.get("prefill");
    if (!prefill) return;
    const decoded = decodeGuideData(prefill);
    if (decoded) {
      setForm((prev) => ({ ...prev, ...decoded }));
      // Clean the URL so reloads don't keep re-applying prefill
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, "", cleanUrl);
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
    setForm((prev) => ({
      ...prev,
      channel_volumes: {
        ...prev.channel_volumes,
        [channel]: value ? parseInt(value) : undefined,
      },
    }));
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
  const hasSectionChanges = sectionItems.some((item, i) => !item.enabled || item.id !== SLIDE_SECTIONS[i]?.id);

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
  const hasCompanyInfo = !!(
    form.company_name ||
    form.company_url ||
    form.contact_name ||
    form.contact_role ||
    form.start_date
  );
  const hasAreas = form.areas_of_interest.length > 0;
  const hasPricing = !!(form.conversation_cost);
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
            <Link
              href="/"
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 focus-visible:ring-offset-boost-purple rounded-sm px-2 py-0.5 whitespace-nowrap"
            >
              ← Change mode
            </Link>
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
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => setShowSalesforce(true)}
              className="px-2 sm:px-3 py-2 text-sm border border-boost-border text-boost-dark font-semibold rounded-lg hover:bg-boost-surface transition-colors flex-shrink-0 flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00A1E0" strokeWidth="2">
                <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
              </svg>
              <span className="hidden sm:inline">Salesforce</span>
            </button>
            <button
              onClick={() => setShowHubspot(true)}
              className="px-2 sm:px-3 py-2 text-sm border border-boost-border text-boost-dark font-semibold rounded-lg hover:bg-boost-surface transition-colors flex-shrink-0 flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF7A59">
                <path d="M17.2 9.2V6.7a1.7 1.7 0 001-1.5V5a1.7 1.7 0 00-1.7-1.7h-.2A1.7 1.7 0 0014.6 5v.2a1.7 1.7 0 001 1.5v2.5a5.3 5.3 0 00-2.4 1.3l-6.4-5a2.1 2.1 0 00.1-.6 2.1 2.1 0 10-2.1 2.1c.4 0 .8-.1 1.1-.3l6.3 4.9a5.3 5.3 0 00-.5 2.3 5.3 5.3 0 00.7 2.6l-2 2a1.8 1.8 0 00-.5-.1 1.8 1.8 0 101.8 1.8 1.8 1.8 0 00-.1-.5l2-2a5.3 5.3 0 103.6-8.5zM16.5 17a3 3 0 01-3-3 3 3 0 013-3 3 3 0 013 3 3 3 0 01-3 3z" />
              </svg>
              <span className="hidden sm:inline">HubSpot</span>
            </button>
            <button
              onClick={handleDownloadSOW}
              disabled={generatingPdf}
              className="px-2 sm:px-3 py-2 text-sm border border-boost-border text-boost-dark font-semibold rounded-lg hover:bg-boost-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              <span className="hidden sm:inline">{generatingPdf ? "Generating..." : "SOW"}</span>
            </button>
            <button
              onClick={handleStartPresentation}
              className="px-2 sm:px-3 py-2 text-sm border border-boost-border text-boost-dark font-semibold rounded-lg hover:bg-boost-surface transition-colors flex-shrink-0 flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
              </svg>
              <span className="hidden sm:inline">Guide</span>
            </button>
            <button
              onClick={handleSubmit}
              className="px-2 sm:px-3 py-2 text-sm border border-boost-border text-boost-dark font-semibold rounded-lg hover:bg-boost-surface transition-colors flex-shrink-0 flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="hidden sm:inline">Generate</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
        {/* Sections 1 + 2 are SHARED customer metadata \u2014 rendered
            for every audience. Company identity, contact, start date,
            and the customer's vertical drive block defaults (agenda
            mentions the company name; SWOT frames around the industry;
            benchmarking cohort filters by vertical). Without these
            fields populated the CE blocks pre-fill with placeholders
            and the generated guide reads generic. */}

        {/* 1 — Company Info */}
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
              (newbies land here), closed by default when a prefill has run. */}
          <details
            className="group mt-4 rounded-lg border border-boost-border/60 bg-boost-surface/20"
            open={!form.company_name}
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

        {/* 2 — Areas of Interest */}
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
            helper="Leave empty for a general financial-services guide."
          />

          <AdminChipRow>
            {INDUSTRIES.filter((ind) => !HIDDEN_INDUSTRIES.has(ind.key)).map((ind) => (
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

        {/* 3 — Pricing & Costs */}
        <CollapsibleSection
          number={3}
          title="Pricing Model & Costs"
          subtitle={hasPricing ? `${PRICING_MODELS.find(p => p.key === form.pricing_model)?.label} · ${form.conversation_cost}` : "Choose pricing model and enter cost baseline"}
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
        </CollapsibleSection>

        {/* 4 — Deployment & Resources */}
        <CollapsibleSection
          number={4}
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

        {/* 5 — Requirements & Volumes */}
        <CollapsibleSection
          number={5}
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
            helper="Total monthly conversation volume per channel — all markets combined. Anchors the ROI calculator."
          />
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

        {/* 6 — Integrations */}
        <CollapsibleSection
          number={6}
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
                  <div className="px-3 pb-3 pt-1">
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
                    </AdminChipRow>
                  </div>
                </details>
              );
            })}
          </div>
        </CollapsibleSection>

        {/* 7 — Notes */}
        <CollapsibleSection
          number={7}
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

        {/* 8 — Guide Sections */}
        <div ref={guideSectionsRef} className="scroll-mt-20">
        <CollapsibleSection
          number={8}
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
          {/* ── Preset cards — the primary UX for picking sections ── */}
          <div className="mb-5">
            <p className="text-[11px] font-semibold text-boost-muted uppercase tracking-widest mb-2">
              Pick a starting point
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {SECTION_PRESETS.map((preset) => {
                const active = activePresetKey === preset.key;
                const presetMinutes = estimateMinutes(preset.enable);
                // Pick up to 4 section labels to tease what's inside
                const previewLabels = preset.enable
                  .slice(0, 4)
                  .map((id) => SLIDE_SECTIONS.find((s) => s.id === id)?.label)
                  .filter(Boolean) as string[];
                const extra = preset.enable.length - previewLabels.length;
                const icon = PRESET_ICONS[preset.key] ?? PRESET_ICONS.full;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`group relative text-left p-4 rounded-xl border transition-all ${
                      active
                        ? "border-boost-green-light bg-boost-green-light/[0.06] shadow-sm ring-1 ring-boost-green-light/40"
                        : "border-boost-border bg-white hover:border-boost-dark/30 hover:shadow-sm"
                    }`}
                  >
                    {active && (
                      <span
                        className="absolute top-3 right-3 w-5 h-5 rounded-full bg-boost-green-light text-white flex items-center justify-center"
                        aria-label="Selected preset"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                          active
                            ? "bg-boost-green-light text-white"
                            : "bg-boost-surface text-boost-dark/70 group-hover:text-boost-dark"
                        }`}
                      >
                        {icon}
                      </span>
                      <span className="text-sm font-semibold text-boost-dark">{preset.label}</span>
                    </div>
                    <p className="text-[11px] text-boost-muted leading-snug mb-2.5 pr-5 h-[2.5em]">
                      {preset.description}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-boost-muted mb-2.5">
                      <span className="inline-flex items-center gap-1 font-semibold text-boost-dark/80 tabular-nums">
                        {preset.enable.length}
                        <span className="font-normal text-boost-muted">sections</span>
                      </span>
                      <span className="text-boost-border">·</span>
                      <span className="tabular-nums">~{presetMinutes} min</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {previewLabels.map((label) => (
                        <span
                          key={label}
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            active
                              ? "bg-white text-boost-dark/70 border border-boost-green-light/30"
                              : "bg-boost-surface text-boost-muted"
                          }`}
                        >
                          {label}
                        </span>
                      ))}
                      {extra > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded tabular-nums ${
                            active ? "text-boost-green" : "text-boost-muted"
                          }`}
                        >
                          +{extra}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Summary band — shows current real state (may differ from preset) ── */}
          <div className="mb-2 flex items-center gap-2 flex-wrap text-xs px-1">
            <span className="inline-flex items-center gap-1.5 text-boost-dark">
              <span className="w-1.5 h-1.5 rounded-full bg-boost-green-light" />
              <span className="font-semibold tabular-nums">{selectedSectionIds.length}</span>
              <span className="text-boost-muted">sections</span>
            </span>
            <span className="text-boost-border">·</span>
            <span className="text-boost-muted tabular-nums">~{estimatedReadTime} min scan time</span>
            {lastAppliedPresetKey && !activePresetKey && (
              <span className="ml-auto text-[11px] text-boost-muted italic">
                Edited from {SECTION_PRESETS.find((p) => p.key === lastAppliedPresetKey)?.label}
              </span>
            )}
          </div>

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
              <div className="mb-3 flex items-center gap-2 flex-wrap text-xs">
                <span className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setAllEnabled(true)}
                    className="text-[11px] text-boost-muted hover:text-boost-dark transition-colors"
                  >
                    Enable all
                  </button>
                  <span className="text-boost-border">·</span>
                  <button
                    type="button"
                    onClick={() => setAllEnabled(false)}
                    className="text-[11px] text-boost-muted hover:text-boost-dark transition-colors"
                  >
                    Disable all
                  </button>
                  <span className="text-boost-border">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setHasTouchedSections(true);
                      setLastAppliedPresetKey(null);
                      setSectionItems(SLIDE_SECTIONS.map((s) => ({ ...s, enabled: s.defaultEnabled ?? true })));
                    }}
                    className="text-[11px] text-boost-muted hover:text-boost-dark transition-colors"
                  >
                    Reset order
                  </button>
                </span>
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
                  const allOn = groupEnabledCount === groupItems.length;
                  rows.push(
                    <div
                      key={`group-${item.group}`}
                      className="flex items-center gap-3 mt-5 first:mt-0 mb-1.5 px-2"
                    >
                      <p className="text-[10px] font-bold text-boost-muted uppercase tracking-[0.12em]">
                        {groupLabel}
                      </p>
                      <span className="text-[10px] text-boost-muted/60 tabular-nums">
                        {groupEnabledCount}/{groupItems.length}
                      </span>
                      <div className="flex-1 h-px bg-boost-border/50" />
                      <button
                        type="button"
                        onClick={() => toggleGroupEnabled(item.group!, !allOn)}
                        className="text-[10px] text-boost-muted/80 hover:text-boost-dark transition-colors"
                      >
                        {allOn ? "Disable all" : "Enable all"}
                      </button>
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
                    className={`relative flex items-center gap-3 py-2 px-2 rounded-lg transition-colors cursor-grab active:cursor-grabbing ${
                      item.enabled ? "bg-white hover:bg-boost-surface/30" : "bg-boost-surface/40"
                    }`}
                  >
                    {/* Drop indicator line */}
                    <div
                      data-drop-indicator
                      className="absolute left-2 right-2 h-[2px] bg-boost-green-light rounded-full pointer-events-none transition-opacity"
                      style={{ opacity: 0, top: "-1px" }}
                    />

                    {/* Drag handle — more visible now */}
                    <span className="flex-shrink-0 text-boost-muted/60 hover:text-boost-dark transition-colors touch-none select-none">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="5" cy="3" r="1.2" /><circle cx="11" cy="3" r="1.2" />
                        <circle cx="5" cy="8" r="1.2" /><circle cx="11" cy="8" r="1.2" />
                        <circle cx="5" cy="13" r="1.2" /><circle cx="11" cy="13" r="1.2" />
                      </svg>
                    </span>

                    {/* Toggle switch — much clearer on/off affordance than the checkbox */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSection(item.id); }}
                      aria-pressed={item.enabled}
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

                    {/* Label + hint */}
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span
                        className={`text-sm select-none truncate ${
                          item.enabled ? "text-boost-dark font-medium" : "text-boost-muted"
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.minutes !== undefined && (
                        <span className="text-[10px] text-boost-muted/60 tabular-nums shrink-0">
                          ~{item.minutes}m
                        </span>
                      )}
                    </div>

                    {/* Hint tooltip (shown on hover via native title) */}
                    {item.hint && (
                      <span
                        className="shrink-0 text-boost-muted/40 hover:text-boost-dark transition-colors cursor-help"
                        title={item.hint}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4M12 8h.01" />
                        </svg>
                      </span>
                    )}
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

        {/* 9 — Case Study Selection */}
        <CollapsibleSection
          number={9}
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

        {/* 10 — Custom Section Content */}
        <CollapsibleSection
          number={10}
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

        <CollapsibleSection
          number={11}
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
      </main>

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
