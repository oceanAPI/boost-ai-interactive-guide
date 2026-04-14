"use client";

import { useState, useEffect } from "react";
import { SLIDE_SECTIONS } from "@/lib/slide-sections";

interface SectionPickerModalProps {
  open: boolean;
  onClose: () => void;
  onStart: (selectedSectionIds: string[]) => void;
}

export default function SectionPickerModal({ open, onClose, onStart }: SectionPickerModalProps) {
  /* Track ordered list of ALL sections; each has an enabled flag */
  const [items, setItems] = useState(() =>
    SLIDE_SECTIONS.map((s) => ({ ...s, enabled: true })),
  );

  /* Reset on open */
  useEffect(() => {
    if (open) {
      setItems(SLIDE_SECTIONS.map((s) => ({ ...s, enabled: true })));
    }
  }, [open]);

  /* Escape to close */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)),
    );
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index >= items.length - 1) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const selectedIds = items.filter((i) => i.enabled).map((i) => i.id);
  let displayNumber = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-boost-border w-full max-w-md mx-4 animate-modal-in">
        {/* Header */}
        <div className="px-5 py-4 border-b border-boost-border">
          <h3 className="text-base font-bold text-boost-dark">Select & Order Sections</h3>
          <p className="text-xs text-boost-muted mt-1">
            Check the sections to include and use arrows to reorder them.
          </p>
        </div>

        {/* Section list */}
        <div className="px-5 py-3 max-h-[60vh] overflow-y-auto">
          {items.map((item, index) => {
            if (item.enabled) displayNumber++;
            const num = item.enabled ? displayNumber : null;

            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 py-2.5 px-2 rounded-lg transition-colors ${
                  item.enabled ? "bg-white" : "bg-boost-surface/50"
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggle(item.id)}
                  className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                    item.enabled
                      ? "bg-boost-green-light border-boost-green-light"
                      : "border-boost-border"
                  }`}
                >
                  {item.enabled && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>

                {/* Number badge */}
                <span
                  className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${
                    item.enabled
                      ? "bg-boost-purple text-white"
                      : "bg-boost-border text-boost-muted"
                  }`}
                >
                  {num ?? "—"}
                </span>

                {/* Label */}
                <span
                  className={`flex-1 text-sm ${
                    item.enabled ? "text-boost-dark font-medium" : "text-boost-muted"
                  }`}
                >
                  {item.label}
                </span>

                {/* Up / Down arrows */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="w-7 h-7 rounded flex items-center justify-center text-boost-muted hover:bg-boost-surface hover:text-boost-dark transition-colors disabled:opacity-20 disabled:cursor-default"
                    aria-label="Move up"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === items.length - 1}
                    className="w-7 h-7 rounded flex items-center justify-center text-boost-muted hover:bg-boost-surface hover:text-boost-dark transition-colors disabled:opacity-20 disabled:cursor-default"
                    aria-label="Move down"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-boost-border flex items-center justify-between">
          <span className="text-xs text-boost-muted">
            {selectedIds.length} of {items.length} sections selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg text-boost-muted hover:bg-boost-surface transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onStart(selectedIds)}
              disabled={selectedIds.length === 0}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-boost-purple text-white hover:bg-boost-purple-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Start Presentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
