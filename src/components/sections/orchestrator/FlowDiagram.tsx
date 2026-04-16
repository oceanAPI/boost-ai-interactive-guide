"use client";

import { useState } from "react";
import type { SpecialistAgent, FlowNode } from "@/data/agents";
import BoostIcon from "@/components/BoostIcon";
import FlowNodeCard from "./FlowNodeCard";
import FlowConnector from "./FlowConnector";

interface FlowDiagramProps {
  agent: SpecialistAgent;
  onDrillChange?: (isDrilledIn: boolean) => void;
}

// Orchestrator-matching connector color
const FD_CONNECTOR_COLOR = "rgba(89,25,93,0.18)";

/* ─── Category column (same style as topic group in orchestrator) ─── */
function CategoryColumn({
  label,
  icon,
  nodes,
  category,
  onSelect,
}: {
  label: string;
  icon: string;
  nodes: FlowNode[];
  category: "guardrail" | "actionHook" | "process" | "standardResponse" | "knowledge";
  onSelect: (node: FlowNode) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  if (nodes.length === 0) return null;

  return (
    <div className="flex flex-col min-w-0">
      {/* Vertical connector stub */}
      <div className="flex justify-center h-6" aria-hidden="true">
        <div className="w-px" style={{ backgroundColor: FD_CONNECTOR_COLOR }} />
      </div>
      {/* Count badge — matches orchestrator */}
      <div className="flex justify-center mb-1" aria-hidden="true">
        <span className="w-5 h-5 rounded-full bg-white text-[10px] font-bold text-boost-purple flex items-center justify-center shadow-sm border border-boost-purple/20">
          {nodes.length}
        </span>
      </div>
      <div className="flex justify-center h-3" aria-hidden="true">
        <div className="w-px" style={{ backgroundColor: FD_CONNECTOR_COLOR }} />
      </div>

      {/* Header — matches orchestrator group header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between gap-2 px-3 py-2 rounded-t-xl text-white"
        style={{ background: "rgba(89,25,93,0.6)" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <BoostIcon name={icon} variant="white" size={14} />
          <span className="text-[11px] font-semibold truncate">{label}</span>
        </div>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          className={`flex-shrink-0 text-white/60 transition-transform ${collapsed ? "" : "rotate-180"}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Node cards */}
      {!collapsed && (
        <div className="space-y-2 pt-2">
          {nodes.map((node) => (
            <button key={node.id} onClick={() => onSelect(node)} className="w-full text-left">
              <FlowNodeCard
                node={node}
                category={category === "knowledge" ? "knowledge" : category}
                className="w-full max-w-none cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Custom Card Preview (mini chat) ─── */
function CustomCardPreview({ card }: { card: NonNullable<FlowNode["customCardJson"]> }) {
  return (
    <div className="mt-4 rounded-xl border border-boost-border bg-gradient-to-b from-boost-surface/50 to-white overflow-hidden">
      {/* Chat header */}
      <div className="bg-boost-purple px-3 py-2 flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </div>
        <span className="text-[10px] text-white font-semibold">boost.ai</span>
      </div>

      <div className="p-3 space-y-2.5">
        {/* User message */}
        <div className="flex justify-end">
          <div className="bg-boost-purple/10 rounded-xl rounded-tr-sm px-3 py-1.5 max-w-[75%]">
            <p className="text-[10px] text-boost-dark">Show me my account overview</p>
          </div>
        </div>

        {/* Bot response + card */}
        <div className="flex justify-start">
          <div className="max-w-[90%] space-y-1.5">
            <div className="bg-boost-surface rounded-xl rounded-tl-sm px-3 py-1.5">
              <p className="text-[10px] text-boost-dark">Here&apos;s your account overview:</p>
            </div>

            {/* Rendered custom card */}
            <div className="rounded-xl border border-boost-green/30 bg-white shadow-sm overflow-hidden">
              <div className="bg-boost-green/10 px-3 py-2 border-b border-boost-green/15">
                <p className="text-xs font-bold text-boost-dark">{card.title}</p>
                {card.subtitle && <p className="text-[10px] text-boost-muted">{card.subtitle}</p>}
              </div>
              {card.fields && card.fields.length > 0 && (
                <div className="px-3 py-2 space-y-1.5">
                  {card.fields.map((f) => (
                    <div key={f.label} className="flex items-center justify-between">
                      <span className="text-[10px] text-boost-muted">{f.label}</span>
                      <span className="text-[10px] font-semibold text-boost-dark">{f.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {card.actions && card.actions.length > 0 && (
                <div className="px-3 py-2 border-t border-boost-border flex gap-1.5">
                  {card.actions.map((a) => (
                    <div
                      key={a.label}
                      className={`flex-1 text-center py-1.5 rounded-md text-[9px] font-semibold ${
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
        </div>
      </div>

      {/* JSON preview */}
      <details className="group px-3 pb-3">
        <summary className="text-[10px] text-boost-muted cursor-pointer hover:text-boost-dark transition-colors flex items-center gap-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-open:rotate-90"><polyline points="9 18 15 12 9 6" /></svg>
          View JSON
        </summary>
        <div className="mt-1.5 rounded-md border border-boost-border bg-[#1e1e2e] overflow-hidden">
          <pre className="px-3 py-2 text-[10px] font-mono leading-relaxed text-[#cdd6f4] overflow-x-auto">
            {JSON.stringify(card, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
}

/* ─── Node detail panel ─── */
function NodeDetail({ node, onBack }: { node: FlowNode; onBack: () => void }) {
  return (
    <div className="bg-boost-surface rounded-xl border border-boost-border p-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-boost-muted hover:text-boost-dark mb-3 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>
      <div className="flex items-start gap-3 mb-3">
        <BoostIcon name={node.icon} variant="purple" size={20} />
        <div>
          <h4 className="text-sm font-bold text-boost-dark">{node.name}</h4>
          <span className="text-[10px] text-boost-muted uppercase">{node.type.replace(/_/g, " ")}</span>
        </div>
      </div>
      <p className="text-xs text-boost-muted leading-relaxed">{node.description}</p>

      {/* Custom card preview for action hooks with content type */}
      {node.customCardJson && <CustomCardPreview card={node.customCardJson} />}

      {node.elevioUrl && (
        <a
          href={node.elevioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-boost-green hover:underline"
        >
          Read more
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      )}
    </div>
  );
}

/* ─── Inline collapsible section inside the agentic card ─── */
function InlineSection({
  label,
  icon,
  nodes,
  onSelect,
  defaultOpen,
}: {
  label: string;
  icon: string;
  nodes: FlowNode[];
  onSelect: (node: FlowNode) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  if (nodes.length === 0) return null;

  return (
    <div className="border-t border-boost-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-white relative z-10"
        style={{ background: "rgba(89,25,93,0.6)" }}
      >
        <div className="flex items-center gap-2">
          {icon === "computer-api" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="flex-shrink-0" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="flex-shrink-0" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          )}
          <span className="text-[10px] font-semibold">{label}</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">{nodes.length}</span>
        </div>
        <svg
          width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="px-3 py-2 space-y-1.5 bg-boost-surface/50">
          {nodes.map((node) => (
            <button
              key={node.id}
              onClick={() => onSelect(node)}
              className="w-full flex items-center gap-2 text-left hover:bg-white rounded p-1 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 384 512" fill="#7a6b80" className="flex-shrink-0">
                <path d="M192 32L64 32C46.3 32 32 46.3 32 64l0 384c0 17.7 14.3 32 32 32l256 0c17.7 0 32-14.3 32-32l0-256-96 0c-35.3 0-64-28.7-64-64l0-96zM338.7 160L224 45.3V128c0 17.7 14.3 32 32 32h82.7zM0 64C0 28.7 28.7 0 64 0L197.5 0c17 0 33.3 6.7 45.3 18.7L365.3 141.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64z"/>
              </svg>
              <span className="text-[11px] text-boost-dark truncate">{node.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── AGENTIC card with Knowledge + API Hook inside ─── */
function AgenticCard({
  agent,
  knowledgeDocs,
  apiHooks,
  onSelectNode,
}: {
  agent: SpecialistAgent;
  knowledgeDocs: FlowNode[];
  apiHooks: FlowNode[];
  onSelectNode: (node: FlowNode) => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-boost-green-light/25 border-t-[3px] border-t-boost-green-light shadow-sm overflow-hidden w-full sm:max-w-[340px]">
      {/* Header */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-boost-green-light/8">
        <BoostIcon name="robot-brain" variant="purple" size={14} />
        <span className="text-[10px] font-bold tracking-wider uppercase text-boost-green">AGENTIC</span>
      </div>
      {/* Body */}
      <div className="px-3 py-2.5">
        <p className="text-sm font-bold text-boost-dark leading-snug">{agent.name}</p>
        <p className="text-[11px] text-boost-muted mt-1 leading-snug line-clamp-3">{agent.description}</p>
      </div>
      {/* Knowledge section */}
      <InlineSection
        label="Knowledge"
        icon="books"
        nodes={knowledgeDocs}
        onSelect={onSelectNode}
      />
      {/* API Hook section */}
      <InlineSection
        label="API Hook"
        icon="computer-api"
        nodes={apiHooks}
        onSelect={onSelectNode}
      />
    </div>
  );
}

/* ─── Main Flow Diagram ─── */
export default function FlowDiagram({ agent, onDrillChange }: FlowDiagramProps) {
  const { flow } = agent;
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);

  const selectNode = (node: FlowNode | null) => {
    setSelectedNode(node);
    onDrillChange?.(node !== null);
  };

  // If a node is selected, show its detail view
  if (selectedNode) {
    return <NodeDetail node={selectedNode} onBack={() => selectNode(null)} />;
  }

  // Separate knowledge/API from the flow columns — they go inside the agentic card
  const knowledgeDocs = flow.knowledgeSources.filter(n => n.type !== "api");
  const apiHooks = flow.knowledgeSources.filter(n => n.type === "api");

  // Build category columns (without knowledge — it's inside the agentic card now)
  const categories = [
    { key: "guardrail" as const, label: "Guardrails", icon: "shield-medal", nodes: flow.guardrails },
    { key: "actionHook" as const, label: "Action Hooks", icon: "target-selection", nodes: flow.actionHooks },
    { key: "process" as const, label: "Processes", icon: "cogs", nodes: flow.processes },
    { key: "standardResponse" as const, label: "Responses", icon: "route", nodes: flow.standardResponses },
  ].filter(c => c.nodes.length > 0);

  return (
    <div
      className="rounded-2xl px-3 sm:px-5 py-6 -mx-1 sm:-mx-2"
      style={{
        background:
          "radial-gradient(ellipse at 20% 0%, rgba(89,25,93,0.08), transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(54,181,149,0.06), transparent 55%), linear-gradient(135deg, #f4eef5 0%, #eef5f2 100%)",
      }}
    >
      {/* Agentic node with Knowledge + API Hook sections inside */}
      <div className="flex justify-center">
        <AgenticCard
          agent={agent}
          knowledgeDocs={knowledgeDocs}
          apiHooks={apiHooks}
          onSelectNode={selectNode}
        />
      </div>

      {/* Vertical solid line down — matches orchestrator */}
      <div className="flex justify-center h-8" aria-hidden="true">
        <div className="w-px" style={{ backgroundColor: FD_CONNECTOR_COLOR }} />
      </div>

      {/* Horizontal solid bar — matches orchestrator */}
      <div className="mx-2" aria-hidden="true">
        <div className="h-px" style={{ backgroundColor: FD_CONNECTOR_COLOR }} />
      </div>

      {/* Category columns grid — 2 cols on mobile, auto on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
        {categories.map((cat) => (
          <CategoryColumn
            key={cat.key}
            label={cat.label}
            icon={cat.icon}
            nodes={cat.nodes}
            category={cat.key}
            onSelect={selectNode}
          />
        ))}
      </div>
    </div>
  );
}
