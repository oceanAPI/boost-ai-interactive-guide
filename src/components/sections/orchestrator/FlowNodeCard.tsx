"use client";

import BoostIcon from "@/components/BoostIcon";
import type { FlowNode } from "@/data/agents";

export type NodeCategory =
  | "agentic"
  | "knowledge"
  | "guardrail"
  | "actionHook"
  | "process"
  | "standardResponse";

const CATEGORY_CONFIG: Record<
  NodeCategory,
  { label: string; icon: string; borderColor: string; headerBg: string; headerText: string }
> = {
  agentic: {
    label: "AGENTIC",
    icon: "robot-brain",
    borderColor: "border-t-boost-green-light",
    headerBg: "bg-boost-green-light/8",
    headerText: "text-boost-green",
  },
  knowledge: {
    label: "KNOWLEDGE",
    icon: "books",
    borderColor: "border-t-boost-green-light",
    headerBg: "bg-boost-green-light/8",
    headerText: "text-boost-green",
  },
  guardrail: {
    label: "GUARDRAIL",
    icon: "shield-medal",
    borderColor: "border-t-boost-green-light",
    headerBg: "bg-boost-green-light/8",
    headerText: "text-boost-green",
  },
  actionHook: {
    label: "ACTION HOOK",
    icon: "target-selection",
    borderColor: "border-t-boost-green-light",
    headerBg: "bg-boost-green-light/8",
    headerText: "text-boost-green",
  },
  process: {
    label: "PROCESS",
    icon: "cogs",
    borderColor: "border-t-boost-green-light",
    headerBg: "bg-boost-green-light/8",
    headerText: "text-boost-green",
  },
  standardResponse: {
    label: "STANDARD RESPONSE",
    icon: "route",
    borderColor: "border-t-boost-green-light",
    headerBg: "bg-boost-green-light/8",
    headerText: "text-boost-green",
  },
};

interface FlowNodeCardProps {
  node?: FlowNode;
  category: NodeCategory;
  /** Override the name (e.g. for the top-level agentic node) */
  name?: string;
  description?: string;
  /** Sub-items to show (e.g. knowledge documents) */
  subItems?: { icon: string; label: string }[];
  /** Max sub-items before "+N more" */
  maxSubItems?: number;
  className?: string;
}

export default function FlowNodeCard({
  node,
  category,
  name,
  description,
  subItems,
  maxSubItems = 3,
  className = "",
}: FlowNodeCardProps) {
  const config = CATEGORY_CONFIG[category];
  const displayName = name || node?.name || "";
  const displayDesc = description || node?.description || "";
  const visibleItems = subItems?.slice(0, maxSubItems) || [];
  const overflowCount = (subItems?.length || 0) - maxSubItems;

  return (
    <div
      className={`
        bg-white rounded-lg border border-boost-green-light/25 border-t-[3px] ${config.borderColor}
        shadow-sm min-w-[200px] max-w-[260px] overflow-hidden
        ${className}
      `}
    >
      {/* Header */}
      <div className={`flex items-center gap-1.5 px-3 py-1.5 ${config.headerBg}`}>
        <BoostIcon name={config.icon} variant="purple" size={14} />
        <span className={`text-[10px] font-bold tracking-wider uppercase ${config.headerText}`}>
          {config.label}
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-2.5">
        <p className="text-sm font-bold text-boost-dark leading-snug">{displayName}</p>
        {displayDesc && (
          <p className="text-[11px] text-boost-muted mt-1 leading-snug line-clamp-3">
            {displayDesc}
          </p>
        )}
      </div>

      {/* Sub-items (knowledge documents, etc.) */}
      {visibleItems.length > 0 && (
        <div className="border-t border-boost-border px-3 py-2 space-y-1.5">
          {visibleItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 384 512" fill="#7a6b80" className="flex-shrink-0">
                <path d="M192 32L64 32C46.3 32 32 46.3 32 64l0 384c0 17.7 14.3 32 32 32l256 0c17.7 0 32-14.3 32-32l0-256-96 0c-35.3 0-64-28.7-64-64l0-96zM338.7 160L224 45.3V128c0 17.7 14.3 32 32 32h82.7zM0 64C0 28.7 28.7 0 64 0L197.5 0c17 0 33.3 6.7 45.3 18.7L365.3 141.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64z"/>
              </svg>
              <span className="text-[11px] text-boost-dark truncate">{item.label}</span>
            </div>
          ))}
          {overflowCount > 0 && (
            <p className="text-[11px] text-boost-muted">+ {overflowCount} more</p>
          )}
        </div>
      )}
    </div>
  );
}
