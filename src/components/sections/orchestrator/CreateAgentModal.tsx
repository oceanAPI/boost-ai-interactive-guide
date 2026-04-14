"use client";

import { useState, useEffect } from "react";
import type { SpecialistAgent } from "@/data/agents";
import type { KnowledgeEntry, HookEntry } from "./builder-types";
import KnowledgeEditor from "./KnowledgeEditor";
import HookEditor from "./HookEditor";

export default function CreateAgentModal({ onClose, onSaveAgent }: { onClose: () => void; onSaveAgent: (agent: SpecialistAgent) => void }) {
  const [agentName, setAgentName] = useState("");
  const [instructions, setInstructions] = useState(
    "You are a specialist agent for [topic].\n\nHuman chat is open status is currently: ${filters_and_skill_open_status}\n${synonym_lists_by_filter}\n${genaction_background_by_filter}"
  );
  const [saved, setSaved] = useState(false);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeEntry[]>([]);
  /* Admin metadata: knowledge backend type — default SharePoint */
  const [backendType] = useState("SharePoint");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const [hookItems, setHookItems] = useState<HookEntry[]>([
    { id: "h-default-1", hookType: "action", name: "create_inquiry", description: "Creates an inquiry/task/ticket in your CRM.", inputKeys: [{ name: "department", type: "Text", description: "The relevant department value.", required: true }] },
    { id: "h-default-2", hookType: "action", name: "transfer_to_customer_service", description: "Transfers the conversation to customer service.", inputKeys: [] },
  ]);

  const handleSave = (andClose: boolean) => {
    /* Build a SpecialistAgent from form data */
    const key = `custom_${agentName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/_+$/, "") || "agent"}_${Date.now()}`;

    const newAgent: SpecialistAgent = {
      key,
      name: agentName || "New Agent",
      icon: "robot-brain",
      automationRate: 0,
      avgResolutionTime: "—",
      topTopic: "Custom",
      description: instructions.split("\n")[0] || "Custom agent",
      capabilities: [
        { title: "Custom instructions", description: instructions.slice(0, 200) },
      ],
      quickActions: [],
      flow: {
        knowledgeSources: knowledgeItems.map((k, i) => ({
          id: `${key}-kb-${i}`,
          name: k.title,
          type: k.type === "url" ? "api" : k.type === "connector" ? "api" : k.type === "document" ? "document" : "document",
          icon: k.type === "url" ? "computer-api" : k.type === "connector" ? "computer-api" : k.type === "document" ? "hierarchy-document" : "books",
          description: k.title,
        })),
        guardrails: [
          { id: `${key}-gr-hallucination`, name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents the agent from generating inaccurate information" },
          { id: `${key}-gr-pii`, name: "PII Protection", type: "pii", icon: "lock-security", description: "Ensures personal identifiable information is handled securely" },
        ],
        actionHooks: hookItems.map((h, i) => ({
          id: `${key}-ah-${i}`,
          name: h.name,
          type: h.hookType === "api" ? "api" : h.customCardJson ? "custom_card" : "transfer",
          icon: h.hookType === "api" ? "computer-api" : h.customCardJson ? "target-selection" : "headset",
          description: h.description,
          ...(h.customCardJson ? { customCardJson: h.customCardJson } : {}),
        })),
        processes: [],
        standardResponses: [
          { id: `${key}-sr-fallback`, name: "Unable to Assist", type: "fallback", icon: "route", description: "Graceful fallback when the request cannot be automated" },
        ],
      },
    };

    if (!saved) {
      onSaveAgent(newAgent);
    }
    setSaved(true);
    if (andClose) {
      setTimeout(onClose, 1200);
    }
  };

  const addKnowledgeEntry = (entry: Omit<KnowledgeEntry, "id">) => {
    setKnowledgeItems((prev) => [...prev, { ...entry, id: `k-${Date.now()}` }]);
  };
  const removeKnowledgeEntry = (id: string) => {
    setKnowledgeItems((prev) => prev.filter((k) => k.id !== id));
  };

  const addHookEntry = (hook: Omit<HookEntry, "id">) => {
    setHookItems((prev) => [...prev, { ...hook, id: `h-${Date.now()}` }]);
  };
  const removeHookEntry = (id: string) => {
    setHookItems((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-boost-border max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto animate-modal-in">
        {/* Header bar */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-boost-border rounded-t-2xl">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-boost-dark">Edit agentic action</h3>
            <span className="w-5 h-5 rounded-full border border-boost-muted/30 flex items-center justify-center text-[9px] text-boost-muted">?</span>
            <span className="px-2 py-0.5 rounded-full border border-boost-green text-[10px] font-semibold text-boost-green">EN</span>
            <span className="px-2 py-0.5 rounded-full bg-boost-purple text-white text-[10px] font-bold">NEW</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-boost-surface flex items-center justify-center transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Agent name */}
          <div>
            <label className="text-xs font-semibold text-boost-dark mb-1.5 block">Agent name</label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="e.g. Card Disputes Agent"
              className="w-full px-3 py-2 rounded-lg border border-boost-border text-sm text-boost-dark placeholder:text-boost-muted/50 focus:outline-none focus:ring-2 focus:ring-boost-purple/30 focus:border-boost-purple transition-colors"
            />
          </div>

          {/* Global instructions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-boost-dark flex items-center gap-1.5">
                Global instructions
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-boost-muted">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </label>
              <div className="w-9 h-5 rounded-full bg-boost-purple flex items-center px-0.5">
                <div className="w-4 h-4 rounded-full bg-white ml-auto" />
              </div>
            </div>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 rounded-lg border border-boost-border text-xs text-boost-dark font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-boost-purple/30 focus:border-boost-purple transition-colors resize-none bg-boost-surface/30"
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-boost-border" />

          {/* Knowledge */}
          <div>
            <h4 className="text-sm font-bold text-boost-purple mb-3">Edit knowledge</h4>
            <KnowledgeEditor
              items={knowledgeItems}
              onAdd={addKnowledgeEntry}
              onRemove={removeKnowledgeEntry}
              backendType={backendType}
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-boost-border" />

          {/* Hooks */}
          <div>
            <h4 className="text-sm font-bold text-boost-purple mb-3">Hooks</h4>
            <HookEditor
              items={hookItems}
              onAdd={addHookEntry}
              onRemove={removeHookEntry}
            />
          </div>
        </div>

        {/* Footer with Save */}
        <div className="sticky bottom-0 bg-white border-t border-boost-border px-5 py-3 flex items-center justify-end gap-3 rounded-b-2xl">
          {saved ? (
            <div className="flex-1 animate-modal-in">
              <div className="bg-boost-green/10 border border-boost-green/20 rounded-lg px-3 py-2.5">
                <p className="text-xs text-boost-dark leading-relaxed">
                  <span className="font-semibold text-boost-green">Saved!</span>{" "}
                  All sections are fully customizable per agent. boost.ai delivers template best-practice industry instructions to get you started quickly.
                </p>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-boost-border text-xs font-medium text-boost-muted hover:bg-boost-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(false)}
                className="px-4 py-2 rounded-lg bg-boost-purple text-white text-xs font-semibold hover:bg-boost-purple/90 transition-colors flex items-center gap-1.5"
              >
                Save
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
              <button
                onClick={() => handleSave(true)}
                className="px-4 py-2 rounded-lg bg-boost-purple text-white text-xs font-semibold hover:bg-boost-purple/90 transition-colors flex items-center gap-1.5"
              >
                Save &amp; close
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
