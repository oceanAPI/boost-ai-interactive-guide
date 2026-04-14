"use client";

import { useState } from "react";
import type { KnowledgeEntry, KnowledgeTab } from "./builder-types";

export default function KnowledgeEditor({
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
