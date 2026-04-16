"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { SectionHeader } from "@/components/ui";
import { assetPath } from "@/lib/asset-path";
import type { GuideData } from "@/lib/types";
import type { TopicContentBlock } from "@/data/topics/_types";
import ContentBlockRenderer from "@/components/sections/topics/ContentBlocks";
import { ALL_INTEGRATIONS } from "@/data/integrations";

/* ─── Types ─── */
interface ArchNode {
  label: string;
  icon: string;
  description?: string;
  category?: string;
  isStatic?: boolean; // platform-internal nodes that aren't selectable integrations
}

/* ─── Icon map for known integrations ─── */
const ICON_MAP: Record<string, string> = {
  // Channels
  "Vonage WhatsApp & SMS": "chatting", Facebook: "chatting",
  "Google Chat": "chat", "Microsoft Bot Framework": "computer-network-3671774",
  "Twilio SMS": "phone", "Twilio WhatsApp": "chatting",
  "Genesys Bot Connector": "hand-to-hand", "Puzzel Digital Engagement": "chat",
  "LivePerson Bot Connector": "chat", "Symphony": "chatting",
  "Viber": "chatting", "Workplace": "computer-network-3671774",
  "Zendesk Sunshine Conversations": "chat", Aldeamo: "chatting",
  // Voice
  Alexa: "phone", "Google Home": "phone",
  "Nice inContact IVR": "phone", "Twilio Programmable Voice": "phone",
  "VIER Cognitive Voice Gateway": "phone",
  // Human Handover — generic
  default_handover: "hand-to-hand",
  // Utility — generic
  default_utility: "desktop-network",
  // OpenID — generic
  default_openid: "lock-security",
};

function iconFor(name: string, category: string): string {
  if (ICON_MAP[name]) return ICON_MAP[name];
  if (category === "channel") return "chat";
  if (category === "human_handover") return "hand-to-hand";
  if (category === "voice") return "phone";
  if (category === "openid") return "lock-security";
  if (category === "utility") return "desktop-network";
  return "cogs";
}

/* ─── Look up description from integration data ─── */
function getDescription(name: string): string {
  const found = ALL_INTEGRATIONS.find((i) => i.name === name);
  return found?.description || "";
}

/* ─── Build dynamic nodes from guide selections ─── */
function buildNodes(guide: GuideData, category: string, fallback: ArchNode[]): ArchNode[] {
  const selected = (guide.integrations as Record<string, string[] | undefined>)?.[category];
  if (!selected?.length) return fallback;
  return selected.map((name) => ({
    label: name.length > 16 ? name.slice(0, 14) + "\u2026" : name,
    icon: iconFor(name, category),
    description: getDescription(name),
    category,
  }));
}

/* ─── Default fallbacks ─── */
const FALLBACK_CHANNELS: ArchNode[] = [
  { label: "Web Chat", icon: "chat", description: "Browser-based chat widget", isStatic: true },
  { label: "Voice / IVR", icon: "phone", description: "Interactive voice response", isStatic: true },
  { label: "WhatsApp", icon: "chatting", description: "WhatsApp Business messaging", isStatic: true },
  { label: "MS Teams", icon: "computer-network-3671774", description: "Microsoft Teams integration", isStatic: true },
];
const FALLBACK_HANDOVER: ArchNode[] = [
  { label: "Live Agent", icon: "hand-to-hand", description: "Seamless handover to human agents", isStatic: true },
];
const FALLBACK_BACKENDS: ArchNode[] = [
  { label: "CRM", icon: "desktop-network", description: "Connect to Salesforce, Dynamics 365, or other CRMs", isStatic: true },
  { label: "Ticketing", icon: "hand-to-hand", description: "Zendesk, ServiceNow, and other ticketing systems", isStatic: true },
  { label: "Core Banking", icon: "bank", description: "Backend banking and financial APIs", isStatic: true },
];
const FALLBACK_AUTH: ArchNode[] = [
  { label: "OpenID / SSO", icon: "lock-security", description: "Single sign-on and identity verification", isStatic: true },
];
const FALLBACK_VOICE: ArchNode[] = [
  { label: "Voice AI", icon: "phone", description: "Voice-enabled conversational AI", isStatic: true },
];

/* ─── Platform-internal static nodes ─── */
const PLATFORM_CORE: ArchNode[] = [
  { label: "Orchestrator", icon: "brain-processor", description: "Routes conversations to the right agent, maintains context across the full interaction lifecycle.", isStatic: true },
  { label: "Specialist Agents", icon: "chatbot", description: "Domain-specific AI workers trained on your processes — each handles a focused area like claims, onboarding, or account servicing.", isStatic: true },
  { label: "Knowledge Base", icon: "books", description: "RAG-powered retrieval from your structured and unstructured data. Keeps answers grounded in approved sources.", isStatic: true },
  { label: "ML Training", icon: "brain-setting", description: "Continuous model training and intent refinement. AI trainers fine-tune accuracy without engineering support.", isStatic: true },
];

const PLATFORM_PROCESSING: ArchNode[] = [
  { label: "Chat Services", icon: "chatbot", description: "Core conversation engine — manages dialogue state, session history, and multi-turn interactions.", isStatic: true },
  { label: "API Connector", icon: "computer-api-3671765", description: "Pre-built connector framework for calling external systems — REST, SOAP, GraphQL, webhooks.", isStatic: true },
];

/* ─── Clickable icon with inline popover ─── */
function IconBlock({ node, size = "md", delay, visible }: {
  node: ArchNode; size?: "sm" | "md" | "lg"; delay: number; visible: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dims = { sm: "w-10 h-10", md: "w-12 h-12", lg: "w-14 h-14" };
  const iconDims = { sm: "w-5 h-5", md: "w-6 h-6", lg: "w-7 h-7" };
  const hasDetail = !!node.description;

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const isYourPick = !node.isStatic;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          if (hasDetail) setOpen((v) => !v);
        }}
        className={`
          flex flex-col items-center gap-1.5 transition-all duration-500 group
          ${visible ? "opacity-100 scale-100" : "opacity-0 scale-90"}
          ${hasDetail ? "cursor-pointer" : "cursor-default"}
        `}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <div
          className={`
            ${dims[size]} relative rounded-xl bg-white flex items-center justify-center
            border border-boost-border/50
            shadow-[0_1px_2px_rgba(35,21,40,0.04)]
            transition-all duration-200
            ${open
              ? "ring-2 ring-boost-green/30 shadow-md scale-110 border-boost-green/60"
              : "group-hover:border-boost-purple/30 group-hover:shadow-md group-hover:-translate-y-0.5"
            }
          `}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assetPath(`/icons/purple/${node.icon}.svg`)} alt="" className={iconDims[size]} />
          {/* Tiny green dot signalling "selected in admin" */}
          {isYourPick && (
            <span
              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-boost-green-light border-2 border-white"
              aria-label="Selected in admin"
            />
          )}
        </div>
        <span className={`
          text-[9px] font-semibold text-center leading-tight max-w-[72px]
          ${open ? "text-boost-green" : "text-boost-dark"}
        `}>
          {node.label}
        </span>
      </button>

      {/* Popover — floats above the icon */}
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-modal-in">
          <div className="bg-white rounded-xl border border-boost-border shadow-xl p-3 w-[260px]">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-boost-purple/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assetPath(`/icons/purple/${node.icon}.svg`)} alt="" className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-[13px] font-semibold text-boost-dark">{node.label}</h4>
                  {isYourPick && (
                    <span className="inline-flex items-center gap-1 text-[8px] uppercase tracking-[0.1em] font-bold text-boost-green bg-boost-green/10 px-1.5 py-0.5 rounded-full">
                      <span className="w-1 h-1 rounded-full bg-boost-green-light" />
                      Your pick
                    </span>
                  )}
                  {node.category && !isYourPick && (
                    <span className="text-[7px] uppercase tracking-widest font-bold text-boost-muted bg-boost-surface px-1 py-0.5 rounded">
                      {node.category.replace(/_/g, " ")}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-boost-muted mt-1 leading-relaxed">{node.description}</p>
              </div>
            </div>
            {/* Arrow pointing down */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white drop-shadow-sm" />
          </div>
        </div>
      )}
    </div>
  );
}

// Orchestrator-matching connector color
const IA_CONNECTOR_COLOR = "rgba(89,25,93,0.18)";

/* ─── Vertical connector — thin solid line, matches orchestrator ─── */
function ZoneConnector({ delay, visible }: {
  label?: string; delay: number; visible: boolean; color?: string;
}) {
  return (
    <div
      className={`flex justify-center py-2 transition-all duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ transitionDelay: `${delay}ms` }}
      aria-hidden="true"
    >
      <div className="w-px h-8" style={{ backgroundColor: IA_CONNECTOR_COLOR }} />
    </div>
  );
}

/* ─── Zone container — label above, soft backdrop, no floating border label ─── */
function Zone({ label, children, delay, visible, className = "", compact = false }: {
  label: string; bg?: string; border?: string; children: React.ReactNode;
  delay: number; visible: boolean; className?: string; compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-stretch transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Small caps label above */}
      <div className="text-center mb-2">
        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-boost-muted/70">
          {label}
        </span>
      </div>

      {/* Soft backdrop — airy, no heavy border */}
      <div
        className={`rounded-xl ${compact ? "px-3 py-3" : "px-4 py-4"}`}
        style={{
          background: "rgba(255,255,255,0.5)",
          border: "1px solid rgba(89,25,93,0.08)",
          boxShadow: "0 1px 2px rgba(35,21,40,0.02)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Horizontal arrow — subtle chevron ─── */
function HArrow({ delay, visible }: { delay: number; visible: boolean; color?: string }) {
  return (
    <div
      className={`flex items-center px-1 transition-all duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ transitionDelay: `${delay}ms` }}
      aria-hidden="true"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(89,25,93,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 6 15 12 9 18" />
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────
   DESKTOP DIAGRAM
   ──────────────────────────────────────────── */
function DesktopDiagram({ channels, handover, utility, auth, voiceNodes, visible }: {
  channels: ArchNode[]; handover: ArchNode[]; utility: ArchNode[];
  auth: ArchNode[]; voiceNodes: ArchNode[]; visible: boolean;
}) {
  /* Merge handover into processing row alongside static nodes */
  const processingNodes: ArchNode[] = [
    ...PLATFORM_PROCESSING,
    ...handover.slice(0, 2),
  ];

  /* Auth nodes go into platform as well */
  const authRow = auth.slice(0, 3);

  /* Combine voice into channels */
  const allChannels = [...channels];
  if (voiceNodes.length > 0 && !voiceNodes[0].isStatic) {
    voiceNodes.forEach((v) => {
      if (!allChannels.some((c) => c.label === v.label)) allChannels.push(v);
    });
  }

  return (
    <div className="flex flex-col items-center gap-0">

      {/* Zone 1: End Users */}
      <Zone label="End Users" delay={300} visible={visible}>
        <div className="flex justify-center gap-8 pt-1">
          <IconBlock node={{ label: "Chat User", icon: "chat", description: "Web and messaging users interacting through text-based channels.", isStatic: true }} delay={400} visible={visible} />
          <IconBlock node={{ label: "Voice User", icon: "phone", description: "Users calling in via IVR, WebRTC, or SIP-based voice channels.", isStatic: true }} delay={450} visible={visible} />
        </div>
      </Zone>

      <ZoneConnector delay={500} visible={visible} />

      {/* Zone 2: Channels (dynamic) */}
      <Zone label="Your Channels" delay={500} visible={visible}>
        <div className="flex flex-wrap justify-center gap-4 pt-1">
          {allChannels.slice(0, 6).map((node, i) => (
            <IconBlock key={node.label} node={node} size="sm" delay={550 + i * 50} visible={visible} />
          ))}
        </div>
      </Zone>

      <ZoneConnector delay={700} visible={visible} />

      {/* Zone 3: boost.ai Platform — flattened (sub-sections use subtle dividers, not rectangles) */}
      <Zone
        label="boost.ai Enterprise Conversational AI Platform"
        delay={700}
        visible={visible}
        className="w-full max-w-[720px]"
      >
        <div className="flex flex-col items-stretch gap-5 pt-1">

          {/* Core Services — no rectangle, just a label + row */}
          <div
            className={`transition-all duration-600 ${visible ? "opacity-100" : "opacity-0"}`}
            style={{ transitionDelay: "850ms" }}
          >
            <div className="text-[8px] font-semibold uppercase tracking-[0.18em] text-boost-muted/70 text-center mb-3">
              Core Services
            </div>
            <div className="flex items-center justify-center gap-1 flex-wrap">
              {PLATFORM_CORE.map((node, i) => (
                <div key={node.label} className="flex items-center gap-0">
                  <IconBlock node={node} size="md" delay={900 + i * 80} visible={visible} />
                  {i < PLATFORM_CORE.length - 1 && <HArrow delay={950 + i * 80} visible={visible} />}
                </div>
              ))}
            </div>
          </div>

          {/* Subtle divider */}
          <div className="h-px mx-4" style={{ backgroundColor: "rgba(89,25,93,0.08)" }} aria-hidden="true" />

          {/* Processing + Handover */}
          <div
            className={`transition-all duration-600 ${visible ? "opacity-100" : "opacity-0"}`}
            style={{ transitionDelay: "1050ms" }}
          >
            <div className="text-[8px] font-semibold uppercase tracking-[0.18em] text-boost-muted/70 text-center mb-3">
              Processing &amp; Handover
            </div>
            <div className="flex items-center justify-center gap-1 flex-wrap">
              {processingNodes.slice(0, 5).map((node, i) => (
                <div key={node.label} className="flex items-center gap-0">
                  <IconBlock node={node} size="md" delay={1100 + i * 70} visible={visible} />
                  {i < processingNodes.length - 1 && i < 4 && <HArrow delay={1130 + i * 70} visible={visible} />}
                </div>
              ))}
            </div>
          </div>

          {/* Auth row */}
          {authRow.length > 0 && (
            <>
              <div className="h-px mx-4" style={{ backgroundColor: "rgba(89,25,93,0.08)" }} aria-hidden="true" />
              <div
                className={`transition-all duration-600 ${visible ? "opacity-100" : "opacity-0"}`}
                style={{ transitionDelay: "1200ms" }}
              >
                <div className="text-[8px] font-semibold uppercase tracking-[0.18em] text-boost-muted/70 text-center mb-3">
                  Authentication
                </div>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {authRow.map((node, i) => (
                    <IconBlock key={node.label} node={node} size="sm" delay={1250 + i * 60} visible={visible} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Guardrails banner — soft pill, not a bordered card */}
          <div
            className={`transition-all duration-600 ${visible ? "opacity-100" : "opacity-0"}`}
            style={{ transitionDelay: "1300ms" }}
          >
            <div
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-full mx-auto max-w-max"
              style={{
                background: "linear-gradient(90deg, rgba(89,25,93,0.08), rgba(54,181,149,0.06))",
                border: "1px solid rgba(89,25,93,0.1)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={assetPath("/icons/purple/shield-medal.svg")} alt="" className="w-3.5 h-3.5" />
              <span className="text-[9px] uppercase tracking-[0.15em] font-semibold text-boost-purple/70">
                Guardrails &amp; Compliance Layer
              </span>
            </div>
          </div>
        </div>
      </Zone>

      <ZoneConnector delay={1400} visible={visible} />

      {/* Zone 4: External systems (3 groups, flat) */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-[720px]">
        <Zone label="Data Layer" delay={1450} visible={visible} compact>
          <div className="flex flex-col items-center gap-3 pt-1">
            <IconBlock node={{ label: "PostgreSQL", icon: "cloud-network-3671763", description: "Primary relational database for conversation logs, analytics, and configuration.", isStatic: true }} size="sm" delay={1550} visible={visible} />
            <IconBlock node={{ label: "File Storage", icon: "books", description: "Document and model storage for knowledge base files and ML training artifacts.", isStatic: true }} size="sm" delay={1600} visible={visible} />
          </div>
        </Zone>

        <Zone label="LLM Providers" delay={1500} visible={visible} compact>
          <div className="flex flex-col items-center gap-3 pt-1">
            <IconBlock node={{ label: "Boost LLM", icon: "brain-integration", description: "boost.ai's own fine-tuned language models, optimized for enterprise conversations and compliance.", isStatic: true }} size="sm" delay={1600} visible={visible} />
            <IconBlock node={{ label: "Bring Your Own", icon: "brain-setting", description: "Connect your preferred LLM — Azure OpenAI, AWS Bedrock, Google Vertex AI, or any OpenAI-compatible endpoint.", isStatic: true }} size="sm" delay={1650} visible={visible} />
          </div>
        </Zone>

        <Zone label="Your Systems" delay={1550} visible={visible} compact>
          <div className="flex flex-col items-center gap-3 pt-1">
            {utility.slice(0, 4).map((node, i) => (
              <IconBlock key={node.label} node={node} size="sm" delay={1650 + i * 50} visible={visible} />
            ))}
          </div>
        </Zone>
      </div>

      <ZoneConnector delay={1750} visible={visible} />

      {/* Small REST / Webhooks chip */}
      <div
        className={`transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
        style={{ transitionDelay: "1780ms" }}
      >
        <span className="inline-block text-[8px] font-semibold uppercase tracking-[0.18em] text-boost-muted/60 px-2 py-0.5 rounded-full bg-white/60 border border-boost-border/40 mb-1">
          REST / Webhooks
        </span>
      </div>

      <IconBlock
        node={{ label: "External APIs", icon: "computer-api-3671765", description: "Any REST, SOAP, or webhook-based API your organization exposes. boost.ai's API connector handles authentication, retries, and response mapping.", isStatic: true }}
        size="lg" delay={1800} visible={visible}
      />
    </div>
  );
}

/* ─── Mobile diagram ─── */
function MobileDiagram({ channels, handover, utility, auth, voiceNodes, visible }: {
  channels: ArchNode[]; handover: ArchNode[]; utility: ArchNode[];
  auth: ArchNode[]; voiceNodes: ArchNode[]; visible: boolean;
}) {
  const allChannels = [...channels];
  voiceNodes.forEach((v) => {
    if (!v.isStatic && !allChannels.some((c) => c.label === v.label)) allChannels.push(v);
  });

  const zones = [
    { label: "End Users", color: "#7a6b80", nodes: [
      { label: "Chat User", icon: "chat", description: "Web and messaging users.", isStatic: true },
      { label: "Voice User", icon: "phone", description: "Voice/IVR callers.", isStatic: true },
    ]},
    { label: "Your Channels", color: "#7a6b80", nodes: allChannels.slice(0, 6) },
    { label: "boost.ai Platform", color: "#59195d", nodes: [...PLATFORM_CORE, ...PLATFORM_PROCESSING] },
    ...(handover.length > 0 && !handover[0].isStatic ? [{ label: "Human Handover", color: "#59195d", nodes: handover.slice(0, 3) }] : []),
    ...(auth.length > 0 && !auth[0].isStatic ? [{ label: "Authentication", color: "#59195d", nodes: auth.slice(0, 3) }] : []),
    { label: "LLM Providers", color: "#208269", nodes: [
      { label: "Boost LLM", icon: "brain-integration", description: "boost.ai's own LLM.", isStatic: true },
      { label: "Bring Your Own", icon: "brain-setting", description: "Connect your preferred LLM.", isStatic: true },
    ]},
    { label: "Your Systems", color: "#ef8b00", nodes: utility.slice(0, 4) },
  ];

  return (
    <div className="flex flex-col items-center gap-0">
      {zones.map((zone, zIdx) => (
        <div key={zone.label} className="w-full flex flex-col items-center">
          <Zone
            label={zone.label}
            delay={300 + zIdx * 120}
            visible={visible}
            className="w-full"
          >
            <div className="flex flex-wrap justify-center gap-4 pt-1">
              {zone.nodes.map((node, i) => (
                <IconBlock key={node.label} node={node} size="sm" delay={400 + zIdx * 120 + i * 40} visible={visible} />
              ))}
            </div>
          </Zone>
          {zIdx < zones.length - 1 && (
            <ZoneConnector delay={450 + zIdx * 120} visible={visible} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Main Section ─── */
export default function IntegrationArchSection({
  guide,
  sectionNumber,
  headerBlocks,
  contentBlocks,
}: {
  guide: GuideData;
  sectionNumber: string;
  headerBlocks?: TopicContentBlock[];
  contentBlocks?: TopicContentBlock[];
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Build all dynamic node lists */
  const channels = useMemo(() => buildNodes(guide, "channel", FALLBACK_CHANNELS), [guide]);
  const handover = useMemo(() => buildNodes(guide, "human_handover", FALLBACK_HANDOVER), [guide]);
  const utility = useMemo(() => buildNodes(guide, "utility", FALLBACK_BACKENDS), [guide]);
  const auth = useMemo(() => buildNodes(guide, "openid", FALLBACK_AUTH), [guide]);
  const voiceNodes = useMemo(() => buildNodes(guide, "voice", FALLBACK_VOICE), [guide]);

  return (
    <section ref={sectionRef}>
      <SectionHeader
        number={sectionNumber}
        title="Integrations & Architecture"
        subtitle="Your integration ecosystem — pre-built connectors, your structured data"
      />

      {headerBlocks && headerBlocks.length > 0 && (
        <div className="mt-6 space-y-6">
          {headerBlocks.map((block, i) => (
            <ContentBlockRenderer key={i} block={block} />
          ))}
        </div>
      )}

      <div
        className={`mt-8 max-w-2xl transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        style={{ transitionDelay: "100ms" }}
      >
        <h3 className="text-lg font-semibold text-boost-dark mb-3">
          Build your knowledge.
          <br />
          <span className="text-boost-green">We&apos;ll build around it.</span>
        </h3>
        <p className="text-sm text-boost-muted leading-relaxed">
          The best AI outcomes come from great data — not great infrastructure.
          boost.ai takes care of that.
        </p>
      </div>

      {/* Desktop */}
      <div className="mt-10 hidden md:block">
        <div
          className={`rounded-2xl p-5 xl:p-6 transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
          style={{
            transitionDelay: "200ms",
            background:
              "radial-gradient(ellipse at 20% 0%, rgba(89,25,93,0.08), transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(54,181,149,0.06), transparent 55%), linear-gradient(135deg, #f4eef5 0%, #eef5f2 100%)",
          }}
        >
          <DesktopDiagram channels={channels} handover={handover} utility={utility} auth={auth} voiceNodes={voiceNodes} visible={visible} />
        </div>
      </div>

      {/* Mobile */}
      <div className="mt-8 md:hidden">
        <div
          className="rounded-2xl p-4"
          style={{
            background:
              "radial-gradient(ellipse at 20% 0%, rgba(89,25,93,0.08), transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(54,181,149,0.06), transparent 55%), linear-gradient(135deg, #f4eef5 0%, #eef5f2 100%)",
          }}
        >
          <MobileDiagram channels={channels} handover={handover} utility={utility} auth={auth} voiceNodes={voiceNodes} visible={visible} />
        </div>
      </div>

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
