"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { assetPath } from "@/lib/asset-path";
import { INTEGRATION_CATEGORIES } from "@/data/integrations";
import { INDUSTRIES, SUPPORTING_DEPARTMENTS } from "@/data/agents";
import { encodeGuideData } from "@/lib/url-encoding";
import type { GuideFormData, ChannelVolumes, IntegrationSelections, PricingModel, ResourceAllocation } from "@/lib/types";

/* ─── Collapsible Section ─── */
function CollapsibleSection({
  number,
  title,
  subtitle,
  hasContent,
  defaultOpen,
  children,
}: {
  number: number;
  title: string;
  subtitle?: string;
  hasContent: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  useEffect(() => {
    if (hasContent) setOpen(true);
  }, [hasContent]);

  return (
    <section className="bg-white rounded-xl border border-boost-border shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-boost-surface/50 transition-colors"
      >
        <span
          className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm flex-shrink-0 ${
            hasContent
              ? "bg-boost-green-light text-white"
              : "bg-boost-surface text-boost-muted border border-boost-border"
          }`}
        >
          {hasContent ? "✓" : number}
        </span>
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
      </button>
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
  });

  const updateField = <K extends keyof GuideFormData>(key: K, value: GuideFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

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
      return { ...prev, areas_of_interest: areas };
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
    if (!form.company_name.trim()) return;
    const encoded = encodeGuideData(form);
    router.push(`/guide?data=${encoded}`);
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
    form.contact_role
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
          <button
            onClick={handleSubmit}
            disabled={!form.company_name.trim()}
            className="px-4 py-2 text-sm sm:text-base bg-boost-green-light text-white font-semibold rounded-lg hover:bg-boost-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            Generate →
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
        {/* 1 — Company Info */}
        <CollapsibleSection
          number={1}
          title="Company Information"
          hasContent={hasCompanyInfo}
          defaultOpen={true}
        >
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
                onClick={() =>
                  updateResource(
                    "knowledge_management",
                    !form.resources.knowledge_management,
                  )
                }
                className={`w-10 h-6 rounded-full transition-colors relative ${
                  form.resources.knowledge_management
                    ? "bg-boost-green-light"
                    : "bg-boost-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    form.resources.knowledge_management
                      ? "translate-x-4"
                      : "translate-x-0.5"
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

        {/* Generate Button */}
        <div className="flex justify-center pb-8 pt-4">
          <button
            onClick={handleSubmit}
            disabled={!form.company_name.trim()}
            className="px-8 py-3 bg-boost-green-light text-white font-bold rounded-xl text-lg hover:bg-boost-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-boost-green-light/25"
          >
            Generate Interactive Guide →
          </button>
        </div>
      </main>
    </div>
  );
}
