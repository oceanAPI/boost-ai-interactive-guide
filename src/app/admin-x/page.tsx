"use client";

/* /admin-x — ENGAGEMENT JOURNEY (mockup)
 *
 * Visual experiment for the new authoring shell. Replaces today's
 * 12-card form-dump with a progressive journey: empty → choose →
 * search/custom → editing. The rail GROWS as the user adds sections
 * — no upfront complexity, opt-in at every step.
 *
 * Style cues taken from the workspace landing (/):
 *   - bg-boost-bg page surface
 *   - boost-card surfaces with left green-light accent stripes
 *   - purple reserved for brand mark + headline, not chrome
 *   - green-light is the dynamic / active accent
 *   - hover lift + shadow on cards
 *   - generous headline tracking
 *
 * Real wiring happens after the journey shape is locked. */

import { useState } from "react";
import Link from "next/link";
import BoostLogo from "@/components/BoostLogo";

/* Brand sparkle — 4-point star, mirrors the decoration on the new
 * boost.ai customer slides. Used as soft chrome around hero areas. */
function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2 L13.4 10.6 L22 12 L13.4 13.4 L12 22 L10.6 13.4 L2 12 L10.6 10.6 Z" />
    </svg>
  );
}

/* ─── Mock data ─── */
interface PrefillStub {
  key: string;
  name: string;
  country: string;
  category: string;
  domain: string;
  initials: string;
  tint: string;
}

const PREFILLS: PrefillStub[] = [
  { key: "hm", name: "H&M", country: "Sweden", category: "Retail · apparel", domain: "hm.com", initials: "HM", tint: "bg-rose-100 text-rose-700" },
  { key: "folksam", name: "Folksam", country: "Sweden", category: "Insurance · mutual", domain: "folksam.se", initials: "F", tint: "bg-blue-100 text-blue-700" },
  { key: "telenor", name: "Telenor", country: "Norway", category: "Telecom", domain: "telenor.no", initials: "T", tint: "bg-sky-100 text-sky-700" },
  { key: "dnb", name: "DNB", country: "Norway", category: "Banking · retail", domain: "dnb.no", initials: "D", tint: "bg-emerald-100 text-emerald-700" },
  { key: "sas", name: "SAS", country: "Scandinavia", category: "Airline", domain: "flysas.com", initials: "S", tint: "bg-amber-100 text-amber-800" },
  { key: "klarna", name: "Klarna", country: "Sweden", category: "Fintech · BNPL", domain: "klarna.com", initials: "K", tint: "bg-pink-100 text-pink-700" },
  { key: "tryg", name: "Tryg", country: "Denmark", category: "Insurance", domain: "tryg.dk", initials: "T", tint: "bg-indigo-100 text-indigo-700" },
];

interface AddableSection {
  id: string;
  title: string;
  hint: string;
  group: "core" | "pricing" | "delivery" | "narrative";
}

const ADDABLE: AddableSection[] = [
  { id: "areas", title: "Areas of Interest", hint: "Industry, sub-areas, agent surface", group: "core" },
  { id: "pricing", title: "Pricing Model & ROI", hint: "Cost / conv, FTE capacity, ramp", group: "pricing" },
  { id: "invoice", title: "Commercial Invoice", hint: "Volumes, packages, line items", group: "pricing" },
  { id: "deployment", title: "Deployment & Resources", hint: "Markets, team, capacity", group: "delivery" },
  { id: "requirements", title: "Requirements & Volumes", hint: "Per-market or rollup volumes", group: "delivery" },
  { id: "integrations", title: "Backend Integrations", hint: "Auth, channels, CRM", group: "delivery" },
  { id: "notes", title: "Additional Notes", hint: "Free-form context", group: "narrative" },
  { id: "sections", title: "Guide Sections", hint: "Pick which slides render", group: "narrative" },
  { id: "cases", title: "Case Study Selection", hint: "Override industry default", group: "narrative" },
  { id: "custom", title: "Custom Section", hint: "Bespoke section content", group: "narrative" },
  { id: "demos", title: "Demos", hint: "Default scripted or live", group: "narrative" },
];

const GROUP_LABEL: Record<AddableSection["group"], string> = {
  core: "Core",
  pricing: "Pricing & ROI",
  delivery: "Delivery",
  narrative: "Narrative & content",
};

/* ─── Journey state ─── */
type Stage =
  | { kind: "choose" }
  | { kind: "search" }
  | { kind: "custom-entry" }
  | { kind: "editing"; customer: PrefillStub; source: "prefill" | "custom"; added: string[]; activeId: string };

export default function AdminXJourney() {
  const [stage, setStage] = useState<Stage>({ kind: "choose" });
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [showGenerateMenu, setShowGenerateMenu] = useState(false);

  return (
    <div className="min-h-screen bg-boost-bg flex flex-col">
      {/* Top chrome — quiet brand mark + eyebrow, mirrors the
          workspace landing's hierarchy. */}
      <header className="px-6 sm:px-10 pt-6 pb-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 focus-visible:outline-none">
          <BoostLogo className="h-6 w-auto text-boost-purple" />
        </Link>
        <div className="flex items-center gap-4">
          <p className="text-[10px] font-semibold text-boost-muted uppercase tracking-[0.18em]">
            {stage.kind === "editing" ? stage.customer.name : "New engagement"}
          </p>
          {stage.kind !== "choose" && (
            <button
              type="button"
              onClick={() => setStage({ kind: "choose" })}
              className="text-[10px] font-semibold text-boost-muted/80 hover:text-boost-dark uppercase tracking-[0.16em] transition-colors"
            >
              ← Start over
            </button>
          )}
          <Link
            href="/admin"
            className="text-[10px] font-semibold text-boost-muted/80 hover:text-boost-dark uppercase tracking-[0.16em] transition-colors"
          >
            /admin
          </Link>
        </div>
      </header>

      {stage.kind === "choose" && (
        <ChooseStage
          onPickPrefill={() => setStage({ kind: "search" })}
          onPickCustom={() => setStage({ kind: "custom-entry" })}
        />
      )}
      {stage.kind === "search" && (
        <SearchStage
          onPick={(stub) =>
            setStage({
              kind: "editing",
              customer: stub,
              source: "prefill",
              added: ["company", "areas"],
              activeId: "company",
            })
          }
          onMiss={() => setStage({ kind: "custom-entry" })}
        />
      )}
      {stage.kind === "custom-entry" && (
        <CustomEntryStage
          onCreate={(stub) =>
            setStage({
              kind: "editing",
              customer: stub,
              source: "custom",
              added: ["company"],
              activeId: "company",
            })
          }
        />
      )}
      {stage.kind === "editing" && (
        <EditingStage
          stage={stage}
          setStage={setStage}
          showAddPicker={showAddPicker}
          setShowAddPicker={setShowAddPicker}
          showGenerateMenu={showGenerateMenu}
          setShowGenerateMenu={setShowGenerateMenu}
        />
      )}
    </div>
  );
}

/* ─── Stage 1: Choose ─── (entry point — no empty intermediate) */
function ChooseStage({
  onPickPrefill,
  onPickCustom,
}: {
  onPickPrefill: () => void;
  onPickCustom: () => void;
}) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-10">
      <div className="w-full max-w-3xl">
        <div className="relative text-center mb-10 sm:mb-12">
          {/* Brand sparkles — subtle decoration, echoes the new
              boost.ai slide aesthetic. */}
          <Sparkle className="absolute left-[20%] -top-2 w-4 h-4 text-boost-green-light/35" />
          <Sparkle className="absolute right-[18%] top-7 w-3 h-3 text-boost-green-light/45" />
          <Sparkle className="absolute right-[6%] top-12 w-2.5 h-2.5 text-boost-green-light/30" />
          <p className="text-[11px] font-bold text-boost-muted uppercase tracking-[0.2em] mb-3">
            New engagement
          </p>
          <h1 className="text-3xl sm:text-[40px] font-bold text-boost-dark tracking-[-0.02em] leading-[1.05]">
            Where are you starting from?
          </h1>
          <p className="text-sm sm:text-base text-boost-muted mt-4 max-w-lg mx-auto">
            Begin with a curated prefill, or open a blank engagement and
            type the essentials yourself.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ChoiceCard
            onClick={onPickPrefill}
            kicker="Prefill"
            title="Pick a known company"
            bullets={[
              "Search 40+ curated patterns",
              "Industry, contact, defaults populate",
              "Edit anything after",
            ]}
            cta="Search prefills"
            glyph={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
                <circle cx="11" cy="11" r="6" />
                <line x1="21" y1="21" x2="15.5" y2="15.5" />
              </svg>
            }
            recommended
          />
          <ChoiceCard
            onClick={onPickCustom}
            kicker="Custom"
            title="Start from scratch"
            bullets={[
              "Type the company name",
              "Add domain + industry if known",
              "Everything else stays optional",
            ]}
            cta="Open blank"
            glyph={<span className="text-[28px] font-thin leading-none">+</span>}
          />
        </div>
      </div>
    </main>
  );
}

function ChoiceCard({
  onClick,
  kicker,
  title,
  bullets,
  cta,
  glyph,
  recommended,
}: {
  onClick: () => void;
  kicker: string;
  title: string;
  bullets: string[];
  cta: string;
  glyph: React.ReactNode;
  recommended?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative block text-left rounded-xl border border-boost-border bg-boost-card shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2"
    >
      <span
        aria-hidden="true"
        className={`absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-1.5 ${
          recommended ? "bg-boost-green-light" : "bg-boost-lavender"
        }`}
      />
      <div className="p-6 sm:p-7">
        {/* Glyph badge — same faded purple aesthetic as the
            former empty-stage hero, scaled down. */}
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-boost-purple/8 text-boost-purple/60 mb-5 transition-all duration-300 group-hover:bg-boost-purple/12 group-hover:text-boost-purple/80 group-hover:scale-[1.04]">
          {glyph}
        </span>
        <div className="flex items-baseline gap-2.5 mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-boost-purple">{kicker}</p>
          {recommended && (
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-boost-green">
              Recommended
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-boost-dark mb-3 tracking-tight">{title}</h3>
        <ul className="space-y-1.5 mb-5">
          {bullets.map((b, i) => (
            <li key={i} className="text-xs text-boost-text-secondary flex items-start gap-2">
              <span
                aria-hidden="true"
                className={`mt-1 w-1 h-1 rounded-full flex-shrink-0 ${
                  recommended ? "bg-boost-green-light" : "bg-boost-muted/60"
                }`}
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between pt-3 border-t border-boost-border/60">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
            {cta}
          </span>
          <span aria-hidden="true" className="text-boost-muted group-hover:text-boost-purple group-hover:translate-x-0.5 transition-all">
            →
          </span>
        </div>
      </div>
    </button>
  );
}

/* ─── Stage 3: Search ─── */
function SearchStage({
  onPick,
  onMiss,
}: {
  onPick: (stub: PrefillStub) => void;
  onMiss: () => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = query
    ? PREFILLS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.domain.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()),
      )
    : PREFILLS;
  const noMatch = query.length > 0 && filtered.length === 0;

  return (
    <main className="flex-1 px-6 sm:px-10 py-12">
      <div className="max-w-[640px] mx-auto">
        <div className="text-center mb-8">
          <p className="text-[11px] font-semibold text-boost-muted uppercase tracking-[0.18em] mb-3">
            Pick a starting point
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-boost-dark tracking-tight">
            Search prefills
          </h1>
        </div>

        <div className="relative mb-5">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder="Company name, domain, or industry…"
            className="w-full pl-11 pr-4 py-3.5 text-[15px] bg-boost-card border border-boost-border rounded-xl shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light/40 focus-visible:border-boost-green-light/40 placeholder:text-boost-muted/60"
          />
          <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-boost-muted">
            ⌕
          </span>
        </div>

        {noMatch ? (
          <div className="bg-boost-card border border-boost-border rounded-xl p-6 text-center shadow-sm">
            <p className="text-sm text-boost-dark mb-1">No prefill matches &ldquo;{query}&rdquo;.</p>
            <p className="text-xs text-boost-muted mb-5">
              Switch to custom entry — keeps what you typed and adds the essentials manually.
            </p>
            <button
              type="button"
              onClick={onMiss}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-boost-purple-deeper text-white rounded-lg text-[12px] font-semibold uppercase tracking-[0.14em] hover:bg-boost-purple transition-colors"
            >
              Open custom entry
              <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : (
          <ul className="bg-boost-card border border-boost-border rounded-xl divide-y divide-boost-border/60 overflow-hidden shadow-sm">
            {filtered.map((p) => (
              <li key={p.key}>
                <button
                  type="button"
                  onClick={() => onPick(p)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-boost-surface/60 transition-colors group"
                >
                  <span className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold tabular-nums ${p.tint}`}>
                    {p.initials}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-semibold text-boost-dark truncate">{p.name}</span>
                    <span className="block text-[11px] text-boost-muted truncate mt-0.5">
                      {p.category} · {p.country} · {p.domain}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-boost-muted/60 group-hover:text-boost-purple group-hover:translate-x-0.5 transition-all">→</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

/* ─── Stage 3b: Custom entry ─── */
function CustomEntryStage({ onCreate }: { onCreate: (stub: PrefillStub) => void }) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [category, setCategory] = useState("");
  const ready = name.trim().length > 0;

  const submit = () => {
    if (!ready) return;
    onCreate({
      key: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: name.trim(),
      country: "—",
      category: category.trim() || "Custom",
      domain: domain.trim() || "—",
      initials: name.trim().slice(0, 2).toUpperCase(),
      tint: "bg-boost-purple/10 text-boost-purple",
    });
  };

  return (
    <main className="flex-1 px-6 sm:px-10 py-12">
      <div className="max-w-[520px] mx-auto">
        <div className="text-center mb-8">
          <p className="text-[11px] font-semibold text-boost-muted uppercase tracking-[0.18em] mb-3">
            Pick a starting point
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-boost-dark tracking-tight">
            Open a blank engagement
          </h1>
          <p className="text-sm text-boost-muted mt-3 max-w-md mx-auto">
            Just the essentials — everything else is optional and added later.
          </p>
        </div>

        <div className="bg-boost-card border border-boost-border rounded-xl shadow-sm p-5 sm:p-6">
          <div className="space-y-4">
            <Field
              label="Company name"
              value={name}
              onChange={setName}
              placeholder="e.g. Acme Insurance"
              autoFocus
            />
            <Field
              label="Domain"
              value={domain}
              onChange={setDomain}
              placeholder="acme.com"
              optional
            />
            <Field
              label="Industry / category"
              value={category}
              onChange={setCategory}
              placeholder="Insurance · mutual"
              optional
            />
          </div>

          <div className="mt-6 pt-5 border-t border-boost-border/60 flex justify-end">
            <button
              type="button"
              onClick={submit}
              disabled={!ready}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-boost-purple-deeper text-white rounded-lg text-[12px] font-semibold uppercase tracking-[0.14em] hover:bg-boost-purple transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  optional?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-boost-muted mb-1.5">
        {label}
        {optional && <span className="ml-1.5 text-boost-muted/60 normal-case font-medium tracking-normal">optional</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full px-3.5 py-2.5 text-[14px] bg-white border border-boost-border rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light/40 focus-visible:border-boost-green-light/40 placeholder:text-boost-muted/60"
      />
    </div>
  );
}

/* ─── Stage 4: Editing — grow rail ─── */
function EditingStage({
  stage,
  setStage,
  showAddPicker,
  setShowAddPicker,
  showGenerateMenu,
  setShowGenerateMenu,
}: {
  stage: Extract<Stage, { kind: "editing" }>;
  setStage: (s: Stage) => void;
  showAddPicker: boolean;
  setShowAddPicker: (b: boolean) => void;
  showGenerateMenu: boolean;
  setShowGenerateMenu: (b: boolean) => void;
}) {
  const { customer, source, added, activeId } = stage;
  const remaining = ADDABLE.filter((s) => !added.includes(s.id));

  const setActive = (id: string) => setStage({ ...stage, activeId: id });
  const addSection = (id: string) => {
    setStage({ ...stage, added: [...added, id], activeId: id });
    setShowAddPicker(false);
  };

  return (
    <div className="max-w-[1180px] mx-auto px-6 sm:px-10 py-6 flex gap-6 items-start w-full">
      {/* ─── Grown rail ─── */}
      <aside className="hidden lg:flex w-[252px] shrink-0 flex-col sticky self-start" style={{ top: "76px" }}>
        <div className="relative rounded-xl border border-boost-border bg-boost-card shadow-sm overflow-hidden">
          {/* Left accent stripe — same vocabulary as workspace landing cards */}
          <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1 bg-boost-green-light" />

          {/* Customer summary header */}
          <div className="pl-4 pr-3.5 py-3.5 border-b border-boost-border/60">
            <div className="flex items-center gap-2.5">
              <span className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold tabular-nums ${customer.tint}`}>
                {customer.initials}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-boost-dark truncate tracking-tight">{customer.name}</p>
                <p className="text-[10px] text-boost-muted truncate mt-0.5">{customer.category}</p>
              </div>
            </div>
            <p className="text-[9px] uppercase tracking-[0.18em] text-boost-muted/70 mt-3 font-semibold">
              From {source === "prefill" ? "prefill" : "custom entry"} · {added.length} {added.length === 1 ? "section" : "sections"}
            </p>
          </div>

          {/* Active sections */}
          <nav className="py-1">
            <RailItem
              label="Company Information"
              hint={customer.name}
              filled
              active={activeId === "company"}
              onClick={() => setActive("company")}
            />
            {added
              .filter((id) => id !== "company")
              .map((id) => {
                const def = ADDABLE.find((a) => a.id === id);
                if (!def) return null;
                return (
                  <RailItem
                    key={id}
                    label={def.title}
                    hint={def.hint}
                    filled
                    active={activeId === id}
                    onClick={() => setActive(id)}
                  />
                );
              })}
          </nav>

          {/* Quiet "Add" — minimal, no border, ghost text. The
              prominent affordance lives in the main column pill. */}
          {remaining.length > 0 && (
            <div className="pb-1">
              <button
                type="button"
                onClick={() => setShowAddPicker(true)}
                className="w-full text-left pl-4 pr-3 py-1.5 flex items-center gap-2.5 text-boost-muted/70 hover:text-boost-green hover:bg-boost-green-light/8 transition-colors"
              >
                <span className="flex-shrink-0 w-[18px] h-[18px] flex items-center justify-center text-[12px] leading-none">+</span>
                <span className="text-[11px] font-medium tracking-tight">Add</span>
                <span className="text-[10px] text-boost-muted/50 tabular-nums">{remaining.length}</span>
              </button>
            </div>
          )}

          {/* Generate — single primary CTA. Click opens a picker so
              the user chooses an output (Presentation / SoW PDF /
              Interactive Engagement) rather than committing to one
              format up front. */}
          <div className="border-t border-boost-border/60 bg-boost-surface/40 p-3">
            <button
              type="button"
              onClick={() => setShowGenerateMenu(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-boost-purple-deeper text-white text-[11px] font-bold uppercase tracking-[0.16em] hover:bg-boost-purple transition-colors shadow-sm"
            >
              <span>Generate engagement</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main: active section ─── */}
      <main className="flex-1 min-w-0">
        <ActiveSectionPanel customer={customer} activeId={activeId} />

        {remaining.length > 0 && (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAddPicker(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-boost-green-light/12 text-boost-green text-[11px] font-semibold uppercase tracking-[0.14em] hover:bg-boost-green-light/18 transition-colors"
            >
              <span aria-hidden="true" className="text-[13px] leading-none">+</span>
              <span>Add a section</span>
              <span className="text-boost-green/70 normal-case tracking-normal font-medium">· {remaining.length} available</span>
            </button>
          </div>
        )}
      </main>

      {showAddPicker && (
        <AddSectionPicker
          remaining={remaining}
          onPick={addSection}
          onClose={() => setShowAddPicker(false)}
        />
      )}

      {showGenerateMenu && <GenerateMenu onClose={() => setShowGenerateMenu(false)} />}
    </div>
  );
}

/* CRM import button — minimal ghost pill that lives inside Company
 * Information. Pulls customer data from the CRM record into the form
 * fields. Distinct from Generate-menu's "Push to ..." which exports
 * back. */
function CrmImportButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-boost-border/80 bg-white text-boost-muted text-[10px] font-semibold uppercase tracking-[0.14em] hover:text-boost-dark hover:border-boost-purple/40 transition-colors"
    >
      <span aria-hidden="true" className="w-1 h-1 rounded-full bg-boost-orange/70" />
      {label}
    </button>
  );
}

function RailItem({
  label,
  hint,
  filled,
  active,
  onClick,
}: {
  label: string;
  hint: string;
  filled: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full text-left pl-4 pr-3 py-2 flex items-start gap-2.5 transition-colors ${
        active ? "bg-boost-surface/60" : "hover:bg-boost-surface/30"
      }`}
    >
      <span
        className={`flex-shrink-0 mt-[2px] flex items-center justify-center w-[18px] h-[18px] rounded-full text-[9px] font-bold tabular-nums leading-none transition-colors ${
          filled
            ? "bg-boost-green-light text-white"
            : active
              ? "bg-boost-purple text-white"
              : "bg-white ring-1 ring-inset ring-boost-border text-boost-muted"
        }`}
      >
        {filled ? "✓" : "+"}
      </span>
      <span className="flex-1 min-w-0">
        <span className={`block text-[12px] font-semibold leading-snug truncate ${active ? "text-boost-dark" : "text-boost-dark/85"}`}>
          {label}
        </span>
        <span className="block text-[10px] text-boost-muted leading-tight truncate mt-0.5">{hint}</span>
      </span>
    </button>
  );
}

function ActiveSectionPanel({ customer, activeId }: { customer: PrefillStub; activeId: string }) {
  const def = ADDABLE.find((a) => a.id === activeId);
  const title = activeId === "company" ? "Company Information" : (def?.title ?? "Section");
  const hint = activeId === "company" ? "Identity, contact, kickoff date" : (def?.hint ?? "");

  return (
    <section className="relative bg-boost-card rounded-xl border border-boost-border shadow-sm overflow-hidden">
      <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1 bg-boost-green-light" />
      <header className="pl-7 pr-6 py-5 border-b border-boost-border/60">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-boost-muted mb-1.5">Editing</p>
        <h2 className="text-[20px] font-semibold text-boost-dark tracking-tight">{title}</h2>
        <p className="text-[12px] text-boost-muted mt-1">{hint}</p>
      </header>
      <div className="pl-7 pr-6 py-5">
        {activeId === "company" ? (
          <div className="space-y-5">
            {/* CRM import row — minimal ghost buttons. Pulls company
                data from the CRM into the form fields below. The push
                direction (export back to CRM) lives in the Generate
                menu, not here. */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-boost-muted/80">
                Import from
              </span>
              <CrmImportButton label="Salesforce" />
              <CrmImportButton label="HubSpot" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Company name" value={customer.name} onChange={() => {}} />
              <Field label="Domain" value={customer.domain} onChange={() => {}} />
              <Field label="Country" value={customer.country} onChange={() => {}} />
              <Field label="Category" value={customer.category} onChange={() => {}} />
              <Field label="Contact name" value="" onChange={() => {}} placeholder="e.g. Jane Doe" optional />
              <Field label="Kickoff date" value="" onChange={() => {}} placeholder="2026-05-01" optional />
            </div>
          </div>
        ) : (
          <div className="bg-boost-surface/50 rounded-lg border border-dashed border-boost-border px-4 py-10 text-center">
            <p className="text-[12px] text-boost-muted">[live editor for {title} — port from /admin]</p>
          </div>
        )}
      </div>
    </section>
  );
}

/* Generate picker — traffic-light status per output. Green = ready,
 * orange = CRM sync (coming), grey = future placeholder. The bi-
 * directional split is intentional: imports (pull-from-CRM) live
 * inside Company Information; exports (push-to-CRM) live here. */
type OutputStatus = "ready" | "soon-orange" | "soon-grey";

interface OutputOption {
  id: string;
  title: string;
  hint: string;
  status: OutputStatus;
  glyph: string;
}

const OUTPUTS: OutputOption[] = [
  { id: "presentation", title: "Presentation", hint: "Full-screen slide deck for live walk-throughs.", status: "ready", glyph: "▷" },
  { id: "sow-pdf", title: "SoW PDF", hint: "Procurement-friendly downloadable scope.", status: "ready", glyph: "↓" },
  { id: "interactive", title: "Interactive Engagement", hint: "Shareable URL the customer can browse on their own.", status: "ready", glyph: "✦" },
  { id: "push-salesforce", title: "Push to Salesforce", hint: "Sync engagement back into the opportunity record.", status: "soon-orange", glyph: "◆" },
  { id: "push-hubspot", title: "Push to HubSpot", hint: "Sync engagement back into the deal pipeline.", status: "soon-orange", glyph: "◆" },
  { id: "save", title: "Save engagement", hint: "Stash a draft you can return to or share with a teammate.", status: "soon-grey", glyph: "✓" },
];

function statusToken(status: OutputStatus) {
  switch (status) {
    case "ready":
      return { dot: "bg-boost-green-light", label: "Ready", labelColor: "text-boost-green" };
    case "soon-orange":
      return { dot: "bg-boost-orange", label: "Coming soon", labelColor: "text-boost-orange" };
    case "soon-grey":
      return { dot: "bg-boost-muted/60", label: "Future", labelColor: "text-boost-muted/80" };
  }
}

function GenerateMenu({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Generate engagement"
      className="fixed inset-0 z-30 flex items-start justify-center bg-boost-dark/35 backdrop-blur-[2px] p-6 pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[600px] bg-boost-card rounded-xl border border-boost-border shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-4 border-b border-boost-border flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-boost-muted">Generate engagement</p>
            <h3 className="text-[15px] font-semibold text-boost-dark mt-0.5 tracking-tight">Pick an output</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-boost-muted hover:text-boost-dark text-lg leading-none px-2 py-1 rounded-md hover:bg-boost-surface"
          >
            ✕
          </button>
        </header>
        <ul className="p-2 max-h-[60vh] overflow-y-auto">
          {OUTPUTS.map((opt) => {
            const tok = statusToken(opt.status);
            const dim = opt.status !== "ready";
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  className={`w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    dim ? "hover:bg-boost-surface/60" : "hover:bg-boost-surface"
                  }`}
                >
                  <span className={`flex-shrink-0 relative w-9 h-9 rounded-full bg-boost-purple/8 text-boost-purple/70 flex items-center justify-center text-[14px] ${dim ? "opacity-70" : ""}`}>
                    {opt.glyph}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-boost-card ${tok.dot}`} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-baseline gap-2">
                      <span className={`block text-[13px] font-semibold tracking-tight ${dim ? "text-boost-dark/75" : "text-boost-dark"}`}>
                        {opt.title}
                      </span>
                      <span className={`text-[9px] font-semibold uppercase tracking-[0.16em] ${tok.labelColor}`}>
                        {tok.label}
                      </span>
                    </span>
                    <span className="block text-[11px] text-boost-muted mt-0.5">{opt.hint}</span>
                  </span>
                  <span aria-hidden="true" className={`text-boost-muted/60 ${dim ? "opacity-50" : ""}`}>→</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function AddSectionPicker({
  remaining,
  onPick,
  onClose,
}: {
  remaining: AddableSection[];
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const grouped: Record<AddableSection["group"], AddableSection[]> = {
    core: [],
    pricing: [],
    delivery: [],
    narrative: [],
  };
  remaining.forEach((s) => grouped[s.group].push(s));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add a section"
      className="fixed inset-0 z-30 flex items-start justify-center bg-boost-dark/30 backdrop-blur-[2px] p-6 pt-24"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] bg-boost-card rounded-xl border border-boost-border shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-4 border-b border-boost-border flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-boost-muted">Add a section</p>
            <h3 className="text-[15px] font-semibold text-boost-dark mt-0.5 tracking-tight">Pick what to author next</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-boost-muted hover:text-boost-dark text-lg leading-none px-2 py-1 rounded-md hover:bg-boost-surface"
          >
            ✕
          </button>
        </header>
        <div className="max-h-[60vh] overflow-y-auto">
          {(Object.keys(grouped) as AddableSection["group"][]).map((g) => {
            const items = grouped[g];
            if (items.length === 0) return null;
            return (
              <div key={g} className="px-3 py-2">
                <p className="px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-boost-muted">{GROUP_LABEL[g]}</p>
                <ul>
                  {items.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => onPick(s.id)}
                        className="w-full text-left px-2.5 py-2 rounded-lg flex items-start gap-2.5 hover:bg-boost-surface transition-colors group"
                      >
                        <span className="flex-shrink-0 mt-[2px] flex items-center justify-center w-[18px] h-[18px] rounded-full bg-boost-green-light/15 text-boost-green text-[11px] font-bold leading-none transition-colors group-hover:bg-boost-green-light/25">
                          +
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] font-semibold text-boost-dark">{s.title}</span>
                          <span className="block text-[11px] text-boost-muted mt-0.5">{s.hint}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
