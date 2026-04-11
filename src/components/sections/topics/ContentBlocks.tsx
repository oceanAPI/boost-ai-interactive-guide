"use client";

import { useState } from "react";
import type {
  TopicContentBlock,
  StatsBlockData,
  ListBlockData,
  TableBlockData,
  CalloutBlockData,
  StepsBlockData,
  TextBlockData,
} from "@/data/topics/_types";
import { StatCounter } from "@/components/ui";

/* ─── Block heading ─── */
function BlockHeading({ children }: { children: string }) {
  return (
    <h4 className="text-xs font-bold text-boost-muted uppercase tracking-wider mb-3">
      {children}
    </h4>
  );
}

/* ─── Text block ─── */
function TextBlock({ block }: { block: TextBlockData }) {
  return (
    <div>
      {block.heading && <BlockHeading>{block.heading}</BlockHeading>}
      <p className="text-sm text-boost-text-secondary leading-relaxed">{block.body}</p>
    </div>
  );
}

/* ─── Stats block ─── */
function StatsBlock({ block }: { block: StatsBlockData }) {
  return (
    <div>
      {block.heading && <BlockHeading>{block.heading}</BlockHeading>}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {block.items.map((item) => (
          <div key={item.label} className="bg-boost-surface rounded-lg p-4 border border-boost-border">
            <StatCounter
              value={item.value}
              suffix={item.suffix}
              prefix={item.prefix}
              label={item.label}
              color="green"
              size="sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── List block ─── */
function ListBlock({ block }: { block: ListBlockData }) {
  const variant = block.variant || "bullet";
  return (
    <div>
      {block.heading && <BlockHeading>{block.heading}</BlockHeading>}
      <ul className="space-y-2">
        {block.items.map((item, i) => (
          <li key={item.title} className="flex gap-3">
            <span className="flex-shrink-0 mt-0.5">
              {variant === "check" && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-boost-green">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {variant === "bullet" && (
                <span className="block w-1.5 h-1.5 rounded-full bg-boost-green mt-1.5" />
              )}
              {variant === "numbered" && (
                <span className="text-xs font-bold text-boost-green w-5 h-5 rounded-full bg-boost-green/10 flex items-center justify-center">
                  {i + 1}
                </span>
              )}
            </span>
            <div className="min-w-0">
              <span className="text-sm font-semibold text-boost-dark">{item.title}</span>
              {item.description && (
                <p className="text-xs text-boost-muted mt-0.5">{item.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Table block ─── */
function TableBlock({ block }: { block: TableBlockData }) {
  return (
    <div>
      {block.heading && <BlockHeading>{block.heading}</BlockHeading>}
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {block.columns.map((col) => (
                <th
                  key={col}
                  className="text-left text-[11px] font-bold text-boost-muted uppercase tracking-wider px-3 py-2 border-b border-boost-border"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => {
              const isHighlighted = block.highlightColumn && Object.values(row)[0] === block.highlightColumn;
              return (
                <tr key={i} className={isHighlighted ? "bg-boost-green/5" : i % 2 === 0 ? "bg-white" : "bg-boost-surface/50"}>
                  {block.columns.map((col) => (
                    <td
                      key={col}
                      className={`px-3 py-2.5 border-b border-boost-border/50 ${
                        isHighlighted ? "font-semibold text-boost-green" : "text-boost-dark"
                      }`}
                    >
                      {row[col] || "\u2014"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Mobile card stack */}
      <div className="sm:hidden space-y-2">
        {block.rows.map((row, i) => (
          <div key={i} className="bg-boost-surface rounded-lg p-3 border border-boost-border">
            {block.columns.map((col) => (
              <div key={col} className="flex justify-between py-1">
                <span className="text-[11px] text-boost-muted">{col}</span>
                <span className="text-xs font-medium text-boost-dark">{row[col] || "\u2014"}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Callout block ─── */
function CalloutBlock({ block }: { block: CalloutBlockData }) {
  const variant = block.variant || "neutral";
  const styles = {
    green: "bg-boost-green/5 border-boost-green/20 text-boost-dark",
    purple: "bg-boost-purple/5 border-boost-purple/20 text-boost-dark",
    neutral: "bg-boost-surface border-boost-border text-boost-dark",
  };
  return (
    <div className={`rounded-lg border p-4 ${styles[variant]}`}>
      {block.heading && (
        <p className="text-sm font-bold mb-1">{block.heading}</p>
      )}
      <p className="text-sm leading-relaxed">{block.body}</p>
    </div>
  );
}

/* ─── Steps block ─── */
function StepsBlock({ block }: { block: StepsBlockData }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div>
      {block.heading && <BlockHeading>{block.heading}</BlockHeading>}
      <div className="space-y-0">
        {block.items.map((step, i) => (
          <div key={step.title} className="relative pl-8">
            {i < block.items.length - 1 && (
              <div className="absolute left-[11px] top-6 bottom-0 w-px bg-boost-border" />
            )}
            <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-boost-green text-white text-[10px] font-bold flex items-center justify-center">
              {i + 1}
            </div>
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full text-left pb-4"
            >
              <p className="text-sm font-semibold text-boost-dark">{step.title}</p>
              <p className="text-xs text-boost-muted mt-0.5">{step.description}</p>
              {step.detail && expanded === i && (
                <p className="text-xs text-boost-text-secondary mt-2 leading-relaxed bg-boost-surface rounded-lg p-3 border border-boost-border">
                  {step.detail}
                </p>
              )}
              {step.detail && (
                <span className="text-[10px] text-boost-green mt-1 inline-block">
                  {expanded === i ? "Show less" : "Show more"}
                </span>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Block renderer (shared) ─── */
export default function ContentBlockRenderer({ block }: { block: TopicContentBlock }) {
  switch (block.type) {
    case "text": return <TextBlock block={block} />;
    case "stats": return <StatsBlock block={block} />;
    case "list": return <ListBlock block={block} />;
    case "table": return <TableBlock block={block} />;
    case "callout": return <CalloutBlock block={block} />;
    case "steps": return <StepsBlock block={block} />;
    default: return null;
  }
}
