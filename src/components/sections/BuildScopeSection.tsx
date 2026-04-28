"use client";

/* ──────────────────────────────────────────────────────────────
 *  BuildScopeSection — the "what + how" of the SoW
 *
 *  Four tabs, each a different visual metaphor:
 *
 *    Tab 1 — Overview:       spec tiles + knowledge / filter chip
 *                            clouds + env status pills
 *    Tab 2 — Channels:       per-channel cards with URL chips +
 *                            voice-config card below
 *    Tab 3 — Intelligence:   provider hero block + feature grid +
 *                            knowledge-sync source chips
 *    Tab 4 — Integrations:   auth flow card + customer-API grid
 *                            coloured by HTTP method
 *
 *  Reads `customer.build_scope`. Empty-state when not populated.
 *  All animations tied to per-tab useTabActivation so each tab
 *  animates in fresh on re-visit.
 * ────────────────────────────────────────────────────────────── */

import { useState, useEffect, useRef, useMemo } from "react";
import type {
  Customer,
  PsBuildScope,
  PsGenAiFeature,
} from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface BuildScopeSectionProps {
  customer?: Customer;
  sectionNumber?: string;
}

type TabId = "overview" | "channels" | "intelligence" | "integrations";
const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "channels", label: "Channels" },
  { id: "intelligence", label: "Intelligence" },
  { id: "integrations", label: "Integrations" },
];

/* Reset per-tab animation on activation. Note: prevRef is only
 * updated in the fall-through branch to survive Strict Mode's
 * synthetic cleanup-and-rerun. */
function useTabActivation(active: boolean) {
  const [ready, setReady] = useState(false);
  const prevRef = useRef(false);
  useEffect(() => {
    if (active && !prevRef.current) {
      setReady(false);
      const t = setTimeout(() => setReady(true), 80);
      return () => clearTimeout(t);
    }
    prevRef.current = active;
  }, [active]);
  return ready;
}

/* ───── Shared display dictionaries ───── */

const HOSTING_LABEL: Record<string, string> = {
  aws: "Cloud (AWS)",
  customer_on_prem: "Customer on-prem",
  boost_on_prem: "boost.ai on-prem",
};
const HOSTING_DESCRIPTOR: Record<string, string> = {
  aws: "Managed by boost.ai on shared AWS infrastructure",
  customer_on_prem: "Runs inside the customer's own data centre",
  boost_on_prem: "Runs on boost.ai-managed dedicated infrastructure",
};

const PROVIDER_LABEL: Record<string, string> = {
  openai_boost: "OpenAI",
  openai_own: "OpenAI",
  azure_boost: "Azure OpenAI",
  azure_own: "Azure OpenAI",
};
const PROVIDER_TENANT: Record<string, string> = {
  openai_boost: "via boost.ai's OpenAI tenant",
  openai_own: "via customer's own OpenAI account",
  azure_boost: "via boost.ai's Azure tenant",
  azure_own: "via customer's own Azure tenant",
};

const FEATURE_LABEL: Record<PsGenAiFeature, string> = {
  ai_trainer_efficiency: "AI Trainer Efficiency",
  generative_action: "Agentic action",
  ai_review: "AI Review",
  handover_summary: "Handover Summary",
};
const FEATURE_DESCRIPTION: Record<PsGenAiFeature, string> = {
  ai_trainer_efficiency: "AI-authored suggestions for trainers — intent coverage, flow quality, retraining prompts.",
  generative_action: "LLM-driven generative responses where a static match isn't a clean fit.",
  ai_review: "Automated QA pass flagging conversations for training-team review.",
  handover_summary: "Structured conversation summary handed to the human agent on escalation.",
};

/* ═══════════════════════════════════════════════════════════════════
 *  TAB 1 — Overview
 *
 *  Three spec tiles across the top, two chip clouds (knowledge
 *  coverage + filters), then a pair of environment pills. No
 *  decorative animation — this is a scannable specification page.
 * ═══════════════════════════════════════════════════════════════════ */

function SpecTile({
  label,
  value,
  descriptor,
  delay,
  ready,
}: {
  label: string;
  value: string;
  descriptor?: string;
  delay: number;
  ready: boolean;
}) {
  return (
    <article
      className="relative rounded-xl border border-boost-border bg-white p-4 sm:p-5 overflow-hidden"
      style={{
        opacity: ready ? 1 : 0,
        transform: ready ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 520ms cubic-bezier(0.16,1,0.3,1), transform 520ms cubic-bezier(0.16,1,0.3,1)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 w-1 bg-boost-green-light"
      />
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
        {label}
      </p>
      <p className="text-lg sm:text-xl font-bold text-boost-dark leading-tight">
        {value}
      </p>
      {descriptor && (
        <p className="text-xs text-boost-muted mt-1.5 leading-relaxed">
          {descriptor}
        </p>
      )}
    </article>
  );
}

function ChipCloud({
  chips,
  ready,
  accent,
}: {
  chips: string[];
  ready: boolean;
  accent: "green" | "purple";
}) {
  const border = accent === "green" ? "border-boost-green-light/40" : "border-boost-purple/40";
  const dot = accent === "green" ? "bg-boost-green-light" : "bg-boost-purple";
  return (
    <ul className="flex flex-wrap gap-2">
      {chips.map((c, i) => (
        <li
          key={`${c}-${i}`}
          className={`inline-flex items-center gap-1.5 rounded-full bg-white border ${border} px-3 py-1.5 text-xs font-medium text-boost-dark`}
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "translateY(0)" : "translateY(4px)",
            transition: "opacity 420ms cubic-bezier(0.16,1,0.3,1), transform 420ms cubic-bezier(0.16,1,0.3,1)",
            transitionDelay: `${320 + i * 40}ms`,
          }}
        >
          <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${dot}`} />
          {c}
        </li>
      ))}
    </ul>
  );
}

function OverviewTab({
  scope,
  active,
}: {
  scope: PsBuildScope;
  active: boolean;
}) {
  const ready = useTabActivation(active);
  const hostingKey = scope.hosting ?? "aws";
  const langCount = scope.languages?.length ?? 0;
  const coverage = scope.knowledge_coverage ?? [];
  const filters = scope.filters ?? [];

  return (
    <div className="py-4 space-y-6">
      {/* Spec tile row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <SpecTile
          label="Hosting"
          value={HOSTING_LABEL[hostingKey] ?? hostingKey}
          descriptor={HOSTING_DESCRIPTOR[hostingKey]}
          delay={120}
          ready={ready}
        />
        <SpecTile
          label="Languages"
          value={langCount > 0 ? `${langCount} · ${scope.languages!.join(" · ")}` : "—"}
          delay={200}
          ready={ready}
        />
        <SpecTile
          label="Expected intents"
          value={scope.expected_intents !== undefined ? String(scope.expected_intents) : "—"}
          descriptor={scope.expected_intents !== undefined ? "Estimated total across every flow and language" : undefined}
          delay={280}
          ready={ready}
        />
      </div>

      {/* Chip clouds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {coverage.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2.5">
              Knowledge coverage
            </p>
            <ChipCloud chips={coverage} ready={ready} accent="green" />
          </div>
        )}
        {filters.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2.5">
              Filters
            </p>
            <ChipCloud chips={filters} ready={ready} accent="purple" />
          </div>
        )}
      </div>

      {/* Environment pills */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2.5">
          Environments
        </p>
        <div className="flex flex-wrap gap-3">
          <EnvPill label="Staging" on={scope.staging === true} ready={ready} delay={480} />
          <EnvPill label="Test environment" on={scope.test_environment === true} ready={ready} delay={560} />
        </div>
      </div>
    </div>
  );
}

function EnvPill({
  label,
  on,
  ready,
  delay,
}: {
  label: string;
  on: boolean;
  ready: boolean;
  delay: number;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
        on ? "bg-boost-green-light/15 text-boost-green border border-boost-green-light/40" : "bg-boost-surface text-boost-muted border border-boost-border"
      }`}
      style={{
        opacity: ready ? 1 : 0,
        transform: ready ? "scale(1)" : "scale(0.95)",
        transition: "opacity 440ms cubic-bezier(0.16,1,0.3,1), transform 440ms cubic-bezier(0.16,1,0.3,1)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <span
        aria-hidden="true"
        className={`w-2 h-2 rounded-full ${on ? "bg-boost-green-light" : "bg-boost-muted/40"}`}
      />
      {label}
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] ml-1">
        {on ? "Included" : "Not included"}
      </span>
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  TAB 2 — Channels
 *
 *  Channel cards, one per chat_channel entry. Each card shows a
 *  leading type-glyph (inferred from the label), URL chips if
 *  present, and notes. A separate voice-config card at the bottom
 *  if voice is in scope (purple-accented to mark the different
 *  delivery vertical).
 * ═══════════════════════════════════════════════════════════════════ */

/** Tiny inline icon — one character glyph + a surrounding square.
 *  Restraint over ornament; consistent sizing. */
function ChannelGlyph({ kind }: { kind: "web" | "whatsapp" | "app" | "voice" | "other" }) {
  const glyph = {
    web: "◱",
    whatsapp: "◇",
    app: "▢",
    voice: "◉",
    other: "◌",
  }[kind];
  return (
    <span
      aria-hidden="true"
      className="flex-shrink-0 w-10 h-10 rounded-lg bg-boost-purple/10 text-boost-purple flex items-center justify-center text-lg font-bold"
    >
      {glyph}
    </span>
  );
}

function classifyChannel(label: string): "web" | "whatsapp" | "app" | "voice" | "other" {
  const l = label.toLowerCase();
  if (l.includes("whatsapp")) return "whatsapp";
  if (l.includes("voice") || l.includes("phone") || l.includes("sip")) return "voice";
  if (l.includes("app") || l.includes("mobile") || l.includes("ios") || l.includes("android")) return "app";
  if (l.includes("web") || l.includes("site")) return "web";
  return "other";
}

function ChannelsTab({
  scope,
  active,
}: {
  scope: PsBuildScope;
  active: boolean;
}) {
  const ready = useTabActivation(active);
  const channels = scope.chat_channels ?? [];
  const voice = scope.voice;

  if (channels.length === 0 && !voice) {
    return (
      <div className="py-8 text-center text-boost-muted text-sm">
        No channels captured yet.
      </div>
    );
  }

  return (
    <div className="py-4 space-y-4">
      {channels.map((ch, i) => {
        const kind = classifyChannel(ch.label);
        return (
          <article
            key={`${ch.label}-${i}`}
            data-testid={`build-scope-channel-${kind}`}
            className="flex items-start gap-4 rounded-xl border border-boost-border bg-white p-4 sm:p-5"
            style={{
              opacity: ready ? 1 : 0,
              transform: ready ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 520ms cubic-bezier(0.16,1,0.3,1), transform 520ms cubic-bezier(0.16,1,0.3,1)",
              transitionDelay: `${160 + i * 100}ms`,
            }}
          >
            <ChannelGlyph kind={kind} />
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-boost-dark mb-1">
                {ch.label}
              </p>
              {ch.urls && ch.urls.length > 0 && (
                <ul className="flex flex-wrap gap-1.5 mb-2">
                  {ch.urls.map((u, j) => (
                    <li
                      key={`${u}-${j}`}
                      className="inline-flex items-center rounded-md bg-boost-surface border border-boost-border px-2 py-0.5 font-mono text-[11px] text-boost-dark/80"
                    >
                      {u.replace(/^https?:\/\//, "")}
                    </li>
                  ))}
                </ul>
              )}
              {ch.notes && (
                <p className="text-xs text-boost-muted leading-relaxed">
                  {ch.notes}
                </p>
              )}
            </div>
          </article>
        );
      })}

      {voice && (
        <article
          data-testid="build-scope-voice"
          className="relative flex items-start gap-4 rounded-xl border border-boost-purple/40 bg-boost-purple/[0.04] p-4 sm:p-5 overflow-hidden"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 520ms cubic-bezier(0.16,1,0.3,1), transform 520ms cubic-bezier(0.16,1,0.3,1)",
            transitionDelay: `${160 + channels.length * 100}ms`,
          }}
        >
          <span
            aria-hidden="true"
            className="absolute left-0 top-0 bottom-0 w-1 bg-boost-purple"
          />
          <ChannelGlyph kind="voice" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1 mb-1">
              <p className="text-base font-semibold text-boost-dark">Voice</p>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-boost-purple">
                Voice delivery
              </span>
            </div>
            <dl className="text-xs space-y-1.5 mt-2">
              <div className="flex gap-2">
                <dt className="text-boost-muted font-semibold uppercase tracking-[0.1em] w-24 flex-shrink-0">
                  Telephony
                </dt>
                <dd className="text-boost-dark">{voice.telephony_provider}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-boost-muted font-semibold uppercase tracking-[0.1em] w-24 flex-shrink-0">
                  Gateway
                </dt>
                <dd className="text-boost-dark">{voice.gateway_type}</dd>
              </div>
              {voice.notes && (
                <div className="flex gap-2 pt-1">
                  <dt className="text-boost-muted font-semibold uppercase tracking-[0.1em] w-24 flex-shrink-0">
                    Notes
                  </dt>
                  <dd className="text-boost-muted leading-relaxed">{voice.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </article>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  TAB 3 — Intelligence
 *
 *  Provider hero block (big, purple-accented) + feature grid
 *  (2x2 on desktop, 1-col mobile) + knowledge-sync source chips.
 *  Shows the LLM stack without over-diagramming.
 * ═══════════════════════════════════════════════════════════════════ */

function IntelligenceTab({
  scope,
  active,
}: {
  scope: PsBuildScope;
  active: boolean;
}) {
  const ready = useTabActivation(active);
  const genai = scope.generative_ai;

  if (!genai || !genai.enabled) {
    return (
      <div className="py-8">
        <div className="rounded-xl border border-boost-border bg-boost-surface p-6 text-center">
          <p className="text-sm text-boost-muted">
            Generative AI is not enabled for this engagement.
          </p>
        </div>
      </div>
    );
  }

  const providerKey = genai.provider ?? "openai_boost";
  const features = genai.features ?? [];
  const sources = genai.knowledge_sync_sources ?? [];

  return (
    <div className="py-4 space-y-6">
      {/* Provider hero */}
      <article
        className="relative rounded-2xl bg-boost-purple text-white p-6 sm:p-8 overflow-hidden"
        style={{
          opacity: ready ? 1 : 0,
          transform: ready ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 640ms cubic-bezier(0.16,1,0.3,1), transform 640ms cubic-bezier(0.16,1,0.3,1)",
          transitionDelay: "120ms",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 92% 100%, rgba(54,181,149,0.22) 0%, transparent 65%)",
          }}
        />
        <p className="relative text-[10px] font-semibold uppercase tracking-[0.16em] text-boost-green-light mb-2">
          GenAI provider
        </p>
        <p className="relative text-3xl sm:text-4xl font-bold leading-tight">
          {PROVIDER_LABEL[providerKey] ?? providerKey}
        </p>
        <p className="relative text-sm text-white/75 mt-2">
          {PROVIDER_TENANT[providerKey] ?? ""}
        </p>
        <div className="relative mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.14em] font-semibold text-white/70">
          <span>
            <span className="text-boost-green-light text-base tabular-nums font-bold">
              {features.length}
            </span>{" "}
            feature{features.length === 1 ? "" : "s"} enabled
          </span>
          {sources.length > 0 && (
            <span>
              <span className="text-boost-green-light text-base tabular-nums font-bold">
                {sources.length}
              </span>{" "}
              knowledge source{sources.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </article>

      {/* Feature grid */}
      {features.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-3">
            Features enabled
          </p>
          <div
            className={`grid gap-3 sm:gap-4 ${
              features.length === 1
                ? "grid-cols-1"
                : features.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2"
            }`}
          >
            {features.map((f, i) => (
              <article
                key={f}
                className="rounded-xl border border-boost-border bg-white p-4"
                style={{
                  opacity: ready ? 1 : 0,
                  transform: ready ? "translateY(0)" : "translateY(6px)",
                  transition: "opacity 500ms cubic-bezier(0.16,1,0.3,1), transform 500ms cubic-bezier(0.16,1,0.3,1)",
                  transitionDelay: `${360 + i * 80}ms`,
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    aria-hidden="true"
                    className="w-1.5 h-1.5 rounded-full bg-boost-green-light"
                  />
                  <p className="text-sm font-semibold text-boost-dark">
                    {FEATURE_LABEL[f] ?? f}
                  </p>
                </div>
                <p className="text-xs text-boost-muted leading-relaxed">
                  {FEATURE_DESCRIPTION[f] ?? ""}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Knowledge sync sources */}
      {sources.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2.5">
            Knowledge sync sources
          </p>
          <ChipCloud chips={sources} ready={ready} accent="green" />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  TAB 4 — Integrations
 *
 *  Authentication hero card (method + provider + notes) + a grid of
 *  customer-API cards. API cards carry an HTTP-method badge whose
 *  colour is extracted from the captured method string.
 * ═══════════════════════════════════════════════════════════════════ */

function extractHttpMethod(raw: string): { verb: string; rest: string } {
  const m = raw.match(/^\s*(GET|POST|PUT|PATCH|DELETE|WEBHOOK)\b[^\w]*(.*)$/i);
  if (m) return { verb: m[1].toUpperCase(), rest: m[2].trim() };
  return { verb: "", rest: raw };
}

const METHOD_COLOR: Record<string, { bg: string; fg: string }> = {
  GET: { bg: "bg-boost-green-light/15", fg: "text-boost-green" },
  POST: { bg: "bg-boost-purple/15", fg: "text-boost-purple" },
  PUT: { bg: "bg-boost-gold/20", fg: "text-boost-gold" },
  PATCH: { bg: "bg-boost-gold/20", fg: "text-boost-gold" },
  DELETE: { bg: "bg-boost-orange/20", fg: "text-boost-orange" },
  WEBHOOK: { bg: "bg-boost-lavender/25", fg: "text-boost-purple" },
};

function IntegrationsTab({
  scope,
  active,
}: {
  scope: PsBuildScope;
  active: boolean;
}) {
  const ready = useTabActivation(active);
  const auth = scope.authentication;
  const apis = scope.customer_apis ?? [];

  if (!auth && apis.length === 0) {
    return (
      <div className="py-8 text-center text-boost-muted text-sm">
        No integrations captured yet.
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6">
      {/* Authentication hero */}
      {auth && (
        <article
          data-testid="build-scope-authentication"
          className="rounded-xl border border-boost-border bg-white p-5 sm:p-6"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? "translateY(0)" : "translateY(6px)",
            transition: "opacity 560ms cubic-bezier(0.16,1,0.3,1), transform 560ms cubic-bezier(0.16,1,0.3,1)",
            transitionDelay: "120ms",
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-3">
            Authentication
          </p>
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-8 gap-y-5 items-start">
            {/* Flow glyph — User → Provider → boost.ai */}
            <div className="flex items-center gap-2 text-xs font-medium text-boost-dark">
              <span className="rounded-md bg-boost-surface border border-boost-border px-2.5 py-1.5">
                User
              </span>
              <span aria-hidden="true" className="text-boost-muted">→</span>
              <span className="rounded-md bg-boost-purple/10 border border-boost-purple/40 px-2.5 py-1.5 text-boost-purple">
                {auth.provider ?? "Identity provider"}
              </span>
              <span aria-hidden="true" className="text-boost-muted">→</span>
              <span className="rounded-md bg-boost-green-light/15 border border-boost-green-light/40 px-2.5 py-1.5 text-boost-green">
                boost.ai
              </span>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold text-boost-dark leading-tight">
                {auth.method}
              </p>
              {auth.notes && (
                <p className="text-xs text-boost-muted mt-2 leading-relaxed">
                  {auth.notes}
                </p>
              )}
            </div>
          </div>
        </article>
      )}

      {/* API grid */}
      {apis.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
              Customer APIs
            </p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-boost-muted/70 tabular-nums">
              {apis.length} endpoint{apis.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {apis.map((api, i) => {
              const { verb, rest } = extractHttpMethod(api.method);
              const color = verb && METHOD_COLOR[verb] ? METHOD_COLOR[verb] : METHOD_COLOR.GET;
              return (
                <article
                  key={`${api.name}-${i}`}
                  data-testid={`build-scope-api-${i}`}
                  className="rounded-xl border border-boost-border bg-white p-4 sm:p-5"
                  style={{
                    opacity: ready ? 1 : 0,
                    transform: ready ? "translateY(0)" : "translateY(6px)",
                    transition: "opacity 500ms cubic-bezier(0.16,1,0.3,1), transform 500ms cubic-bezier(0.16,1,0.3,1)",
                    transitionDelay: `${260 + i * 70}ms`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {verb && (
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider ${color.bg} ${color.fg}`}
                      >
                        {verb}
                      </span>
                    )}
                    {rest && (
                      <span className="text-[10px] uppercase tracking-[0.12em] text-boost-muted">
                        {rest}
                      </span>
                    )}
                  </div>
                  <p className="text-base font-semibold text-boost-dark mb-1 leading-snug">
                    {api.name}
                  </p>
                  <p className="text-xs text-boost-muted leading-relaxed">
                    {api.purpose}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  Main export — tab nav wrapper, forwards the build_scope slice to
 *  the relevant tab based on selection. Empty-state when the field
 *  is entirely absent.
 * ═══════════════════════════════════════════════════════════════════ */

export default function BuildScopeSection({
  customer,
  sectionNumber,
}: BuildScopeSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const scope = customer?.build_scope;

  const hasContent = useMemo(() => {
    if (!scope) return false;
    return (
      scope.hosting !== undefined ||
      (scope.languages?.length ?? 0) > 0 ||
      (scope.knowledge_coverage?.length ?? 0) > 0 ||
      (scope.chat_channels?.length ?? 0) > 0 ||
      (scope.customer_apis?.length ?? 0) > 0 ||
      !!scope.generative_ai ||
      !!scope.authentication ||
      !!scope.voice
    );
  }, [scope]);

  if (!hasContent || !scope) {
    return (
      <section>
        <SectionHeader
          number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
          title="Build scope"
          subtitle="No build scope captured yet. Fill in hosting, channels, GenAI, auth, and customer APIs in admin to render this section."
        />
      </section>
    );
  }

  return (
    <section>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title="Build scope"
        subtitle="The what and the how — deliverables, channels, intelligence stack, and integration surface."
      />

      <div
        ref={ref}
        data-testid="build-scope"
        className={`transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Tab nav */}
        <div className="border-b border-boost-border mb-2 flex items-center gap-1 overflow-x-auto scrollbar-hide" role="tablist">
          {TABS.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(t.id)}
                data-testid={`build-scope-tab-${t.id}`}
                className={`relative px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light rounded-t-md ${
                  isActive ? "text-boost-purple" : "text-boost-muted hover:text-boost-dark"
                }`}
              >
                {t.label}
                <span
                  aria-hidden="true"
                  className={`absolute left-3 right-3 -bottom-px h-0.5 rounded-t ${
                    isActive ? "bg-boost-purple" : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Tab panels */}
        <div role="tabpanel">
          {activeTab === "overview" && <OverviewTab scope={scope} active={activeTab === "overview"} />}
          {activeTab === "channels" && <ChannelsTab scope={scope} active={activeTab === "channels"} />}
          {activeTab === "intelligence" && <IntelligenceTab scope={scope} active={activeTab === "intelligence"} />}
          {activeTab === "integrations" && <IntegrationsTab scope={scope} active={activeTab === "integrations"} />}
        </div>
      </div>
    </section>
  );
}
