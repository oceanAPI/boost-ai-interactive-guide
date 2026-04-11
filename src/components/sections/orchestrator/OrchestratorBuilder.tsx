"use client";

import { useState, useRef, useEffect } from "react";
import type { SpecialistAgent } from "@/data/agents";
import FlowNodeCard from "./FlowNodeCard";

/* ─── Types ─── */

interface BuilderGroup {
  id: string;
  label: string;
  agentKeys: string[];
}

interface OrchestratorBuilderProps {
  availableAgents: SpecialistAgent[];
  onSelectAgent: (agent: SpecialistAgent) => void;
  onSelectOrchestrator: () => void;
  onExit: () => void;
}

/* ─── Connector line helper ─── */
const DashedLine = ({ height = "h-8", horizontal = false }: { height?: string; horizontal?: boolean }) => (
  <div
    className={horizontal ? "flex-1" : `flex justify-center ${height}`}
    aria-hidden="true"
  >
    <div
      className={horizontal ? "border-t-[1.5px] border-dashed w-full" : "w-0 border-l-[1.5px] border-dashed h-full"}
      style={{ borderColor: "var(--color-boost-connector)" }}
    />
  </div>
);

/* ─── Add Group Popover ─── */
function AddGroupPopover({
  onAdd,
  onCancel,
}: {
  onAdd: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed) onAdd(trimmed);
  };

  return (
    <div className="animate-modal-in bg-white rounded-xl shadow-xl border border-boost-border p-4 w-72">
      <p className="text-xs font-semibold text-boost-dark mb-2">New agent group</p>
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Group name..."
        className="w-full text-sm px-3 py-2 rounded-lg border border-boost-border outline-none focus:border-boost-purple/50 text-boost-dark placeholder:text-boost-muted/50"
      />
      <div className="flex gap-2 mt-3">
        <button
          onClick={onCancel}
          className="flex-1 text-xs px-3 py-1.5 rounded-lg text-boost-muted hover:bg-boost-surface transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-boost-purple text-white font-semibold hover:bg-boost-purple/90 transition-colors disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}

/* ─── Add Agent Dropdown ─── */
function AddAgentDropdown({
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
      <div className="border-t border-boost-border py-1">
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
    </div>
  );
}

/* ─── Create New Agent Placeholder Modal ─── */
function CreateAgentModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-boost-border max-w-md w-full mx-4 p-8 animate-modal-in text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-boost-surface flex items-center justify-center transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="w-12 h-12 rounded-full bg-boost-purple/10 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-boost-purple">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-boost-dark mb-2">Create New Agent</h3>
        <p className="text-sm text-boost-muted leading-relaxed mb-6">
          Agent creation wizard coming soon. This will let you define a new specialist agent with knowledge sources, guardrails, and action hooks.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-lg bg-boost-purple text-white text-sm font-semibold hover:bg-boost-purple/90 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

/* ─── Builder Group Column ─── */
function BuilderGroupColumn({
  group,
  agents,
  allAddedKeys,
  availableAgents,
  onAddAgent,
  onRemoveGroup,
  onSelectAgent,
  onCreateNew,
}: {
  group: BuilderGroup;
  agents: SpecialistAgent[];
  allAddedKeys: Set<string>;
  availableAgents: SpecialistAgent[];
  onAddAgent: (groupId: string, agent: SpecialistAgent) => void;
  onRemoveGroup: (groupId: string) => void;
  onSelectAgent: (agent: SpecialistAgent) => void;
  onCreateNew: () => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="flex flex-col animate-modal-in">
      {/* Vertical stub */}
      <DashedLine height="h-8" />

      {/* Count badge */}
      <div className="flex justify-center -mt-1 mb-1" aria-hidden="true">
        <span
          className="w-5 h-5 rounded-full bg-white border text-[10px] font-semibold text-boost-muted flex items-center justify-center"
          style={{ borderColor: "var(--color-boost-connector)" }}
        >
          {agents.length}
        </span>
      </div>

      <DashedLine height="h-4" />

      {/* Group header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-t-lg bg-boost-purple/90 text-white">
        <span className="text-xs font-semibold truncate">{group.label}</span>
        <button
          onClick={() => onRemoveGroup(group.id)}
          className="flex-shrink-0 w-5 h-5 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          title="Remove group"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Agent cards */}
      <div className="space-y-2 pt-2">
        {agents.map((agent) => (
          <button key={agent.key} onClick={() => onSelectAgent(agent)} className="w-full text-left">
            <FlowNodeCard
              category="agentic"
              name={agent.name}
              className="w-full max-w-none cursor-pointer transition-shadow hover:shadow-md hover:border-boost-green-light/50"
            />
          </button>
        ))}
      </div>

      {/* Add agent button */}
      <div className="flex justify-center mt-3 relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-7 h-7 rounded-full bg-boost-purple/10 border-[1.5px] border-dashed border-boost-purple/40 flex items-center justify-center hover:bg-boost-purple/20 hover:border-boost-purple/60 transition-colors"
          title="Add agent"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-boost-purple">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        {showDropdown && (
          <div className="absolute top-full mt-2 z-30 left-1/2 -translate-x-1/2">
            <AddAgentDropdown
              agents={availableAgents}
              addedKeys={allAddedKeys}
              onSelect={(agent) => {
                onAddAgent(group.id, agent);
                setShowDropdown(false);
              }}
              onCreateNew={() => {
                setShowDropdown(false);
                onCreateNew();
              }}
              onClose={() => setShowDropdown(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Mobile Builder Group ─── */
function MobileBuilderGroup({
  group,
  agents,
  allAddedKeys,
  availableAgents,
  onAddAgent,
  onRemoveGroup,
  onSelectAgent,
  onCreateNew,
}: {
  group: BuilderGroup;
  agents: SpecialistAgent[];
  allAddedKeys: Set<string>;
  availableAgents: SpecialistAgent[];
  onAddAgent: (groupId: string, agent: SpecialistAgent) => void;
  onRemoveGroup: (groupId: string) => void;
  onSelectAgent: (agent: SpecialistAgent) => void;
  onCreateNew: () => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="border border-boost-border rounded-xl overflow-hidden animate-modal-in">
      <div className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-boost-purple/90 text-white">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{group.label}</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{agents.length}</span>
        </div>
        <button
          onClick={() => onRemoveGroup(group.id)}
          className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-3 space-y-2 bg-boost-surface">
        {agents.map((agent) => (
          <button key={agent.key} onClick={() => onSelectAgent(agent)} className="w-full text-left">
            <FlowNodeCard
              category="agentic"
              name={agent.name}
              className="w-full max-w-none cursor-pointer transition-shadow hover:shadow-md hover:border-boost-green-light/50"
            />
          </button>
        ))}

        {/* Add agent */}
        <div className="relative pt-1">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border-[1.5px] border-dashed border-boost-purple/30 text-boost-purple hover:bg-boost-purple/5 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="text-xs font-semibold">Add agent</span>
          </button>
          {showDropdown && (
            <div className="absolute bottom-full mb-2 z-30 left-0 right-0 flex justify-center">
              <AddAgentDropdown
                agents={availableAgents}
                addedKeys={allAddedKeys}
                onSelect={(agent) => {
                  onAddAgent(group.id, agent);
                  setShowDropdown(false);
                }}
                onCreateNew={() => {
                  setShowDropdown(false);
                  onCreateNew();
                }}
                onClose={() => setShowDropdown(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Builder ─── */

let nextGroupId = 1;

export default function OrchestratorBuilder({
  availableAgents,
  onSelectAgent,
  onSelectOrchestrator,
  onExit,
}: OrchestratorBuilderProps) {
  const [groups, setGroups] = useState<BuilderGroup[]>([]);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showCreateAgent, setShowCreateAgent] = useState(false);

  const addGroup = (label: string) => {
    setGroups((prev) => [...prev, { id: `bg-${nextGroupId++}`, label, agentKeys: [] }]);
    setShowAddGroup(false);
  };

  const removeGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const addAgentToGroup = (groupId: string, agent: SpecialistAgent) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, agentKeys: [...g.agentKeys, agent.key] } : g,
      ),
    );
  };

  // All agent keys currently in any group
  const allAddedKeys = new Set(groups.flatMap((g) => g.agentKeys));

  // Resolve agent keys to full agent objects
  const agentMap = new Map(availableAgents.map((a) => [a.key, a]));
  const resolveAgents = (keys: string[]) => keys.map((k) => agentMap.get(k)).filter(Boolean) as SpecialistAgent[];

  return (
    <div>
      {/* Back button — prominent pill so users can easily exit builder */}
      <button
        onClick={onExit}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-boost-green hover:bg-boost-green/90 px-3 py-1.5 rounded-full mb-6 transition-all shadow-sm"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to pre-built model
      </button>

      {/* Orchestrator card — clickable */}
      <div className="flex justify-center mb-0">
        <button
          onClick={onSelectOrchestrator}
          className="text-left cursor-pointer transition-shadow hover:shadow-lg rounded-lg"
        >
          <FlowNodeCard
            category="agentic"
            name="Agent Orchestrator"
            description="The main orchestrator handles all incoming requests and traffic to pass on to agents."
            className="min-w-[280px] max-w-[360px]"
          />
        </button>
      </div>

      {/* Vertical line */}
      <DashedLine height="h-8" />

      {/* Add group button (always visible) */}
      {groups.length === 0 && !showAddGroup && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAddGroup(true)}
            className="w-10 h-10 rounded-full bg-boost-purple/10 border-2 border-dashed border-boost-purple/40 flex items-center justify-center hover:bg-boost-purple/20 hover:border-boost-purple/60 transition-all hover:scale-110"
            title="Add agent group"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-boost-purple">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      )}

      {/* Add group popover */}
      {showAddGroup && groups.length === 0 && (
        <div className="flex justify-center">
          <AddGroupPopover
            onAdd={addGroup}
            onCancel={() => setShowAddGroup(false)}
          />
        </div>
      )}

      {/* Groups exist — show grid + add more button */}
      {groups.length > 0 && (
        <>
          {/* Horizontal bar — desktop */}
          <div className="mx-4 hidden md:block" aria-hidden="true">
            <div className="border-t-[1.5px] border-dashed" style={{ borderColor: "var(--color-boost-connector)" }} />
          </div>

          {/* Desktop grid */}
          <div
            className="hidden md:grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${Math.min(groups.length + 1, 6)}, minmax(0, 1fr))`,
            }}
          >
            {groups.map((group) => (
              <BuilderGroupColumn
                key={group.id}
                group={group}
                agents={resolveAgents(group.agentKeys)}
                allAddedKeys={allAddedKeys}
                availableAgents={availableAgents}
                onAddAgent={addAgentToGroup}
                onRemoveGroup={removeGroup}
                onSelectAgent={onSelectAgent}
                onCreateNew={() => setShowCreateAgent(true)}
              />
            ))}

            {/* Add another group column */}
            <div className="flex flex-col items-center">
              <DashedLine height="h-8" />
              <div className="flex justify-center h-5 -mt-1 mb-1" />
              <DashedLine height="h-4" />
              <div className="relative">
                {showAddGroup ? (
                  <AddGroupPopover
                    onAdd={addGroup}
                    onCancel={() => setShowAddGroup(false)}
                  />
                ) : (
                  <button
                    onClick={() => setShowAddGroup(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-boost-purple/30 text-boost-purple hover:bg-boost-purple/5 hover:border-boost-purple/50 transition-colors"
                    title="Add another group"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    <span className="text-xs font-semibold">Add group</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile list */}
          <div className="md:hidden space-y-3">
            {groups.map((group) => (
              <MobileBuilderGroup
                key={group.id}
                group={group}
                agents={resolveAgents(group.agentKeys)}
                allAddedKeys={allAddedKeys}
                availableAgents={availableAgents}
                onAddAgent={addAgentToGroup}
                onRemoveGroup={removeGroup}
                onSelectAgent={onSelectAgent}
                onCreateNew={() => setShowCreateAgent(true)}
              />
            ))}

            {/* Add group button — mobile */}
            <div className="relative">
              {showAddGroup ? (
                <div className="flex justify-center">
                  <AddGroupPopover
                    onAdd={addGroup}
                    onCancel={() => setShowAddGroup(false)}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowAddGroup(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-boost-purple/30 text-boost-purple hover:bg-boost-purple/5 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span className="text-sm font-semibold">Add group</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Create agent placeholder modal */}
      {showCreateAgent && (
        <CreateAgentModal onClose={() => setShowCreateAgent(false)} />
      )}
    </div>
  );
}
