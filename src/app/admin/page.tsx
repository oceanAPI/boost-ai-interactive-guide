"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BoostLogo from "@/components/BoostLogo";
import { INTEGRATION_CATEGORIES } from "@/data/integrations";
import { SPECIALIST_AGENTS, INDUSTRIES } from "@/data/agents";
import { encodeGuideData } from "@/lib/url-encoding";
import type { GuideFormData, ChannelVolumes, IntegrationSelections } from "@/lib/types";

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

  // Auto-expand when content is added
  useEffect(() => {
    if (hasContent) setOpen(true);
  }, [hasContent]);

  return (
    <section className="bg-white rounded-xl border border-boost-border shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-boost-surface/50 transition-colors"
      >
        <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm flex-shrink-0 ${
          hasContent ? "bg-boost-green-light text-white" : "bg-boost-surface text-boost-muted border border-boost-border"
        }`}>
          {hasContent ? "✓" : number}
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-boost-dark">{title}</h2>
          {subtitle && !open && <p className="text-xs text-boost-muted truncate mt-0.5">{subtitle}</p>}
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`text-boost-muted transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-0">
          {children}
        </div>
      )}
    </section>
  );
}

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="block text-sm font-medium text-boost-text-secondary mb-1">
      {children}
      {optional && <span className="text-boost-muted ml-1">(optional)</span>}
    </label>
  );
}

const inputClass =
  "w-full px-3 py-2 bg-white border border-boost-border rounded-lg text-boost-dark placeholder-boost-lavender focus:outline-none focus:ring-2 focus:ring-boost-green-light focus:border-transparent transition-colors";

export default function AdminPage() {
  const router = useRouter();
  const [form, setForm] = useState<GuideFormData>({
    company_name: "",
    company_url: "",
    contact_name: "",
    contact_role: "",
    industry: "insurance",
    areas_of_interest: [],
    specific_requirements: "",
    channel_volumes: {},
    cost_per_employee: "",
    integrations: {},
    custom_notes: "",
  });

  const updateField = <K extends keyof GuideFormData>(key: K, value: GuideFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArea = (key: string) => {
    setForm((prev) => {
      const areas = prev.areas_of_interest.includes(key)
        ? prev.areas_of_interest.filter((a) => a !== key)
        : [...prev.areas_of_interest, key];
      return { ...prev, areas_of_interest: areas };
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
    0
  );

  const hasCompanyInfo = !!(form.company_name || form.company_url || form.contact_name || form.contact_role);
  const hasAreas = form.areas_of_interest.length > 0;
  const hasRequirements = !!(form.specific_requirements || Object.values(form.channel_volumes).some(v => v) || form.cost_per_employee);
  const hasIntegrations = totalIntegrations > 0;
  const hasNotes = !!form.custom_notes;

  return (
    <div className="min-h-screen bg-boost-surface">
      {/* Header */}
      <header className="border-b border-boost-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BoostLogo height={24} color="#59195d" />
            <span className="text-boost-muted text-sm ml-2">Guide Builder</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!form.company_name.trim()}
            className="px-5 py-2 bg-boost-green-light text-white font-semibold rounded-lg hover:bg-boost-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Generate Guide →
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        {/* Section 1: Company Info — always open by default */}
        <CollapsibleSection number={1} title="Company Information" hasContent={hasCompanyInfo} defaultOpen={true}>
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
            <div className="md:col-span-2">
              <FieldLabel>Industry</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind.key}
                    onClick={() => updateField("industry", ind.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      form.industry === ind.key
                        ? "bg-boost-green-light text-white"
                        : "bg-boost-surface text-boost-text-secondary border border-boost-border hover:border-boost-green-light"
                    }`}
                  >
                    {ind.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 2: Areas of Interest */}
        <CollapsibleSection
          number={2}
          title="Areas of Interest"
          subtitle={hasAreas ? `${form.areas_of_interest.length} selected` : "If none selected, all will be shown"}
          hasContent={hasAreas}
        >
          <p className="text-boost-muted text-sm mb-4">
            Select the agent areas this customer has expressed preference for. If none selected, all will be shown.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SPECIALIST_AGENTS.map((agent) => (
              <button
                key={agent.key}
                onClick={() => toggleArea(agent.key)}
                className={`p-4 rounded-lg text-left transition-all ${
                  form.areas_of_interest.includes(agent.key)
                    ? "bg-boost-green-light/10 border-2 border-boost-green-light"
                    : "bg-boost-surface border-2 border-transparent hover:border-boost-border"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-boost-dark text-sm">{agent.name}</span>
                  <span className="text-boost-green font-bold text-sm">{agent.automationRate}%</span>
                </div>
                <p className="text-xs text-boost-muted line-clamp-2">{agent.description}</p>
              </button>
            ))}
          </div>
        </CollapsibleSection>

        {/* Section 3: Requirements & Volumes */}
        <CollapsibleSection
          number={3}
          title="Requirements & Volumes"
          subtitle={hasRequirements ? "Data added" : "Optional — volumes, costs, and specific needs"}
          hasContent={hasRequirements}
        >
          <div className="space-y-4">
            <div>
              <FieldLabel optional>Specific Requirements</FieldLabel>
              <textarea
                value={form.specific_requirements}
                onChange={(e) => updateField("specific_requirements", e.target.value)}
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
                    <span className="text-xs text-boost-muted capitalize mb-1 block">{ch}</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel optional>Cost per Employee / Contact</FieldLabel>
                <input
                  type="text"
                  value={form.cost_per_employee}
                  onChange={(e) => updateField("cost_per_employee", e.target.value)}
                  placeholder="e.g. $12 per contact"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 4: Integrations */}
        <CollapsibleSection
          number={4}
          title="Backend Systems & Integrations"
          subtitle={hasIntegrations ? `${totalIntegrations} selected` : "Optional — select known integrations"}
          hasContent={hasIntegrations}
        >
          <p className="text-boost-muted text-sm mb-4">
            Select integrations the customer uses or needs.{" "}
            {totalIntegrations > 0 && (
              <span className="text-boost-green font-medium">{totalIntegrations} selected</span>
            )}
          </p>
          <div className="space-y-6">
            {INTEGRATION_CATEGORIES.map((cat) => {
              const selected = (form.integrations[cat.key as keyof IntegrationSelections] || []) as string[];
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

        {/* Section 5: Notes */}
        <CollapsibleSection
          number={5}
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
