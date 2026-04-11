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
  { label: string; icon: string; borderColor: string; headerBg: string; headerText: string; borderClass: string }
> = {
  agentic: {
    label: "AGENTIC",
    icon: "robot-brain",
    borderColor: "border-t-boost-green-light",
    borderClass: "border-boost-green-light/25",
    headerBg: "bg-boost-green-light/8",
    headerText: "text-boost-green",
  },
  knowledge: {
    label: "KNOWLEDGE",
    icon: "books",
    borderColor: "border-t-boost-green-light",
    borderClass: "border-boost-green-light/25",
    headerBg: "bg-boost-green-light/8",
    headerText: "text-boost-green",
  },
  guardrail: {
    label: "GUARDRAIL",
    icon: "shield-medal",
    borderColor: "border-t-boost-guardrail",
    borderClass: "border-boost-guardrail/20",
    headerBg: "bg-boost-guardrail/6",
    headerText: "text-boost-guardrail",
  },
  actionHook: {
    label: "ACTION HOOK",
    icon: "target-selection",
    borderColor: "border-t-boost-action-hook",
    borderClass: "border-boost-action-hook/20",
    headerBg: "bg-boost-action-hook/6",
    headerText: "text-boost-action-hook",
  },
  process: {
    label: "PROCESS",
    icon: "cogs",
    borderColor: "border-t-boost-process",
    borderClass: "border-boost-process/20",
    headerBg: "bg-boost-process/6",
    headerText: "text-boost-process",
  },
  standardResponse: {
    label: "STANDARD RESPONSE",
    icon: "route",
    borderColor: "border-t-boost-response",
    borderClass: "border-boost-response/20",
    headerBg: "bg-boost-response/6",
    headerText: "text-boost-response",
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
        bg-white rounded-lg border ${config.borderClass} border-t-[3px] ${config.borderColor}
        shadow-sm overflow-hidden
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
        <p className="text-sm font-medium text-boost-text-secondary leading-snug">{displayName}</p>
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

      {/* Mini custom card preview for action hooks with content cards */}
      {node?.customCardJson && (
        <div className="border-t border-boost-green/20 bg-boost-green/[0.03] px-2.5 py-2">
          <div className="rounded-lg border border-boost-green/25 bg-white overflow-hidden shadow-xs">
            <div className="bg-boost-green/10 px-2 py-1 border-b border-boost-green/10">
              <p className="text-[9px] font-bold text-boost-dark truncate">{node.customCardJson.title}</p>
              {node.customCardJson.subtitle && (
                <p className="text-[8px] text-boost-muted truncate">{node.customCardJson.subtitle}</p>
              )}
            </div>
            {node.customCardJson.fields && node.customCardJson.fields.length > 0 && (
              <div className="px-2 py-1 space-y-0.5">
                {node.customCardJson.fields.slice(0, 2).map((f) => (
                  <div key={f.label} className="flex items-center justify-between">
                    <span className="text-[8px] text-boost-muted">{f.label}</span>
                    <span className="text-[8px] font-semibold text-boost-dark">{f.value}</span>
                  </div>
                ))}
                {node.customCardJson.fields.length > 2 && (
                  <p className="text-[7px] text-boost-muted">+{node.customCardJson.fields.length - 2} more</p>
                )}
              </div>
            )}
            {node.customCardJson.actions && node.customCardJson.actions.length > 0 && (
              <div className="px-2 py-1 border-t border-boost-border/50 flex gap-1">
                {node.customCardJson.actions.map((a) => (
                  <div
                    key={a.label}
                    className={`flex-1 text-center py-0.5 rounded text-[7px] font-semibold ${
                      a.type === "primary"
                        ? "bg-boost-green text-white"
                        : "border border-boost-border text-boost-dark"
                    }`}
                  >
                    {a.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
