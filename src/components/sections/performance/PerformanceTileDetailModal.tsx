"use client";

/* ──────────────────────────────────────────────────────────────
 *  PerformanceTileDetailModal — click-detail for a KPI tile.
 *
 *  Renders: label, current value with unit, trend chip (same
 *  direction-aware tone as the tile), sparkline over history,
 *  narrative explaining the movement, and linked initiatives
 *  (looked up by ID in accepted_initiatives).
 *
 *  Sparkline is a zero-dependency inline SVG polyline + a filled
 *  area below it. Points scale per-modal to fill the canvas so
 *  movement reads clearly regardless of unit.
 * ────────────────────────────────────────────────────────────── */

import { useEffect, useRef } from "react";
import type {
  AcceptedInitiative,
  PerformanceMetricDetail,
} from "@/lib/types";

interface PerformanceTileDetailModalProps {
  metricKey: string;
  label: string;
  unit: string;
  currentValue?: number;
  previousValue?: number;
  lowerIsBetter?: boolean;
  detail?: PerformanceMetricDetail;
  linkedInitiatives: AcceptedInitiative[];
  onClose: () => void;
}

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}

function fmtValue(v: number | undefined, unit: string): string {
  if (typeof v !== "number") return "—";
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M${unit}`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k${unit}`;
  if (v % 1 === 0) return `${v}${unit}`;
  return `${v.toFixed(1)}${unit}`;
}

export default function PerformanceTileDetailModal({
  metricKey,
  label,
  unit,
  currentValue,
  previousValue,
  lowerIsBetter,
  detail,
  linkedInitiatives,
  onClose,
}: PerformanceTileDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    setTimeout(() => modalRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      previousFocus.current?.focus();
    };
  }, [onClose]);

  // Delta chip tone
  const delta =
    typeof currentValue === "number" && typeof previousValue === "number"
      ? currentValue - previousValue
      : null;
  const deltaToneClass = (() => {
    if (delta === null || delta === 0) return "bg-boost-surface text-boost-muted";
    const positive = delta > 0;
    const isWin = lowerIsBetter ? !positive : positive;
    return isWin
      ? "bg-boost-green-light/15 text-boost-green"
      : "bg-boost-gold/15 text-boost-gold";
  })();
  const deltaArrow = delta === null ? "" : delta > 0 ? "↑" : delta < 0 ? "↓" : "→";
  const deltaLabel = (() => {
    if (delta === null) return null;
    const abs = Math.abs(delta);
    const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
    return `${sign}${abs % 1 === 0 ? abs : abs.toFixed(1)}${unit}`;
  })();

  const history = detail?.history ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-8"
      role="presentation"
      data-testid={`performance-modal-${metricKey}`}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="performance-modal-title"
        tabIndex={-1}
        className="relative bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-boost-border max-w-2xl w-full h-full sm:h-auto sm:max-h-[calc(100vh-4rem)] overflow-y-auto animate-modal-in focus:outline-none"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-boost-border sm:rounded-t-2xl px-5 sm:px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-1">
                Performance metric
              </p>
              <h3
                id="performance-modal-title"
                className="text-lg sm:text-xl font-semibold text-boost-dark leading-snug"
              >
                {label}
              </h3>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl sm:text-3xl font-semibold text-boost-dark tabular-nums">
                  {fmtValue(currentValue, "")}
                </span>
                {unit && <span className="text-sm text-boost-muted">{unit}</span>}
                {deltaLabel && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-[0.14em] ${deltaToneClass}`}
                  >
                    <span aria-hidden="true">{deltaArrow}</span>
                    <span className="tabular-nums normal-case tracking-normal">{deltaLabel}</span>
                  </span>
                )}
              </div>
              {typeof previousValue === "number" && (
                <p className="text-xs text-boost-muted mt-1">
                  Previous period: {fmtValue(previousValue, unit)}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-boost-muted hover:bg-boost-surface hover:text-boost-dark transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2"
              aria-label="Close detail"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-6 py-5 space-y-6">
          {/* Sparkline */}
          {history.length >= 2 && <Sparkline history={history} unit={unit} />}

          {/* Narrative */}
          {detail?.narrative && (
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
                What drove this
              </p>
              <p className="text-sm text-boost-dark leading-relaxed">
                {detail.narrative}
              </p>
            </section>
          )}

          {/* Linked initiatives */}
          {linkedInitiatives.length > 0 && (
            <section className="rounded-xl border border-boost-border bg-boost-surface/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
                Initiatives contributing to this metric
              </p>
              <ul className="space-y-3">
                {linkedInitiatives.map((init) => (
                  <li key={init.initiative_id} className="min-w-0">
                    <p className="text-sm font-semibold text-boost-dark">
                      {init.title || init.initiative_id}
                    </p>
                    {init.business_impact && (
                      <p className="text-xs text-boost-text-secondary mt-0.5 leading-relaxed">
                        {init.business_impact}
                      </p>
                    )}
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mt-1">
                      {init.status.replace("-", " ")}
                      {init.owner && (
                        <>
                          <span aria-hidden="true" className="mx-1.5 text-boost-border">·</span>
                          <span className="normal-case tracking-normal font-normal text-boost-muted">
                            {init.owner}
                          </span>
                        </>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Sparkline — pure inline SVG ─────────────────────────── */

function Sparkline({
  history,
  unit,
}: {
  history: Array<{ at: string; value: number }>;
  unit: string;
}) {
  const W = 560;
  const H = 120;
  const padX = 16;
  const padY = 16;

  const values = history.map((h) => h.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);

  const points = history.map((h, i) => {
    const x = padX + (i / (history.length - 1)) * (W - padX * 2);
    const y = padY + (1 - (h.value - min) / span) * (H - padY * 2);
    return { x, y, h };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = `${pathD} L${points[points.length - 1].x},${H - padY} L${points[0].x},${H - padY} Z`;

  // Direction tint: end ≥ start → green, end < start → purple. Intent
  // is visual polish, not semantic win/loss.
  const lastBetter = points[points.length - 1].h.value >= points[0].h.value;
  const stroke = lastBetter ? "#36b595" : "#59195d";
  const fill = lastBetter ? "rgba(54,181,149,0.12)" : "rgba(89,25,93,0.1)";

  return (
    <section>
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
          History
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted tabular-nums">
          {history.length} points · {fmtDate(history[0].at)} → {fmtDate(history[history.length - 1].at)}
        </p>
      </div>
      <div className="rounded-xl border border-boost-border bg-white p-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="w-full h-auto block"
          role="img"
          aria-label="Trend sparkline"
        >
          <path d={areaD} fill={fill} />
          <path d={pathD} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={3} fill="white" stroke={stroke} strokeWidth={2}>
                <title>
                  {fmtDate(p.h.at)}: {p.h.value}
                  {unit}
                </title>
              </circle>
            </g>
          ))}
        </svg>
        <div className="flex items-center justify-between mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted tabular-nums">
          <span>
            {fmtDate(history[0].at)} · {history[0].value}
            {unit}
          </span>
          <span>
            {fmtDate(history[history.length - 1].at)} · {history[history.length - 1].value}
            {unit}
          </span>
        </div>
      </div>
    </section>
  );
}
