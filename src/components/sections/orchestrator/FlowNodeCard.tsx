"use client";

import BoostIcon from "@/components/BoostIcon";
import { Badge } from "@/components/ui";
import type { FlowNode } from "@/data/agents";

interface FlowNodeCardProps {
  node: FlowNode;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function FlowNodeCard({ node, isSelected, onClick }: FlowNodeCardProps) {
  return (
    <button
      onClick={onClick}
      aria-expanded={isSelected}
      className={`
        flex items-start gap-3 p-3 rounded-lg text-left transition-all min-w-[180px] max-w-[220px] flex-shrink-0
        ${isSelected
          ? "bg-boost-green-light/15 border-2 border-boost-green-light shadow-sm"
          : "bg-boost-green-light/5 border border-boost-green-light/20 hover:bg-boost-green-light/10 hover:border-boost-green-light/40"
        }
      `}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-boost-green-light/15 flex items-center justify-center">
        <BoostIcon name={node.icon} variant="purple" size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-xs font-semibold text-boost-dark block leading-tight truncate">
          {node.name}
        </span>
        <Badge variant="muted" size="sm">
          {node.type}
        </Badge>
      </div>
    </button>
  );
}
