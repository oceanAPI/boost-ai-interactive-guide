"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { assetPath } from "@/lib/asset-path";
import { INTEGRATION_CATEGORIES } from "@/data/integrations";
import { INDUSTRIES, SUPPORTING_DEPARTMENTS, INDUSTRY_VARIANTS } from "@/data/agents";
import { encodeGuideData, decodeGuideData } from "@/lib/url-encoding";
import { generateSOWPdf } from "@/lib/generate-sow-pdf";
import SalesforceImportModal from "@/components/SalesforceImportModal";
import HubSpotImportModal from "@/components/HubSpotImportModal";
import CompanySearch from "@/components/CompanySearch";
import SearchLogPanel from "@/components/SearchLogPanel";
import {
  PacManFeedbackButton,
  FeedbackModal,
} from "@/components/FeedbackBacklog";
import type { DetectionResult } from "@/lib/company-detect";
import {
  SLIDE_SECTIONS,
  SECTION_GROUPS,
  SECTION_PRESETS,
  estimateMinutes,
  type SectionGroup,
  type SectionPreset,
} from "@/lib/slide-sections";
import { CASE_STUDIES } from "@/data/case-studies";
import type { GuideFormData, ChannelVolumes, IntegrationSelections, PricingModel, ResourceAllocation } from "@/lib/types";

/* ─── Collapsible Section ─── */
function CollapsibleSection({
  number,
  title,
  subtitle,
  hasContent,
  defaultOpen,
  autoOpenOnContent = true,
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
  children: React.ReactNode;
  customBadge?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  useEffect(() => {
    if (autoOpenOnContent && hasContent) setOpen(true);
  }, [hasContent, autoOpenOnContent]);

  return (
    <section className="bg-white rounded-xl border border-boost-border shadow-sm overflow-hidden">
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
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-boost-surface/50 transition-colors cursor-pointer select-none"
      >
        {customBadge ? (
          customBadge
        ) : (
          <span
            className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm flex-shrink-0 ${
              hasContent
                ? "bg-boost-green-light text-white"
                : "bg-boost-surface text-boost-muted border border-boost-border"
            }`}
          >
            {hasContent ? "✓" : number}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-boost-dark">{title}</h2>
          {subtitle && !open && (
            <p className="text-xs text-boost-muted truncate mt-0.5">{subtitle}</p>
          )}
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-boost-muted transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && <div className="px-5 pb-5 pt-0">{children}</div>}
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

  const handleSubmit = () => {
    const encoded = encodeGuideData(form);
    const sections = selectedSectionIds.join(",");
    router.push(`/guide?data=${encoded}&sections=${sections}`);
  };

  const handleStartPresentation = () => {
    const encoded = encodeGuideData(form);
    const sections = selectedSectionIds.join(",");
    router.push(`/slides?data=${encoded}&sections=${sections}`);
  };

  /* ─── Salesforce import ─── */
  const [showSalesforce, setShowSalesforce] = useState(false);
  const [showHubspot, setShowHubspot] = useState(false);
  const [showSearchLog, setShowSearchLog] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  /* ─── Guide sections (inline picker) ─── */
  const [sectionItems, setSectionItems] = useState(() =>
    SLIDE_SECTIONS.map((s) => ({ ...s, enabled: s.defaultEnabled ?? true })),
  );

  const toggleSection = (id: string) => {
    setSectionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)),
    );
  };

  const moveSectionUp = (index: number) => {
    if (index <= 0) return;
    setSectionItems((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveSectionDown = (index: number) => {
    if (index >= sectionItems.length - 1) return;
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
  };

  const setAllEnabled = (enabled: boolean) => {
    setSectionItems((prev) => prev.map((item) => ({ ...item, enabled })));
  };

  const toggleGroupEnabled = (group: SectionGroup, enabled: boolean) => {
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
      const guideUrl = `${base}/guide?data=${encoded}`;
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
      {/* Header */}
      <header className="border-b border-boost-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assetPath("/brand/boost_logo_purple-_main.svg")}
              alt="boost.ai"
              className="h-5 sm:h-6 w-auto flex-shrink-0"
            />
            <span className="text-boost-muted text-xs sm:text-sm hidden sm:inline">Guide Builder</span>
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
        {/* 1 — Company Info */}
        <CollapsibleSection
          number={1}
          title="Company Information"
          hasContent={hasCompanyInfo}
          defaultOpen={true}
          customBadge={
            <PacManFeedbackButton onClick={() => setShowFeedback(true)} />
          }
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
            {lastPrefilled && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-boost-green-light/10 text-boost-green font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Prefilled from {lastPrefilled}
                </span>
                <span className="text-boost-muted">
                  — edit any field below to override
                </span>
                <button
                  type="button"
                  onClick={() => setLastPrefilled(null)}
                  className="ml-auto text-boost-muted hover:text-boost-dark transition-colors"
                  aria-label="Dismiss"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

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
          </div>
          <div className="mt-4">
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
          <p className="text-boost-muted text-sm mb-4">
            Select the industries / verticals this customer operates in. If none
            are selected, a general financial services guide will be generated.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.key}
                onClick={() => toggleArea(ind.key)}
                className={`p-4 rounded-lg text-left transition-all ${
                  form.areas_of_interest.includes(ind.key)
                    ? "bg-boost-green-light/10 border-2 border-boost-green-light"
                    : "bg-boost-surface border-2 border-transparent hover:border-boost-border"
                }`}
              >
                <span className="font-medium text-boost-dark text-sm block mb-1">
                  {ind.label}
                </span>
                <p className="text-xs text-boost-muted line-clamp-2">
                  {ind.description}
                </p>
              </button>
            ))}
          </div>

          {/* ── Variant pickers — one per enabled industry that has variants ── */}
          {form.areas_of_interest
            .filter((areaKey) => INDUSTRY_VARIANTS[areaKey]?.length)
            .map((areaKey) => {
              const industry = INDUSTRIES.find((i) => i.key === areaKey);
              const variants = INDUSTRY_VARIANTS[areaKey] || [];
              const selectedForIndustry = (form.selected_variants || []).filter((v) =>
                variants.some((iv) => iv.key === v),
              );
              return (
                <div
                  key={`variants-${areaKey}`}
                  className="mt-5 pt-5 border-t border-boost-border"
                >
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-boost-dark">
                        {industry?.label} variant
                      </p>
                      <p className="text-xs text-boost-muted">
                        {selectedForIndustry.length > 0
                          ? `Filtering to ${selectedForIndustry.length} variant${selectedForIndustry.length > 1 ? "s" : ""} — agents tagged for these (plus universal ones) will show`
                          : "Optional — narrows agents to a specific flavour of " + (industry?.label.toLowerCase() ?? "industry")}
                      </p>
                    </div>
                    {selectedForIndustry.length > 0 && (
                      <button
                        onClick={() =>
                          updateField(
                            "selected_variants",
                            (form.selected_variants || []).filter(
                              (v) => !variants.some((iv) => iv.key === v),
                            ),
                          )
                        }
                        className="text-xs text-boost-muted hover:text-boost-dark transition-colors shrink-0"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {variants.map((v) => {
                      const selected = (form.selected_variants || []).includes(v.key);
                      return (
                        <button
                          key={v.key}
                          type="button"
                          onClick={() => toggleVariant(v.key)}
                          className={`p-3 rounded-lg text-left transition-all border-2 ${
                            selected
                              ? "bg-boost-green-light/10 border-boost-green-light"
                              : "bg-boost-surface/50 border-transparent hover:border-boost-border"
                          }`}
                        >
                          <span className="text-xs font-semibold text-boost-dark block leading-tight">
                            {v.label}
                          </span>
                          {v.description && (
                            <p className="text-[11px] text-boost-muted mt-1 leading-snug">
                              {v.description}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
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
          <div className="space-y-5">
            <div>
              <FieldLabel>Pricing Model</FieldLabel>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PRICING_MODELS.map((pm) => (
                  <button
                    key={pm.key}
                    onClick={() => updateField("pricing_model", pm.key)}
                    className={`p-4 rounded-lg text-left transition-all ${
                      form.pricing_model === pm.key
                        ? "bg-boost-green-light/10 border-2 border-boost-green-light"
                        : "bg-boost-surface border-2 border-transparent hover:border-boost-border"
                    }`}
                  >
                    <span className="font-semibold text-boost-dark text-sm block mb-1">
                      {pm.label}
                    </span>
                    <p className="text-xs text-boost-muted">{pm.description}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel>Cost per Conversation</FieldLabel>
                <input
                  type="text"
                  value={form.conversation_cost}
                  onChange={(e) => updateField("conversation_cost", e.target.value)}
                  placeholder="e.g. $8.50"
                  className={inputClass}
                />
                <p className="text-xs text-boost-muted mt-1">
                  Current average cost to handle one customer conversation
                </p>
              </div>
            </div>
          </div>
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
          <div className="space-y-5">
            {/* Markets */}
            <div>
              <FieldLabel>Number of Markets / Countries</FieldLabel>
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
                <span className="text-boost-dark font-bold text-lg w-10 text-center">
                  {form.deployment_markets}
                </span>
              </div>
            </div>

            {/* FTE breakdown */}
            <div>
              <FieldLabel>Available FTEs by Role</FieldLabel>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-boost-muted block mb-1">
                    Stakeholder Owners
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={form.resources.stakeholder_owners ?? ""}
                    onChange={(e) =>
                      updateResource(
                        "stakeholder_owners",
                        e.target.value ? parseInt(e.target.value) : undefined,
                      )
                    }
                    placeholder="0"
                    className={inputClass}
                  />
                  <p className="text-[11px] text-boost-muted mt-0.5">
                    Executive sponsors & project owners
                  </p>
                </div>
                <div>
                  <span className="text-xs text-boost-muted block mb-1">
                    AI Trainers
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={form.resources.ai_trainers ?? ""}
                    onChange={(e) =>
                      updateResource(
                        "ai_trainers",
                        e.target.value ? parseInt(e.target.value) : undefined,
                      )
                    }
                    placeholder="0"
                    className={inputClass}
                  />
                  <p className="text-[11px] text-boost-muted mt-0.5">
                    Work in the boost.ai platform daily
                  </p>
                </div>
                <div>
                  <span className="text-xs text-boost-muted block mb-1">
                    Technical Resources
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={form.resources.technical_resources ?? ""}
                    onChange={(e) =>
                      updateResource(
                        "technical_resources",
                        e.target.value ? parseInt(e.target.value) : undefined,
                      )
                    }
                    placeholder="0"
                    className={inputClass}
                  />
                  <p className="text-[11px] text-boost-muted mt-0.5">
                    Developers & integration engineers
                  </p>
                </div>
              </div>
            </div>

            {/* Supporting departments */}
            <div>
              <FieldLabel optional>Supporting Departments Involved</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {SUPPORTING_DEPARTMENTS.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => toggleDepartment(dept)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      form.resources.supporting_departments?.includes(dept)
                        ? "bg-boost-green-light text-white"
                        : "bg-boost-surface text-boost-muted hover:text-boost-dark border border-boost-border"
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Knowledge management */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  updateResource(
                    "knowledge_management",
                    !form.resources.knowledge_management,
                  )
                }
                className={`w-10 h-6 rounded-full transition-colors relative p-0 border-0 ${
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
              <div>
                <span className="text-sm font-medium text-boost-dark">
                  Knowledge Management Responsible
                </span>
                <p className="text-xs text-boost-muted">
                  Dedicated person(s) managing knowledge base content
                </p>
              </div>
            </div>
          </div>
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
          <div className="space-y-4">
            <div>
              <FieldLabel optional>Specific Requirements</FieldLabel>
              <textarea
                value={form.specific_requirements}
                onChange={(e) =>
                  updateField("specific_requirements", e.target.value)
                }
                placeholder="Any specific requirements they've communicated..."
                rows={3}
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel optional>Monthly Channel Volumes</FieldLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(["chat", "voice", "email", "social"] as const).map((ch) => (
                  <div key={ch}>
                    <span className="text-xs text-boost-muted capitalize mb-1 block">
                      {ch}
                    </span>
                    <input
                      type="number"
                      value={form.channel_volumes[ch] || ""}
                      onChange={(e) => updateVolume(ch, e.target.value)}
                      placeholder="0"
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
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
          <p className="text-boost-muted text-sm mb-4">
            Select integrations the customer uses or needs.{" "}
            {totalIntegrations > 0 && (
              <span className="text-boost-green font-medium">
                {totalIntegrations} selected
              </span>
            )}
          </p>
          <div className="space-y-6">
            {INTEGRATION_CATEGORIES.map((cat) => {
              const selected = (form.integrations[
                cat.key as keyof IntegrationSelections
              ] || []) as string[];
              return (
                <div key={cat.key}>
                  <h3 className="text-sm font-semibold text-boost-dark mb-2 flex items-center gap-2">
                    {cat.label}
                    {selected.length > 0 && (
                      <span className="text-xs bg-boost-green-light/20 text-boost-green px-2 py-0.5 rounded-full">
                        {selected.length}
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => toggleIntegration(cat.key, item.name)}
                        title={item.description}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          selected.includes(item.name)
                            ? "bg-boost-green-light text-white"
                            : "bg-boost-surface text-boost-muted hover:text-boost-dark hover:bg-boost-card-hover border border-boost-border"
                        }`}
                      >
                        {item.name}
                        {item.tags?.includes("beta") && (
                          <span className="ml-1 text-[10px] opacity-70">β</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
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
          <textarea
            value={form.custom_notes}
            onChange={(e) => updateField("custom_notes", e.target.value)}
            placeholder="Any additional context for this customer..."
            rows={3}
            className={inputClass}
          />
        </CollapsibleSection>

        {/* 8 — Guide Sections */}
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
        >
          {/* ── Preset pills ── */}
          <div className="mb-5">
            <p className="text-[11px] font-semibold text-boost-muted uppercase tracking-widest mb-2">
              Start from a preset
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SECTION_PRESETS.map((preset) => {
                const active = activePresetKey === preset.key;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    title={preset.description}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      active
                        ? "bg-boost-dark text-white border-boost-dark"
                        : "bg-white text-boost-muted border-boost-border hover:border-boost-dark/30 hover:text-boost-dark"
                    }`}
                  >
                    {preset.label}
                    <span className={`ml-1.5 text-[10px] ${active ? "text-white/60" : "text-boost-muted/70"} tabular-nums`}>
                      {preset.enable.length}
                    </span>
                  </button>
                );
              })}
            </div>
            {activePresetKey && (
              <p className="text-[11px] text-boost-muted mt-2">
                {SECTION_PRESETS.find((p) => p.key === activePresetKey)?.description}
              </p>
            )}
          </div>

          {/* ── Summary band ── */}
          <div className="mb-4 flex items-center gap-3 flex-wrap text-xs">
            <span className="inline-flex items-center gap-1.5 text-boost-dark">
              <span className="w-1.5 h-1.5 rounded-full bg-boost-green-light" />
              <span className="font-semibold tabular-nums">{selectedSectionIds.length}</span>
              <span className="text-boost-muted">of {sectionItems.length} enabled</span>
            </span>
            <span className="text-boost-border">·</span>
            <span className="text-boost-muted tabular-nums">~{estimatedReadTime} min scan time</span>
            <span className="ml-auto flex items-center gap-2">
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
                onClick={() => setSectionItems(SLIDE_SECTIONS.map((s) => ({ ...s, enabled: s.defaultEnabled ?? true })))}
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
        </CollapsibleSection>

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
          <p className="text-boost-muted text-sm mb-3">
            Pick the customer stories to feature. Leave empty to show all, sorted by industry match.
          </p>
          {hasCustomCaseStudies && (
            <button
              onClick={() => updateField("selected_case_studies", [])}
              className="text-xs text-boost-muted hover:text-boost-dark transition-colors mb-3"
            >
              Clear selection
            </button>
          )}
          <div className="space-y-1.5">
            {CASE_STUDIES.map((cs) => {
              const isSelected = form.selected_case_studies?.includes(cs.id) ?? false;
              const isRelevant = cs.relevantIndustries.some((ind) =>
                form.areas_of_interest.includes(ind),
              );
              return (
                <button
                  key={cs.id}
                  onClick={() => toggleCaseStudy(cs.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                    isSelected
                      ? "bg-boost-green-light/10 ring-1 ring-boost-green-light/30"
                      : "bg-boost-surface/50 hover:bg-boost-surface"
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
                      <span className="text-sm font-medium text-boost-dark">{cs.headline}</span>
                      {isRelevant && (
                        <span className="text-[9px] font-semibold text-boost-green-light bg-boost-green-light/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
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
          <p className="text-boost-muted text-sm mb-4">
            Add a custom content section to the guide. It will appear as &ldquo;Other&rdquo; in the section list.
          </p>
          <div className="space-y-4">
            <div>
              <FieldLabel>Section Title</FieldLabel>
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
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel>Body Content</FieldLabel>
              <textarea
                value={form.custom_section?.body || ""}
                onChange={(e) =>
                  updateField("custom_section", {
                    ...form.custom_section!,
                    title: form.custom_section?.title || "",
                    body: e.target.value,
                  })
                }
                placeholder="Write the section content here. Use double line-breaks for paragraphs."
                rows={5}
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel optional>Image URL</FieldLabel>
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
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel optional>Video URL</FieldLabel>
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
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                className={inputClass}
              />
            </div>
          </div>
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

      {/* Feedback backlog (Pac-Man hiding the backlog behind the little green guy) */}
      <FeedbackModal
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
      />
    </div>
  );
}
