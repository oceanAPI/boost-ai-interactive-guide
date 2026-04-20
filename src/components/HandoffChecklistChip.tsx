"use client";

/* ──────────────────────────────────────────────────────────────
 *  HandoffChecklistChip — SoW handoff status pill
 *
 *  Renders a compact horizontal strip at the top of a guide when
 *  `customer.handoff_checklist` is populated. Five items, one per
 *  required-pre-PS dimension:
 *
 *     Auth · CRM · Contact centre · Integrations · Partner
 *
 *  Each item carries a status dot:
 *    - green  — required=true and detail present (complete)
 *    - amber  — required=true and no detail (pending)
 *    - muted  — required=false (n/a)
 *    - grey   — field absent entirely (unknown)
 *
 *  Click the strip to toggle an expanded detail panel that lists
 *  the notes / which-system-by-name value per item. No modal —
 *  just an inline expand beneath the strip.
 *
 *  Renders nothing if the customer has no checklist at all.
 *  Purely informational; not editable in the guide view.
 * ────────────────────────────────────────────────────────────── */

import { useState } from "react";
import type { Customer } from "@/lib/types";

interface HandoffChecklistChipProps {
  customer?: Customer;
}

type ItemStatus = "complete" | "pending" | "na" | "unknown";

interface ItemConfig {
  key: "authentication" | "crm_integration" | "contact_center" | "additional_integrations" | "partner";
  label: string;
  /** Renders the detail when expanded — extracts free-form value. */
  getDetail: (c: NonNullable<Customer["handoff_checklist"]>) => string | undefined;
}

const ITEMS: ItemConfig[] = [
  {
    key: "authentication",
    label: "Auth",
    getDetail: (c) => c.authentication?.notes,
  },
  {
    key: "crm_integration",
    label: "CRM",
    getDetail: (c) => c.crm_integration?.which,
  },
  {
    key: "contact_center",
    label: "Contact centre",
    getDetail: (c) => c.contact_center?.which,
  },
  {
    key: "additional_integrations",
    label: "Integrations",
    getDetail: (c) => c.additional_integrations?.which?.join(" · "),
  },
  {
    key: "partner",
    label: "Partner",
    getDetail: (c) => c.partner?.which,
  },
];

function statusOf(item: ItemConfig, checklist: NonNullable<Customer["handoff_checklist"]>): ItemStatus {
  const entry = checklist[item.key];
  if (!entry) return "unknown";
  if (entry.required === false) return "na";
  const detail = item.getDetail(checklist);
  const hasDetail = typeof detail === "string" && detail.length > 0;
  return hasDetail ? "complete" : "pending";
}

const STATUS_DOT_CLASS: Record<ItemStatus, string> = {
  complete: "bg-boost-green-light",
  pending: "bg-boost-gold",
  na: "bg-boost-muted/40",
  unknown: "bg-boost-border",
};

const STATUS_LABEL: Record<ItemStatus, string> = {
  complete: "Complete",
  pending: "Pending",
  na: "Not applicable",
  unknown: "Not captured",
};

export default function HandoffChecklistChip({ customer }: HandoffChecklistChipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const checklist = customer?.handoff_checklist;

  if (!checklist) return null;

  // If literally every item is absent, don't render at all.
  const hasAny = ITEMS.some((it) => checklist[it.key] !== undefined);
  if (!hasAny) return null;

  const completeCount = ITEMS.filter((it) => statusOf(it, checklist) === "complete").length;
  const applicableCount = ITEMS.filter((it) => {
    const s = statusOf(it, checklist);
    return s === "complete" || s === "pending";
  }).length;

  return (
    <div
      data-testid="handoff-checklist-chip"
      className="sticky top-2 z-20 mx-auto mb-6 w-full max-w-4xl px-3 sm:px-0"
    >
      <div className="rounded-xl border border-boost-border bg-white shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          className="w-full flex items-center gap-3 sm:gap-5 px-4 sm:px-5 py-3 text-left hover:bg-boost-surface/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-inset"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-boost-purple flex-shrink-0">
            Sales → PS handoff
          </span>

          <div className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-3 overflow-x-auto scrollbar-hide">
            {ITEMS.map((it) => {
              const s = statusOf(it, checklist);
              return (
                <span
                  key={it.key}
                  className="inline-flex items-center gap-1.5 flex-shrink-0"
                  title={`${it.label} — ${STATUS_LABEL[s]}`}
                >
                  <span
                    aria-hidden="true"
                    className={`w-2 h-2 rounded-full ${STATUS_DOT_CLASS[s]}`}
                  />
                  <span className="text-xs font-medium text-boost-dark">
                    {it.label}
                  </span>
                </span>
              );
            })}
          </div>

          <span className="flex-shrink-0 flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted tabular-nums hidden sm:inline">
              {completeCount}/{applicableCount} captured
            </span>
            <span aria-hidden="true" className="text-boost-muted text-xs">
              {isOpen ? "▾" : "▸"}
            </span>
          </span>
        </button>

        {isOpen && (
          <div className="border-t border-boost-border bg-boost-surface/30 px-4 sm:px-5 py-4 space-y-2.5">
            {ITEMS.map((it) => {
              const s = statusOf(it, checklist);
              const detail = it.getDetail(checklist);
              return (
                <div
                  key={it.key}
                  className="flex items-start gap-3 text-xs sm:text-sm"
                  data-testid={`handoff-item-${it.key}`}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT_CLASS[s]}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-boost-dark">
                      {it.label}{" "}
                      <span className="font-normal text-boost-muted">
                        · {STATUS_LABEL[s]}
                      </span>
                    </p>
                    {detail && (
                      <p className="text-boost-muted mt-0.5 leading-relaxed break-words">
                        {detail}
                      </p>
                    )}
                    {!detail && s === "pending" && (
                      <p className="text-boost-muted mt-0.5 italic">
                        Required but no detail captured yet.
                      </p>
                    )}
                    {!detail && s === "na" && (
                      <p className="text-boost-muted mt-0.5 italic">
                        Not needed for this engagement.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
