"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SectionHeader } from "@/components/ui";
import ContentBlockRenderer from "@/components/sections/topics/ContentBlocks";
import type { TopicContentBlock } from "@/data/topics/_types";
import {
  ROADMAP_PHASES,
  ROADMAP_LANES,
  TOTAL_WEEKS,
  type RoadmapItem,
} from "@/data/roadmap";

/* ─── Helpers ─── */

function getWeekDate(startDate: string, weekOffset: number): Date {
  const d = new Date(startDate);
  d.setDate(d.getDate() + (weekOffset - 1) * 7);
  return d;
}

function formatWeekLabel(startDate: string, week: number): string {
  const d = getWeekDate(startDate, week);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getMonthSpans(startDate: string): { label: string; startCol: number; span: number }[] {
  const months: { label: string; startCol: number; span: number }[] = [];
  let currentMonth = "";
  let startCol = 1;
  let span = 0;

  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    const d = getWeekDate(startDate, w);
    const month = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    if (month !== currentMonth) {
      if (currentMonth) months.push({ label: currentMonth, startCol, span });
      currentMonth = month;
      startCol = w;
      span = 1;
    } else {
      span++;
    }
  }
  if (currentMonth) months.push({ label: currentMonth, startCol, span });
  return months;
}

const PHASE_COLORS = {
  purple: "bg-boost-purple text-white",
  "purple-dark": "bg-boost-purple-dark text-white",
  green: "bg-boost-green text-white",
  "green-light": "bg-boost-green-light text-white",
} as const;

/* F7 — Per-phase complexity weighting.
 * Build absorbs the most complexity (integrations + market localisation),
 * Scale absorbs market-driven stretch, Pilot is moderate, Discovery is
 * nearly flat. Weight × global complexityScore gives the phase's stretch
 * bar fill (0–1). */
const PHASE_COMPLEXITY_WEIGHT: Record<string, number> = {
  Discovery: 0.35,
  Build: 1.0,
  Pilot: 0.6,
  Scale: 0.75,
};

/** Compute 0–1 complexity score from guide signals. Markets dominate
 *  because multi-market localisation is the single biggest delivery
 *  stretch; integrations + resources fill the rest. */
function computeComplexity(guide?: import("@/lib/types").GuideData): number {
  if (!guide) return 0.25;
  const markets = Math.max(1, guide.deployment_markets || 1);
  // Markets: 1→0, 2→0.35, 3→0.65, 4+→1
  const marketScore = Math.min(1, (markets - 1) / 3);

  const ig = guide.integrations || {};
  const integrationCount =
    (ig.channel?.length || 0) +
    (ig.human_handover?.length || 0) +
    (ig.openid?.length || 0) +
    (ig.utility?.length || 0) +
    (ig.voice?.length || 0);
  // Integrations: 0→0, 3→0.5, 6+→1
  const integrationScore = Math.min(1, integrationCount / 6);

  const r = guide.resources || {};
  const resourceCount =
    (r.stakeholder_owners || 0) +
    (r.ai_trainers || 0) +
    (r.technical_resources || 0);
  // Resources: smaller contributor — 0→0, 4→0.5, 8+→1
  const resourceScore = Math.min(1, resourceCount / 8);

  return 0.5 * marketScore + 0.35 * integrationScore + 0.15 * resourceScore;
}

function complexityLabel(score: number): string {
  if (score < 0.3) return "Low complexity";
  if (score < 0.65) return "Medium complexity";
  return "High complexity";
}

const ITEM_COLORS = {
  default: "bg-boost-green/90 text-white hover:bg-boost-green",
  highlight: "bg-boost-purple text-white shadow-lg shadow-boost-purple/20 hover:bg-boost-purple-dark",
} as const;

/* ─── Unique key for an item ─── */
function itemKey(laneIdx: number, itemIdx: number) {
  return `${laneIdx}-${itemIdx}`;
}

/* ─── Detail Panel (shown below the chart when an item is clicked) ─── */
function DetailPanel({
  item,
  startDate,
  onClose,
}: {
  item: RoadmapItem;
  startDate: string;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const weekRange = item.startWeek === item.endWeek
    ? `Week ${item.startWeek}`
    : `Week ${item.startWeek}–${item.endWeek}`;
  const dateRange = item.startWeek === item.endWeek
    ? formatWeekLabel(startDate, item.startWeek)
    : `${formatWeekLabel(startDate, item.startWeek)} – ${formatWeekLabel(startDate, item.endWeek)}`;

  return (
    <div
      ref={panelRef}
      className="mt-4 rounded-xl border border-boost-border bg-white shadow-lg overflow-hidden animate-modal-in"
    >
      <div className={`px-5 py-3 flex items-center justify-between ${
        item.highlight ? "bg-boost-purple" : "bg-boost-green/90"
      }`}>
        <div className="text-white">
          <h4 className="font-semibold text-sm">{item.name}</h4>
          <p className="text-xs text-white/75">{weekRange} · {dateRange}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors p-1"
          aria-label="Close detail"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="px-5 py-4 space-y-3">
        {item.detail && (
          <p className="text-sm text-boost-text-secondary leading-relaxed">{item.detail}</p>
        )}
        <div className="flex flex-wrap gap-6 text-xs">
          {item.owner && (
            <div>
              <span className="font-semibold text-boost-dark block mb-0.5">Owner</span>
              <span className="text-boost-muted">{item.owner}</span>
            </div>
          )}
          {item.deliverables && item.deliverables.length > 0 && (
            <div className="flex-1 min-w-[200px]">
              <span className="font-semibold text-boost-dark block mb-1">Deliverables</span>
              <div className="flex flex-wrap gap-1.5">
                {item.deliverables.map((d) => (
                  <span
                    key={d}
                    className="px-2 py-0.5 rounded-md bg-boost-surface text-boost-text-secondary text-[11px]"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Desktop Item Pill ─── */
function ItemPill({
  item,
  style,
  animDelay,
  visible,
  isSelected,
  onClick,
}: {
  item: RoadmapItem;
  style: React.CSSProperties;
  animDelay: number;
  visible: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        absolute top-1 bottom-1 rounded-lg flex items-center justify-center
        text-[11px] sm:text-xs font-medium px-1.5 overflow-hidden
        transition-all duration-700 ease-out cursor-pointer
        ${item.highlight ? ITEM_COLORS.highlight : ITEM_COLORS.default}
        ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-95"}
        ${isSelected ? "ring-2 ring-boost-gold ring-offset-1 scale-[1.03]" : ""}
      `}
      style={{
        ...style,
        transitionDelay: visible ? `${animDelay}ms` : "0ms",
      }}
      aria-label={`${item.name} — click for details`}
    >
      <span className="truncate">{item.name}</span>
    </button>
  );
}

/* ─── Mobile Card ─── */
function MobileCard({
  lane,
  laneIdx,
  startDate,
  visible,
  selectedKey,
  onSelect,
}: {
  lane: (typeof ROADMAP_LANES)[0];
  laneIdx: number;
  startDate: string;
  visible: boolean;
  selectedKey: string | null;
  onSelect: (key: string) => void;
}) {
  return (
    <div
      className={`transition-all duration-600 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: visible ? `${laneIdx * 120}ms` : "0ms" }}
    >
      <h4 className="text-xs font-semibold text-boost-dark mb-2 uppercase tracking-wider">
        {lane.name}
      </h4>
      <div className="space-y-2">
        {lane.items.map((item, i) => {
          const key = itemKey(laneIdx, i);
          const isOpen = selectedKey === key;
          return (
            <div key={i}>
              <button
                onClick={() => onSelect(key)}
                className={`
                  w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium
                  transition-all duration-500 ease-out
                  ${item.highlight ? ITEM_COLORS.highlight : ITEM_COLORS.default}
                  ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
                  ${isOpen ? "ring-2 ring-boost-gold ring-offset-1" : ""}
                `}
                style={{ transitionDelay: visible ? `${laneIdx * 120 + i * 80}ms` : "0ms" }}
              >
                <div className="flex items-center justify-between">
                  <span>{item.name}</span>
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                <div className="text-[10px] opacity-75 mt-0.5">
                  Wk {item.startWeek}{item.endWeek > item.startWeek ? `–${item.endWeek}` : ""} · {formatWeekLabel(startDate, item.startWeek)}
                </div>
              </button>
              {isOpen && (
                <div className="mt-1 rounded-lg bg-white border border-boost-border p-3 text-xs space-y-2 animate-modal-in">
                  {item.detail && <p className="text-boost-text-secondary leading-relaxed">{item.detail}</p>}
                  {item.owner && (
                    <div>
                      <span className="font-semibold text-boost-dark">Owner: </span>
                      <span className="text-boost-muted">{item.owner}</span>
                    </div>
                  )}
                  {item.deliverables && item.deliverables.length > 0 && (
                    <div>
                      <span className="font-semibold text-boost-dark block mb-1">Deliverables</span>
                      <div className="flex flex-wrap gap-1">
                        {item.deliverables.map((d) => (
                          <span key={d} className="px-2 py-0.5 rounded bg-boost-surface text-boost-text-secondary text-[10px]">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Section ─── */
export default function RoadmapSection({
  guide,
  startDate: startDateProp,
  sectionNumber,
  headerBlocks,
  contentBlocks,
}: {
  guide?: import("@/lib/types").GuideData;
  startDate?: string;
  sectionNumber: string;
  headerBlocks?: TopicContentBlock[];
  contentBlocks?: TopicContentBlock[];
}) {
  const startDate = startDateProp || guide?.start_date || new Date().toISOString().slice(0, 10);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const toggleItem = useCallback((key: string) => {
    setSelectedKey((prev) => (prev === key ? null : key));
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Resolve the selected item for the detail panel */
  const selectedItem = (() => {
    if (!selectedKey) return null;
    const [laneStr, itemStr] = selectedKey.split("-");
    const lane = ROADMAP_LANES[Number(laneStr)];
    return lane?.items[Number(itemStr)] ?? null;
  })();

  const months = getMonthSpans(startDate);
  const startLabel = new Date(startDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  /* F7 — complexity stretch signal. The 12-week template is indicative;
   * real delivery scales with markets + integrations + resources. We
   * surface that as a thin fill bar inside each phase header so the
   * prospect can see which phases stretch for their footprint. */
  const complexityScore = computeComplexity(guide);
  const complexityPct = Math.round(complexityScore * 100);
  const complexityTone = complexityLabel(complexityScore);

  /* Build resource context from guide data */
  const resourceHints: string[] = [];
  if (guide?.resources?.supporting_departments?.length) {
    resourceHints.push(`${guide.resources.supporting_departments.join(", ")} support`);
  }
  if (guide?.resources?.knowledge_management) {
    resourceHints.push("knowledge management in place");
  }
  const resourceSuffix = resourceHints.length
    ? ` · ${resourceHints.join(" · ")}`
    : "";

  return (
    <section ref={sectionRef}>
      <SectionHeader
        number={sectionNumber}
        title="Implementation & Rollout"
        subtitle={`Starting ${startLabel} — 12-week roadmap from kickoff to full scale${resourceSuffix}`}
      />

      {/* Header content blocks — above the roadmap */}
      {headerBlocks && headerBlocks.length > 0 && (
        <div className="mt-6 space-y-6">
          {headerBlocks.map((block, i) => (
            <ContentBlockRenderer key={i} block={block} />
          ))}
        </div>
      )}

      {/* ─── Desktop Roadmap (hidden on small screens) ─── */}
      <div className="mt-8 hidden md:block">
        <div className="rounded-2xl border border-boost-border bg-white overflow-hidden shadow-sm">

          {/* Phase headers */}
          <div
            className="grid"
            style={{ gridTemplateColumns: `140px repeat(${TOTAL_WEEKS}, 1fr)` }}
          >
            <div className="bg-boost-surface border-r border-boost-border" />
            {ROADMAP_PHASES.map((phase) => {
              const weight = PHASE_COMPLEXITY_WEIGHT[phase.name] ?? 0.5;
              const stretchPct = Math.round(complexityScore * weight * 100);
              return (
                <div
                  key={phase.name}
                  className={`
                    ${PHASE_COLORS[phase.color]} pt-2.5 pb-1.5 px-3 text-center text-sm font-semibold
                    border-r border-white/20 last:border-r-0
                    transition-all duration-700 ease-out
                    ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
                  `}
                  style={{
                    gridColumn: `${phase.startWeek + 1} / ${phase.endWeek + 2}`,
                    transitionDelay: visible ? "100ms" : "0ms",
                  }}
                  title={`${phase.name} — scales with your complexity (${stretchPct}%)`}
                >
                  <div>{phase.name}</div>
                  <div
                    className="mt-1.5 mx-auto h-1 w-[70%] rounded-full bg-white/20 overflow-hidden"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-white/80 transition-all duration-1000 ease-out"
                      style={{
                        width: visible ? `${Math.max(6, stretchPct)}%` : "0%",
                        transitionDelay: visible ? "600ms" : "0ms",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Month labels */}
          <div
            className="grid border-b border-boost-border"
            style={{ gridTemplateColumns: `140px repeat(${TOTAL_WEEKS}, 1fr)` }}
          >
            <div className="bg-boost-surface border-r border-boost-border" />
            {months.map((m) => (
              <div
                key={m.label}
                className={`
                  bg-boost-surface/50 py-1.5 px-2 text-center text-[11px] font-medium
                  text-boost-muted border-r border-boost-border/50 last:border-r-0
                  transition-all duration-500 ease-out
                  ${visible ? "opacity-100" : "opacity-0"}
                `}
                style={{
                  gridColumn: `${m.startCol + 1} / ${m.startCol + m.span + 1}`,
                  transitionDelay: visible ? "200ms" : "0ms",
                }}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Week numbers */}
          <div
            className="grid border-b border-boost-border"
            style={{ gridTemplateColumns: `140px repeat(${TOTAL_WEEKS}, 1fr)` }}
          >
            <div className="bg-boost-surface border-r border-boost-border py-1 px-3 text-[10px] font-medium text-boost-muted">
              Week
            </div>
            {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
              <div
                key={i}
                className={`
                  py-1 text-center text-[10px] text-boost-muted border-r border-boost-border/30
                  last:border-r-0 transition-all duration-500
                  ${visible ? "opacity-100" : "opacity-0"}
                `}
                style={{ transitionDelay: visible ? `${250 + i * 30}ms` : "0ms" }}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Lanes */}
          {ROADMAP_LANES.map((lane, laneIdx) => (
            <div
              key={lane.name}
              className="grid border-b border-boost-border/50 last:border-b-0"
              style={{ gridTemplateColumns: `140px repeat(${TOTAL_WEEKS}, 1fr)` }}
            >
              {/* Lane label */}
              <div
                className={`
                  bg-boost-surface border-r border-boost-border py-3 px-3
                  text-xs font-semibold text-boost-dark flex items-center
                  transition-all duration-600 ease-out
                  ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}
                `}
                style={{ transitionDelay: visible ? `${300 + laneIdx * 100}ms` : "0ms" }}
              >
                {lane.name}
              </div>

              {/* Item cells */}
              <div
                className="relative col-span-full"
                style={{
                  gridColumn: `2 / ${TOTAL_WEEKS + 2}`,
                  minHeight: "44px",
                }}
              >
                {lane.items.map((item, itemIdx) => {
                  const leftPct = ((item.startWeek - 1) / TOTAL_WEEKS) * 100;
                  const widthPct = ((item.endWeek - item.startWeek + 1) / TOTAL_WEEKS) * 100;
                  const key = itemKey(laneIdx, itemIdx);
                  return (
                    <ItemPill
                      key={itemIdx}
                      item={item}
                      visible={visible}
                      isSelected={selectedKey === key}
                      onClick={() => toggleItem(key)}
                      animDelay={400 + laneIdx * 120 + itemIdx * 80}
                      style={{
                        left: `${leftPct}%`,
                        width: `calc(${widthPct}% - 4px)`,
                        marginLeft: "2px",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Week date labels below the chart */}
        <div
          className="grid mt-1"
          style={{ gridTemplateColumns: `140px repeat(${TOTAL_WEEKS}, 1fr)` }}
        >
          <div />
          {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
            <div
              key={i}
              className={`
                text-center text-[9px] text-boost-muted/60
                transition-opacity duration-500
                ${visible ? "opacity-100" : "opacity-0"}
              `}
              style={{ transitionDelay: visible ? `${800 + i * 30}ms` : "0ms" }}
            >
              {formatWeekLabel(startDate, i + 1)}
            </div>
          ))}
        </div>

        {/* Desktop detail panel */}
        {selectedItem && (
          <DetailPanel
            item={selectedItem}
            startDate={startDate}
            onClose={() => setSelectedKey(null)}
          />
        )}
      </div>

      {/* ─── Mobile Layout (card-based) ─── */}
      <div className="mt-6 md:hidden space-y-6">
        {/* Phase ribbon */}
        <div className="flex rounded-xl overflow-hidden">
          {ROADMAP_PHASES.map((phase) => {
            const span = phase.endWeek - phase.startWeek + 1;
            const weight = PHASE_COMPLEXITY_WEIGHT[phase.name] ?? 0.5;
            const stretchPct = Math.round(complexityScore * weight * 100);
            return (
              <div
                key={phase.name}
                className={`${PHASE_COLORS[phase.color]} pt-2 pb-1.5 px-2 text-center text-[11px] font-semibold`}
                style={{ flex: span }}
              >
                <div>{phase.name}</div>
                <div
                  className="mt-1 mx-auto h-0.5 w-[70%] rounded-full bg-white/20 overflow-hidden"
                  aria-hidden="true"
                >
                  <div
                    className="h-full rounded-full bg-white/80 transition-all duration-1000 ease-out"
                    style={{
                      width: visible ? `${Math.max(6, stretchPct)}%` : "0%",
                      transitionDelay: visible ? "500ms" : "0ms",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Lane cards */}
        {ROADMAP_LANES.map((lane, i) => (
          <MobileCard
            key={lane.name}
            lane={lane}
            laneIdx={i}
            startDate={startDate}
            visible={visible}
            selectedKey={selectedKey}
            onSelect={toggleItem}
          />
        ))}
      </div>

      {/* Legend */}
      <div
        className={`
          mt-6 flex flex-wrap items-center gap-4 text-xs text-boost-muted
          transition-all duration-500
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
        style={{ transitionDelay: visible ? "1200ms" : "0ms" }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-boost-purple" />
          Milestone
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-boost-green/90" />
          Workstream
        </div>
        <span className="text-boost-border">|</span>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-boost-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-dark">
            <span className="relative inline-block h-1 w-6 rounded-full bg-boost-border/50 overflow-hidden">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-boost-purple transition-all duration-1000 ease-out"
                style={{ width: visible ? `${Math.max(8, complexityPct)}%` : "0%" }}
              />
            </span>
            {complexityTone}
          </span>
          <span>— phase bars stretch with markets + integrations</span>
        </div>
        <span className="text-boost-border">|</span>
        <span>Click any item for details · Timeline adapts to your projected start date</span>
      </div>

      {/* Additional content blocks from topic data */}
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
