"use client";

import { useState } from "react";
import type { SpecialistAgent, FlowNode } from "@/data/agents";
import BoostIcon from "@/components/BoostIcon";
import FlowNodeCard from "./FlowNodeCard";
import FlowConnector from "./FlowConnector";

interface FlowDiagramProps {
  agent: SpecialistAgent;
}

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
      {/* Vertical dashed stub */}
      <div className="flex justify-center h-6" aria-hidden="true">
        <div className="w-0 border-l-[1.5px] border-dashed" style={{ borderColor: "#b2dfdb" }} />
      </div>
      {/* Count badge */}
      <div className="flex justify-center -mt-0.5 mb-0.5" aria-hidden="true">
        <span className="w-5 h-5 rounded-full bg-white border text-[10px] font-semibold text-boost-muted flex items-center justify-center"
          style={{ borderColor: "#b2dfdb" }}
        >{nodes.length}</span>
      </div>
      <div className="flex justify-center h-3" aria-hidden="true">
        <div className="w-0 border-l-[1.5px] border-dashed" style={{ borderColor: "#b2dfdb" }} />
      </div>

      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between gap-2 px-3 py-2 rounded-t-lg bg-boost-purple/90 text-white"
      >
        <div className="flex items-center gap-2 min-w-0">
          <BoostIcon name={icon} variant="white" size={14} />
          <span className="text-xs font-semibold truncate">{label}</span>
        </div>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          className={`flex-shrink-0 transition-transform ${collapsed ? "" : "rotate-180"}`}
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
                className="w-full max-w-none cursor-pointer transition-shadow hover:shadow-md"
              />
            </button>
          ))}
        </div>
      )}
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
          <span className="text-[10px] text-boost-muted uppercase">{node.type}</span>
        </div>
      </div>
      <p className="text-xs text-boost-muted leading-relaxed">{node.description}</p>
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
    <div className="border-t border-boost-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-boost-purple/90 text-white relative z-10"
      >
        <div className="flex items-center gap-2">
          <BoostIcon name={icon} variant="white" size={14} />
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
    <div className="bg-white rounded-lg border border-boost-green-light/25 border-t-[3px] border-t-boost-green-light shadow-sm overflow-hidden max-w-[340px] w-full">
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
export default function FlowDiagram({ agent }: FlowDiagramProps) {
  const { flow } = agent;
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);

  // If a node is selected, show its detail view
  if (selectedNode) {
    return <NodeDetail node={selectedNode} onBack={() => setSelectedNode(null)} />;
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
    <div className="pb-2">
      {/* Agentic node with Knowledge + API Hook sections inside */}
      <div className="flex justify-center">
        <AgenticCard
          agent={agent}
          knowledgeDocs={knowledgeDocs}
          apiHooks={apiHooks}
          onSelectNode={setSelectedNode}
        />
      </div>

      {/* Vertical line down */}
      <div className="flex justify-center h-6" aria-hidden="true">
        <div className="w-0 border-l-[1.5px] border-dashed" style={{ borderColor: "#b2dfdb" }} />
      </div>

      {/* Horizontal dashed bar */}
      <div className="mx-2" aria-hidden="true">
        <div className="border-t-[1.5px] border-dashed" style={{ borderColor: "#b2dfdb" }} />
      </div>

      {/* Category columns grid */}
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${Math.min(categories.length, 5)}, minmax(0, 1fr))`,
        }}
      >
        {categories.map((cat) => (
          <CategoryColumn
            key={cat.key}
            label={cat.label}
            icon={cat.icon}
            nodes={cat.nodes}
            category={cat.key}
            onSelect={setSelectedNode}
          />
        ))}
      </div>
    </div>
  );
}
