"use client";

import type { FlowNode } from "@/data/agents";

export type NodeCategory =
  | "agentic"
  | "knowledge"
  | "guardrail"
  | "actionHook"
  | "process"
  | "standardResponse";

/* ─── Inline outline icon per category (matches platform style) ─── */
function CategoryIcon({ category, size = 12 }: { category: NodeCategory; size?: number }) {
  const props = {
    width: size,
    height: size,
    fill: "none" as const,
    stroke: "white" as const,
    strokeOpacity: 0.65,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };
  switch (category) {
    case "agentic":
      // Sparkle / generative
      return (
        <svg {...props}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M7 7l2 2M15 15l2 2M7 17l2-2M15 9l2-2" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "knowledge":
      // Book
      return (
        <svg {...props}>
          <path d="M4 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V4zM4 4a2 2 0 0 0-2 2v14" />
          <path d="M8 8h8M8 12h6" />
        </svg>
      );
    case "guardrail":
      // Shield check
      return (
        <svg {...props}>
          <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "actionHook":
      // Webhook link
      return (
        <svg {...props}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
    case "process":
      // Cogs / gear
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case "standardResponse":
      // Chat bubble
      return (
        <svg {...props}>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      );
  }
}

const CATEGORY_LABELS: Record<NodeCategory, string> = {
  agentic: "AGENTIC",
  knowledge: "KNOWLEDGE",
  guardrail: "GUARDRAIL",
  actionHook: "ACTION HOOK",
  process: "PROCESS",
  standardResponse: "STANDARD RESPONSE",
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
  const displayName = name || node?.name || "";
  const displayDesc = description || node?.description || "";
  const visibleItems = subItems?.slice(0, maxSubItems) || [];
  const overflowCount = (subItems?.length || 0) - maxSubItems;
  const isAgentic = category === "agentic";

  return (
    <div
      className={`rounded-xl overflow-hidden transition-all ${className}`}
      style={{
        background: "linear-gradient(145deg, rgba(75,30,82,0.98) 0%, rgba(55,22,62,1) 100%)",
      }}
    >
      {/* Header — category pill + agentic green dot */}
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-1.5">
        <CategoryIcon category={category} size={12} />
        <span className="text-[9px] font-bold tracking-[0.1em] uppercase text-white/55">
          {CATEGORY_LABELS[category]}
        </span>
        {isAgentic && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-boost-green-light" title="Active" />
        )}
      </div>

      {/* Body */}
      <div className="px-3 pb-3">
        <p className="text-[13px] font-semibold text-white leading-snug">{displayName}</p>
        {displayDesc && (
          <p className="text-[11px] text-white/50 mt-1 leading-relaxed line-clamp-3">
            {displayDesc}
          </p>
        )}
      </div>

      {/* Sub-items (knowledge documents, etc.) */}
      {visibleItems.length > 0 && (
        <div className="px-3 pb-2.5 pt-2 space-y-1.5" style={{ background: "rgba(0,0,0,0.18)" }}>
          {visibleItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <svg width="11" height="11" viewBox="0 0 384 512" fill="rgba(255,255,255,0.45)" className="flex-shrink-0">
                <path d="M192 32L64 32C46.3 32 32 46.3 32 64l0 384c0 17.7 14.3 32 32 32l256 0c17.7 0 32-14.3 32-32l0-256-96 0c-35.3 0-64-28.7-64-64l0-96zM338.7 160L224 45.3V128c0 17.7 14.3 32 32 32h82.7zM0 64C0 28.7 28.7 0 64 0L197.5 0c17 0 33.3 6.7 45.3 18.7L365.3 141.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64z" />
              </svg>
              <span className="text-[11px] text-white/80 truncate">{item.label}</span>
            </div>
          ))}
          {overflowCount > 0 && (
            <p className="text-[11px] text-white/45">+ {overflowCount} more</p>
          )}
        </div>
      )}

      {/* Mini custom card preview for action hooks with content cards */}
      {node?.customCardJson && (
        <div className="px-3 pb-3 pt-2" style={{ background: "rgba(0,0,0,0.15)" }}>
          <div className="rounded-lg bg-white/95 overflow-hidden shadow-sm">
            <div className="bg-boost-green/10 px-2 py-1.5 border-b border-boost-green/15">
              <p className="text-[9px] font-bold text-boost-dark truncate">{node.customCardJson.title}</p>
              {node.customCardJson.subtitle && (
                <p className="text-[8px] text-boost-muted truncate">{node.customCardJson.subtitle}</p>
              )}
            </div>
            {node.customCardJson.fields && node.customCardJson.fields.length > 0 && (
              <div className="px-2 py-1.5 space-y-0.5">
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
              <div className="px-2 py-1.5 border-t border-boost-border/50 flex gap-1">
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
