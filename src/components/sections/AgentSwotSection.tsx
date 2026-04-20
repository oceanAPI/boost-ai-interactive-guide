"use client";

/* ──────────────────────────────────────────────────────────────
 *  AgentSwotSection — CE per-agent diagnostic.
 *
 *  Reads `customer.agent_swot` — a keyed map of agent_key →
 *  { strengths, weaknesses, opportunities, threats }. Renders one
 *  card per agent, with the SWOT quadrants stacked as four
 *  coloured-stripe rows for scannability (rather than a literal
 *  2x2 box which wastes space on mobile).
 *
 *  Agent display name is humanised from the key ("order-status" →
 *  "Order status"). Customer-specific agents don't map to the
 *  boost.ai FS agent catalogue, so this simple transform is the
 *  right default.
 * ────────────────────────────────────────────────────────────── */

import { useState } from "react";
import type { AgentSwot, Customer } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import AgentSwotDetailModal from "./agent-swot/AgentSwotDetailModal";

interface AgentSwotSectionProps {
  customer?: Customer;
  sectionNumber?: string;
}

type QuadrantKey = keyof AgentSwot;

const QUADRANTS: Array<{
  key: QuadrantKey;
  label: string;
  stripe: string;
  eyebrowText: string;
}> = [
  { key: "strengths",     label: "Strengths",     stripe: "bg-boost-green-light", eyebrowText: "text-boost-green" },
  { key: "weaknesses",    label: "Weaknesses",    stripe: "bg-boost-gold",        eyebrowText: "text-boost-gold" },
  { key: "opportunities", label: "Opportunities", stripe: "bg-boost-purple",      eyebrowText: "text-boost-purple" },
  { key: "threats",       label: "Threats",       stripe: "bg-boost-muted",       eyebrowText: "text-boost-muted" },
];

/** "order-status" → "Order status". Preserves multi-word feel
 *  without forcing title-case on every word (reads better). */
function humanizeKey(key: string): string {
  const spaced = key.replace(/[-_]/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export default function AgentSwotSection({
  customer,
  sectionNumber,
}: AgentSwotSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [openAgentKey, setOpenAgentKey] = useState<string | null>(null);
  const swotMap = customer?.agent_swot;
  const agentKeys = swotMap ? Object.keys(swotMap) : [];
  const openSwot = openAgentKey && swotMap ? swotMap[openAgentKey] : null;

  if (agentKeys.length === 0) {
    return (
      <section>
        <SectionHeader
          number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
          title="Agent SWOT"
          subtitle="No agent diagnostics captured yet. Add per-agent SWOT entries in admin to render this section."
        />
      </section>
    );
  }

  return (
    <section>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title="Agent SWOT"
        subtitle="Per-agent strengths, weaknesses, opportunities, and threats — how each specialist is performing and where the attention is."
      />

      <div
        ref={ref}
        className={`grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {agentKeys.map((agentKey, i) => {
          const swot = swotMap![agentKey];
          return (
            <button
              key={agentKey}
              type="button"
              onClick={() => setOpenAgentKey(agentKey)}
              className="stagger-child rounded-xl border border-boost-border bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2"
              style={{ animationDelay: `${i * 60}ms` }}
              aria-label={`Open SWOT detail for ${humanizeKey(agentKey)}`}
              data-testid={`agent-swot-${agentKey}`}
            >
              <header className="px-4 sm:px-5 py-3 border-b border-boost-border/60 bg-boost-surface/50">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
                  Agent
                </p>
                <h3 className="text-base font-semibold text-boost-dark mt-0.5">
                  {humanizeKey(agentKey)}
                </h3>
              </header>
              <div className="divide-y divide-boost-border/60">
                {QUADRANTS.map((q) => {
                  const items = swot[q.key] ?? [];
                  return (
                    <div
                      key={q.key}
                      className="relative px-4 sm:px-5 py-3 pl-5 sm:pl-6"
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${q.stripe}`}
                      />
                      <p
                        className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${q.eyebrowText} mb-1.5`}
                      >
                        {q.label}
                      </p>
                      {items.length > 0 ? (
                        <ul className="space-y-1">
                          {items.map((item, ii) => (
                            <li
                              key={ii}
                              className="text-xs text-boost-text-secondary leading-relaxed flex items-start gap-2"
                            >
                              <span
                                aria-hidden="true"
                                className="mt-1.5 w-1 h-1 rounded-full bg-boost-muted/60 flex-shrink-0"
                              />
                              <span className="flex-1 min-w-0">{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-boost-muted/80 italic">None captured.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {openAgentKey && openSwot && (
        <AgentSwotDetailModal
          agentKey={openAgentKey}
          agentName={humanizeKey(openAgentKey)}
          swot={openSwot}
          onClose={() => setOpenAgentKey(null)}
        />
      )}
    </section>
  );
}
