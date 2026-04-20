"use client";

/* ──────────────────────────────────────────────────────────────
 *  AgendaSection — shared across audiences.
 *
 *  Reads `customer.br_context` (set by CE admins on customers with a
 *  scheduled business review; Sales admins may populate it for
 *  discovery / demo meetings). Gracefully renders an empty state
 *  when no agenda is authored so the section can sit in the default
 *  section list without exploding.
 *
 *  Two visual styles controlled by `br_context.agenda_style`:
 *    - "timed"    → hh:mm gutter in boost-green-light (the BR default)
 *    - "numbered" → 01 / 02 / 03 gutter (Moi style)
 *
 *  Chrome matches the other guide sections: SectionHeader on top for
 *  eyebrow + title + optional subtitle (meeting title / date). The
 *  agenda list itself renders on a purple-tinted card so the section
 *  feels like a distinct meeting anchor rather than a body paragraph.
 * ────────────────────────────────────────────────────────────── */

import { useState } from "react";
import type { Customer } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface AgendaSectionProps {
  customer?: Customer;
  sectionNumber?: string;
}

export default function AgendaSection({
  customer,
  sectionNumber,
}: AgendaSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const br = customer?.br_context;
  const items = br?.agenda_items ?? [];
  const style = br?.agenda_style ?? "timed";

  // Empty state — agenda enabled but no items authored. Keeps the
  // section discoverable (nav pill still scrolls here) without
  // pretending there's a meeting to attend.
  if (items.length === 0) {
    return (
      <section>
        <SectionHeader
          number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
          title="Agenda"
          subtitle="No agenda captured for this meeting yet. Add agenda items in admin to populate this section."
        />
        <div className="rounded-2xl border border-dashed border-boost-border bg-boost-surface/40 p-8 text-center">
          <p className="text-sm text-boost-muted">
            Empty agenda — toggle off in admin or add items to the meeting.
          </p>
        </div>
      </section>
    );
  }

  // Build the subtitle from meeting metadata when present. Matches the
  // "Customer Excellence mode · Post-sale reviews, success planning,
  // inspiration" banner rhythm — label · tagline.
  const subtitleParts: string[] = [];
  if (br?.meeting_date) {
    try {
      subtitleParts.push(
        new Date(br.meeting_date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );
    } catch {
      subtitleParts.push(br.meeting_date);
    }
  }
  if (br?.attendees && br.attendees.length > 0) {
    subtitleParts.push(
      `${br.attendees.length} attendee${br.attendees.length === 1 ? "" : "s"}`,
    );
  }

  const subtitle =
    subtitleParts.length > 0 ? subtitleParts.join(" · ") : undefined;

  return (
    <section>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title={br?.meeting_title || "Agenda"}
        subtitle={subtitle}
      />

      <div
        ref={ref}
        className={`relative rounded-2xl bg-boost-purple text-white overflow-hidden shadow-sm transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Subtle radial glow to give the card the same restrained
            Scandinavian-cover feel as the Hero — deep purple base with
            a single green accent bloom in the lower-right corner. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 90% 100%, rgba(54,181,149,0.18) 0%, transparent 65%)",
          }}
        />

        <ol className="relative px-6 sm:px-10 py-8 sm:py-10 grid gap-5 sm:gap-6">
          {items.map((item, i) => {
            const gutter =
              style === "timed"
                ? item.time ?? ""
                : String(i + 1).padStart(2, "0");
            const hasNotes = !!item.notes;
            const isOpen = expandedIdx === i;

            const rowContent = (
              <>
                <span
                  aria-hidden="true"
                  className="flex-shrink-0 text-boost-green-light font-bold tabular-nums w-14 sm:w-16 text-sm sm:text-base pt-1"
                >
                  {gutter}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <p className="text-base sm:text-lg font-semibold leading-snug flex-1 min-w-0">
                      {item.topic}
                    </p>
                    {hasNotes && (
                      <span
                        aria-hidden="true"
                        className="flex-shrink-0 text-white/50 text-xs mt-1.5"
                      >
                        {isOpen ? "▾" : "▸"}
                      </span>
                    )}
                  </div>
                  {item.subtitle && (
                    <p className="text-xs sm:text-sm text-white/70 mt-1 leading-relaxed">
                      {item.subtitle}
                    </p>
                  )}
                  {(item.owner || item.minutes) && (
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50 flex items-center gap-2">
                      {item.owner && <span>{item.owner}</span>}
                      {item.owner && item.minutes ? (
                        <span aria-hidden="true" className="text-white/30">
                          ·
                        </span>
                      ) : null}
                      {item.minutes && <span>{item.minutes} min</span>}
                    </p>
                  )}
                </div>
              </>
            );

            return (
              <li
                key={i}
                className="stagger-child"
                style={{ animationDelay: `${i * 60}ms` }}
                data-testid={`agenda-item-${i}`}
              >
                {hasNotes ? (
                  <button
                    type="button"
                    onClick={() => setExpandedIdx(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="w-full text-left flex items-start gap-5 sm:gap-6 rounded-lg px-2 -mx-2 py-1 -my-1 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light"
                  >
                    {rowContent}
                  </button>
                ) : (
                  <div className="flex items-start gap-5 sm:gap-6">{rowContent}</div>
                )}

                {hasNotes && isOpen && (
                  <div className="mt-3 ml-[76px] sm:ml-[88px] rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-xs sm:text-sm text-white/80 leading-relaxed">
                    {item.notes}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {/* Attendee strip — only when attendees are captured. Sits
            below the agenda list separated by a soft divider so the
            item block feels primary. */}
        {br?.attendees && br.attendees.length > 0 && (
          <div className="relative px-6 sm:px-10 py-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
            <span className="text-white/50">Attendees:</span>
            {br.attendees.map((a, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/10 text-white/80 normal-case tracking-normal font-normal"
              >
                {a}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
