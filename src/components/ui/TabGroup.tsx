"use client";

import { useRef, useEffect, useState } from "react";

interface Tab {
  key: string;
  label: string;
  badge?: string | number;
}

interface TabGroupProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
  size?: "sm" | "md";
}

export default function TabGroup({ tabs, activeTab, onChange, size = "md" }: TabGroupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeEl = container.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [activeTab]);

  const sizeClasses = size === "sm" ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2";

  return (
    <div ref={containerRef} className="relative flex gap-1 bg-boost-surface rounded-lg p-1">
      {/* Animated indicator */}
      <div
        className="absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all duration-200 ease-out"
        style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.key}
          data-tab={tab.key}
          onClick={() => onChange(tab.key)}
          className={`
            relative z-10 ${sizeClasses} rounded-md font-medium transition-colors
            ${activeTab === tab.key ? "text-boost-dark" : "text-boost-muted hover:text-boost-dark"}
          `}
        >
          {tab.label}
          {tab.badge !== undefined && (
            <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key
                ? "bg-boost-green-light/20 text-boost-green"
                : "bg-boost-border text-boost-muted"
            }`}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
