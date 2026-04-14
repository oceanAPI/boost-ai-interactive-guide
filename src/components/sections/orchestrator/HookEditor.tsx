"use client";

import { useState } from "react";
import type { HookEntry } from "./builder-types";
import ApiHookCreator from "./ApiHookCreator";
import ActionHookCreator from "./ActionHookCreator";

export default function HookEditor({
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
