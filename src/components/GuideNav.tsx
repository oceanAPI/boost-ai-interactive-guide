"use client";

import Image from "next/image";

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
  return (
    <nav className="guide-nav sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-boost-border">
      <div className="max-w-5xl mx-auto px-8">
        {/* Top row: logo + company */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/boost_logo_purple-_main.svg"
              alt="boost.ai"
              width={100}
              height={24}
              className="h-5 w-auto"
              unoptimized
            />
            <span className="text-xs text-boost-muted">|</span>
            <span className="text-sm font-medium text-boost-dark">{companyName}</span>
          </div>
        </div>

        {/* Section pills — scrollable row */}
        <div className="flex items-center gap-1 pb-2 overflow-x-auto -mx-1 px-1 scrollbar-hide">
          {sections.map((section, idx) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => onNavigate(section.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                  whitespace-nowrap transition-colors flex-shrink-0
                  ${isActive
                    ? "bg-boost-purple text-white"
                    : "text-boost-muted hover:text-boost-dark hover:bg-boost-surface"
                  }
                `}
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
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
