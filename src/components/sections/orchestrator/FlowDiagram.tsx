"use client";

import type { SpecialistAgent } from "@/data/agents";
import BoostIcon from "@/components/BoostIcon";
import { Badge } from "@/components/ui";
import FlowNodeCard from "./FlowNodeCard";
import FlowConnector from "./FlowConnector";

interface FlowDiagramProps {
  agent: SpecialistAgent;
}

const FLOW_ROW_CONFIG = [
  { key: "knowledgeSources" as const, label: "KNOWLEDGE", icon: "books", color: "text-boost-green" },
  { key: "guardrails" as const, label: "GUARDRAIL", icon: "shield-medal", color: "text-boost-orange" },
  { key: "actionHooks" as const, label: "ACTION HOOK", icon: "target-selection", color: "text-boost-purple" },
  { key: "processes" as const, label: "PROCESS", icon: "cogs", color: "text-boost-green" },
  { key: "standardResponses" as const, label: "STANDARD RESPONSE", icon: "route", color: "text-boost-muted" },
];

export default function FlowDiagram({ agent }: FlowDiagramProps) {
  return (
    <div className="py-4 space-y-0">
      {/* Agentic node at top */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-boost-green-light/10 border-2 border-boost-green-light/30">
          <div className="w-9 h-9 rounded-lg bg-boost-green-light/20 flex items-center justify-center">
            <BoostIcon name={agent.icon} variant="purple" size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="green" size="sm">AGENTIC</Badge>
            </div>
            <span className="text-sm font-bold text-boost-dark block mt-0.5">{agent.name}</span>
          </div>
        </div>
      </div>

      {/* Flow rows */}
      {FLOW_ROW_CONFIG.map((row) => {
        const nodes = agent.flow[row.key];
        if (!nodes || nodes.length === 0) return null;

        return (
          <div key={row.key}>
            <FlowConnector />

            {/* Row label */}
            <div className="flex items-center gap-2 mb-2 px-1">
              <BoostIcon name={row.icon} variant="purple" size={14} />
              <span className="text-[10px] font-bold tracking-wider text-boost-muted uppercase">
                {row.label}
              </span>
              <span className="text-[10px] text-boost-muted">({nodes.length})</span>
            </div>

            {/* Node cards row */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {nodes.map((node) => (
                <FlowNodeCard key={node.id} node={node} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
