"use client";

/* ──────────────────────────────────────────────────────────────
 *  SolutionArchitectureSection — 3-column flow poster
 *
 *  Reads `customer.solution_architecture`. Maps the six fixture
 *  groups into three columns:
 *
 *      UPSTREAM         ┃  BOOST.AI CORE  ┃  DOWNSTREAM
 *      - user           ┃  - boost_core   ┃  - backend
 *      - channel        ┃                 ┃  - contact_center
 *                       ┃                 ┃  - role
 *
 *  boost.ai core is visually elevated (purple hero) to mark where
 *  the platform sits in the conversation path. Decorative directional
 *  arrows between columns signal data flow without over-claiming
 *  exact topology. Groups expose their items as pills; click a
 *  group header to collapse long groups when scanning.
 *
 *  Interactivity is intentionally minimal (per .impeccable — restraint
 *  is confidence): collapse per group, hover-to-highlight on pills,
 *  notes callout at the bottom when present.
 * ────────────────────────────────────────────────────────────── */

import { useMemo, useState } from "react";
import type { Customer, PsArchitectureGroup } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface SolutionArchitectureSectionProps {
  customer?: Customer;
  sectionNumber?: string;
}

/* Which fixture group keys map to which of the three columns. Keys
 * not in this map fall through to the "Downstream" column as an
 * additive / defensive default so we never drop content. */
const COLUMN_OF: Record<string, "upstream" | "core" | "downstream"> = {
  user: "upstream",
  channel: "upstream",
  channels: "upstream",
  boost_core: "core",
  core: "core",
  backend: "downstream",
  contact_center: "downstream",
  contactcenter: "downstream",
  role: "downstream",
  roles: "downstream",
};

/* Headline label per column for the flow poster — keeps the
 * heading compact and consistent with the 3-column structure. */
const COLUMN_LABEL: Record<"upstream" | "core" | "downstream", string> = {
  upstream: "Upstream",
  core: "boost.ai core",
  downstream: "Downstream",
};

const COLUMN_DESCRIPTOR: Record<"upstream" | "core" | "downstream", string> = {
  upstream: "Who reaches us and how",
  core: "The platform that carries the conversation",
  downstream: "Where we read, write, escalate",
};

function columnOf(key: string): "upstream" | "core" | "downstream" {
  return COLUMN_OF[key.toLowerCase()] ?? "downstream";
}

/* ───── Group block — header + item pills ───── */

function GroupBlock({
  group,
  accent,
  isVisible,
  delayMs,
  onDark = false,
}: {
  group: PsArchitectureGroup;
  accent: "green" | "purple" | "gold";
  isVisible: boolean;
  delayMs: number;
  /** When rendered inside a dark/purple column, flips colours so labels
   *  + pills stay legible against the dark background. */
  onDark?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const slug = group.key.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const labelClasses = onDark
    ? { dot: "bg-boost-green-light", text: "text-boost-green-light", count: "text-white/60", chevron: "text-white/50" }
    : {
        dot:
          accent === "green" ? "bg-boost-green-light" : accent === "purple" ? "bg-boost-purple" : "bg-boost-gold",
        text:
          accent === "green" ? "text-boost-green" : accent === "purple" ? "text-boost-purple" : "text-boost-gold",
        count: "text-boost-muted",
        chevron: "text-boost-muted",
      };

  const pillClasses = onDark
    ? "bg-white/10 border-white/15 text-white hover:bg-white/[0.14] hover:border-white/25"
    : `bg-white text-boost-dark hover:border-boost-dark/30 hover:bg-boost-surface/60 ${
        accent === "green"
          ? "border-boost-green-light/40"
          : accent === "purple"
          ? "border-boost-purple/40"
          : "border-boost-gold/60"
      }`;

  return (
    <div
      data-testid={`architecture-group-${slug}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 520ms cubic-bezier(0.16,1,0.3,1), transform 520ms cubic-bezier(0.16,1,0.3,1)",
        transitionDelay: `${delayMs}ms`,
      }}
    >
      <button
        type="button"
        onClick={() => group.items.length > 3 && setCollapsed((v) => !v)}
        aria-expanded={!collapsed}
        className={`w-full flex items-center gap-2 mb-2.5 text-left ${
          group.items.length > 3 ? "cursor-pointer" : "cursor-default"
        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light rounded-sm`}
      >
        <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${labelClasses.dot}`} />
        <span className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${labelClasses.text}`}>
          {group.label}
        </span>
        <span className={`ml-auto text-[10px] font-semibold tabular-nums ${labelClasses.count}`}>
          {group.items.length}
        </span>
        {group.items.length > 3 && (
          <span
            aria-hidden="true"
            className={`${labelClasses.chevron} text-[10px] transition-transform`}
            style={{ transform: collapsed ? "rotate(0deg)" : "rotate(90deg)" }}
          >
            ▸
          </span>
        )}
      </button>
      {!collapsed && (
        <ul className="flex flex-col gap-1.5">
          {group.items.map((item, i) => (
            <li
              key={`${slug}-${i}`}
              className={`rounded-lg border px-3 py-2 text-xs leading-snug transition-colors ${pillClasses}`}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ───── Directional arrow between columns ───── */

function FlowArrow({ isVisible, delayMs }: { isVisible: boolean; delayMs: number }) {
  return (
    <div
      aria-hidden="true"
      className="hidden lg:flex flex-col items-center justify-center px-1"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 640ms ease-out",
        transitionDelay: `${delayMs}ms`,
      }}
    >
      <svg viewBox="0 0 40 12" className="w-10 h-3 text-boost-muted/60" fill="none">
        <path d="M 0 6 L 32 6" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 3" />
        <path d="M 30 1 L 38 6 L 30 11" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ───── Single column wrapper ───── */

function ArchitectureColumn({
  label,
  descriptor,
  groups,
  accent,
  isVisible,
  startDelayMs,
  hero,
  "data-testid": dataTestId,
}: {
  label: string;
  descriptor: string;
  groups: PsArchitectureGroup[];
  accent: "green" | "purple" | "gold";
  isVisible: boolean;
  startDelayMs: number;
  hero?: boolean;
  "data-testid"?: string;
}) {
  const wrapperClasses = hero
    ? "relative rounded-2xl bg-boost-purple text-white p-5 sm:p-6 overflow-hidden"
    : "rounded-2xl border border-boost-border bg-white p-5 sm:p-6";
  const headerColor = hero ? "text-boost-green-light" : "text-boost-muted";
  const descriptorColor = hero ? "text-white/70" : "text-boost-muted/90";

  return (
    <section data-testid={dataTestId} className={wrapperClasses}>
      {hero && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 55% 40% at 90% 100%, rgba(54,181,149,0.22) 0%, transparent 65%)",
          }}
        />
      )}
      <div className="relative">
        <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${headerColor} mb-0.5`}>
          {label}
        </p>
        <p className={`text-xs ${descriptorColor} mb-5`}>{descriptor}</p>
        <div className="space-y-5">
          {groups.length === 0 ? (
            <p className={`text-xs italic ${hero ? "text-white/60" : "text-boost-muted"}`}>
              Nothing captured for this layer.
            </p>
          ) : (
            groups.map((g, i) => (
              <GroupBlock
                key={g.key}
                group={g}
                accent={accent}
                onDark={hero}
                isVisible={isVisible}
                delayMs={startDelayMs + i * 80}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  Main export
 * ═══════════════════════════════════════════════════════════════════ */

export default function SolutionArchitectureSection({
  customer,
  sectionNumber,
}: SolutionArchitectureSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const architecture = customer?.solution_architecture;

  const buckets = useMemo(() => {
    const b: Record<"upstream" | "core" | "downstream", PsArchitectureGroup[]> = {
      upstream: [],
      core: [],
      downstream: [],
    };
    if (architecture?.groups) {
      for (const g of architecture.groups) {
        b[columnOf(g.key)].push(g);
      }
    }
    return b;
  }, [architecture?.groups]);

  const totalGroups = buckets.upstream.length + buckets.core.length + buckets.downstream.length;

  if (totalGroups === 0) {
    return (
      <section>
        <SectionHeader
          number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
          title="Solution architecture"
          subtitle="No architecture composition captured yet. Define groups + items in admin to render this section."
        />
      </section>
    );
  }

  return (
    <section>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title="Solution architecture"
        subtitle="How the platform sits between the customer and the backend. Upstream channels flow into boost.ai core, which reads and writes to the downstream systems."
      />

      <div
        ref={ref}
        data-testid="solution-architecture"
        className={`transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* 3-column flow poster */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1.15fr_auto_1fr] gap-4 lg:gap-0 items-stretch">
          <ArchitectureColumn
            label={COLUMN_LABEL.upstream}
            descriptor={COLUMN_DESCRIPTOR.upstream}
            groups={buckets.upstream}
            accent="green"
            isVisible={isVisible}
            startDelayMs={120}
            data-testid="architecture-col-upstream"
          />
          <FlowArrow isVisible={isVisible} delayMs={360} />
          <ArchitectureColumn
            label={COLUMN_LABEL.core}
            descriptor={COLUMN_DESCRIPTOR.core}
            groups={buckets.core}
            accent="purple"
            isVisible={isVisible}
            startDelayMs={200}
            hero
            data-testid="architecture-col-core"
          />
          <FlowArrow isVisible={isVisible} delayMs={520} />
          <ArchitectureColumn
            label={COLUMN_LABEL.downstream}
            descriptor={COLUMN_DESCRIPTOR.downstream}
            groups={buckets.downstream}
            accent="gold"
            isVisible={isVisible}
            startDelayMs={280}
            data-testid="architecture-col-downstream"
          />
        </div>

        {/* Notes callout */}
        {architecture?.notes && (
          <aside
            className="mt-5 rounded-xl border border-boost-border bg-boost-surface/50 p-4 sm:p-5 flex items-start gap-3"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 600ms cubic-bezier(0.16,1,0.3,1), transform 600ms cubic-bezier(0.16,1,0.3,1)",
              transitionDelay: "640ms",
            }}
          >
            <span
              aria-hidden="true"
              className="flex-shrink-0 w-6 h-6 rounded-full bg-boost-purple/15 text-boost-purple flex items-center justify-center text-xs font-bold"
            >
              i
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-1">
                Architecture notes
              </p>
              <p className="text-sm text-boost-dark/90 leading-relaxed">
                {architecture.notes}
              </p>
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
