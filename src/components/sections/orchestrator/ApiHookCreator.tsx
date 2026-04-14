"use client";

import { useState } from "react";
import type { HookEntry } from "./builder-types";

export default function ApiHookCreator({ onSave, onCancel }: { onSave: (hook: Omit<HookEntry, "id">) => void; onCancel: () => void }) {
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
