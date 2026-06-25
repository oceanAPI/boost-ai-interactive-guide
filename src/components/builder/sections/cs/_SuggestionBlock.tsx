"use client";

import { AdminMiniLabel } from "@/components/admin/primitives";

/* Shared "we suggest, you decide" block for the CS builder panels.
 * Renders a ranked, reasoned shortlist the engine produced. Each row
 * shows the title, the why-chips, and an accept/added affordance — the
 * CSM stays in control (nothing is auto-applied). Used by the success
 * story, thought-leadership, and agentic-outcome panels. */

export interface SuggestionItem {
  /** Stable key (story id, chapter tag, source id). */
  key: string;
  title: string;
  /** Optional one-line context under the title. */
  subtitle?: string;
  /** Why the engine suggested this — rendered as chips. */
  reasons: string[];
  /** Already in the engagement's selection. */
  accepted: boolean;
}

export function SuggestionBlock({
  heading,
  helper,
  items,
  emptyHint,
  onAccept,
}: {
  heading: string;
  helper?: string;
  items: SuggestionItem[];
  /** Shown when there are no suggestions (e.g. no metrics yet). */
  emptyHint: string;
  onAccept: (key: string) => void;
}) {
  return (
    <div className="rounded-xl border border-boost-purple/25 bg-boost-purple/[0.04] p-3.5 space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-md bg-boost-purple/12 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-boost-purple">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          We suggest
        </span>
        <span className="text-[12px] font-semibold text-boost-dark">{heading}</span>
      </div>
      {helper ? <p className="text-[11px] text-boost-muted leading-relaxed">{helper}</p> : null}

      {items.length === 0 ? (
        <p className="text-[11px] text-boost-muted italic">{emptyHint}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((it) => (
            <li
              key={it.key}
              className="flex items-start gap-2.5 rounded-lg border border-boost-border bg-white px-3 py-2"
              data-testid={`suggestion-${it.key}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-boost-dark leading-snug truncate">
                  {it.title}
                </p>
                {it.subtitle ? (
                  <p className="text-[10px] text-boost-muted truncate">{it.subtitle}</p>
                ) : null}
                {it.reasons.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {it.reasons.map((r, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-full border border-boost-purple/30 bg-boost-purple/[0.06] px-1.5 py-0.5 text-[9px] font-medium text-boost-purple"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => onAccept(it.key)}
                disabled={it.accepted}
                className={`flex-shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors ${
                  it.accepted
                    ? "bg-boost-green-light/15 text-boost-green cursor-default"
                    : "border border-boost-green-light/50 bg-boost-green-light/10 text-boost-green hover:bg-boost-green-light/20"
                }`}
                data-testid={`suggestion-accept-${it.key}`}
              >
                {it.accepted ? (
                  <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Added
                  </>
                ) : (
                  <>+ Add</>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <AdminMiniLabel className="text-boost-muted/70">
        Suggested from your data — accept or keep picking your own below.
      </AdminMiniLabel>
    </div>
  );
}
