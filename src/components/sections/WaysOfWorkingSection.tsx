"use client";

import { useState } from "react";
import { SectionHeader, StatCounter } from "@/components/ui";
import ExpandableCard from "@/components/ui/ExpandableCard";
import { assetPath } from "@/lib/asset-path";
import type { GuideData } from "@/lib/types";
import type { TopicContentBlock } from "@/data/topics/_types";
import ContentBlockRenderer from "@/components/sections/topics/ContentBlocks";

/* ═══════════════════════════════════════════════════════════════
   Section 07 — Ways of Working
   Interactive cards covering implementation, team, hypercare,
   and ongoing partnership
   ═══════════════════════════════════════════════════════════════ */

interface Props {
  guide: GuideData;
  sectionNumber: string;
  headerBlocks?: TopicContentBlock[];
  contentBlocks?: TopicContentBlock[];
}

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

/* WowCard replaced by shared ExpandableCard from @/components/ui/ExpandableCard */

/* ═══════════════════════════════════════════════════════════════
   Card 1 — Implementation Plan (Gantt-style)
   12-week visual timeline with 3 phases
   ═══════════════════════════════════════════════════════════════ */
function ImplementationPlan() {
  const [activePhase, setActivePhase] = useState<number | null>(null);

  const phases = [
    {
      number: 1,
      name: "Project preparation",
      duration: "1 week",
      weeks: [1, 1],
      color: "bg-boost-purple",
      tasks: [
        { name: "Agree KPIs & confirm scope", detail: "Define success metrics together — automation rate, resolution quality, cost savings targets. Map which customer journeys to automate first." },
        { name: "Project kick-off", detail: "Joint workshop with all stakeholders. Align on timeline, establish governance model, and set up communication cadence." },
      ],
    },
    {
      number: 2,
      name: "Virtual agent build sprints",
      duration: "9 weeks",
      weeks: [2, 10],
      color: "bg-boost-purple",
      tasks: [
        { name: "Sprint 1 — Build & test", detail: "First agent goes live in a controlled environment. Core conversation flows, knowledge base setup, and initial guardrail configuration." },
        { name: "Sprint 2 — Expand & test", detail: "Add more topics, refine existing flows based on Sprint 1 feedback. Integration testing with your channels and backend systems." },
        { name: "Sprint 3 — Polish & test", detail: "Final conversation design refinements, edge case handling, brand voice alignment, and load testing." },
      ],
    },
    {
      number: 3,
      name: "Integrations, testing & QA",
      duration: "2 weeks",
      weeks: [11, 12],
      color: "bg-boost-green",
      tasks: [
        { name: "Front-end & interaction design", detail: "Chat widget styling, conversation UI, mobile optimization, and accessibility testing. Ensure the experience matches your brand." },
        { name: "Technical integrations", detail: "Final API connections, authentication flows, handover routing, and data pipeline validation." },
        { name: "Final UAT & Go-live", detail: "User acceptance testing with real scenarios. Sign-off from stakeholders. Controlled rollout to production traffic." },
      ],
    },
  ];

  /* Week markers for the Gantt bar */
  const totalWeeks = 12;

  return (
    <div className="space-y-4">
      {/* Week header bar */}
      <div className="flex items-center gap-0 rounded-lg overflow-hidden">
        <div className="bg-boost-purple text-white text-[10px] font-bold px-3 py-1.5 text-center flex-1 rounded-lg">
          12 Weeks
        </div>
      </div>

      {/* Gantt rows */}
      <div className="space-y-2">
        {phases.map((phase, i) => {
          const isActive = activePhase === i;
          const startPct = ((phase.weeks[0] - 1) / totalWeeks) * 100;
          const widthPct =
            ((phase.weeks[1] - phase.weeks[0] + 1) / totalWeeks) * 100;

          return (
            <div key={phase.number}>
              <button
                onClick={() => setActivePhase(isActive ? null : i)}
                className={`w-full text-left rounded-lg border p-3 transition-all ${
                  isActive
                    ? "bg-boost-surface border-boost-purple/20 shadow-sm"
                    : "bg-white border-boost-border hover:bg-boost-surface/50"
                }`}
              >
                {/* Phase label row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-boost-purple text-white text-[10px] font-bold flex items-center justify-center">
                      {phase.number}
                    </span>
                    <p className="text-xs font-semibold text-boost-dark">
                      {phase.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-boost-muted">
                      {phase.duration}
                    </span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`text-boost-muted transition-transform duration-200 ${
                        isActive ? "rotate-180" : ""
                      }`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Gantt bar */}
                <div className="relative h-5 bg-boost-surface rounded-full overflow-hidden">
                  {/* Week ticks */}
                  {Array.from({ length: totalWeeks - 1 }).map((_, w) => (
                    <div
                      key={w}
                      className="absolute top-0 bottom-0 w-px bg-boost-border/40"
                      style={{ left: `${((w + 1) / totalWeeks) * 100}%` }}
                    />
                  ))}
                  {/* Phase bar */}
                  <div
                    className={`absolute top-0.5 bottom-0.5 rounded-full ${phase.color} transition-all`}
                    style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                  />
                </div>
              </button>

              {/* Expanded tasks */}
              {isActive && (
                <div className="mt-2 pl-4 space-y-1.5 animate-modal-in">
                  {phase.tasks.map((task, ti) => (
                    <div
                      key={task.name}
                      className="bg-white rounded-lg border border-boost-border p-3 flex gap-3"
                    >
                      <div
                        className={`w-1 flex-shrink-0 rounded-full ${
                          ti === phase.tasks.length - 1 && phase.number === 3
                            ? "bg-boost-green"
                            : "bg-boost-purple/40"
                        }`}
                      />
                      <div>
                        <p className="text-xs font-semibold text-boost-dark">
                          {task.name}
                        </p>
                        <p className="text-[10px] text-boost-text-secondary leading-relaxed mt-1">
                          {task.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sprint methodology note */}
      <div className="bg-boost-green/5 rounded-lg border border-boost-green/20 p-3">
        <p className="text-[10px] text-boost-text-secondary leading-relaxed">
          <span className="font-semibold text-boost-green">Sprint-based delivery.</span>{" "}
          Each sprint builds incrementally — you see working agents early, test with real
          scenarios, and refine iteratively. No big-bang go-live surprises.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Card 2 — Team & Responsibilities
   Side-by-side: your team vs boost.ai team
   ═══════════════════════════════════════════════════════════════ */
function TeamResponsibilities() {
  const [activeSide, setActiveSide] = useState<"client" | "boost">("client");

  const sides = {
    client: {
      label: "Your team",
      icon: "users",
      roles: [
        { role: "Executive sponsor", commitment: "~1 hr/week", detail: "Project governance, executive sponsorship, and removing blockers. Champions the initiative internally." },
        { role: "Project manager", commitment: "5–15 hrs/week", detail: "Day-to-day project management, stakeholder coordination, and progress tracking. Main point of contact." },
        { role: "AI Trainers / Content designers", commitment: "2 people, ~30 hrs/week each", detail: "Build and refine conversation flows, manage knowledge base content, and define response quality standards." },
        { role: "Technical resource", commitment: "Varies by scope", detail: "Integration setup, security review, API configuration, and SSO/authentication setup." },
        { role: "Brand & communications", commitment: "As needed", detail: "Align virtual agent with brand voice, communication guidelines, and tone of voice standards." },
        { role: "User testers", commitment: "~15 min/person/week", detail: "Conduct user testing, provide feedback on conversation quality, and validate real-world scenarios." },
      ],
    },
    boost: {
      label: "boost.ai",
      icon: "rocket",
      roles: [
        { role: "AI Supervisor", commitment: "~140 hours total", detail: "Establishes intent hierarchy, provides quality assurance throughout implementation, and supports user testing. Your guide to conversational AI best practices." },
        { role: "AI Trainer support", commitment: "On request", detail: "Expert conversation designers available to help with complex flows, multi-language setups, and advanced NLU tuning." },
        { role: "Technical Developer", commitment: "As needed", detail: "Integration development, custom API connectors, and technical support for complex deployment scenarios." },
        { role: "Customer Success Manager", commitment: "Ongoing", detail: "Your strategic partner from go-live onward. Drives adoption, monitors performance, and ensures you realize the business value." },
        { role: "Platform & environment", commitment: "Fully managed", detail: "Environment setup, infrastructure management, security patches, and platform updates — all handled by boost.ai." },
      ],
    },
  };

  const active = sides[activeSide];

  return (
    <div className="space-y-4">
      {/* Side selector */}
      <div className="flex gap-1 bg-boost-surface rounded-lg p-1 border border-boost-border">
        {(["client", "boost"] as const).map((side) => (
          <button
            key={side}
            onClick={() => setActiveSide(side)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-xs font-semibold transition-all ${
              activeSide === side
                ? "bg-boost-purple text-white shadow-sm"
                : "text-boost-muted hover:text-boost-dark"
            }`}
          >
            {sides[side].label}
          </button>
        ))}
      </div>

      {/* Role cards */}
      <div className="space-y-2">
        {active.roles.map((r) => (
          <div
            key={r.role}
            className="bg-white rounded-lg border border-boost-border p-3"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-boost-dark">{r.role}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-boost-purple/10 text-boost-purple font-medium whitespace-nowrap">
                {r.commitment}
              </span>
            </div>
            <p className="text-[10px] text-boost-text-secondary leading-relaxed">
              {r.detail}
            </p>
          </div>
        ))}
      </div>

      {/* Note */}
      <p className="text-[10px] text-boost-muted leading-relaxed italic">
        Resource commitments are estimates based on a standard 12-week implementation.
        Actual needs depend on scope and complexity.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Card 3 — Hypercare & Ongoing Support
   Post-launch journey: hypercare → CSM → continuous
   ═══════════════════════════════════════════════════════════════ */
function HypercareSupport() {
  const [activeStage, setActiveStage] = useState(0);

  const stages = [
    {
      name: "Hypercare",
      period: "First 2 weeks after go-live",
      icon: "hand-protection",
      color: "bg-boost-purple",
      items: [
        "Add missing intents based on real traffic",
        "Model optimization with clean-up reports",
        "Check & reduce unknowns and broken links",
        "Conversation quality review",
        "Define ongoing goals for the team",
      ],
    },
    {
      name: "Stabilization",
      period: "Weeks 3–4",
      icon: "cogs",
      color: "bg-boost-purple/70",
      items: [
        "Continued model optimization",
        "Check and reduce unknowns & mismatches",
        "Conversation quality review",
        "Extend scope and refine context actions",
        "Full project review and documentation",
      ],
    },
    {
      name: "Customer Success",
      period: "From week 5 onward",
      icon: "man-star",
      color: "bg-boost-green",
      items: [
        "Handover to dedicated Customer Success Manager",
        "Recurring business reviews with performance data",
        "Quarterly advanced QA reports by boost.ai",
        "Workshops and training sessions on demand",
        "New feature adoption and scaling strategy",
        "Continuous optimization of automation rate",
      ],
    },
  ];

  const active = stages[activeStage];

  return (
    <div className="space-y-4">
      {/* Stage selector */}
      <div className="flex gap-1 bg-boost-surface rounded-lg p-1 border border-boost-border">
        {stages.map((stage, i) => (
          <button
            key={stage.name}
            onClick={() => setActiveStage(i)}
            className={`flex-1 px-2 py-2.5 rounded-md text-xs font-semibold transition-all text-center leading-tight ${
              activeStage === i
                ? "bg-boost-purple text-white shadow-sm"
                : "text-boost-muted hover:text-boost-dark"
            }`}
          >
            {stage.name}
          </button>
        ))}
      </div>

      {/* Stage detail */}
      <div className="bg-boost-surface rounded-lg border border-boost-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <BoostIcon name={active.icon} size={22} />
          <div>
            <p className="text-sm font-semibold text-boost-dark">{active.name}</p>
            <p className="text-[10px] text-boost-muted">{active.period}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          {active.items.map((item) => (
            <div
              key={item}
              className="flex items-start gap-2 bg-white rounded-md border border-boost-border/50 px-3 py-2"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                className="text-boost-green flex-shrink-0 mt-0.5"
              >
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-xs text-boost-dark">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Journey visual */}
      <div className="flex items-center gap-0">
        {stages.map((stage, i) => (
          <div key={stage.name} className="flex items-center flex-1">
            <div
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i <= activeStage ? stage.color : "bg-boost-border"
              }`}
            />
            {i < stages.length - 1 && (
              <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                className={`flex-shrink-0 ${
                  i < activeStage ? "text-boost-purple" : "text-boost-border"
                }`}
              >
                <path d="M0 0L8 4L0 8Z" fill="currentColor" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Card 4 — Partnership Lifecycle
   The enablement wheel, reframed from customer perspective
   ═══════════════════════════════════════════════════════════════ */
function PartnershipLifecycle() {
  const [activePhase, setActivePhase] = useState<number | null>(null);

  const phases = [
    {
      number: "01",
      name: "Platform & onboarding",
      color: "bg-boost-purple",
      textColor: "text-white",
      description: "Get set up on the boost.ai platform with dedicated onboarding for your AI trainers and project managers.",
      includes: [
        "Platform environment provisioned",
        "Onboarding for AI trainers",
        "Onboarding for project managers",
        "Platform documentation & guides",
      ],
    },
    {
      number: "02",
      name: "Knowledge & enablement",
      color: "bg-boost-gold",
      textColor: "text-white",
      description: "Build your team's expertise with training sessions, certification programs, and access to the Expert Academy.",
      includes: [
        "Expert Academy access",
        "Conversation design training",
        "Model training & analytics",
        "Best practice workshops",
      ],
    },
    {
      number: "03",
      name: "Build & launch",
      color: "bg-boost-pink",
      textColor: "text-white",
      description: "Go from concept to production with hands-on support from boost.ai's implementation team.",
      includes: [
        "Implementation enablement",
        "Demo & proof-of-concept support",
        "Technical integration guidance",
        "Go-live support",
      ],
    },
    {
      number: "04",
      name: "Optimize & grow",
      color: "bg-boost-orange",
      textColor: "text-white",
      description: "Post-launch, your Customer Success Manager drives continuous improvement and helps you realize increasing value.",
      includes: [
        "Dedicated Customer Success Manager",
        "Performance analytics & recommendations",
        "Quarterly business reviews",
        "Feature adoption guidance",
      ],
    },
    {
      number: "05",
      name: "Scale & evolve",
      color: "bg-boost-green",
      textColor: "text-white",
      description: "Expand to new use cases, languages, and channels. Access advanced product capabilities as your needs evolve.",
      includes: [
        "Multi-market expansion support",
        "Advanced feature enablement",
        "Product roadmap collaboration",
        "Ongoing AI trainer development",
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-boost-muted leading-relaxed">
        A continuous partnership — not a one-time delivery. Each phase builds on the last.
      </p>

      {/* Phase ring/timeline */}
      <div className="grid grid-cols-5 gap-1">
        {phases.map((phase, i) => (
          <button
            key={phase.number}
            onClick={() => setActivePhase(activePhase === i ? null : i)}
            className={`relative rounded-lg p-2 sm:p-3 text-center transition-all ${phase.color} ${
              activePhase === i
                ? "ring-2 ring-boost-dark ring-offset-2 scale-[1.03]"
                : "hover:scale-[1.02]"
            }`}
          >
            <p className={`text-[10px] font-bold ${phase.textColor} opacity-70`}>
              {phase.number}
            </p>
            <p
              className={`text-[9px] sm:text-[10px] font-semibold ${phase.textColor} leading-tight mt-0.5`}
            >
              {phase.name}
            </p>
          </button>
        ))}
      </div>

      {/* Connecting arrow */}
      <div className="flex items-center px-2">
        <div className="flex-1 h-px bg-boost-border" />
        <span className="px-2 text-[10px] text-boost-muted">Continuous cycle</span>
        <div className="flex-1 h-px bg-boost-border" />
      </div>

      {/* Detail panel */}
      {activePhase !== null && (
        <div className="bg-boost-surface rounded-lg border border-boost-border p-4 animate-modal-in">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`w-6 h-6 rounded-md ${phases[activePhase].color} text-white text-[10px] font-bold flex items-center justify-center`}
            >
              {phases[activePhase].number}
            </span>
            <p className="text-sm font-semibold text-boost-dark">
              {phases[activePhase].name}
            </p>
          </div>
          <p className="text-xs text-boost-text-secondary leading-relaxed mb-3">
            {phases[activePhase].description}
          </p>
          <div className="space-y-1.5">
            {phases[activePhase].includes.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-boost-green flex-shrink-0"
                >
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-xs text-boost-dark">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activePhase === null && (
        <p className="text-[10px] text-boost-muted text-center italic">
          Click a phase to see what&apos;s included
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Section Component
   ═══════════════════════════════════════════════════════════════ */
export default function WaysOfWorkingSection({
  guide,
  sectionNumber,
  headerBlocks,
  contentBlocks,
}: Props) {
  /* Row-synced open state: expanding one card expands its row sibling */
  const [row1Open, setRow1Open] = useState(true);  // Implementation + Team — both default open
  const [row2Open, setRow2Open] = useState(false); // Hypercare + Partnership

  return (
    <section>
      <SectionHeader
        number={sectionNumber}
        title="Ways of Working"
        subtitle="How boost.ai partners with you — from kickoff through go-live and beyond."
      />

      {/* Header content blocks (stats) */}
      {headerBlocks?.map((block, i) => (
        <div key={i} className="mb-6">
          <ContentBlockRenderer block={block} />
        </div>
      ))}

      {/* Lead callout */}
      <div className="bg-boost-green/5 rounded-xl border border-boost-green/15 p-4 mb-8">
        <p className="text-sm text-boost-dark leading-relaxed">
          <span className="font-semibold">A partnership, not a handoff.</span>{" "}
          boost.ai delivers a dedicated team, a proven methodology, and ongoing support
          that ensures you build real conversational AI capability in-house — not just
          a vendor dependency.
        </p>
      </div>

      {/* Expandable card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ExpandableCard
          title="Implementation Plan"
          subtitle="12-week sprint-based delivery in 3 phases"
          icon={<BoostIcon name="clock-pass" />}
          accentColor="border-boost-purple"
          open={row1Open}
          onToggle={() => setRow1Open(!row1Open)}
        >
          <ImplementationPlan />
        </ExpandableCard>

        <ExpandableCard
          title="Team & Responsibilities"
          subtitle="Who does what — your team and ours"
          icon={<BoostIcon name="users" />}
          accentColor="border-boost-green"
          open={row1Open}
          onToggle={() => setRow1Open(!row1Open)}
        >
          <TeamResponsibilities />
        </ExpandableCard>

        <ExpandableCard
          title="Hypercare & Ongoing Support"
          subtitle="What happens after go-live"
          icon={<BoostIcon name="hand-protection" />}
          accentColor="border-boost-purple"
          open={row2Open}
          onToggle={() => setRow2Open(!row2Open)}
        >
          <HypercareSupport />
        </ExpandableCard>

        <ExpandableCard
          title="Partnership Lifecycle"
          subtitle="Continuous enablement and growth"
          icon={<BoostIcon name="handshake" />}
          accentColor="border-boost-green"
          open={row2Open}
          onToggle={() => setRow2Open(!row2Open)}
        >
          <PartnershipLifecycle />
        </ExpandableCard>
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
