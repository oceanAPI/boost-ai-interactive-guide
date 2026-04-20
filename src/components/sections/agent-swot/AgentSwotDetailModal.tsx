"use client";

/* ──────────────────────────────────────────────────────────────
 *  AgentSwotDetailModal — card-click detail for Agent SWOT.
 *
 *  The summary card stacks all 4 quadrants compactly. This modal
 *  gives each quadrant room to breathe — larger text, richer
 *  bullets, coloured headers — so a BR conversation can dwell on
 *  one agent at a time without crowding.
 *
 *  Same chrome + focus-trap pattern as the other CE detail modals.
 * ────────────────────────────────────────────────────────────── */

import { useEffect, useRef } from "react";
import type { AgentSwot } from "@/lib/types";

interface AgentSwotDetailModalProps {
  agentKey: string;
  agentName: string;
  swot: AgentSwot;
  onClose: () => void;
}

const QUADRANTS: Array<{
  key: keyof AgentSwot;
  label: string;
  stripe: string;
  eyebrow: string;
}> = [
  { key: "strengths",     label: "Strengths",     stripe: "bg-boost-green-light", eyebrow: "text-boost-green" },
  { key: "weaknesses",    label: "Weaknesses",    stripe: "bg-boost-gold",        eyebrow: "text-boost-gold" },
  { key: "opportunities", label: "Opportunities", stripe: "bg-boost-purple",      eyebrow: "text-boost-purple" },
  { key: "threats",       label: "Threats",       stripe: "bg-boost-muted",       eyebrow: "text-boost-muted" },
];

export default function AgentSwotDetailModal({
  agentKey,
  agentName,
  swot,
  onClose,
}: AgentSwotDetailModalProps) {
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

  const counts = {
    strengths: swot.strengths.length,
    weaknesses: swot.weaknesses.length,
    opportunities: swot.opportunities.length,
    threats: swot.threats.length,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-8"
      role="presentation"
      data-testid={`agent-swot-modal-${agentKey}`}
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
        aria-labelledby="agent-swot-modal-title"
        tabIndex={-1}
        className="relative bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-boost-border max-w-3xl w-full h-full sm:h-auto sm:max-h-[calc(100vh-4rem)] overflow-y-auto animate-modal-in focus:outline-none"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-boost-border sm:rounded-t-2xl px-5 sm:px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-1">
                Agent diagnostic
              </p>
              <h3
                id="agent-swot-modal-title"
                className="text-lg sm:text-xl font-semibold text-boost-dark leading-snug"
              >
                {agentName}
              </h3>
              <p className="text-xs text-boost-muted mt-1.5 tabular-nums">
                {counts.strengths + counts.opportunities} positive ·{" "}
                {counts.weaknesses + counts.threats} to address
              </p>
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

        {/* 2x2 quadrant grid on sm+, stacked on mobile */}
        <div className="px-5 sm:px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {QUADRANTS.map((q) => {
              const items = swot[q.key] ?? [];
              return (
                <section
                  key={q.key}
                  className="relative rounded-xl border border-boost-border bg-white p-4 sm:p-5 overflow-hidden"
                  data-testid={`agent-swot-${agentKey}-${q.key}`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-0 bottom-0 w-1 rounded-full ${q.stripe}`}
                  />
                  <div className="flex items-baseline justify-between mb-3">
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${q.eyebrow}`}
                    >
                      {q.label}
                    </p>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted tabular-nums">
                      {items.length}
                    </span>
                  </div>
                  {items.length > 0 ? (
                    <ul className="space-y-2">
                      {items.map((item, i) => (
                        <li
                          key={i}
                          className="text-sm text-boost-dark leading-relaxed flex items-start gap-2.5"
                        >
                          <span
                            aria-hidden="true"
                            className={`mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full ${q.stripe}`}
                          />
                          <span className="flex-1 min-w-0">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-boost-muted/80 italic">None captured.</p>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
