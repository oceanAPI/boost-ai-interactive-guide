"use client";

import BoostLogo from "@/components/BoostLogo";

interface GuideNavProps {
  sections: { id: string; label: string; icon: string }[];
  activeSection: string;
  onNavigate: (id: string) => void;
  companyName: string;
}

export default function GuideNav({ sections, activeSection, onNavigate, companyName }: GuideNavProps) {
  return (
    <nav className="w-64 bg-boost-purple flex flex-col h-screen sticky top-0">
      {/* Logo area */}
      <div className="p-5 border-b border-white/15">
        <BoostLogo height={24} color="#ffffff" className="mb-3" />
        <p className="text-xs text-white/60">Prepared for</p>
        <p className="text-sm font-medium text-white truncate">{companyName}</p>
      </div>

      {/* Section list */}
      <div className="flex-1 overflow-y-auto py-3 guide-scrollbar">
        {sections.map((section, idx) => (
          <button
            key={section.id}
            onClick={() => onNavigate(section.id)}
            className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-all group ${
              activeSection === section.id
                ? "bg-white/15 border-r-3 border-boost-green-light text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className={`text-base ${activeSection === section.id ? "opacity-100" : "opacity-50 group-hover:opacity-80"}`}>
              {section.icon}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-white/40">{String(idx + 1).padStart(2, "0")}</span>
              <p className="text-sm font-medium truncate">{section.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/15">
        <p className="text-[10px] text-white/40 text-center">
          Trust every conversation
        </p>
      </div>
    </nav>
  );
}
