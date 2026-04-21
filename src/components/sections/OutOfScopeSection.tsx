"use client";

/* ──────────────────────────────────────────────────────────────
 *  OutOfScopeSection — explicit boundaries
 *
 *  Reads `customer.out_of_scope` (string[]). Renders an intro
 *  callout that frames the section (exclusions protect scope;
 *  change-orders, not scope creep) and a numbered list of
 *  exclusion cards. Each string is parsed on the em- / en-dash
 *  pattern ("<title> — <reason>") so we can render the exclusion
 *  title bold and the reasoning below as muted context.
 *
 *  Minimal interactivity on purpose — per .impeccable's "restraint
 *  is confidence": boundaries should read as definitive, not
 *  playful. A subtle hover elevation is the only affordance.
 * ────────────────────────────────────────────────────────────── */

import { useMemo } from "react";
import type { Customer } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface OutOfScopeSectionProps {
  customer?: Customer;
  sectionNumber?: string;
}

interface ParsedExclusion {
  title: string;
  reason?: string;
}

/** Split an exclusion string on the first em-dash, en-dash, or
 *  " - " surrounded-by-spaces hyphen. Everything before is the
 *  exclusion title; everything after is the reasoning. If no
 *  separator is found, the whole string is the title. */
function parseExclusion(raw: string): ParsedExclusion {
  const m = raw.match(/^(.+?)\s*[—–]\s*(.+)$/) || raw.match(/^(.+?)\s+-\s+(.+)$/);
  if (m) {
    return { title: m[1].trim(), reason: m[2].trim() };
  }
  return { title: raw.trim() };
}

export default function OutOfScopeSection({
  customer,
  sectionNumber,
}: OutOfScopeSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const items = customer?.out_of_scope ?? [];

  const parsed = useMemo(() => items.map(parseExclusion), [items]);

  if (items.length === 0) {
    return (
      <section>
        <SectionHeader
          number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
          title="Out of scope"
          subtitle="No exclusions captured yet. List anything explicitly excluded in admin to render this section."
        />
      </section>
    );
  }

  return (
    <section>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title="Out of scope"
        subtitle="What this engagement does not cover. Clear exclusions protect the plan — anything below surfaces as a change order, not scope creep."
      />

      <div
        ref={ref}
        data-testid="out-of-scope"
        className={`transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <ol className="space-y-2.5">
          {parsed.map((ex, i) => {
            const slug = ex.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")
              .slice(0, 60);
            return (
              <li
                key={`${slug}-${i}`}
                data-testid={`out-of-scope-item-${i}`}
                className="group rounded-xl border border-boost-border bg-white hover:border-boost-purple/30 hover:shadow-sm transition-all"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0)" : "translateY(4px)",
                  transition: "opacity 440ms cubic-bezier(0.16,1,0.3,1), transform 440ms cubic-bezier(0.16,1,0.3,1), border-color 180ms ease, box-shadow 180ms ease",
                  transitionDelay: `${120 + i * 60}ms`,
                }}
              >
                <div className="flex items-start gap-4 px-4 py-3.5 sm:px-5 sm:py-4">
                  {/* Numbered marker */}
                  <div className="flex-shrink-0 flex items-center gap-3 pt-0.5">
                    <span
                      aria-hidden="true"
                      className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted tabular-nums"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {/* Strike-through accent — visualises the "not this" */}
                    <span
                      aria-hidden="true"
                      className="w-6 h-px bg-boost-purple/50"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-semibold text-boost-dark leading-snug">
                      {ex.title}
                    </p>
                    {ex.reason && (
                      <p className="text-xs sm:text-sm text-boost-muted mt-1 leading-relaxed">
                        {ex.reason}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Footer — emphasises the positive framing */}
        <aside
          className="mt-5 rounded-xl bg-boost-surface/50 border border-boost-border px-4 py-3 flex items-center gap-3"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(4px)",
            transition: "opacity 500ms cubic-bezier(0.16,1,0.3,1), transform 500ms cubic-bezier(0.16,1,0.3,1)",
            transitionDelay: `${120 + parsed.length * 60 + 80}ms`,
          }}
        >
          <span
            aria-hidden="true"
            className="flex-shrink-0 w-6 h-6 rounded-full bg-boost-purple/15 text-boost-purple flex items-center justify-center text-xs font-bold"
          >
            ✓
          </span>
          <p className="text-xs text-boost-dark/80 leading-relaxed">
            Need any of the above in the build?{" "}
            <span className="text-boost-purple font-semibold">
              Raise it as a change order
            </span>{" "}
            — we'll scope, price, and fold it in without disturbing the committed plan.
          </p>
        </aside>
      </div>
    </section>
  );
}
