"use client";

import { useState, useEffect } from "react";
import type { GuideFormData } from "@/lib/types";

/* ─── Placeholder Salesforce accounts ─── */
interface SFAccount {
  id: string;
  name: string;
  data: Partial<GuideFormData>;
}

const SF_ACCOUNTS: SFAccount[] = [
  {
    id: "sf-1",
    name: "Nordea Bank",
    data: {
      company_name: "Nordea Bank",
      company_url: "https://nordea.com",
      contact_name: "Erik Lindström",
      contact_role: "VP Digital Customer Experience",
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
    id: "sf-2",
    name: "Tryg Insurance",
    data: {
      company_name: "Tryg Insurance",
      company_url: "https://tryg.com",
      contact_name: "Camilla Nielsen",
      contact_role: "Head of Claims Automation",
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
    id: "sf-3",
    name: "DNB ASA",
    data: {
      company_name: "DNB ASA",
      company_url: "https://dnb.no",
      contact_name: "Magnus Haugen",
      contact_role: "Director AI & Automation",
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
    id: "sf-4",
    name: "Handelsbanken",
    data: {
      company_name: "Handelsbanken",
      company_url: "https://handelsbanken.com",
      contact_name: "Anna Bergström",
      contact_role: "Head of Customer Operations",
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
    id: "sf-5",
    name: "Storebrand",
    data: {
      company_name: "Storebrand",
      company_url: "https://storebrand.no",
      contact_name: "Kari Olsen",
      contact_role: "Product Manager, Digital Services",
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
  { key: "company_name", label: "Company Name", format: (v) => String(v || "—") },
  { key: "company_url", label: "Website", format: (v) => String(v || "—") },
  { key: "contact_name", label: "Contact Name", format: (v) => String(v || "—") },
  { key: "contact_role", label: "Contact Role", format: (v) => String(v || "—") },
  { key: "areas_of_interest", label: "Areas of Interest", format: (v) => (Array.isArray(v) && v.length > 0) ? v.map((a: string) => a.replace(/_/g, " ")).join(", ") : "—" },
  { key: "channel_volumes", label: "Channel Volumes", format: (v) => {
    const cv = v as Record<string, number> | undefined;
    if (!cv) return "—";
    const parts = Object.entries(cv).filter(([, n]) => n > 0).map(([k, n]) => `${k}: ${n.toLocaleString()}`);
    return parts.length > 0 ? parts.join(", ") : "—";
  }},
  { key: "conversation_cost", label: "Cost per Conversation", format: (v) => v ? `€${v}` : "—" },
  { key: "pricing_model", label: "Pricing Model", format: (v) => v === "fixed" ? "Fixed Price" : v === "usage" ? "Pay by Usage" : v === "outcome" ? "Pay by Outcome" : "—" },
  { key: "deployment_markets", label: "Markets", format: (v) => String(v || "—") },
  { key: "resources", label: "Resources", format: (v) => {
    const r = v as Record<string, unknown> | undefined;
    if (!r) return "—";
    const parts: string[] = [];
    if (r.stakeholder_owners) parts.push(`${r.stakeholder_owners} stakeholders`);
    if (r.ai_trainers) parts.push(`${r.ai_trainers} trainers`);
    if (r.technical_resources) parts.push(`${r.technical_resources} technical`);
    return parts.length > 0 ? parts.join(", ") : "—";
  }},
  { key: "integrations", label: "Integrations", format: (v) => {
    const ig = v as Record<string, string[]> | undefined;
    if (!ig) return "—";
    const all = Object.values(ig).flat().filter(Boolean);
    return all.length > 0 ? all.join(", ") : "—";
  }},
  { key: "specific_requirements", label: "Requirements", format: (v) => v ? String(v).slice(0, 80) + (String(v).length > 80 ? "..." : "") : "—" },
  { key: "custom_notes", label: "Notes", format: (v) => v ? String(v).slice(0, 80) + (String(v).length > 80 ? "..." : "") : "—" },
];

/* ─── Modal ─── */
interface SalesforceImportModalProps {
  open: boolean;
  onClose: () => void;
  currentForm: GuideFormData;
  onApply: (merged: GuideFormData) => void;
}

export default function SalesforceImportModal({ open, onClose, currentForm, onApply }: SalesforceImportModalProps) {
  const [selectedAccount, setSelectedAccount] = useState<SFAccount | null>(null);
  /* Per-field choice: "sf" = use Salesforce value, "own" = keep current form value */
  const [choices, setChoices] = useState<Record<string, "sf" | "own">>({});

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

  const selectAccount = (account: SFAccount) => {
    setSelectedAccount(account);
    /* Default: use SF value for every field that has data */
    const initial: Record<string, "sf" | "own"> = {};
    for (const f of FIELDS) {
      const sfVal = account.data[f.key];
      const hasData = sfVal !== undefined && sfVal !== "" && sfVal !== null &&
        !(Array.isArray(sfVal) && sfVal.length === 0) &&
        !(typeof sfVal === "object" && !Array.isArray(sfVal) && Object.keys(sfVal).length === 0);
      initial[f.key] = hasData ? "sf" : "own";
    }
    setChoices(initial);
  };

  const toggleChoice = (key: string) => {
    setChoices((prev) => ({ ...prev, [key]: prev[key] === "sf" ? "own" : "sf" }));
  };

  const handleApply = () => {
    if (!selectedAccount) return;
    const merged = { ...currentForm };
    for (const f of FIELDS) {
      if (choices[f.key] === "sf" && selectedAccount.data[f.key] !== undefined) {
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
          {/* Salesforce-style cloud icon */}
          <div className="w-8 h-8 rounded-lg bg-[#00A1E0]/10 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00A1E0" strokeWidth="2">
              <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-boost-dark">Salesforce Data</h3>
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
              <p className="text-xs font-semibold text-boost-muted uppercase tracking-wider mb-3">Accounts</p>
              {SF_ACCOUNTS.map((account) => (
                <button
                  key={account.id}
                  onClick={() => selectAccount(account)}
                  className="w-full text-left p-4 rounded-xl border border-boost-border hover:border-boost-green-light/50 hover:bg-boost-surface/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-boost-dark group-hover:text-boost-green">{account.name}</p>
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
                  <span className="text-[10px] font-semibold text-[#00A1E0] uppercase">Salesforce</span>
                  <span className="text-[10px] font-semibold text-boost-muted uppercase">Your Value</span>
                  <span className="text-[10px] font-semibold text-boost-muted uppercase text-center">Use</span>
                </div>

                {FIELDS.map((field) => {
                  const sfVal = selectedAccount.data[field.key];
                  const ownVal = currentForm[field.key];
                  const sfDisplay = field.format(sfVal);
                  const ownDisplay = field.format(ownVal);
                  const hasSF = sfDisplay !== "—";
                  const choice = choices[field.key] || "own";

                  return (
                    <div
                      key={field.key}
                      className={`grid grid-cols-[140px_1fr_1fr_36px] gap-2 px-2 py-2 rounded-lg transition-colors ${
                        choice === "sf" ? "bg-[#00A1E0]/5" : ""
                      }`}
                    >
                      <span className="text-xs font-medium text-boost-dark truncate">{field.label}</span>
                      <span className={`text-xs truncate ${choice === "sf" ? "text-[#00A1E0] font-medium" : "text-boost-muted"}`}>
                        {sfDisplay}
                      </span>
                      <span className={`text-xs truncate ${choice === "own" ? "text-boost-dark font-medium" : "text-boost-muted"}`}>
                        {ownDisplay}
                      </span>
                      <div className="flex justify-center">
                        {hasSF && (
                          <button
                            onClick={() => toggleChoice(field.key)}
                            className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                              choice === "sf"
                                ? "bg-[#00A1E0] text-white"
                                : "bg-boost-surface text-boost-muted hover:bg-boost-border"
                            }`}
                            title={choice === "sf" ? "Using Salesforce data" : "Using your value"}
                          >
                            {choice === "sf" ? "SF" : "—"}
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
              {Object.values(choices).filter((c) => c === "sf").length} fields from Salesforce
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
                Apply to Form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
