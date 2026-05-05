"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { BOOST_CAMP_LOCATIONS } from "@/data/boost-camp-events";

/**
 * Resources & Trust — four self-service surfaces every customer gets
 * post-deal. Re-made from a flat 4-card grid into a tabbed interactive
 * destination. Each surface gets a preview that hints at what's behind
 * the external link, so the prospect can SEE what they're inheriting
 * before they click.
 *
 *   Academy       — public learning catalogue with course tracks
 *   Help Center   — searchable docs + ticket creation
 *   Trust Center  — Vanta-powered live compliance posture
 *   Community     — Boost Camp events + walkthrough library
 *
 * Same tab vocabulary as PlatformVisionSection / ImpactSection so the
 * deck rhythm stays consistent.
 */

type TabId = "academy" | "help" | "trust" | "community";

interface TabDef {
  id: TabId;
  label: string;
  /** One-word kicker rendered above the active tab's headline. */
  kicker: string;
  /** Brand accent driver — keys into the colour map. */
  accent: "purple" | "green-light" | "gold" | "green";
  /** External destination opened from the tab CTA. */
  href: string;
  /** Tooltip on the tab button when collapsed on mobile. */
  hint: string;
}

const TABS: TabDef[] = [
  {
    id: "academy",
    label: "Academy",
    kicker: "Learn",
    accent: "purple",
    href: "https://academy.boost.ai/student/catalog",
    hint: "Public course catalogue · self-paced · free",
  },
  {
    id: "help",
    label: "Help Center",
    kicker: "Get answers",
    accent: "green-light",
    href: "https://support.boost.ai/",
    hint: "Searchable runbooks + ticket creation",
  },
  {
    id: "trust",
    label: "Trust Center",
    kicker: "Verify",
    accent: "gold",
    href: "https://trustcenter.boost.ai/",
    hint: "Live compliance dashboard · Vanta-powered",
  },
  {
    id: "community",
    label: "Community",
    kicker: "Connect",
    accent: "green",
    href: "https://boost.ai/blog/category/events/",
    hint: "Boost Camp events + peer walkthroughs",
  },
];

/* ─── Tab-specific data ─── */

interface AcademyCourse {
  title: string;
  duration: string;
  modules: number;
  level: "Foundations" | "Builder" | "Advanced";
  blurb: string;
}

const ACADEMY_COURSES: AcademyCourse[] = [
  {
    title: "Quick overview",
    duration: "30 min",
    modules: 1,
    level: "Foundations",
    blurb: "What boost.ai is, who it's for, and how the platform fits together.",
  },
  {
    title: "How do we build an AI Agent?",
    duration: "4 hours",
    modules: 6,
    level: "Builder",
    blurb: "End-to-end walkthrough — intent design, agent orchestration, knowledge sources, guardrails, deploy.",
  },
  {
    title: "How boost.ai leverages generative AI",
    duration: "2 hours",
    modules: 4,
    level: "Builder",
    blurb: "Hybrid architecture, agentic actions, controlled creativity, the determinism layer.",
  },
  {
    title: "Advanced flow design",
    duration: "6 hours",
    modules: 8,
    level: "Advanced",
    blurb: "Multi-agent orchestration, voice flows, fallbacks, A/B testing, performance tuning.",
  },
];

const HELP_ROTATING_QUERIES = [
  "How do I configure agent orchestration?",
  "What's the SLA on platform incidents?",
  "How do I add a new knowledge source?",
  "How do I migrate from intents to agents?",
  "What's included in the Hypercare phase?",
  "How do I set up voice handover?",
];

const HELP_TOPICS = [
  "Configuration",
  "Integrations",
  "Voice",
  "Analytics",
  "Migrations",
  "Security",
  "Billing",
  "API",
];

interface TrustCert {
  label: string;
  framework: string;
  status: "passing" | "in-progress";
}

const TRUST_CERTS: TrustCert[] = [
  { label: "ISO 27001", framework: "Information security", status: "passing" },
  { label: "SOC 2", framework: "Type II — annual", status: "passing" },
  { label: "ISO 27017", framework: "Cloud security", status: "passing" },
  { label: "ISO 27018", framework: "Cloud privacy (PII)", status: "passing" },
  { label: "GDPR", framework: "EU data protection", status: "passing" },
  { label: "DORA", framework: "Operational resilience", status: "passing" },
];

const ACCENT_TEXT: Record<TabDef["accent"], string> = {
  purple: "text-boost-purple",
  "green-light": "text-boost-green",
  gold: "text-boost-gold",
  green: "text-boost-green",
};
const ACCENT_BG: Record<TabDef["accent"], string> = {
  purple: "bg-boost-purple",
  "green-light": "bg-boost-green-light",
  gold: "bg-boost-gold",
  green: "bg-boost-green",
};
const ACCENT_RING: Record<TabDef["accent"], string> = {
  purple: "ring-boost-purple",
  "green-light": "ring-boost-green-light",
  gold: "ring-boost-gold",
  green: "ring-boost-green",
};

/* ─── Academy preview ─── *
 * Shows real course tracks the rep can scroll. Hover/focus reveals the
 * blurb so the rep can see what each course covers. */
function AcademyTab({ active, href }: { active: boolean; href: string }) {
  return (
    <div
      className="transition-all duration-500"
      style={{ opacity: active ? 1 : 0 }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-boost-purple mb-2">
        Public · self-paced · free
      </p>
      <h3 className="text-2xl sm:text-3xl font-bold text-boost-dark leading-tight mb-3 max-w-[28ch]">
        Get certified on the platform — at your own pace.
      </h3>
      <p className="text-sm text-boost-text-secondary leading-relaxed max-w-[62ch] mb-7">
        Four learning tracks from a 30-minute overview to a 6-hour deep
        dive on multi-agent flow design. No login required, no payment,
        public to anyone on your team.
      </p>

      <ol className="space-y-2 mb-7">
        {ACADEMY_COURSES.map((course, i) => (
          <li
            key={course.title}
            className="group rounded-lg border border-boost-border bg-white px-4 py-3 hover:border-boost-purple/40 hover:shadow-sm transition-all"
            data-testid={`academy-course-${i + 1}`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-3 min-w-0">
                <span className="text-[10px] font-bold tabular-nums text-boost-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h4 className="text-[14px] font-semibold text-boost-dark truncate">
                  {course.title}
                </h4>
                <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-boost-purple/70 hidden sm:inline">
                  · {course.level}
                </span>
              </div>
              <span className="flex-shrink-0 text-[11px] font-medium text-boost-muted tabular-nums whitespace-nowrap">
                {course.duration} · {course.modules} {course.modules === 1 ? "module" : "modules"}
              </span>
            </div>
            <p className="mt-1.5 text-[12px] text-boost-text-secondary leading-relaxed max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100 transition-all duration-300 overflow-hidden">
              {course.blurb}
            </p>
          </li>
        ))}
      </ol>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-boost-purple text-white text-[12px] font-bold uppercase tracking-[0.14em] hover:bg-boost-purple/90 transition-colors"
      >
        Browse full catalogue
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

/* ─── Help Center preview ─── *
 * Animated search-bar mockup with cycling example queries — signals
 * the breadth of docs without needing to crawl Freshdesk. Topic chips
 * below show category coverage. */
function HelpTab({ active, href }: { active: boolean; href: string }) {
  const [queryIdx, setQueryIdx] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setQueryIdx((i) => (i + 1) % HELP_ROTATING_QUERIES.length);
    }, 2400);
    return () => clearInterval(id);
  }, [active]);
  return (
    <div
      className="transition-all duration-500"
      style={{ opacity: active ? 1 : 0 }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-boost-green mb-2">
        Searchable · 24/7 · ticket support
      </p>
      <h3 className="text-2xl sm:text-3xl font-bold text-boost-dark leading-tight mb-3 max-w-[28ch]">
        Answers, in seconds.
      </h3>
      <p className="text-sm text-boost-text-secondary leading-relaxed max-w-[62ch] mb-7">
        Searchable runbooks, configuration guides, integration patterns,
        and release notes. Every customer gets ticket access from
        kick-off — no separate contract, no per-seat fee.
      </p>

      {/* Mock search bar with rotating placeholder */}
      <div
        className="relative rounded-xl border-2 border-boost-border bg-white px-4 py-3.5 mb-5 shadow-sm focus-within:border-boost-green-light transition-colors"
        data-testid="help-search-mock"
      >
        <div className="flex items-center gap-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-5 h-5 text-boost-muted flex-shrink-0"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>
          <span
            key={queryIdx}
            className="text-[14px] text-boost-text-secondary truncate flex-1 animate-fade-in-soft"
          >
            {HELP_ROTATING_QUERIES[queryIdx]}
          </span>
          <span
            aria-hidden="true"
            className="w-[2px] h-5 bg-boost-green-light animate-blink flex-shrink-0"
          />
        </div>
      </div>

      {/* Topic chips */}
      <div className="mb-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2.5">
          Popular topics
        </p>
        <div className="flex flex-wrap gap-1.5">
          {HELP_TOPICS.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center px-2.5 py-1 rounded-md bg-boost-surface text-[11px] font-medium text-boost-dark/80 border border-boost-border"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-baseline gap-6 mb-7 pb-5 border-b border-boost-border">
        <div>
          <p className="text-2xl font-bold text-boost-dark tabular-nums">400+</p>
          <p className="text-[11px] text-boost-muted">articles & guides</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-boost-dark tabular-nums">24/7</p>
          <p className="text-[11px] text-boost-muted">ticket creation</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-boost-dark tabular-nums">≤4h</p>
          <p className="text-[11px] text-boost-muted">first-response SLA</p>
        </div>
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-boost-green text-white text-[12px] font-bold uppercase tracking-[0.14em] hover:bg-boost-green/90 transition-colors"
      >
        Open Help Center
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

/* ─── Trust Center preview ─── *
 * Live-feel compliance badge grid + status indicator. Subtle pulse on
 * 'all passing' dot signals the dashboard is current, not a snapshot. */
function TrustTab({ active, href }: { active: boolean; href: string }) {
  return (
    <div
      className="transition-all duration-500"
      style={{ opacity: active ? 1 : 0 }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-boost-gold mb-2">
        Live · third-party audited
      </p>
      <h3 className="text-2xl sm:text-3xl font-bold text-boost-dark leading-tight mb-3 max-w-[28ch]">
        Compliance you can verify in real time.
      </h3>
      <p className="text-sm text-boost-text-secondary leading-relaxed max-w-[62ch] mb-7">
        Vanta-powered dashboard with live posture across every framework
        we hold. Procurement can verify the controls themselves —
        without a screenshare or a NDA dance.
      </p>

      {/* Status banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-boost-green-light/8 border border-boost-green-light/30 mb-6">
        <span
          aria-hidden="true"
          className="relative flex h-2.5 w-2.5 flex-shrink-0"
        >
          <span className="absolute inline-flex h-full w-full rounded-full bg-boost-green-light opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-boost-green-light" />
        </span>
        <p className="text-[13px] text-boost-dark font-semibold">
          All controls passing
        </p>
        <span className="ml-auto text-[11px] text-boost-muted">
          Last audit · Q1 2026
        </span>
      </div>

      {/* Cert grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-7">
        {TRUST_CERTS.map((cert, i) => (
          <div
            key={cert.label}
            className="rounded-lg border border-boost-border bg-white px-3.5 py-3 hover:border-boost-gold/50 hover:shadow-sm transition-all"
            data-testid={`trust-cert-${cert.label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
            style={{
              animation: active ? `fade-in-up 400ms ${i * 60}ms backwards ease-out` : undefined,
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-[13px] font-bold text-boost-dark tabular-nums">
                {cert.label}
              </p>
              <span
                aria-hidden="true"
                className="w-1.5 h-1.5 rounded-full bg-boost-green-light flex-shrink-0"
              />
            </div>
            <p className="text-[10px] text-boost-muted leading-tight">
              {cert.framework}
            </p>
          </div>
        ))}
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-boost-gold text-white text-[12px] font-bold uppercase tracking-[0.14em] hover:bg-boost-gold/90 transition-colors"
      >
        View live posture
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

/* ─── Community preview ─── *
 * Surfaces real upcoming Boost Camp event from BOOST_CAMP_LOCATIONS, with
 * a live countdown to the next event. Past-events count + walkthrough
 * library count anchor the scale. */
function CommunityTab({ active, href }: { active: boolean; href: string }) {
  const { nextEvent, pastCount } = useMemo(() => {
    const allEvents = BOOST_CAMP_LOCATIONS.flatMap((loc) =>
      loc.events.map((e) => ({ ...e, location: loc.location })),
    );
    const upcoming = allEvents
      .filter((e) => e.status === "upcoming")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const past = allEvents.filter((e) => e.status === "past");
    return { nextEvent: upcoming[0] ?? null, pastCount: past.length };
  }, []);

  const [countdown, setCountdown] = useState<string>("");
  useEffect(() => {
    if (!active || !nextEvent) return;
    const target = new Date(nextEvent.date).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setCountdown("Live now");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      setCountdown(`${days}d ${hours}h ${mins}m`);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [active, nextEvent]);

  return (
    <div
      className="transition-all duration-500"
      style={{ opacity: active ? 1 : 0 }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-boost-green mb-2">
        Boost Camp · video library · peer slack
      </p>
      <h3 className="text-2xl sm:text-3xl font-bold text-boost-dark leading-tight mb-3 max-w-[32ch]">
        Where customers learn from each other.
      </h3>
      <p className="text-sm text-boost-text-secondary leading-relaxed max-w-[62ch] mb-7">
        The annual Boost Camp brings the community together in person.
        Between events, a walkthrough video library and a peer slack
        keep the conversation alive.
      </p>

      {/* Next event card */}
      {nextEvent ? (
        <div
          className="rounded-xl border border-boost-green/30 bg-gradient-to-br from-boost-green/5 to-white p-5 mb-5"
          data-testid="community-next-event"
        >
          <div className="flex items-baseline justify-between gap-3 mb-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-boost-green">
              Up next
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted tabular-nums">
              {countdown || "—"}
            </p>
          </div>
          <h4 className="text-lg font-bold text-boost-dark mb-1">
            {nextEvent.name}
          </h4>
          <p className="text-[13px] text-boost-text-secondary">
            {nextEvent.location} ·{" "}
            {new Date(nextEvent.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      ) : null}

      {/* Stats row */}
      <div className="flex items-baseline gap-7 mb-7 pb-5 border-b border-boost-border">
        <div>
          <p className="text-2xl font-bold text-boost-dark tabular-nums">
            {pastCount}+
          </p>
          <p className="text-[11px] text-boost-muted">events since 2023</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-boost-dark tabular-nums">9</p>
          <p className="text-[11px] text-boost-muted">walkthrough videos</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-boost-dark tabular-nums">3</p>
          <p className="text-[11px] text-boost-muted">categories: starter · platform · best-practice</p>
        </div>
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-boost-green text-white text-[12px] font-bold uppercase tracking-[0.14em] hover:bg-boost-green/90 transition-colors"
      >
        Explore community
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

/* ─── Main section ─── */
export default function ResourcesSection() {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [active, setActive] = useState<TabId>("academy");
  const activeTab = TABS.find((t) => t.id === active)!;

  return (
    <section className="bg-white py-16 sm:py-20" data-section="resources">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeader
          number="08"
          title="Resources & Trust"
          subtitle="Four destinations every customer inherits — Academy for learning, Help Center for runbooks, Trust Center for live security posture, and Community for peer events. All accessible from kick-off, all part of the platform."
        />

        <div
          ref={ref}
          className="transition-all duration-700"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(12px)",
          }}
        >
          {/* Tab strip */}
          <div className="flex flex-wrap gap-1.5 mb-7" role="tablist" aria-label="Resources">
            {TABS.map((tab) => {
              const isActive = tab.id === active;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  data-testid={`resources-tab-${tab.id}`}
                  onClick={() => setActive(tab.id)}
                  className={`group flex-1 min-w-[140px] text-left rounded-xl border px-4 py-3 transition-all focus-visible:outline-none focus-visible:ring-2 ${ACCENT_RING[tab.accent]} focus-visible:ring-offset-2 ${
                    isActive
                      ? "border-transparent bg-boost-dark text-white shadow-sm"
                      : "border-boost-border bg-white text-boost-dark hover:border-boost-purple/40 hover:bg-boost-surface"
                  }`}
                >
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-[0.14em] mb-0.5 ${
                      isActive ? "text-white/60" : ACCENT_TEXT[tab.accent]
                    }`}
                  >
                    {tab.kicker}
                  </p>
                  <p className="text-[14px] font-semibold leading-tight">
                    {tab.label}
                  </p>
                  <p
                    className={`text-[10px] mt-1 leading-tight ${
                      isActive ? "text-white/50" : "text-boost-muted"
                    }`}
                  >
                    {tab.hint}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Tab panel */}
          <div
            role="tabpanel"
            aria-labelledby={`resources-tab-${active}`}
            className="rounded-2xl border border-boost-border bg-white p-6 sm:p-8 lg:p-10 min-h-[520px]"
          >
            {active === "academy" && (
              <AcademyTab active={active === "academy"} href={activeTab.href} />
            )}
            {active === "help" && (
              <HelpTab active={active === "help"} href={activeTab.href} />
            )}
            {active === "trust" && (
              <TrustTab active={active === "trust"} href={activeTab.href} />
            )}
            {active === "community" && (
              <CommunityTab active={active === "community"} href={activeTab.href} />
            )}
          </div>

          {/* Footer reassurance */}
          <p className="mt-6 text-[12px] text-boost-muted leading-relaxed text-center">
            Every customer gets all four from kick-off. No tier gating, no add-on
            contracts — these are part of the platform.
          </p>
        </div>
      </div>

      {/* Animations — scoped via attribute selectors so they don't pollute global scope */}
      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-soft {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 50%   { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        :global(.animate-fade-in-soft) { animation: fade-in-soft 350ms ease-out; }
        :global(.animate-blink)        { animation: blink 1s steps(1, end) infinite; }
      `}</style>
    </section>
  );
}
