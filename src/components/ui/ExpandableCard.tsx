"use client";

import { useState } from "react";

interface ExpandableCardProps {
  title: string;
  preview?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export default function ExpandableCard({
  title,
  preview,
  icon,
  children,
  defaultOpen = false,
  className = "",
}: ExpandableCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-xl border border-boost-border bg-white overflow-hidden transition-shadow ${open ? "shadow-md" : "shadow-sm"} ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-boost-surface/50 transition-colors"
      >
        {icon && <span className="flex-shrink-0 text-boost-green">{icon}</span>}
        <div className="flex-1 min-w-0">
          <span className="font-medium text-boost-dark text-sm">{title}</span>
          {preview && !open && (
            <p className="text-xs text-boost-muted truncate mt-0.5">{preview}</p>
          )}
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          className={`text-boost-muted flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
