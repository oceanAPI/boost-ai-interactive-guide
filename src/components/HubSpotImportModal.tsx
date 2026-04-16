"use client";

import { useState, useEffect } from "react";
import type { GuideFormData } from "@/lib/types";

/* ─── Placeholder HubSpot accounts ─── */
interface HSAccount {
  id: string;
  name: string;
  data: Partial<GuideFormData>;
}

const HS_ACCOUNTS: HSAccount[] = [
  {
    id: "hs-1",
    name: "Nordea Bank",
    data: {
      company_name: "Nordea Bank",
      company_url: "https://nordea.com",
      contact_name: "Erik 'The Spreadsheet' Lindstr\u00f6m",
      contact_role: "Chief Enthusiasm Officer",
      areas_of_interest: ["banking"],
      channel_volumes: { chat: 85000, voice: 42000, email: 28000, social: 12000 },
      conversation_cost: "6.20",
      pricing_model: "fixed",
      deployment_markets: 4,
      resources: { stakeholder_owners: 3, ai_trainers: 4, technical_resources: 2, supporting_departments: ["IT", "Customer Service", "Compliance"], knowledge_management: true },
      integrations: { channel: ["Zendesk Chat", "Meta Messenger"], human_handover: ["Genesys Cloud"], voice: ["Boost Voice"], utility: ["Salesforce CRM"] },
      specific_requirements: "Must support Norwegian, Swedish, Danish, and Finnish languages. GDPR compliance mandatory.",
      custom_notes: "Existing chatbot vendor contract expires Q3 2026. Migration path needed.",
    },
  },
  {
    id: "hs-2",
    name: "Tryg Insurance",
    data: {
      company_name: "Tryg Insurance",
      company_url: "https://tryg.com",
      contact_name: "Camilla 'Pipeline Queen' Nielsen",
      contact_role: "VP of Vibes-Based Pipeline",
      areas_of_interest: ["insurance"],
      channel_volumes: { chat: 52000, voice: 68000, email: 31000, social: 5000 },
      conversation_cost: "8.50",
      pricing_model: "outcome",
      deployment_markets: 3,
      resources: { stakeholder_owners: 2, ai_trainers: 3, technical_resources: 2, supporting_departments: ["Claims", "IT", "Legal"], knowledge_management: true },
      integrations: { channel: ["Salesforce Chat"], human_handover: ["Puzzel"], utility: ["Guidewire", "Salesforce CRM"], openid: ["Azure AD"] },
      specific_requirements: "Claims FNOL automation is top priority. Integration with Guidewire ClaimCenter required.",
    },
  },
  {
    id: "hs-3",
    name: "DNB ASA",
    data: {
      company_name: "DNB ASA",
      company_url: "https://dnb.no",
      contact_name: "Magnus Haugen",
      contact_role: "Director of Aspiring Automation",
      areas_of_interest: ["banking", "insurance"],
      channel_volumes: { chat: 120000, voice: 95000, email: 45000, social: 18000 },
      conversation_cost: "7.80",
      pricing_model: "usage",
      deployment_markets: 2,
      resources: { stakeholder_owners: 4, ai_trainers: 6, technical_resources: 3, supporting_departments: ["Digital Banking", "IT Infrastructure", "Customer Service", "Risk & Compliance"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat", "Apple Business Chat"], human_handover: ["Genesys Cloud"], voice: ["Boost Voice"], utility: ["Temenos T24", "Salesforce CRM"], openid: ["BankID"] },
      specific_requirements: "Mobile banking app integration critical. Must support BankID authentication flow.",
      custom_notes: "Board-level initiative for 2026. Budget pre-approved.",
    },
  },
  {
    id: "hs-4",
    name: "Handelsbanken",
    data: {
      company_name: "Handelsbanken",
      company_url: "https://handelsbanken.com",
      contact_name: "Anna Bergstr\u00f6m",
      contact_role: "Head of Optimistic Forecasting",
      areas_of_interest: ["banking"],
      channel_volumes: { chat: 38000, voice: 55000, email: 22000 },
      conversation_cost: "5.40",
      pricing_model: "fixed",
      deployment_markets: 6,
      resources: { stakeholder_owners: 2, ai_trainers: 2, technical_resources: 1, supporting_departments: ["Branch Operations", "IT"], knowledge_management: false },
      integrations: { channel: ["Zendesk Chat"], human_handover: ["Zendesk"], utility: ["Core Banking API"] },
    },
  },
  {
    id: "hs-5",
    name: "Storebrand",
    data: {
      company_name: "Storebrand",
      company_url: "https://storebrand.no",
      contact_name: "Kari 'KPI Whisperer' Olsen",
      contact_role: "Pension & Good Vibes Manager",
      areas_of_interest: ["insurance", "pension"],
      channel_volumes: { chat: 25000, voice: 30000, email: 18000, social: 3000 },
      conversation_cost: "9.10",
      pricing_model: "outcome",
      deployment_markets: 1,
      resources: { stakeholder_owners: 2, ai_trainers: 2, technical_resources: 1, supporting_departments: ["Pension Administration", "Life Insurance", "IT"], knowledge_management: true },
      integrations: { channel: ["Custom Web Chat"], human_handover: ["Puzzel"], utility: ["SAP"], openid: ["Azure AD"] },
      specific_requirements: "Pension inquiry automation is primary use case. Complex regulatory requirements around pension advice.",
    },
  },
];

/* ─── Field mapping for display ─── */
interface FieldOption {
  key: keyof GuideFormData;
  label: string;
  format: (val: unknown) => string;
}

const FIELDS: FieldOption[] = [
  { key: "company_name", label: "Company Name", format: (v) => String(v || "\u2014") },
  { key: "company_url", label: "Website", format: (v) => String(v || "\u2014") },
  { key: "contact_name", label: "Contact Name", format: (v) => String(v || "\u2014") },
  { key: "contact_role", label: "Contact Role", format: (v) => String(v || "\u2014") },
  { key: "areas_of_interest", label: "Areas of Interest", format: (v) => (Array.isArray(v) && v.length > 0) ? v.map((a: string) => a.replace(/_/g, " ")).join(", ") : "\u2014" },
  { key: "channel_volumes", label: "Channel Volumes", format: (v) => {
    const cv = v as Record<string, number> | undefined;
    if (!cv) return "\u2014";
    const parts = Object.entries(cv).filter(([, n]) => n > 0).map(([k, n]) => `${k}: ${n.toLocaleString()}`);
    return parts.length > 0 ? parts.join(", ") : "\u2014";
  }},
  { key: "conversation_cost", label: "Cost per Conversation", format: (v) => v ? `\u20ac${v}` : "\u2014" },
  { key: "pricing_model", label: "Pricing Model", format: (v) => v === "fixed" ? "Fixed Price" : v === "usage" ? "Pay by Usage" : v === "outcome" ? "Pay by Outcome" : "\u2014" },
  { key: "deployment_markets", label: "Markets", format: (v) => String(v || "\u2014") },
  { key: "resources", label: "Resources", format: (v) => {
    const r = v as Record<string, unknown> | undefined;
    if (!r) return "\u2014";
    const parts: string[] = [];
    if (r.stakeholder_owners) parts.push(`${r.stakeholder_owners} stakeholders`);
    if (r.ai_trainers) parts.push(`${r.ai_trainers} trainers`);
    if (r.technical_resources) parts.push(`${r.technical_resources} technical`);
    return parts.length > 0 ? parts.join(", ") : "\u2014";
  }},
  { key: "integrations", label: "Integrations", format: (v) => {
    const ig = v as Record<string, string[]> | undefined;
    if (!ig) return "\u2014";
    const all = Object.values(ig).flat().filter(Boolean);
    return all.length > 0 ? all.join(", ") : "\u2014";
  }},
  { key: "specific_requirements", label: "Requirements", format: (v) => v ? String(v).slice(0, 80) + (String(v).length > 80 ? "..." : "") : "\u2014" },
  { key: "custom_notes", label: "Notes", format: (v) => v ? String(v).slice(0, 80) + (String(v).length > 80 ? "..." : "") : "\u2014" },
];

/* ─── Modal ─── */
interface HubSpotImportModalProps {
  open: boolean;
  onClose: () => void;
  currentForm: GuideFormData;
  onApply: (merged: GuideFormData) => void;
}

export default function HubSpotImportModal({ open, onClose, currentForm, onApply }: HubSpotImportModalProps) {
  const [selectedAccount, setSelectedAccount] = useState<HSAccount | null>(null);
  /* Per-field choice: "hs" = use HubSpot value, "own" = keep current form value */
  const [choices, setChoices] = useState<Record<string, "hs" | "own">>({});

  /* Reset on open */
  useEffect(() => {
    if (open) {
      setSelectedAccount(null);
      setChoices({});
    }
  }, [open]);

  /* Escape to close */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const selectAccount = (account: HSAccount) => {
    setSelectedAccount(account);
    /* Default: use HS value for every field that has data */
    const initial: Record<string, "hs" | "own"> = {};
    for (const f of FIELDS) {
      const hsVal = account.data[f.key];
      const hasData = hsVal !== undefined && hsVal !== "" && hsVal !== null &&
        !(Array.isArray(hsVal) && hsVal.length === 0) &&
        !(typeof hsVal === "object" && !Array.isArray(hsVal) && Object.keys(hsVal).length === 0);
      initial[f.key] = hasData ? "hs" : "own";
    }
    setChoices(initial);
  };

  const toggleChoice = (key: string) => {
    setChoices((prev) => ({ ...prev, [key]: prev[key] === "hs" ? "own" : "hs" }));
  };

  const handleApply = () => {
    if (!selectedAccount) return;
    const merged = { ...currentForm };
    for (const f of FIELDS) {
      if (choices[f.key] === "hs" && selectedAccount.data[f.key] !== undefined) {
        (merged as Record<string, unknown>)[f.key] = selectedAccount.data[f.key];
      }
    }
    onApply(merged);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-boost-border w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden animate-modal-in flex flex-col">

        {/* Header */}
        <div className="px-5 py-4 border-b border-boost-border flex items-center gap-3 flex-shrink-0">
          {/* HubSpot sprocket icon */}
          <div className="w-8 h-8 rounded-lg bg-[#FF7A59]/10 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF7A59">
              <path d="M17.2 9.2V6.7a1.7 1.7 0 001-1.5V5a1.7 1.7 0 00-1.7-1.7h-.2A1.7 1.7 0 0014.6 5v.2a1.7 1.7 0 001 1.5v2.5a5.3 5.3 0 00-2.4 1.3l-6.4-5a2.1 2.1 0 00.1-.6 2.1 2.1 0 10-2.1 2.1c.4 0 .8-.1 1.1-.3l6.3 4.9a5.3 5.3 0 00-.5 2.3 5.3 5.3 0 00.7 2.6l-2 2a1.8 1.8 0 00-.5-.1 1.8 1.8 0 101.8 1.8 1.8 1.8 0 00-.1-.5l2-2a5.3 5.3 0 103.6-8.5zM16.5 17a3 3 0 01-3-3 3 3 0 013-3 3 3 0 013 3 3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-boost-dark">HubSpot Data</h3>
            <p className="text-xs text-boost-muted">
              {selectedAccount ? `Importing from ${selectedAccount.name}` : "Select an account to pre-fill"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-boost-muted hover:bg-boost-surface hover:text-boost-dark transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!selectedAccount ? (
            /* ─── Account picker ─── */
            <div className="p-5 space-y-2">
              {/* Humorous disclaimer banner */}
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 mb-3">
                <span className="mr-1">{"\uD83C\uDFAD"}</span>
                Heads up — this is placeholder data. Real HubSpot integration needs your API key + OAuth. For now, enjoy these artisanal, hand-crafted numbers.
              </div>
              <p className="text-xs font-semibold text-boost-muted uppercase tracking-wider mb-3">Accounts</p>
              {HS_ACCOUNTS.map((account) => (
                <button
                  key={account.id}
                  onClick={() => selectAccount(account)}
                  className="w-full text-left p-4 rounded-xl border border-boost-border hover:border-[#FF7A59]/50 hover:bg-[#FF7A59]/5 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-boost-dark group-hover:text-[#FF7A59]">{account.name}</p>
                      <p className="text-xs text-boost-muted mt-0.5">
                        {account.data.contact_name} — {account.data.contact_role}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {account.data.areas_of_interest?.map((a) => (
                        <span key={a} className="px-2 py-0.5 rounded-full bg-boost-surface text-[10px] font-semibold text-boost-muted capitalize">
                          {a.replace(/_/g, " ")}
                        </span>
                      ))}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-boost-muted">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            /* ─── Field-by-field chooser ─── */
            <div className="p-5">
              <button
                onClick={() => { setSelectedAccount(null); setChoices({}); }}
                className="flex items-center gap-1.5 text-xs text-boost-muted hover:text-boost-dark mb-4 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back to accounts
              </button>

              <div className="space-y-1">
                {/* Column headers */}
                <div className="grid grid-cols-[140px_1fr_1fr_36px] gap-2 px-2 pb-2 border-b border-boost-border">
                  <span className="text-[10px] font-semibold text-boost-muted uppercase">Field</span>
                  <span className="text-[10px] font-semibold text-[#FF7A59] uppercase">HubSpot</span>
                  <span className="text-[10px] font-semibold text-boost-muted uppercase">Your Value</span>
                  <span className="text-[10px] font-semibold text-boost-muted uppercase text-center">Use</span>
                </div>

                {FIELDS.map((field) => {
                  const hsVal = selectedAccount.data[field.key];
                  const ownVal = currentForm[field.key];
                  const hsDisplay = field.format(hsVal);
                  const ownDisplay = field.format(ownVal);
                  const hasHS = hsDisplay !== "\u2014";
                  const choice = choices[field.key] || "own";

                  return (
                    <div
                      key={field.key}
                      className={`grid grid-cols-[140px_1fr_1fr_36px] gap-2 px-2 py-2 rounded-lg transition-colors ${
                        choice === "hs" ? "bg-[#FF7A59]/5" : ""
                      }`}
                    >
                      <span className="text-xs font-medium text-boost-dark truncate">{field.label}</span>
                      <span className={`text-xs truncate ${choice === "hs" ? "text-[#FF7A59] font-medium" : "text-boost-muted"}`}>
                        {hsDisplay}
                      </span>
                      <span className={`text-xs truncate ${choice === "own" ? "text-boost-dark font-medium" : "text-boost-muted"}`}>
                        {ownDisplay}
                      </span>
                      <div className="flex justify-center">
                        {hasHS && (
                          <button
                            onClick={() => toggleChoice(field.key)}
                            className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                              choice === "hs"
                                ? "bg-[#FF7A59] text-white"
                                : "bg-boost-surface text-boost-muted hover:bg-boost-border"
                            }`}
                            title={choice === "hs" ? "Using HubSpot data" : "Using your value"}
                          >
                            {choice === "hs" ? "HS" : "\u2014"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedAccount && (
          <div className="px-5 py-4 border-t border-boost-border flex items-center justify-between flex-shrink-0">
            <span className="text-xs text-boost-muted">
              {Object.values(choices).filter((c) => c === "hs").length} fields from HubSpot (trust us)
            </span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg text-boost-muted hover:bg-boost-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-boost-border text-boost-dark hover:bg-boost-surface transition-colors"
              >
                Apply (Totally Real) Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
