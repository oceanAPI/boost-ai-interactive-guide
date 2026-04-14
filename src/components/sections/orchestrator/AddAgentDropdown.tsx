"use client";

import { useRef, useEffect } from "react";
import type { SpecialistAgent } from "@/data/agents";

export default function AddAgentDropdown({
  agents,
  addedKeys,
  onSelect,
  onCreateNew,
  onClose,
}: {
  agents: SpecialistAgent[];
  addedKeys: Set<string>;
  onSelect: (agent: SpecialistAgent) => void;
  onCreateNew: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="animate-modal-in bg-white rounded-xl shadow-xl border border-boost-border w-64 max-h-72 overflow-y-auto"
    >
      <div className="px-3 py-2 border-b border-boost-border">
        <p className="text-[10px] font-semibold text-boost-muted uppercase tracking-wider">Add agent</p>
      </div>
      <div className="border-b border-boost-border py-1">
        <button
          onClick={onCreateNew}
          className="w-full text-left px-3 py-2 flex items-center gap-2 text-xs text-boost-purple hover:bg-boost-purple/5 transition-colors"
        >
          <span className="w-4 h-4 rounded-full bg-boost-purple/10 flex items-center justify-center flex-shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-boost-purple">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span className="font-semibold">Create new agent</span>
        </button>
      </div>
      <div className="py-1">
        {agents.map((agent) => {
          const alreadyAdded = addedKeys.has(agent.key);
          return (
            <button
              key={agent.key}
              onClick={() => { if (!alreadyAdded) onSelect(agent); }}
              disabled={alreadyAdded}
              className={`w-full text-left px-3 py-2 flex items-center gap-2 text-xs transition-colors ${
                alreadyAdded
                  ? "text-boost-muted/40 cursor-default"
                  : "text-boost-dark hover:bg-boost-surface"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-boost-green-light/20 flex items-center justify-center flex-shrink-0">
                {alreadyAdded ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-boost-green">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-boost-green" />
                )}
              </span>
              <span className="truncate">{agent.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
