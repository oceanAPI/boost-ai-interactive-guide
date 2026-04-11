"use client";

import { useEffect, useRef } from "react";
import { assetPath } from "@/lib/asset-path";

interface GuideNavProps {
  sections: { id: string; label: string; icon: string }[];
  activeSection: string;
  onNavigate: (id: string) => void;
  companyName: string;
}

export default function GuideNav({
  sections,
  activeSection,
  onNavigate,
  companyName,
}: GuideNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  /* Auto-scroll the pill strip to keep the active pill visible */
  useEffect(() => {
    const pill = pillRefs.current[activeSection];
    const container = scrollRef.current;
    if (!pill || !container) return;

    const pillLeft = pill.offsetLeft;
    const pillRight = pillLeft + pill.offsetWidth;
    const viewLeft = container.scrollLeft;
    const viewRight = viewLeft + container.offsetWidth;

    if (pillRight > viewRight - 16 || pillLeft < viewLeft + 16) {
      /* Center the pill in the strip */
      const center = pillLeft - container.offsetWidth / 2 + pill.offsetWidth / 2;
      container.scrollTo({ left: center, behavior: "smooth" });
    }
  }, [activeSection]);

  return (
    <nav className="guide-nav sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-boost-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        {/* Top row: logo + company */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assetPath("/brand/boost_logo_purple-_main.svg")}
              alt="boost.ai"
              className="h-5 w-auto"
            />
            <span className="text-xs text-boost-muted">|</span>
            <span className="text-sm font-medium text-boost-dark">{companyName}</span>
          </div>
        </div>

        {/* Section pills -- scrollable row */}
        <div
          ref={scrollRef}
          className="flex items-center gap-1 pb-2 overflow-x-auto -mx-1 px-1 scrollbar-hide"
        >
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                ref={(el) => { pillRefs.current[section.id] = el; }}
                onClick={() => onNavigate(section.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-full text-xs font-medium
                  whitespace-nowrap flex-shrink-0 min-h-[44px] sm:min-h-0
                  transition-all duration-300 ease-out
                  ${isActive
                    ? "bg-boost-purple text-white"
                    : "text-boost-muted hover:text-boost-dark hover:bg-boost-surface"
                  }
                `}
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-300 ${
                  isActive ? "bg-boost-green-light" : "bg-boost-border"
                }`} />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
