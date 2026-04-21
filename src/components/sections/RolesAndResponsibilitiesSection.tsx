"use client";

/* ──────────────────────────────────────────────────────────────
 *  RolesAndResponsibilitiesSection — 3-party swim-lane
 *
 *  Reads `customer.roles_and_responsibilities` (PsRaci in types.ts).
 *  Renders three parallel columns — Customer / boost.ai / 3rd Party
 *  — each a swim-lane of role cards. Role cards are compact at
 *  rest (role name + headline allocation) and expand inline on
 *  click to reveal the full responsibility list + allocation
 *  detail for implementation vs production.
 *
 *  Unlike ProjectFraming and BuildScope (tab-based), this section
 *  keeps everything on one canvas — the visual structure itself
 *  conveys that delivery is a three-party coordination exercise.
 *  Progressive disclosure via inline expansion, not hidden tabs.
 *
 *  Responsive:
 *    - Desktop: 3 columns side-by-side
 *    - Tablet:  3 narrower columns
 *    - Mobile:  stacked, each party full-width
 * ────────────────────────────────────────────────────────────── */

import { useState } from "react";
import type { Customer, PsRaci, PsRoleEntry } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface RolesAndResponsibilitiesSectionProps {
  customer?: Customer;
  sectionNumber?: string;
}

/* ───── Party column header — name + role count roll-up ───── */

function PartyHeader({
  label,
  count,
  accent,
  glyph,
}: {
  label: string;
  count: number;
  accent: "green" | "purple" | "gold";
  glyph: string;
}) {
  const accentClasses = {
    green: { bg: "bg-boost-green-light/10", dot: "bg-boost-green-light", text: "text-boost-green" },
    purple: { bg: "bg-boost-purple/10", dot: "bg-boost-purple", text: "text-boost-purple" },
    gold: { bg: "bg-boost-gold/15", dot: "bg-boost-gold", text: "text-boost-gold" },
  }[accent];
  return (
    <header className={`rounded-t-xl ${accentClasses.bg} px-4 py-3 border-b border-boost-border`}>
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className={`w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center text-sm font-bold ${accentClasses.text}`}
        >
          {glyph}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${accentClasses.text}`}>
            {label}
          </p>
          <p className="text-xs text-boost-muted tabular-nums">
            {count} role{count === 1 ? "" : "s"}
          </p>
        </div>
      </div>
    </header>
  );
}

/* ───── Single role card — collapsed + expanded ───── */

interface RoleCardProps {
  role: PsRoleEntry;
  index: number;
  accent: "green" | "purple" | "gold";
  isVisible: boolean;
  partyKey: string;
}

function RoleCard({ role, index, accent, isVisible, partyKey }: RoleCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const accentBorder = {
    green: "border-boost-green-light/50",
    purple: "border-boost-purple/50",
    gold: "border-boost-gold/60",
  }[accent];
  const accentStrip = {
    green: "bg-boost-green-light",
    purple: "bg-boost-purple",
    gold: "bg-boost-gold",
  }[accent];
  const hasDetail = role.responsibilities.length > 0 || !!role.implementation || !!role.production;
  const slug = role.role.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <article
      className="stagger-child relative"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 480ms cubic-bezier(0.16,1,0.3,1), transform 480ms cubic-bezier(0.16,1,0.3,1)",
        transitionDelay: `${120 + index * 70}ms`,
      }}
    >
      <button
        type="button"
        onClick={() => hasDetail && setIsOpen((v) => !v)}
        disabled={!hasDetail}
        aria-expanded={isOpen}
        data-testid={`raci-${partyKey}-${slug}`}
        className={`relative w-full text-left rounded-xl bg-white border ${
          isOpen ? accentBorder : "border-boost-border"
        } px-4 py-3 transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light disabled:cursor-default`}
      >
        <span
          aria-hidden="true"
          className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full ${accentStrip}`}
        />
        <div className="pl-2 flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-boost-dark leading-snug">{role.role}</p>
            {role.implementation && (
              <p className="text-xs text-boost-muted mt-1 leading-snug">
                <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-boost-muted/80 mr-1.5">
                  Build
                </span>
                {role.implementation}
              </p>
            )}
          </div>
          {hasDetail && (
            <span
              aria-hidden="true"
              className="flex-shrink-0 text-boost-muted text-xs mt-0.5 transition-transform"
              style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
            >
              ▸
            </span>
          )}
        </div>

        {isOpen && (
          <div className="pl-2 mt-3 space-y-3 animate-[fadeIn_320ms_cubic-bezier(0.16,1,0.3,1)_both]">
            {role.responsibilities.length > 0 && (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-boost-muted/80 mb-1.5">
                  Responsibilities
                </p>
                <ul className="space-y-1 text-xs text-boost-dark/90">
                  {role.responsibilities.map((r, i) => (
                    <li key={`${slug}-r-${i}`} className="flex gap-2 leading-relaxed">
                      <span aria-hidden="true" className={`flex-shrink-0 mt-1.5 w-1 h-1 rounded-full ${accentStrip}`} />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Allocation detail — only render when it differs from what's
                already shown in the collapsed state. */}
            {(role.implementation || role.production) && (
              <div className="grid grid-cols-1 gap-1.5">
                {role.implementation && (
                  <AllocationRow label="Build" value={role.implementation} />
                )}
                {role.production && (
                  <AllocationRow label="Production" value={role.production} />
                )}
              </div>
            )}
          </div>
        )}
      </button>
    </article>
  );
}

function AllocationRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="flex-shrink-0 w-[72px] text-[9px] font-bold uppercase tracking-[0.14em] text-boost-muted/80 pt-0.5">
        {label}
      </span>
      <span className="text-boost-dark/90 leading-relaxed">{value}</span>
    </div>
  );
}

/* ───── Party column wrapper ───── */

function PartyColumn({
  label,
  glyph,
  accent,
  partyKey,
  roles,
  isVisible,
}: {
  label: string;
  glyph: string;
  accent: "green" | "purple" | "gold";
  partyKey: string;
  roles: PsRoleEntry[];
  isVisible: boolean;
}) {
  return (
    <section
      data-testid={`raci-column-${partyKey}`}
      className="rounded-xl border border-boost-border bg-boost-surface/40 flex flex-col"
    >
      <PartyHeader label={label} count={roles.length} accent={accent} glyph={glyph} />
      {roles.length === 0 ? (
        <div className="px-4 py-5 text-xs text-boost-muted italic">
          No {label.toLowerCase()} roles captured.
        </div>
      ) : (
        <div className="p-3 space-y-2 flex-1">
          {roles.map((r, i) => (
            <RoleCard
              key={`${partyKey}-${i}`}
              role={r}
              index={i}
              accent={accent}
              isVisible={isVisible}
              partyKey={partyKey}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  Main export
 * ═══════════════════════════════════════════════════════════════════ */

export default function RolesAndResponsibilitiesSection({
  customer,
  sectionNumber,
}: RolesAndResponsibilitiesSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const raci: PsRaci | undefined = customer?.roles_and_responsibilities;

  const customerRoles = raci?.customer_roles ?? [];
  const boostRoles = raci?.boost_roles ?? [];
  const thirdPartyRoles = raci?.third_party ?? [];

  const hasAny = customerRoles.length + boostRoles.length + thirdPartyRoles.length > 0;

  if (!hasAny) {
    return (
      <section>
        <SectionHeader
          number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
          title="Roles & responsibilities"
          subtitle="No RACI captured yet. Fill in customer, boost.ai, and 3rd-party roles in admin to render this section."
        />
      </section>
    );
  }

  // Top summary strip — count totals per party, clickable via column below
  const totalRoles = customerRoles.length + boostRoles.length + thirdPartyRoles.length;

  return (
    <section>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title="Roles & responsibilities"
        subtitle="Who does what, during build and once we're live. Click any role for full responsibilities and allocation detail."
      />

      <div
        ref={ref}
        data-testid="roles-and-responsibilities"
        className={`transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Summary strip */}
        <div className="mb-5 rounded-xl border border-boost-border bg-white px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-boost-dark tabular-nums leading-none">
              {totalRoles}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
              roles total
            </span>
          </div>
          <span aria-hidden="true" className="hidden sm:inline h-6 w-px bg-boost-border" />
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
            <PartyTally label="Customer" count={customerRoles.length} accent="green" />
            <PartyTally label="boost.ai" count={boostRoles.length} accent="purple" />
            <PartyTally label="3rd Party" count={thirdPartyRoles.length} accent="gold" />
          </div>
        </div>

        {/* Three party columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <PartyColumn
            label="Customer"
            glyph="◆"
            accent="green"
            partyKey="customer"
            roles={customerRoles}
            isVisible={isVisible}
          />
          <PartyColumn
            label="boost.ai"
            glyph="◉"
            accent="purple"
            partyKey="boost"
            roles={boostRoles}
            isVisible={isVisible}
          />
          <PartyColumn
            label="3rd Party"
            glyph="◇"
            accent="gold"
            partyKey="third-party"
            roles={thirdPartyRoles}
            isVisible={isVisible}
          />
        </div>
      </div>
    </section>
  );
}

function PartyTally({
  label,
  count,
  accent,
}: {
  label: string;
  count: number;
  accent: "green" | "purple" | "gold";
}) {
  const dot = {
    green: "bg-boost-green-light",
    purple: "bg-boost-purple",
    gold: "bg-boost-gold",
  }[accent];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className={`w-2 h-2 rounded-full ${dot}`} />
      <span className="font-semibold text-boost-dark tabular-nums">{count}</span>
      <span className="text-boost-muted">{label}</span>
    </span>
  );
}
