"use client";

/* ──────────────────────────────────────────────────────────────
 *  StakeholderModal — sponsor-card click detail.
 *
 *  Renders the full customer-side stakeholder list (name, role,
 *  email, phone if available). The sponsor is pinned at the top
 *  with a green "SPONSOR" badge so the escalation path reads at
 *  a glance.
 *
 *  Same chrome pattern as the other CE modals.
 * ────────────────────────────────────────────────────────────── */

import { useEffect, useRef } from "react";
import type { GovernanceCadence } from "@/lib/types";

type Stakeholder = NonNullable<GovernanceCadence["stakeholders"]>[number];

interface StakeholderModalProps {
  stakeholders: Stakeholder[];
  onClose: () => void;
}

export default function StakeholderModal({
  stakeholders,
  onClose,
}: StakeholderModalProps) {
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

  // Sort sponsor first, then stable order
  const sorted = [...stakeholders].sort((a, b) => {
    if (a.is_sponsor && !b.is_sponsor) return -1;
    if (!a.is_sponsor && b.is_sponsor) return 1;
    return 0;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-8"
      role="presentation"
      data-testid="stakeholder-modal"
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
        aria-labelledby="stakeholder-modal-title"
        tabIndex={-1}
        className="relative bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-boost-border max-w-xl w-full h-full sm:h-auto sm:max-h-[calc(100vh-4rem)] overflow-y-auto animate-modal-in focus:outline-none"
      >
        <div className="sticky top-0 z-10 bg-white border-b border-boost-border sm:rounded-t-2xl px-5 sm:px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-1">
                Customer-side stakeholders
              </p>
              <h3
                id="stakeholder-modal-title"
                className="text-lg sm:text-xl font-semibold text-boost-dark leading-snug"
              >
                Who owns what
              </h3>
              <p className="text-xs text-boost-muted mt-1 tabular-nums">
                {sorted.length} {sorted.length === 1 ? "person" : "people"}
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

        <div className="px-5 sm:px-6 py-5">
          <ul className="space-y-3">
            {sorted.map((s, i) => {
              const testId = `stakeholder-${(s.name || `row-${i}`).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
              return (
                <li
                  key={i}
                  data-testid={testId}
                  className="rounded-xl border border-boost-border bg-white p-4 flex items-start gap-4"
                >
                  <div
                    aria-hidden="true"
                    className="flex-shrink-0 w-10 h-10 rounded-full bg-boost-surface flex items-center justify-center text-boost-muted text-sm font-semibold"
                  >
                    {s.name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((w) => w.charAt(0).toUpperCase())
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-boost-dark">{s.name}</p>
                      {s.is_sponsor && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-[0.14em] bg-boost-green-light text-white">
                          Sponsor
                        </span>
                      )}
                    </div>
                    {s.role && <p className="text-xs text-boost-muted mt-0.5">{s.role}</p>}
                    {(s.email || s.phone) && (
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-boost-text-secondary">
                        {s.email && (
                          <a
                            href={`mailto:${s.email}`}
                            className="hover:text-boost-purple transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 rounded-sm"
                          >
                            {s.email}
                          </a>
                        )}
                        {s.phone && (
                          <a
                            href={`tel:${s.phone}`}
                            className="hover:text-boost-purple transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 rounded-sm"
                          >
                            {s.phone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
