"use client";

import BoostLogo from "@/components/BoostLogo";
import type { StakeholderRole } from "@/data/roles";
import { ROLE_DEFINITIONS } from "@/data/roles";

interface GuideNavProps {
  sections: { id: string; label: string; icon: string }[];
  activeSection: string;
  onNavigate: (id: string) => void;
  companyName: string;
  role: StakeholderRole;
  onRoleChange: (role: StakeholderRole) => void;
}

export default function GuideNav({
  sections,
  activeSection,
  onNavigate,
  companyName,
  role,
  onRoleChange,
}: GuideNavProps) {
  const activeIdx = sections.findIndex((s) => s.id === activeSection);
  const progress = sections.length > 0 ? Math.round(((activeIdx + 1) / sections.length) * 100) : 0;

  return (
    <nav className="guide-nav w-64 bg-boost-purple flex flex-col h-screen sticky top-0">
      {/* Logo area */}
      <div className="p-5 border-b border-white/15">
        <BoostLogo height={24} color="#ffffff" className="mb-3" />
        <p className="text-xs text-white/60">Prepared for</p>
        <p className="text-sm font-medium text-white truncate">{companyName}</p>
      </div>

      {/* Role selector */}
      <div className="px-3 py-3 border-b border-white/10 role-selector">
        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2 px-2">Viewing as</p>
        <div className="flex flex-wrap gap-1">
          {ROLE_DEFINITIONS.map((r) => (
            <button
              key={r.key}
              onClick={() => onRoleChange(r.key)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                role === r.key
                  ? "bg-boost-green-light text-white"
                  : "text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              {r.shortLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Section list */}
      <div className="flex-1 overflow-y-auto py-3 guide-scrollbar">
        {sections.map((section, idx) => {
          const isPast = idx < activeIdx;
          return (
            <button
              key={section.id}
              onClick={() => onNavigate(section.id)}
              className={`w-full text-left px-5 py-2.5 flex items-center gap-3 transition-all group ${
                activeSection === section.id
                  ? "bg-white/15 border-r-3 border-boost-green-light text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {/* Progress dot */}
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                activeSection === section.id
                  ? "bg-boost-green-light"
                  : isPast
                    ? "bg-boost-green-light/50"
                    : "bg-white/20"
              }`} />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-white/40">{String(idx + 1).padStart(2, "0")}</span>
                <p className="text-xs font-medium truncate">{section.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress footer */}
      <div className="p-4 border-t border-white/15">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-white/40">Progress</p>
          <p className="text-[10px] text-white/40">{progress}%</p>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-boost-green-light rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-white/30 text-center mt-3">
          Trust every conversation
        </p>
      </div>
    </nav>
  );
}
