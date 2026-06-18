"use client";

import type { ReactNode } from "react";
import { AdminMiniLabel } from "@/components/admin/primitives";

/* ─── CE authoring field primitives ─────────────────────────────
 *  Shared controlled inputs for the nine CS input panels. Every
 *  panel is a controlled editor over a slice of the Customer record;
 *  these primitives keep the markup consistent (boost tokens, focus
 *  ring, label rhythm) and the panels lean.
 *
 *  All inputs are uncontrolled-feeling but fully controlled: value in,
 *  onChange out. Empty string → undefined is handled by callers so the
 *  JSONB payload stays clean (no empty-string noise). */

const inputBase =
  "w-full px-3 py-2 bg-white border border-boost-border rounded-lg text-[13px] text-boost-dark placeholder-boost-lavender focus:outline-none focus:ring-2 focus:ring-boost-green-light focus:border-transparent transition-shadow";

export function TextField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "date" | "email" | "url";
}) {
  const { label, value, onChange, placeholder, type = "text" } = props;
  return (
    <label className="block">
      <AdminMiniLabel className="mb-1">{label}</AdminMiniLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputBase}
      />
    </label>
  );
}

export function NumberField(props: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  const { label, value, onChange, placeholder, min, max, step } = props;
  return (
    <label className="block">
      <AdminMiniLabel className="mb-1">{label}</AdminMiniLabel>
      <input
        type="number"
        value={value ?? ""}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? undefined : Number(v));
        }}
        placeholder={placeholder}
        className={inputBase}
      />
    </label>
  );
}

export function TextAreaField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const { label, value, onChange, placeholder, rows = 3 } = props;
  return (
    <label className="block">
      <AdminMiniLabel className="mb-1">{label}</AdminMiniLabel>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputBase} resize-y leading-relaxed`}
      />
    </label>
  );
}

export function SelectField<T extends string>(props: {
  label: string;
  value: T | undefined;
  onChange: (v: T | undefined) => void;
  options: readonly { value: T; label: string }[];
  placeholder?: string;
}) {
  const { label, value, onChange, options, placeholder = "—" } = props;
  return (
    <label className="block">
      <AdminMiniLabel className="mb-1">{label}</AdminMiniLabel>
      <select
        value={value ?? ""}
        onChange={(e) => onChange((e.target.value || undefined) as T | undefined)}
        className={`${inputBase} cursor-pointer`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Multi-line text ⇄ string[] helper. Each non-empty line is one item. */
export function LinesField(props: {
  label: string;
  value: string[] | undefined;
  onChange: (v: string[]) => void;
  placeholder?: string;
  rows?: number;
}) {
  const { label, value, onChange, placeholder, rows = 3 } = props;
  return (
    <TextAreaField
      label={label}
      value={(value ?? []).join("\n")}
      onChange={(t) =>
        onChange(
          t
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
        )
      }
      placeholder={placeholder}
      rows={rows}
    />
  );
}

/* ─── ListEditor ─────────────────────────────────────────────────
 *  Generic add/remove list of records. Renders each row via a
 *  caller-supplied render-prop that receives the item + an update
 *  callback; appends a fresh item from `makeNew()`; removes by index.
 *  Used by the agenda, recommendations, success-plan, agentic,
 *  uat-status, agent-swot, and benchmark panels. */
export function ListEditor<T>(props: {
  items: T[];
  onChange: (next: T[]) => void;
  makeNew: () => T;
  addLabel: string;
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  itemTitle?: (item: T, index: number) => string;
  emptyHint?: string;
}) {
  const { items, onChange, makeNew, addLabel, renderItem, itemTitle, emptyHint } = props;

  const update = (index: number, patch: Partial<T>) => {
    onChange(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {items.length === 0 && emptyHint ? (
        <p className="text-[12px] text-boost-muted/80 italic">{emptyHint}</p>
      ) : null}
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-xl border border-boost-border bg-boost-surface/30 p-3.5 space-y-2.5 animate-modal-in"
        >
          <div className="flex items-center justify-between gap-2">
            <AdminMiniLabel>{itemTitle ? itemTitle(item, i) : `Item ${i + 1}`}</AdminMiniLabel>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-[10px] font-semibold uppercase tracking-[0.12em] text-boost-muted hover:text-boost-gold transition-colors"
            >
              Remove
            </button>
          </div>
          {renderItem(item, (patch) => update(i, patch), i)}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, makeNew()])}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-boost-border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-boost-muted hover:text-boost-purple hover:border-boost-purple/40 transition-colors"
      >
        <span aria-hidden="true">+</span> {addLabel}
      </button>
    </div>
  );
}

/** Two-column grid for paired fields. */
export function FieldGrid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return (
    <div className={`grid gap-2.5 ${cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
      {children}
    </div>
  );
}

/** Standard RAG status select options. */
export const RAG_OPTIONS = [
  { value: "green" as const, label: "Green" },
  { value: "amber" as const, label: "Amber" },
  { value: "red" as const, label: "Red" },
];
