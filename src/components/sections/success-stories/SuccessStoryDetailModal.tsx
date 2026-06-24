"use client";

/* ──────────────────────────────────────────────────────────────
 *  SuccessStoryDetailModal — card-click detail for a success story.
 *
 *  Expands a story card into the deck-faithful Challenge / Solution /
 *  Outcome narrative plus the four "Key metrics" checklist items.
 *  The displayed name honours the engagement's anon toggle (passed in
 *  pre-resolved as `displayName`).
 *
 *  Same chrome as RecommendationDetailModal: focus-trap, Esc-close,
 *  body-scroll lock, return-focus.
 * ────────────────────────────────────────────────────────────── */

import { useEffect, useRef } from "react";
import type { SuccessStory } from "@/data/success-stories";

interface SuccessStoryDetailModalProps {
  story: SuccessStory;
  displayName: string;
  onClose: () => void;
}

export default function SuccessStoryDetailModal({
  story,
  displayName,
  onClose,
}: SuccessStoryDetailModalProps) {
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

  const narrative: { label: string; body: string }[] = [
    { label: "The challenge", body: story.challenge },
    { label: "The solution", body: story.solution },
    { label: "The outcome", body: story.outcome },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-8"
      role="presentation"
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
        aria-labelledby="story-modal-title"
        tabIndex={-1}
        className="relative bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-boost-border max-w-2xl w-full h-full sm:h-auto sm:max-h-[calc(100vh-4rem)] overflow-y-auto animate-modal-in focus:outline-none"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-boost-border sm:rounded-t-2xl px-5 sm:px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-green">
                  {displayName}
                </span>
                <span aria-hidden="true" className="text-boost-border">·</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
                  {story.industry}
                </span>
                <span aria-hidden="true" className="text-boost-border">·</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
                  {story.geo}
                </span>
                {story.date && (
                  <>
                    <span aria-hidden="true" className="text-boost-border">·</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
                      {story.date}
                    </span>
                  </>
                )}
              </div>
              <h3
                id="story-modal-title"
                className="text-lg sm:text-xl font-semibold text-boost-dark leading-snug"
              >
                {story.title}
              </h3>
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
          {/* Challenge / Solution / Outcome */}
          {narrative.map((n) => (
            <section key={n.label}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
                {n.label}
              </p>
              <p className="text-sm text-boost-dark leading-relaxed">{n.body}</p>
            </section>
          ))}

          {/* Key metrics */}
          {story.keyMetrics.length > 0 && (
            <section className="pt-4 border-t border-boost-border">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
                Key metrics
              </p>
              <ul className="space-y-2">
                {story.keyMetrics.map((m, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-boost-dark leading-relaxed"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 bg-boost-green-light border-boost-green-light flex items-center justify-center"
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span>{m}</span>
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
