"use client";

import { useState, useRef, useEffect } from "react";

export default function AddGroupPopover({
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
