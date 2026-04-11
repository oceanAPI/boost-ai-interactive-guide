"use client";

import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

/**
 * Shared expandable card — the single source of truth for collapsible
 * content panels used in Security, Ways of Working, and future sections.
 *
 * Usage:
 *   <ExpandableCard
 *     title="PII Masking"
 *     subtitle="Real-time data protection"
 *     icon={<BoostIcon name="lock-security" />}
 *     accentColor="border-boost-green"
 *     defaultOpen
 *   >
 *     <MyContent />
 *   </ExpandableCard>
 */

interface ExpandableCardProps {
  title: string;
  /** Shown below title when card is collapsed */
  subtitle?: string;
  icon?: React.ReactNode;
  /** Tailwind border-color class for the top accent stripe, e.g. "border-boost-purple" */
  accentColor?: string;
  defaultOpen?: boolean;
  /** Controlled mode: external open state */
  open?: boolean;
  /** Controlled mode: toggle callback */
  onToggle?: () => void;
  className?: string;
  children: React.ReactNode;
}

export default function ExpandableCard({
  title,
  subtitle,
  icon,
  accentColor = "border-boost-purple",
  defaultOpen = false,
  open: controlledOpen,
  onToggle,
  className = "",
  children,
}: ExpandableCardProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleToggle = onToggle ?? (() => setInternalOpen(!internalOpen));
  const { ref, isVisible } = useScrollReveal({ once: true });

  return (
    <div
      ref={ref}
      className={`rounded-xl border bg-white overflow-hidden transition-all duration-300 ${
        open
          ? `shadow-lg ${accentColor}/20`
          : "shadow-sm border-boost-border hover:shadow-md"
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${className}`}
    >
      {/* Accent top stripe */}
      <div className={`h-[3px] ${accentColor.replace("border-", "bg-")}`} />

      <button
        onClick={handleToggle}
        className="w-full flex items-center gap-3 p-4 sm:p-5 text-left hover:bg-boost-surface/30 transition-colors"
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-boost-dark text-sm sm:text-base">
            {title}
          </span>
          {subtitle && !open && (
            <p className="text-xs text-boost-muted mt-0.5 line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-boost-muted flex-shrink-0 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-400 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-4 sm:px-5 pb-5 pt-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
