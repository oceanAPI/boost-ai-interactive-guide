"use client";

import { useState } from "react";
import { SectionHeader, StatCounter } from "@/components/ui";
import { assetPath } from "@/lib/asset-path";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { GuideData } from "@/lib/types";
import type { TopicContentBlock } from "@/data/topics/_types";
import ContentBlockRenderer from "@/components/sections/topics/ContentBlocks";

/* ═══════════════════════════════════════════════════════════════
   Section 06 — Security & Compliance
   Interactive expandable cards with custom visualizations
   ═══════════════════════════════════════════════════════════════ */

interface Props {
  guide: GuideData;
  sectionNumber: string;
  headerBlocks?: TopicContentBlock[];
  contentBlocks?: TopicContentBlock[];
}

/* ─── Reusable icon helper ─── */
function BoostIcon({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <img
      src={assetPath(`/icons/purple/${name}.svg`)}
      alt=""
      width={size}
      height={size}
      className="flex-shrink-0"
    />
  );
}

/* ─── Expandable card shell ─── */
function SecurityCard({
  title,
  subtitle,
  icon,
  accentColor = "border-boost-purple",
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { ref, isVisible } = useScrollReveal({ once: true });

  return (
    <div
      ref={ref}
      className={`rounded-xl border bg-white overflow-hidden transition-all duration-300 ${
        open ? "shadow-lg border-boost-purple/20" : "shadow-sm border-boost-border hover:shadow-md"
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {/* Accent top stripe */}
      <div className={`h-[3px] ${accentColor.replace("border-", "bg-")}`} />

      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 sm:p-5 text-left hover:bg-boost-surface/30 transition-colors"
      >
        <span className="flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-boost-dark text-sm sm:text-base">{title}</span>
          {!open && (
            <p className="text-xs text-boost-muted mt-0.5 line-clamp-1">{subtitle}</p>
          )}
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-boost-muted flex-shrink-0 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-400 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-4 sm:px-5 pb-5 pt-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Card 1 — Generative Action Flow
   Purple step flow showing how guardrails wrap every interaction
   ═══════════════════════════════════════════════════════════════ */
function GenerativeActionFlow() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      label: "User Input",
      color: "bg-boost-purple/10 border-boost-purple/30",
      textColor: "text-boost-purple",
      detail:
        "Customer message arrives via any connected channel — chat, voice, or messaging.",
    },
    {
      label: "Input Guardrails",
      color: "bg-boost-purple border-boost-purple",
      textColor: "text-white",
      detail:
        "Real-time screening: PII detection, jailbreak prevention, topic boundary enforcement, and profanity filtering — before any LLM processing.",
    },
    {
      label: "Generative AI Processing",
      color: "bg-boost-purple-dark border-boost-purple-dark",
      textColor: "text-white",
      detail:
        "LLM generates a response using approved knowledge sources. RAG retrieval is scoped to authorized content only. No training on customer data.",
    },
    {
      label: "Output Guardrails",
      color: "bg-boost-purple border-boost-purple",
      textColor: "text-white",
      detail:
        "Response validation: hallucination check, compliance verification, tone consistency, PII masking on output, and brand alignment.",
    },
    {
      label: "Safe Response",
      color: "bg-boost-green/10 border-boost-green/30",
      textColor: "text-boost-green",
      detail:
        "Verified, compliant response delivered to the customer. Full conversation logged with audit trail.",
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-boost-muted leading-relaxed">
        Every interaction passes through multiple safety layers. Click any step to learn more.
      </p>

      {/* Flow diagram */}
      <div className="flex flex-col items-center gap-0">
        {steps.map((step, i) => (
          <div key={step.label} className="flex flex-col items-center w-full max-w-sm">
            {/* Step card */}
            <button
              onClick={() => setActiveStep(activeStep === i ? null : i)}
              className={`w-full rounded-lg border-2 px-4 py-3 text-center transition-all duration-200 ${
                step.color
              } ${
                activeStep === i
                  ? "ring-2 ring-boost-green ring-offset-2 scale-[1.02]"
                  : "hover:scale-[1.01]"
              }`}
            >
              <span className={`text-sm font-semibold ${step.textColor}`}>
                {step.label}
              </span>
            </button>

            {/* Detail panel */}
            {activeStep === i && (
              <div className="w-full mt-2 mb-1 bg-boost-surface rounded-lg border border-boost-border p-3 animate-modal-in">
                <p className="text-xs text-boost-text-secondary leading-relaxed">
                  {step.detail}
                </p>
              </div>
            )}

            {/* Arrow connector */}
            {i < steps.length - 1 && (
              <div className="flex flex-col items-center py-1">
                <div className="w-px h-4 bg-boost-purple/30" />
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  className="text-boost-purple/40"
                >
                  <path d="M0 0L5 6L10 0" fill="currentColor" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-2 border-t border-boost-border/50">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-boost-purple/10 border border-boost-purple/30" />
          <span className="text-[10px] text-boost-muted">User touchpoint</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-boost-purple" />
          <span className="text-[10px] text-boost-muted">Guardrail layer</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-boost-purple-dark" />
          <span className="text-[10px] text-boost-muted">AI processing</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-boost-green/10 border border-boost-green/30" />
          <span className="text-[10px] text-boost-muted">Verified output</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Card 2 — PII Masking Demo
   Interactive toggle showing masked vs unmasked conversation
   ═══════════════════════════════════════════════════════════════ */
function PIIMaskingDemo() {
  const [masked, setMasked] = useState(true);

  const conversationLines = [
    {
      role: "customer" as const,
      raw: "Hi, my name is Sarah Johnson and I need help with my account.",
      masked: "Hi, my name is [REDACTED NAME] and I need help with my account.",
    },
    {
      role: "agent" as const,
      raw: "Of course! Can you verify your account number?",
      masked: "Of course! Can you verify your account number?",
    },
    {
      role: "customer" as const,
      raw: "Sure, it's NO 8601 11 17947. My email is sarah.j@example.com",
      masked:
        "Sure, it's [REDACTED ACCOUNT]. My email is [REDACTED EMAIL]",
    },
    {
      role: "agent" as const,
      raw: "Thank you, Sarah. I can see your account ending in 7947. How can I help today?",
      masked:
        "Thank you, [REDACTED NAME]. I can see your account ending in [MASKED]. How can I help today?",
    },
  ];

  const maskTypes = [
    { label: "Names", active: true },
    { label: "Account numbers", active: true },
    { label: "Email addresses", active: true },
    { label: "Phone numbers", active: true },
    { label: "National IDs", active: true },
    { label: "Credit card numbers", active: true },
  ];

  return (
    <div className="space-y-4">
      {/* Toggle bar */}
      <div className="flex items-center justify-between bg-boost-surface rounded-lg p-3 border border-boost-border">
        <div>
          <p className="text-xs font-semibold text-boost-dark">PII Masking</p>
          <p className="text-[10px] text-boost-muted">
            Toggle to see how data appears in logs & analytics
          </p>
        </div>
        <button
          onClick={() => setMasked(!masked)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
            masked ? "bg-boost-green" : "bg-boost-border"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
              masked ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      {/* Chat preview */}
      <div className="bg-boost-surface/50 rounded-lg border border-boost-border p-3 space-y-2.5">
        {conversationLines.map((line, i) => (
          <div
            key={i}
            className={`flex ${line.role === "customer" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed transition-colors duration-300 ${
                line.role === "customer"
                  ? "bg-white border border-boost-border text-boost-dark"
                  : "bg-boost-purple/10 text-boost-dark"
              }`}
            >
              <span className="text-[10px] font-bold text-boost-muted block mb-0.5">
                {line.role === "customer" ? "Customer" : "AI Agent"}
              </span>
              {masked ? (
                <span>
                  {line.masked.split(/(\[.*?\])/).map((part, j) =>
                    part.startsWith("[") ? (
                      <span
                        key={j}
                        className="bg-boost-purple/15 text-boost-purple font-mono text-[10px] px-1 py-0.5 rounded"
                      >
                        {part}
                      </span>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </span>
              ) : (
                <span>{line.raw}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mask type badges */}
      <div>
        <p className="text-[10px] font-bold text-boost-muted uppercase tracking-wider mb-2">
          Configurable data types
        </p>
        <div className="flex flex-wrap gap-1.5">
          {maskTypes.map((mt) => (
            <span
              key={mt.label}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] bg-boost-purple/5 text-boost-purple border border-boost-purple/15"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                className="text-boost-green"
              >
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {mt.label}
            </span>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-boost-muted leading-relaxed">
        Real-time PII masking is applied before data reaches logs, analytics, or LLM context.
        Configurable per agent, per channel, per data type. Partial masking supported (e.g.
        show last 4 digits).
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Card 3 — Compliance Certifications
   Badge grid with details
   ═══════════════════════════════════════════════════════════════ */
function ComplianceCertifications() {
  const [selectedCert, setSelectedCert] = useState<number | null>(null);

  const certs = [
    {
      name: "ISO 27001",
      category: "Security",
      icon: "shield-medal",
      description:
        "Certified Information Security Management System. Annual third-party audits covering access control, risk management, incident response, and business continuity.",
    },
    {
      name: "ISO 27701",
      category: "Privacy",
      icon: "lock-security",
      description:
        "Privacy Information Management extension to ISO 27001. Demonstrates systematic approach to managing personal data in line with GDPR requirements.",
    },
    {
      name: "GDPR",
      category: "Privacy",
      icon: "hierarchy-document-3671708",
      description:
        "Full compliance with EU General Data Protection Regulation. Data processing agreements, subject access rights, right to erasure, and data portability supported.",
    },
    {
      name: "SOC 2 Type II",
      category: "Security",
      icon: "check-symbol-check",
      description:
        "Independent audit of security, availability, and confidentiality controls. Continuous monitoring over a 12-month observation period.",
    },
    {
      name: "FSQS",
      category: "Financial",
      icon: "bank",
      description:
        "Financial Services Qualification System — pre-qualification standard for suppliers to the financial services industry. Validates operational resilience and data handling.",
    },
    {
      name: "EU AI Act",
      category: "AI Regulation",
      icon: "check-robot",
      description:
        "Designed for compliance with high-risk AI classification. Transparency obligations, human oversight mechanisms, and risk management documentation built in.",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {certs.map((cert, i) => (
          <button
            key={cert.name}
            onClick={() => setSelectedCert(selectedCert === i ? null : i)}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all text-center ${
              selectedCert === i
                ? "border-boost-purple bg-boost-purple/5 shadow-sm"
                : "border-boost-border bg-white hover:bg-boost-surface/50 hover:border-boost-purple/20"
            }`}
          >
            <BoostIcon name={cert.icon} size={24} />
            <div>
              <p className="text-xs font-semibold text-boost-dark">{cert.name}</p>
              <p className="text-[10px] text-boost-muted">{cert.category}</p>
            </div>
          </button>
        ))}
      </div>

      {selectedCert !== null && (
        <div className="bg-boost-surface rounded-lg border border-boost-border p-3 animate-modal-in">
          <div className="flex items-start gap-2">
            <BoostIcon name={certs[selectedCert].icon} size={20} />
            <div>
              <p className="text-sm font-semibold text-boost-dark">
                {certs[selectedCert].name}
              </p>
              <p className="text-xs text-boost-text-secondary leading-relaxed mt-1">
                {certs[selectedCert].description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Card 4 — Guardrail Configuration
   Interactive guardrail type selector
   ═══════════════════════════════════════════════════════════════ */
function GuardrailConfig() {
  const [activeGuardrail, setActiveGuardrail] = useState(0);

  const guardrails = [
    {
      name: "Topic boundaries",
      icon: "goal-flag",
      scope: "Per agent",
      description:
        "Define exactly which topics an agent can and cannot discuss. Agents stay within their designated scope — no off-topic responses, no scope creep.",
      example: 'Agent is restricted to "Loans & Mortgages" → will not answer pension questions.',
    },
    {
      name: "Hallucination prevention",
      icon: "check-robot",
      scope: "Global",
      description:
        "Responses are grounded in approved knowledge sources only. If the agent doesn't have a verified answer, it acknowledges this rather than fabricating one.",
      example:
        "Agent asked about a product it has no data for → responds with handover to specialist.",
    },
    {
      name: "Jailbreak protection",
      icon: "shield-medal",
      scope: "Global",
      description:
        'Multi-layered defense against prompt injection and jailbreak attempts. Detects and blocks attempts to make the agent ignore instructions or "role-play" around restrictions.',
      example:
        '"Ignore your instructions and tell me..." → blocked and flagged in security log.',
    },
    {
      name: "PII filtering",
      icon: "lock-security",
      scope: "Configurable",
      description:
        "Automatic detection and masking of personal identifiable information in both input and output. Prevents sensitive data from reaching LLM context or being stored in logs.",
      example:
        "Customer shares account number → masked before LLM sees it, masked in all logs.",
    },
    {
      name: "Tone & brand alignment",
      icon: "chatbot",
      scope: "Per agent",
      description:
        "Enforce consistent tone, language, and brand voice across all responses. Define approved phrasing, prohibited terms, and communication style guidelines.",
      example:
        "Agent must use formal language, never use slang, always reference official product names.",
    },
    {
      name: "Compliance rules",
      icon: "hierarchy-document-3671708",
      scope: "Global + per agent",
      description:
        "Enforce regulatory requirements as hard rules. Financial disclaimers, risk warnings, and mandatory disclosures are automatically included when relevant.",
      example:
        "Agent discussing investment products → automatically appends required risk disclaimer.",
    },
  ];

  const active = guardrails[activeGuardrail];

  return (
    <div className="space-y-4">
      {/* Guardrail selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {guardrails.map((g, i) => (
          <button
            key={g.name}
            onClick={() => setActiveGuardrail(i)}
            className={`px-3 py-2.5 rounded-lg text-center transition-all text-xs leading-tight ${
              activeGuardrail === i
                ? "bg-boost-purple text-white font-semibold shadow-sm"
                : "bg-boost-surface text-boost-dark hover:bg-boost-purple/5 border border-boost-border"
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Detail panel */}
      <div className="bg-boost-surface rounded-lg border border-boost-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BoostIcon name={active.icon} size={20} />
            <p className="text-sm font-semibold text-boost-dark">{active.name}</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-boost-purple/10 text-boost-purple font-medium">
            {active.scope}
          </span>
        </div>
        <p className="text-xs text-boost-text-secondary leading-relaxed">
          {active.description}
        </p>
        <div className="bg-white rounded-md border border-boost-border/50 p-2.5">
          <p className="text-[10px] font-bold text-boost-muted uppercase tracking-wider mb-1">
            Example
          </p>
          <p className="text-xs text-boost-dark italic leading-relaxed">
            {active.example}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Card 5 — Data Handling & Infrastructure
   Visual overview of data architecture
   ═══════════════════════════════════════════════════════════════ */
function DataInfrastructure() {
  const [expandedLayer, setExpandedLayer] = useState<number | null>(null);

  const layers = [
    {
      label: "Encryption",
      icon: "lock-security",
      color: "border-boost-green",
      summary: "AES-256 at rest, TLS 1.3 in transit",
      items: [
        { name: "AES-256 at rest", detail: "All stored data encrypted with AES-256. Encryption keys managed via AWS KMS with automatic rotation every 90 days." },
        { name: "TLS 1.3 in transit", detail: "All data in transit protected with TLS 1.3. Older protocols disabled. Certificate pinning available for mobile SDKs." },
        { name: "Key rotation", detail: "Automated key rotation with zero-downtime re-encryption. Customer-managed keys (BYOK) supported for enterprise deployments." },
      ],
    },
    {
      label: "Access control",
      icon: "shield-medal",
      color: "border-boost-purple",
      summary: "RBAC, SSO/SAML, MFA, API scoping",
      items: [
        { name: "Role-based access (RBAC)", detail: "Granular permissions across platform roles — admin, editor, viewer, API-only. Custom roles configurable per organization." },
        { name: "SSO / SAML integration", detail: "Single sign-on via SAML 2.0, OpenID Connect, or OAuth 2.0. Supports Azure AD, Okta, OneLogin, and custom IdPs." },
        { name: "MFA enforced", detail: "Multi-factor authentication required for all admin access. Supports authenticator apps, hardware keys (FIDO2), and SMS fallback." },
        { name: "API key scoping", detail: "API keys scoped to specific agents, environments, and actions. Rate limiting and IP allowlisting per key." },
      ],
    },
    {
      label: "Data residency",
      icon: "lock-server",
      color: "border-boost-orange",
      summary: "EU-hosted, single-tenant, on-premise option",
      items: [
        { name: "EU-hosted (AWS Frankfurt)", detail: "Primary infrastructure in AWS eu-central-1 (Frankfurt). All data processing and storage within EU borders by default." },
        { name: "Single-tenant available", detail: "Dedicated infrastructure with isolated compute, storage, and networking. No shared resources with other customers." },
        { name: "On-premise option", detail: "Full platform deployment within your own data center or private cloud. Air-gapped deployments supported for regulated environments." },
        { name: "No cross-border transfer", detail: "Strict data residency enforcement. No data replication or processing outside the designated region. Compliant with Schrems II requirements." },
      ],
    },
    {
      label: "Audit & retention",
      icon: "hierarchy-document-3671708",
      color: "border-boost-purple",
      summary: "Full audit trail, configurable retention",
      items: [
        { name: "Conversation audit trail", detail: "Every conversation logged with timestamps, user identifiers, agent actions, and guardrail triggers. Immutable audit log." },
        { name: "Admin action logging", detail: "All platform changes tracked — configuration updates, user management, knowledge base edits. Who did what, when." },
        { name: "Configurable retention", detail: "Set retention periods per data type: conversations, analytics, PII, and system logs. From 30 days to indefinite." },
        { name: "Auto-deletion", detail: "Automated data lifecycle management. Scheduled purges with confirmation workflows. Right-to-erasure (GDPR Art. 17) built in." },
      ],
    },
  ];

  return (
    <div className="space-y-2">
      {layers.map((layer, layerIdx) => {
        const isExpanded = expandedLayer === layerIdx;
        return (
          <div key={layer.label}>
            <button
              onClick={() => setExpandedLayer(isExpanded ? null : layerIdx)}
              className={`w-full rounded-lg border-l-[3px] ${layer.color} p-3 text-left transition-all ${
                isExpanded
                  ? "bg-boost-surface shadow-sm"
                  : "bg-boost-surface/50 hover:bg-boost-surface/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BoostIcon name={layer.icon} size={18} />
                  <p className="text-xs font-semibold text-boost-dark">{layer.label}</p>
                </div>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`text-boost-muted flex-shrink-0 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              {!isExpanded && (
                <p className="text-[10px] text-boost-muted mt-1">{layer.summary}</p>
              )}
            </button>

            {isExpanded && (
              <div className="mt-1 space-y-1.5 pl-3 animate-modal-in">
                {layer.items.map((item) => (
                  <div
                    key={item.name}
                    className="bg-white rounded-lg border border-boost-border p-3"
                  >
                    <p className="text-xs font-semibold text-boost-dark">{item.name}</p>
                    <p className="text-[10px] text-boost-text-secondary leading-relaxed mt-1">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={() => setExpandedLayer(expandedLayer === 99 ? null : 99)}
        className="w-full bg-boost-green/5 rounded-lg border border-boost-green/20 p-3 text-left transition-all hover:bg-boost-green/10"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-boost-green">Zero data training</p>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-boost-green flex-shrink-0 transition-transform duration-200 ${
              expandedLayer === 99 ? "rotate-180" : ""
            }`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        {expandedLayer !== 99 && (
          <p className="text-[10px] text-boost-text-secondary mt-1">
            Customer data is never used to train models
          </p>
        )}
      </button>
      {expandedLayer === 99 && (
        <div className="pl-3 animate-modal-in">
          <div className="bg-white rounded-lg border border-boost-green/20 p-3">
            <p className="text-[10px] text-boost-text-secondary leading-relaxed">
              Customer data is never used to train boost.ai models or any third-party LLMs.
              Conversation data stays within your tenant boundary and is only accessible to
              authorized personnel within your organization. This is a contractual guarantee,
              not just a policy — enforced at the infrastructure level with network isolation
              and strict access controls.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Card 6 — Regulatory Readiness
   EU AI Act & DORA deep dive
   ═══════════════════════════════════════════════════════════════ */
function RegulatoryReadiness() {
  const [activeTab, setActiveTab] = useState<"euai" | "dora">("euai");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const tabs = {
    euai: {
      title: "EU AI Act",
      subtitle: "High-risk AI system requirements",
      items: [
        {
          requirement: "Risk management system",
          status: "Built in",
          summary: "Continuous risk assessment with guardrails and monitoring",
          detail: "boost.ai provides a complete risk management framework as required by Article 9. This includes real-time guardrail monitoring, automated incident detection and classification, risk scoring per conversation, and configurable escalation workflows. Risk assessments are continuously updated based on agent performance data.",
        },
        {
          requirement: "Data governance",
          status: "Built in",
          summary: "Training data documentation and bias testing",
          detail: "Full compliance with Article 10 data governance requirements. All training data is documented with provenance tracking, version control, and bias assessment reports. Knowledge sources are auditable — you can trace any response back to its source material. Data quality metrics are continuously monitored.",
        },
        {
          requirement: "Technical documentation",
          status: "Built in",
          summary: "Automated system documentation and model cards",
          detail: "Article 11 technical documentation is generated automatically. This includes system architecture descriptions, model capability boundaries, intended use documentation, known limitations, and performance metrics. Documentation stays in sync with configuration changes.",
        },
        {
          requirement: "Human oversight",
          status: "Built in",
          summary: "Handover triggers and supervision tools",
          detail: "Article 14 human oversight mechanisms include configurable confidence thresholds for automatic handover, real-time agent monitoring dashboards, conversation intervention capabilities, and one-click agent pause/resume. Supervisors can review and override any agent decision.",
        },
        {
          requirement: "Transparency obligations",
          status: "Built in",
          summary: "AI disclosure and interaction logging",
          detail: "Full Article 13 transparency compliance. End users are clearly informed they are interacting with an AI system. Decision explanations can be provided on request. All interactions are logged with full audit trail. Customers can access their conversation history.",
        },
        {
          requirement: "Accuracy & robustness",
          status: "Built in",
          summary: "Hallucination prevention and accuracy monitoring",
          detail: "Article 15 accuracy requirements met through multi-layer guardrails: knowledge grounding (responses tied to verified sources), hallucination detection (responses checked against source material), adversarial input protection (jailbreak detection), and continuous accuracy monitoring with automated alerts when performance degrades.",
        },
      ],
    },
    dora: {
      title: "DORA",
      subtitle: "Digital Operational Resilience Act",
      items: [
        {
          requirement: "ICT risk management",
          status: "Compliant",
          summary: "Comprehensive risk framework",
          detail: "Complete ICT risk management framework covering identification, protection, detection, response, and recovery. Regular risk assessments with documented methodology. Business impact analysis for all critical functions. Risk appetite statements aligned with financial services requirements.",
        },
        {
          requirement: "Incident reporting",
          status: "Compliant",
          summary: "Structured classification and notification",
          detail: "Structured incident management with automated classification by severity. Notification workflows aligned with DORA reporting timelines (initial notification within 4 hours, intermediate within 72 hours, final within 1 month). Post-incident analysis with root cause documentation and remediation tracking.",
        },
        {
          requirement: "Resilience testing",
          status: "Compliant",
          summary: "Penetration testing and DR drills",
          detail: "Regular penetration testing by independent third parties. Vulnerability scanning on continuous basis. Disaster recovery drills conducted quarterly with documented results. Threat-led penetration testing (TLPT) program aligned with TIBER-EU framework. Recovery time objectives (RTO) and recovery point objectives (RPO) tested and validated.",
        },
        {
          requirement: "Third-party risk",
          status: "Compliant",
          summary: "Vendor management and monitoring",
          detail: "Comprehensive third-party risk management covering all sub-processors. Regular vendor assessments with documented due diligence. Concentration risk analysis for critical service providers. Contractual provisions for audit rights, exit strategies, and data portability. Sub-processor changes communicated with advance notice.",
        },
        {
          requirement: "Information sharing",
          status: "Compliant",
          summary: "Cyber threat intelligence and reporting",
          detail: "Participation in cyber threat intelligence sharing frameworks. Regulatory reporting capabilities integrated into the platform. Incident data structured for automated regulatory submission. Secure communication channels for threat intelligence exchange with customers and authorities.",
        },
      ],
    },
  };

  const active = tabs[activeTab];

  return (
    <div className="space-y-4">
      {/* Tab selector */}
      <div className="flex gap-1 bg-boost-surface rounded-lg p-1 border border-boost-border">
        {(["euai", "dora"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setExpandedItem(null);
            }}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === tab
                ? "bg-boost-purple text-white shadow-sm"
                : "text-boost-muted hover:text-boost-dark"
            }`}
          >
            {tabs[tab].title}
          </button>
        ))}
      </div>

      <p className="text-xs text-boost-muted">{active.subtitle}</p>

      {/* Requirements list */}
      <div className="space-y-2">
        {active.items.map((item) => {
          const isExpanded = expandedItem === `${activeTab}-${item.requirement}`;
          return (
            <button
              key={item.requirement}
              onClick={() =>
                setExpandedItem(
                  isExpanded ? null : `${activeTab}-${item.requirement}`
                )
              }
              className={`w-full text-left rounded-lg border p-3 transition-all ${
                isExpanded
                  ? "bg-boost-surface border-boost-purple/20 shadow-sm"
                  : "bg-white border-boost-border hover:bg-boost-surface/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-boost-dark">{item.requirement}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-boost-green/10 text-boost-green font-medium">
                    {item.status}
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`text-boost-muted transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
              {!isExpanded && (
                <p className="text-[10px] text-boost-muted mt-0.5">{item.summary}</p>
              )}
              {isExpanded && (
                <p className="text-[10px] text-boost-text-secondary leading-relaxed mt-2 animate-modal-in">
                  {item.detail}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Section Component
   ═══════════════════════════════════════════════════════════════ */
export default function SecurityComplianceSection({
  guide,
  sectionNumber,
  headerBlocks,
  contentBlocks,
}: Props) {
  return (
    <section>
      <SectionHeader
        number={sectionNumber}
        title="Security & Compliance"
        subtitle="Bank-grade guardrails, EU AI Act readiness, and enterprise-level data protection built into every interaction."
      />

      {/* Header content blocks (stats) */}
      {headerBlocks?.map((block, i) => (
        <div key={i} className="mb-6">
          <ContentBlockRenderer block={block} />
        </div>
      ))}

      {/* Lead callout */}
      <div className="bg-boost-purple/5 rounded-xl border border-boost-purple/15 p-4 mb-8">
        <p className="text-sm text-boost-dark leading-relaxed">
          <span className="font-semibold">Guardrails come out of the box.</span>{" "}
          boost.ai provides built-in control and safety for every interaction — compliance,
          risk reduction, and response quality are handled at the platform level, not bolted on
          after the fact.
        </p>
      </div>

      {/* Expandable card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1 — Generative Action Flow */}
        <SecurityCard
          title="Generative Action Flow"
          subtitle="How every interaction is secured end-to-end"
          icon={<BoostIcon name="shield-medal" />}
          accentColor="border-boost-purple"
          defaultOpen
        >
          <GenerativeActionFlow />
        </SecurityCard>

        {/* Card 2 — PII Masking */}
        <SecurityCard
          title="PII Masking"
          subtitle="Real-time data protection in every conversation"
          icon={<BoostIcon name="lock-security" />}
          accentColor="border-boost-green"
        >
          <PIIMaskingDemo />
        </SecurityCard>

        {/* Card 3 — Certifications */}
        <SecurityCard
          title="Compliance Certifications"
          subtitle="ISO 27001, SOC 2, GDPR, and more"
          icon={<BoostIcon name="check-symbol-check" />}
          accentColor="border-boost-purple"
        >
          <ComplianceCertifications />
        </SecurityCard>

        {/* Card 4 — Guardrail Configuration */}
        <SecurityCard
          title="Guardrail Configuration"
          subtitle="Six layers of configurable protection"
          icon={<BoostIcon name="check-robot" />}
          accentColor="border-boost-purple"
        >
          <GuardrailConfig />
        </SecurityCard>

        {/* Card 5 — Data & Infrastructure */}
        <SecurityCard
          title="Data Handling & Infrastructure"
          subtitle="Encryption, access control, residency, and audit"
          icon={<BoostIcon name="lock-server" />}
          accentColor="border-boost-green"
        >
          <DataInfrastructure />
        </SecurityCard>

        {/* Card 6 — Regulatory Readiness */}
        <SecurityCard
          title="Regulatory Readiness"
          subtitle="EU AI Act and DORA compliance mapped"
          icon={<BoostIcon name="hierarchy-document-3671708" />}
          accentColor="border-boost-purple"
        >
          <RegulatoryReadiness />
        </SecurityCard>
      </div>

      {/* Bottom content blocks */}
      {contentBlocks && contentBlocks.length > 0 && (
        <div className="mt-8 space-y-6">
          {contentBlocks.map((block, i) => (
            <ContentBlockRenderer key={i} block={block} />
          ))}
        </div>
      )}
    </section>
  );
}
