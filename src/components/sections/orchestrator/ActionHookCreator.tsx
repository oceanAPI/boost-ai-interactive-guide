"use client";

import { useState } from "react";
import type { HookEntry } from "./builder-types";

export default function ActionHookCreator({ onSave, onCancel }: { onSave: (hook: Omit<HookEntry, "id">) => void; onCancel: () => void }) {
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
