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

/* ─── Knowledge Editor (tab-based, matching admin reference) ─── */
type KnowledgeEntry = { id: string; type: "url" | "upload" | "document" | "connector"; title: string };
type KnowledgeTab = "url" | "upload" | "document" | "connector" | "existing";

function KnowledgeEditor({
  items,
  onAdd,
  onRemove,
  backendType,
}: {
  items: KnowledgeEntry[];
  onAdd: (entry: Omit<KnowledgeEntry, "id">) => void;
  onRemove: (id: string) => void;
  backendType: string;
}) {
  const [activeTab, setActiveTab] = useState<KnowledgeTab>("upload");
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [docContent, setDocContent] = useState("");
  const [connectorConfig, setConnectorConfig] = useState(
    `{\n  "source": "${backendType}",\n  "endpoint": "https://your-tenant.sharepoint.com/sites/kb",\n  "auth": "oauth2",\n  "sync_interval": "daily",\n  "filters": {\n    "library": "Knowledge Base",\n    "content_type": "documents"\n  }\n}`
  );

  const tabs: { key: KnowledgeTab; label: string }[] = [
    { key: "url", label: "URL" },
    { key: "upload", label: "Upload file" },
    { key: "document", label: "Document" },
    { key: "connector", label: "Connector" },
    { key: "existing", label: "Existing" },
  ];

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploadDone(true);
      setTimeout(() => {
        onAdd({ type: "upload", title: "upload_knowledge:document.docx" });
        setUploadDone(false);
      }, 1000);
    }, 2000);
  };

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      <div className="flex bg-boost-surface rounded-lg p-0.5 border border-boost-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-1.5 py-2 rounded-md text-[10px] font-semibold transition-all text-center ${
              activeTab === tab.key
                ? "bg-white text-boost-dark shadow-sm"
                : "text-boost-muted hover:text-boost-dark"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[120px]">
        {/* URL tab */}
        {activeTab === "url" && (
          <div className="space-y-2.5 animate-modal-in">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-boost-border text-xs text-boost-dark font-mono placeholder:text-boost-muted/50 focus:outline-none focus:ring-2 focus:ring-boost-purple/20 focus:border-boost-purple"
            />
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (urlValue.trim()) {
                    onAdd({ type: "url", title: urlValue });
                    setUrlValue("");
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-boost-purple text-white text-[10px] font-semibold hover:bg-boost-purple/90 transition-colors"
              >
                Add URL
              </button>
            </div>
          </div>
        )}

        {/* Upload file tab */}
        {activeTab === "upload" && (
          <div className="animate-modal-in">
            {uploadDone ? (
              <div className="flex items-center gap-2 py-6 justify-center animate-modal-in">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-boost-green">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xs font-semibold text-boost-green">upload_knowledge:document.docx uploaded</span>
              </div>
            ) : uploading ? (
              <div className="py-6 flex flex-col items-center gap-3 animate-modal-in">
                <div className="w-48 h-1.5 rounded-full bg-boost-border overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-boost-purple to-boost-green" style={{ animation: "loadProgress 2s ease-in-out forwards" }} />
                </div>
                <span className="text-[10px] text-boost-muted">Uploading...</span>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-boost-border rounded-xl py-6 px-4 text-center hover:border-boost-purple/40 transition-colors cursor-pointer group"
                onClick={handleUpload}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-boost-muted/50 group-hover:text-boost-purple/50 mx-auto mb-2 transition-colors">
                  <path d="M12 16V8M9 11l3-3 3 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
                </svg>
                <p className="text-xs text-boost-dark font-medium mb-0.5">Drag and drop or browse files</p>
                <p className="text-[10px] text-boost-muted">Supported formats: docx, pdf, txt, html, md, png, svg, jpeg, gif, mp4, mov, avi, mkv, webm, mpeg</p>
                <button className="mt-3 px-4 py-1.5 rounded-full border border-boost-border text-xs font-medium text-boost-dark hover:bg-boost-surface transition-colors">
                  Browse
                </button>
              </div>
            )}
          </div>
        )}

        {/* Document tab */}
        {activeTab === "document" && (
          <div className="space-y-2.5 animate-modal-in">
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Knowledge title..."
              className="w-full px-3 py-2 rounded-lg border border-boost-border text-xs text-boost-dark placeholder:text-boost-muted/50 focus:outline-none focus:ring-2 focus:ring-boost-purple/20 focus:border-boost-purple"
            />
            <textarea
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              placeholder="Write knowledge content here..."
              rows={5}
              className="w-full px-3 py-2 rounded-lg border border-boost-border text-xs text-boost-dark leading-relaxed placeholder:text-boost-muted/50 focus:outline-none focus:ring-2 focus:ring-boost-purple/20 focus:border-boost-purple resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (docTitle.trim()) {
                    onAdd({ type: "document", title: docTitle });
                    setDocTitle("");
                    setDocContent("");
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-boost-purple text-white text-[10px] font-semibold hover:bg-boost-purple/90 transition-colors"
              >
                Save knowledge
              </button>
            </div>
          </div>
        )}

        {/* Connector tab */}
        {activeTab === "connector" && (
          <div className="space-y-2.5 animate-modal-in">
            <div className="rounded-lg border border-boost-border bg-[#1e1e2e] overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181825] border-b border-[#313244]">
                <span className="w-2 h-2 rounded-full bg-red-400/80" />
                <span className="w-2 h-2 rounded-full bg-yellow-400/80" />
                <span className="w-2 h-2 rounded-full bg-green-400/80" />
                <span className="text-[9px] text-[#6c7086] ml-2 font-mono">knowledge-backend.json</span>
              </div>
              <textarea
                value={connectorConfig}
                onChange={(e) => setConnectorConfig(e.target.value)}
                rows={9}
                className="w-full px-3 py-2 text-[11px] font-mono leading-relaxed bg-transparent text-[#cdd6f4] focus:outline-none resize-none"
                spellCheck={false}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => onAdd({ type: "connector", title: `${backendType} — Knowledge Backend` })}
                className="px-3 py-1.5 rounded-lg bg-boost-purple text-white text-[10px] font-semibold hover:bg-boost-purple/90 transition-colors"
              >
                Save connection
              </button>
            </div>
          </div>
        )}

        {/* Existing tab */}
        {activeTab === "existing" && (
          <div className="animate-modal-in">
            {items.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs text-boost-muted">No knowledge sources added yet.</p>
                <p className="text-[10px] text-boost-muted/60 mt-1">Use the other tabs to add knowledge.</p>
              </div>
            ) : (
              <p className="text-[10px] text-boost-muted mb-2">All knowledge sources for this agent:</p>
            )}
          </div>
        )}
      </div>

      {/* Knowledge list — always visible */}
      {items.length > 0 && (
        <div className="border-t border-boost-border pt-3">
          <h5 className="text-xs font-bold text-boost-purple mb-2">Knowledge</h5>
          <div className="space-y-1.5">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-boost-border bg-white">
                {item.type === "upload" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-boost-muted flex-shrink-0"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                )}
                {item.type === "document" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-boost-purple flex-shrink-0"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                )}
                {item.type === "url" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-boost-purple flex-shrink-0"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>
                )}
                {item.type === "connector" && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-boost-purple flex-shrink-0"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
                )}
                <span className="text-xs text-boost-dark truncate flex-1">{item.title}</span>
                {item.type === "upload" && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-boost-muted/40 flex-shrink-0">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                )}
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-boost-muted/40 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Hook Editor ─── */
type HookEntry = {
  id: string;
  hookType: "api" | "action";
  name: string;
  description: string;
  inputKeys: { name: string; type: string; description: string; required: boolean }[];
  customCardJson?: {
    type: string;
    title: string;
    subtitle?: string;
    image?: string | null;
    fields?: { label: string; value: string }[];
    actions?: { label: string; type: string }[];
  };
};

function ApiHookCreator({ onSave, onCancel }: { onSave: (hook: Omit<HookEntry, "id">) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [apiConfig, setApiConfig] = useState(
    `{\n  "method": "POST",\n  "url": "https://[banking_api_integration_name]/api/v1/hook",\n  "headers": {\n    "Authorization": "Bearer {{api_key}}",\n    "Content-Type": "application/json"\n  },\n  "body": {\n    "action": "[hook_action_name]",\n    "customer_id": "{{customer_id}}",\n    "data": "{{input_payload}}"\n  }\n}`
  );
  const [instruction, setInstruction] = useState("");
  const [inputKeys, setInputKeys] = useState<HookEntry["inputKeys"]>([]);
  const [showAddKey, setShowAddKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyType, setNewKeyType] = useState("Text");
  const [newKeyDesc, setNewKeyDesc] = useState("");

  const addKey = () => {
    if (newKeyName.trim()) {
      setInputKeys((prev) => [...prev, { name: newKeyName, type: newKeyType, description: newKeyDesc, required: true }]);
      setNewKeyName("");
      setNewKeyDesc("");
      setShowAddKey(false);
    }
  };

  return (
    <div className="rounded-lg border border-boost-purple/30 bg-boost-surface/30 p-3.5 space-y-3 animate-modal-in">
      <div className="flex items-center gap-2">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-boost-purple/10 text-boost-purple font-bold">API Hook</span>
      </div>

      {/* Name */}
      <div>
        <label className="text-[10px] font-semibold text-boost-purple mb-1 block">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. fetch_account_balance"
          className="w-full px-2.5 py-1.5 rounded-md border border-boost-border text-xs text-boost-dark font-mono placeholder:text-boost-muted/50 focus:outline-none focus:ring-2 focus:ring-boost-purple/20 focus:border-boost-purple"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-[10px] font-semibold text-boost-purple mb-1 block">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this API hook do?"
          rows={2}
          className="w-full px-2.5 py-1.5 rounded-md border border-boost-border text-xs text-boost-dark placeholder:text-boost-muted/50 focus:outline-none focus:ring-2 focus:ring-boost-purple/20 focus:border-boost-purple resize-none"
        />
      </div>

      {/* API config code editor */}
      <div>
        <label className="text-[10px] font-semibold text-boost-purple mb-1 block">API Configuration</label>
        <div className="rounded-md border border-boost-border bg-[#1e1e2e] overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181825] border-b border-[#313244]">
            <span className="w-2 h-2 rounded-full bg-red-400/80" />
            <span className="w-2 h-2 rounded-full bg-yellow-400/80" />
            <span className="w-2 h-2 rounded-full bg-green-400/80" />
            <span className="text-[9px] text-[#6c7086] ml-2 font-mono">api-hook.json</span>
          </div>
          <textarea
            value={apiConfig}
            onChange={(e) => setApiConfig(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 text-[11px] font-mono leading-relaxed bg-transparent text-[#cdd6f4] focus:outline-none resize-none"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Instruction */}
      <div>
        <label className="text-[10px] font-semibold text-boost-purple mb-1 block">Hook instruction</label>
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Instructions for when and how this hook should be triggered..."
          rows={2}
          className="w-full px-2.5 py-1.5 rounded-md border border-boost-border text-xs text-boost-dark placeholder:text-boost-muted/50 focus:outline-none focus:ring-2 focus:ring-boost-purple/20 focus:border-boost-purple resize-none"
        />
      </div>

      {/* Input keys */}
      <div>
        <label className="text-[10px] font-semibold text-boost-purple mb-1.5 block">Input keys</label>
        {inputKeys.length > 0 && (
          <div className="space-y-2 mb-2">
            {inputKeys.map((key, i) => (
              <div key={i} className="rounded-md border border-boost-border bg-white p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-[10px] font-semibold text-boost-dark bg-boost-surface px-2 py-0.5 rounded font-mono">{key.name}</span>
                    <span className="text-[9px] text-boost-muted px-1.5 py-0.5 rounded border border-boost-border">{key.type}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-semibold text-boost-purple">Required:</span>
                    <div className={`w-7 h-4 rounded-full flex items-center px-0.5 transition-colors ${key.required ? "bg-boost-purple" : "bg-boost-border"}`}>
                      <div className={`w-3 h-3 rounded-full bg-white transition-transform ${key.required ? "ml-auto" : ""}`} />
                    </div>
                  </div>
                  <button
                    onClick={() => setInputKeys((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-boost-muted/40 hover:text-red-400 transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>
                {key.description && (
                  <p className="text-[10px] text-boost-muted leading-relaxed mt-1">{key.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {showAddKey ? (
          <div className="rounded-md border border-boost-purple/20 bg-white p-2.5 space-y-2 animate-modal-in">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[9px] font-semibold text-boost-muted mb-0.5 block">Name</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. department"
                  className="w-full px-2 py-1 rounded border border-boost-border text-[11px] text-boost-dark font-mono placeholder:text-boost-muted/50 focus:outline-none focus:ring-1 focus:ring-boost-purple/20"
                />
              </div>
              <div className="w-20">
                <label className="text-[9px] font-semibold text-boost-muted mb-0.5 block">Type</label>
                <select
                  value={newKeyType}
                  onChange={(e) => setNewKeyType(e.target.value)}
                  className="w-full px-1.5 py-1 rounded border border-boost-border text-[11px] text-boost-dark focus:outline-none focus:ring-1 focus:ring-boost-purple/20 bg-white"
                >
                  <option>Text</option>
                  <option>Number</option>
                  <option>Boolean</option>
                  <option>JSON</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[9px] font-semibold text-boost-muted mb-0.5 block">Description</label>
              <textarea
                value={newKeyDesc}
                onChange={(e) => setNewKeyDesc(e.target.value)}
                placeholder="Describe what this input key is for..."
                rows={2}
                className="w-full px-2 py-1 rounded border border-boost-border text-[10px] text-boost-dark placeholder:text-boost-muted/50 focus:outline-none focus:ring-1 focus:ring-boost-purple/20 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddKey(false)} className="px-2 py-0.5 text-[10px] text-boost-muted hover:text-boost-dark">Cancel</button>
              <button onClick={addKey} className="px-2.5 py-0.5 rounded bg-boost-purple text-white text-[10px] font-semibold hover:bg-boost-purple/90">Add key</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddKey(true)}
            className="flex items-center gap-1 text-[10px] text-boost-muted hover:text-boost-purple transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
            Add input key
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1 border-t border-boost-border">
        <button onClick={onCancel} className="px-3 py-1 rounded-md text-[10px] font-medium text-boost-muted hover:bg-boost-surface transition-colors">Cancel</button>
        <button
          onClick={() => {
            if (name.trim()) {
              onSave({ hookType: "api", name, description, inputKeys });
            }
          }}
          className="px-3 py-1 rounded-md bg-boost-purple text-white text-[10px] font-semibold hover:bg-boost-purple/90 transition-colors"
        >
          Save hook
        </button>
      </div>
    </div>
  );
}

function ActionHookCreator({ onSave, onCancel }: { onSave: (hook: Omit<HookEntry, "id">) => void; onCancel: () => void }) {
  const [step, setStep] = useState<"type" | "content" | "preview">("type");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const actionTypes = [
    { key: "agentic", label: "Agentic", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", enabled: false },
    { key: "content", label: "Content", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", enabled: true },
    { key: "if", label: "IF", icon: "M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01", enabled: false },
    { key: "entity", label: "Entity Extraction", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z", enabled: false },
    { key: "api", label: "API Connector", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", enabled: false },
    { key: "context", label: "Context", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", enabled: false },
    { key: "process", label: "Process", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", enabled: false },
    { key: "ab", label: "A/B test", icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z", enabled: false },
    { key: "llm", label: "LLM", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z", enabled: false },
    { key: "stop", label: "Stop & listen", icon: "M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 12h.01", enabled: false },
    { key: "search", label: "Search existing", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", enabled: false },
  ];

  const contentTypes = [
    { key: "carousel", label: "Carousel", desc: "Display several cards with image, text and links in a carousel", enabled: false },
    { key: "custom_card", label: "Custom card", desc: "Display a card with image, text, list and links", enabled: true },
    { key: "emit_event", label: "Emit event", desc: "Instruct the chat panel to emit an event", enabled: false },
    { key: "generic_card", label: "Generic card", desc: "Display a card with image and text", enabled: false },
    { key: "google_maps", label: "Google maps", desc: "Take advantage of the Google Maps Embed API", enabled: false },
    { key: "multi_select", label: "Multi select", desc: "Display a list of options that can be selected", enabled: false },
  ];

  /* The custom card JSON that renders in the chat preview */
  const customCardJson = {
    type: "custom_card",
    title: "Account Overview",
    subtitle: "Checking Account ••4821",
    image: null,
    fields: [
      { label: "Available Balance", value: "€12,450.00" },
      { label: "Pending", value: "€340.00" },
      { label: "Last Transaction", value: "Netflix — €15.99" },
    ],
    actions: [
      { label: "View Transactions", type: "link" },
      { label: "Transfer Funds", type: "primary" },
    ],
  };

  return (
    <div className="rounded-lg border border-boost-green/30 bg-boost-surface/30 p-3.5 space-y-3 animate-modal-in">
      <div className="flex items-center gap-2">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-boost-green/10 text-boost-green font-bold">Action Hook</span>
        {step !== "type" && (
          <button onClick={() => setStep(step === "preview" ? "content" : "type")} className="text-[10px] text-boost-muted hover:text-boost-dark">← Back</button>
        )}
      </div>

      {/* Step 1: Pick action type */}
      {step === "type" && (
        <div className="space-y-1 animate-modal-in">
          <p className="text-[10px] text-boost-muted mb-2">Select action type:</p>
          {actionTypes.map((at) => (
            <button
              key={at.key}
              onClick={() => { if (at.enabled) setStep("content"); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                at.enabled
                  ? "bg-boost-green/10 border border-boost-green/30 hover:bg-boost-green/15 cursor-pointer"
                  : "bg-white border border-boost-border/50 opacity-50 cursor-default"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`flex-shrink-0 ${at.enabled ? "text-boost-green" : "text-boost-muted/60"}`}>
                <path d={at.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className={`text-xs font-medium ${at.enabled ? "text-boost-green font-semibold" : "text-boost-muted"}`}>{at.label}</span>
              {at.enabled && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-boost-green ml-auto">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}
              {!at.enabled && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-boost-muted/30 ml-auto">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Pick content type */}
      {step === "content" && (
        <div className="space-y-2 animate-modal-in">
          <p className="text-[10px] text-boost-muted mb-2">Select content type:</p>
          {contentTypes.map((ct) => (
            <button
              key={ct.key}
              onClick={() => { if (ct.enabled) setStep("preview"); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                ct.enabled
                  ? "bg-boost-green/10 border border-boost-green/30 hover:bg-boost-green/15 cursor-pointer"
                  : "bg-white border border-boost-border/50 opacity-45 cursor-default"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ct.enabled ? "bg-boost-green text-white" : "bg-boost-muted/10 text-boost-muted/40"}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" strokeLinecap="round" strokeLinejoin="round" />
                  {ct.key === "custom_card" && <path d="M8 10h8M8 14h5" strokeLinecap="round" />}
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-semibold block ${ct.enabled ? "text-boost-green" : "text-boost-muted"}`}>{ct.label}</span>
                <span className={`text-[10px] leading-tight ${ct.enabled ? "text-boost-dark/70" : "text-boost-muted/60"}`}>{ct.desc}</span>
              </div>
              {ct.enabled && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-boost-green flex-shrink-0">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}
              {!ct.enabled && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-boost-muted/30 flex-shrink-0">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Step 3: Preview — mini chat with rendered custom card */}
      {step === "preview" && (
        <div className="space-y-3 animate-modal-in">
          {/* Name + description */}
          <div>
            <label className="text-[10px] font-semibold text-boost-green mb-1 block">Hook name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. show_account_overview"
              className="w-full px-2.5 py-1.5 rounded-md border border-boost-border text-xs text-boost-dark font-mono placeholder:text-boost-muted/50 focus:outline-none focus:ring-2 focus:ring-boost-green/20 focus:border-boost-green"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-boost-green mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this action do?"
              rows={2}
              className="w-full px-2.5 py-1.5 rounded-md border border-boost-border text-xs text-boost-dark placeholder:text-boost-muted/50 focus:outline-none focus:ring-2 focus:ring-boost-green/20 focus:border-boost-green resize-none"
            />
          </div>

          {/* Mini chat demo */}
          <div>
            <label className="text-[10px] font-semibold text-boost-green mb-1.5 block">Custom card preview</label>
            <div className="rounded-xl border border-boost-border bg-gradient-to-b from-boost-surface/50 to-white overflow-hidden">
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

                {/* Bot typing indicator then card */}
                <div className="flex justify-start">
                  <div className="max-w-[90%] space-y-1.5">
                    <div className="bg-boost-surface rounded-xl rounded-tl-sm px-3 py-1.5">
                      <p className="text-[10px] text-boost-dark">Here&apos;s your account overview:</p>
                    </div>

                    {/* Rendered custom card */}
                    <div className="rounded-xl border border-boost-green/30 bg-white shadow-sm overflow-hidden">
                      <div className="bg-boost-green/10 px-3 py-2 border-b border-boost-green/15">
                        <p className="text-xs font-bold text-boost-dark">{customCardJson.title}</p>
                        <p className="text-[10px] text-boost-muted">{customCardJson.subtitle}</p>
                      </div>
                      <div className="px-3 py-2 space-y-1.5">
                        {customCardJson.fields.map((f) => (
                          <div key={f.label} className="flex items-center justify-between">
                            <span className="text-[10px] text-boost-muted">{f.label}</span>
                            <span className="text-[10px] font-semibold text-boost-dark">{f.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="px-3 py-2 border-t border-boost-border flex gap-1.5">
                        {customCardJson.actions.map((a) => (
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* JSON preview */}
          <details className="group">
            <summary className="text-[10px] text-boost-muted cursor-pointer hover:text-boost-dark transition-colors flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-open:rotate-90"><polyline points="9 18 15 12 9 6" /></svg>
              View JSON
            </summary>
            <div className="mt-1.5 rounded-md border border-boost-border bg-[#1e1e2e] overflow-hidden">
              <pre className="px-3 py-2 text-[10px] font-mono leading-relaxed text-[#cdd6f4] overflow-x-auto">
                {JSON.stringify(customCardJson, null, 2)}
              </pre>
            </div>
          </details>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-boost-border">
            <button onClick={onCancel} className="px-3 py-1 rounded-md text-[10px] font-medium text-boost-muted hover:bg-boost-surface transition-colors">Cancel</button>
            <button
              onClick={() => {
                if (name.trim()) {
                  onSave({ hookType: "action", name, description: description || "Displays a custom card in the conversation.", inputKeys: [], customCardJson });
                }
              }}
              className="px-3 py-1 rounded-md bg-boost-green text-white text-[10px] font-semibold hover:bg-boost-green/90 transition-colors"
            >
              Save hook
            </button>
          </div>
        </div>
      )}

      {/* Cancel on steps 1 & 2 */}
      {step !== "preview" && (
        <div className="flex justify-end pt-1 border-t border-boost-border">
          <button onClick={onCancel} className="px-3 py-1 rounded-md text-[10px] font-medium text-boost-muted hover:bg-boost-surface transition-colors">Cancel</button>
        </div>
      )}
    </div>
  );
}

function HookEditor({
  items,
  onAdd,
  onRemove,
}: {
  items: HookEntry[];
  onAdd: (hook: Omit<HookEntry, "id">) => void;
  onRemove: (id: string) => void;
}) {
  const [creating, setCreating] = useState<"api" | "action" | null>(null);
  const [showTypePicker, setShowTypePicker] = useState(false);

  return (
    <div className="space-y-3">
      {/* Existing hooks */}
      {items.map((hook) => (
        <div key={hook.id} className="rounded-lg border border-boost-border p-3.5 bg-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-boost-purple font-mono">{hook.name}</span>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                hook.hookType === "api"
                  ? "bg-boost-purple/10 text-boost-purple border border-boost-purple/20"
                  : "border border-boost-border text-boost-muted"
              }`}>
                {hook.hookType === "api" ? "API" : "Action"}
              </span>
              <button
                onClick={() => onRemove(hook.id)}
                className="text-boost-muted/40 hover:text-red-400 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <p className="text-[11px] text-boost-muted leading-relaxed">{hook.description}</p>
          {hook.inputKeys.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {hook.inputKeys.map((k) => (
                <span key={k.name} className="text-[9px] px-1.5 py-0.5 rounded bg-boost-surface text-boost-dark font-mono">{k.name}</span>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Creator panels */}
      {creating === "api" && (
        <ApiHookCreator
          onSave={(hook) => { onAdd(hook); setCreating(null); }}
          onCancel={() => setCreating(null)}
        />
      )}
      {creating === "action" && (
        <ActionHookCreator
          onSave={(hook) => { onAdd(hook); setCreating(null); }}
          onCancel={() => setCreating(null)}
        />
      )}

      {/* Add hook button */}
      {!creating && (
        <div className="relative">
          <button
            onClick={() => setShowTypePicker(!showTypePicker)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-boost-border text-xs text-boost-muted hover:text-boost-purple hover:border-boost-purple/40 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add hook
          </button>

          {showTypePicker && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 bg-white rounded-lg shadow-xl border border-boost-border w-48 overflow-hidden animate-modal-in z-10">
              <button
                onClick={() => { setCreating("api"); setShowTypePicker(false); }}
                className="w-full text-left px-3 py-2.5 flex items-center gap-2 text-xs hover:bg-boost-surface transition-colors border-b border-boost-border"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-boost-purple">
                  <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
                </svg>
                <div>
                  <span className="font-semibold text-boost-dark">API Hook</span>
                  <p className="text-[9px] text-boost-muted">External API integration</p>
                </div>
              </button>
              <button
                onClick={() => { setCreating("action"); setShowTypePicker(false); }}
                className="w-full text-left px-3 py-2.5 flex items-center gap-2 text-xs hover:bg-boost-surface transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-boost-green">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <div>
                  <span className="font-semibold text-boost-dark">Action Hook</span>
                  <p className="text-[9px] text-boost-muted">Internal action trigger</p>
                </div>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Create New Agent Modal (admin-style) ─── */
function CreateAgentModal({ onClose, onSaveAgent }: { onClose: () => void; onSaveAgent: (agent: SpecialistAgent) => void }) {
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

  const [hookItems, setHookItems] = useState<HookEntry[]>([
    { id: "h-default-1", hookType: "action", name: "create_inquiry", description: "Creates an inquiry/task/ticket in your CRM.", inputKeys: [{ name: "department", type: "Text", description: "The relevant department value.", required: true }] },
    { id: "h-default-2", hookType: "action", name: "transfer_to_customer_service", description: "Transfers the conversation to customer service.", inputKeys: [] },
  ]);
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
  const [createForGroupId, setCreateForGroupId] = useState<string | null>(null);
  const [customAgents, setCustomAgents] = useState<SpecialistAgent[]>([]);

  /* Merge built-in + custom agents */
  const allAgents = [...availableAgents, ...customAgents];

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

  // Resolve agent keys to full agent objects (includes custom agents)
  const agentMap = new Map(allAgents.map((a) => [a.key, a]));
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
                availableAgents={allAgents}
                onAddAgent={addAgentToGroup}
                onRemoveGroup={removeGroup}
                onSelectAgent={onSelectAgent}
                onCreateNew={() => { setCreateForGroupId(group.id); setShowCreateAgent(true); }}
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
                availableAgents={allAgents}
                onAddAgent={addAgentToGroup}
                onRemoveGroup={removeGroup}
                onSelectAgent={onSelectAgent}
                onCreateNew={() => { setCreateForGroupId(group.id); setShowCreateAgent(true); }}
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

      {/* Create agent modal */}
      {showCreateAgent && (
        <CreateAgentModal
          onClose={() => { setShowCreateAgent(false); setCreateForGroupId(null); }}
          onSaveAgent={(agent) => {
            setCustomAgents((prev) => [...prev, agent]);
            if (createForGroupId) {
              addAgentToGroup(createForGroupId, agent);
            }
          }}
        />
      )}
    </div>
  );
}
