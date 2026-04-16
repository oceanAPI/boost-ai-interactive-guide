"use client";

import { useState } from "react";
import type { CoreComponentsContent } from "@/data/content";
import { CREDIBILITY_STATS } from "@/data/product-vision";
import { assetPath } from "@/lib/asset-path";

/* ─── Icon mapper — maps content icon keys to purple SVGs ─── */
const ICON_MAP: Record<string, string> = {
  "brain-circuit": "brain-integration.svg",
  flask: "flask.svg",
  headset: "headset.svg",
  "chart-bar": "bar-chart.svg",
  microscope: "bubble-in-the-tube-laboratory.svg",
};

function ComponentIcon({ icon, active }: { icon: string; active: boolean }) {
  const file = ICON_MAP[icon] || "cogs.svg";
  return (
    <div
      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
        active
          ? "bg-boost-green-light/15 shadow-lg shadow-boost-green-light/10 scale-110"
          : "bg-boost-surface"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={assetPath(`/icons/purple/${file}`)}
        alt=""
        className={`w-7 h-7 transition-all duration-500 ${active ? "scale-110" : "opacity-70"}`}
      />
    </div>
  );
}

/* ─── Feature check item with stagger animation ─── */
function FeatureItem({ text, index, active }: { text: string; index: number; active: boolean }) {
  return (
    <div
      className={`flex items-start gap-2.5 transition-all duration-400 ${
        active ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
      }`}
      style={{ transitionDelay: active ? `${index * 80}ms` : "0ms" }}
    >
      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-boost-green-light/15 flex items-center justify-center">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#36b595" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <span className="text-sm text-boost-text-secondary leading-relaxed">{text}</span>
    </div>
  );
}

/* ─── Credibility stat strip ─── */
function CredibilityBand() {
  return (
    <div className="mt-10 pt-8 border-t border-boost-border/60">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
        {CREDIBILITY_STATS.map((stat) => (
          <div key={stat.value} className="text-left">
            <p className="text-lg sm:text-xl font-bold text-boost-dark leading-none">
              {stat.value}
            </p>
            <p className="text-[11px] sm:text-xs text-boost-muted leading-tight mt-1.5">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main TodayTab ─── */
export default function TodayTab({ content }: { content: CoreComponentsContent }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = content.components[activeIdx];

  if (!content.components.length) return null;

  return (
    <div>
      {/* Tab row with icons */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
        {content.components.map((comp, i) => (
          <button
            key={comp.id}
            onClick={() => setActiveIdx(i)}
            className={`relative group flex flex-col items-center text-center px-2 py-4 sm:py-5 rounded-t-xl transition-all duration-300 ${
              i === activeIdx
                ? "bg-white shadow-sm z-10"
                : "bg-boost-surface/60 hover:bg-boost-surface"
            }`}
          >
            <ComponentIcon icon={comp.icon} active={i === activeIdx} />
            <p
              className={`mt-2.5 text-[11px] sm:text-xs font-semibold leading-tight transition-colors ${
                i === activeIdx ? "text-boost-dark" : "text-boost-muted group-hover:text-boost-dark"
              }`}
            >
              {comp.name}
            </p>
            <div
              className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition-all duration-300 ${
                i === activeIdx ? "bg-boost-green-light" : "bg-transparent"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Detail card — connected to tabs */}
      <div className="relative bg-white rounded-b-2xl border border-boost-border/50 border-t-0 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Left — identity + description */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-start gap-4">
                <ComponentIcon icon={active.icon} active={true} />
                <div>
                  <h3
                    className="text-lg font-bold text-boost-dark transition-all duration-300"
                    key={active.id + "-title"}
                  >
                    {active.name}
                  </h3>
                  <p className="text-xs font-semibold text-boost-green-light mt-0.5 tracking-wide uppercase">
                    {active.tagline}
                  </p>
                </div>
              </div>

              <p
                className="text-sm text-boost-text-secondary leading-relaxed"
                key={active.id + "-desc"}
              >
                {active.description}
              </p>

              {/* Mini stats strip */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-boost-purple/20 to-boost-green-light/20 flex items-center justify-center"
                    >
                      <span className="text-[8px] font-bold text-boost-purple">
                        {["AI", "NL", "ML"][i]}
                      </span>
                    </div>
                  ))}
                </div>
                <span className="text-[11px] text-boost-muted">
                  Powered by hybrid NLU + GenAI
                </span>
              </div>
            </div>

            {/* Right — features list */}
            <div className="lg:col-span-3">
              <div className="bg-boost-surface/40 rounded-xl p-5 sm:p-6">
                <p className="text-[10px] font-bold text-boost-muted uppercase tracking-widest mb-4">
                  Key Capabilities
                </p>
                <div className="space-y-3" key={active.id + "-features"}>
                  {active.features.map((feat, i) => (
                    <FeatureItem key={feat} text={feat} index={i} active={true} />
                  ))}
                </div>
              </div>

              {/* Connection context */}
              <div className="mt-4 flex items-center gap-2 text-xs text-boost-muted">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-boost-green-light"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                <span>
                  {activeIdx < content.components.length - 1
                    ? `Works seamlessly with ${content.components[activeIdx + 1].name}`
                    : `Complete platform — all components work together`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credibility band — the "9 years, 120% ARR" footer */}
      <CredibilityBand />
    </div>
  );
}
