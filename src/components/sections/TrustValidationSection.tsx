"use client";

import { useState, useEffect, useRef } from "react";
import type { GuideData } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { assetPath } from "@/lib/asset-path";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";

/* ─────────────────────────────────────────────────────────────────────
 *  Platform Credibility — "Why boost.ai"
 *
 *  Three zones:
 *    1. Big animated hero stats (250M conversations, 500+ deployments)
 *    2. World map with animated expansion markers per milestone year
 *    3. Interactive proof cards (certifications, coverage, analyst)
 * ───────────────────────────────────────────────────────────────────── */

/* ─── Map deployment markers per milestone ─── */
interface MapMarker {
  x: number; // % from left
  y: number; // % from top
  label: string;
  size?: "sm" | "md" | "lg";
}

interface Milestone {
  year: string;
  label: string;
  markers: MapMarker[];
}

const MILESTONES: Milestone[] = [
  {
    year: "2016", label: "Founded in Norway",
    markers: [
      { x: 51.5, y: 22, label: "Stavanger", size: "lg" },
    ],
  },
  {
    year: "2019", label: "Nordic scale",
    markers: [
      { x: 53, y: 20, label: "Stockholm" },
      { x: 51, y: 19, label: "Oslo" },
      { x: 52, y: 24, label: "Copenhagen" },
      { x: 55, y: 18, label: "Helsinki" },
      { x: 42, y: 17, label: "Reykjavík" },
    ],
  },
  {
    year: "2021", label: "Global expansion",
    markers: [
      { x: 49, y: 28, label: "London", size: "md" },
      { x: 28, y: 33, label: "New York", size: "md" },
      { x: 51, y: 30, label: "Frankfurt" },
      { x: 49.5, y: 30, label: "Paris" },
      { x: 52, y: 28, label: "Amsterdam" },
    ],
  },
  {
    year: "2023", label: "GenAI + compliance",
    markers: [
      { x: 25, y: 36, label: "Washington DC" },
      { x: 47, y: 30, label: "Dublin" },
      { x: 54, y: 32, label: "Zurich" },
      { x: 45, y: 35, label: "Lisbon" },       // Portugal
      { x: 47, y: 34, label: "Madrid" },       // Spain
      { x: 53, y: 33, label: "Rome" },         // Italy
      { x: 50.5, y: 30, label: "Brussels" },   // Belgium
    ],
  },
  {
    year: "2024", label: "Voice AI",
    markers: [
      { x: 22, y: 30, label: "Toronto" },
      { x: 56, y: 27, label: "Tallinn" },
      { x: 55, y: 25, label: "Riga" },
    ],
  },
  {
    year: "2025", label: "Agentic platform · global reach",
    markers: [
      { x: 73, y: 55, label: "Singapore", size: "md" },
      { x: 82, y: 67, label: "Sydney" },
      { x: 67, y: 38, label: "Dubai" },
      { x: 54, y: 30, label: "Ljubljana" },    // Slovenia
      { x: 54, y: 28, label: "Vienna" },       // Austria
      { x: 55, y: 27, label: "Warsaw" },       // Poland
      { x: 58, y: 33, label: "Istanbul" },     // Turkey
      { x: 22, y: 44, label: "Mexico City" },  // Mexico
      { x: 68, y: 44, label: "Mumbai" },       // India
    ],
  },
];

/* ─── World map component ─── */
/* Real SVG map as background image, deployment dots overlaid */
function WorldMap({ visibleStep }: { visibleStep: number }) {
  const activeMarkers: (MapMarker & { step: number })[] = [];
  MILESTONES.forEach((m, i) => {
    if (i <= visibleStep) {
      m.markers.forEach((marker) => activeMarkers.push({ ...marker, step: i }));
    }
  });

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-boost-surface/30" style={{ aspectRatio: "2.2 / 1" }}>
      {/* Real world map SVG — rendered as background with boost-purple tint */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={assetPath("/images/world-map.svg")}
        alt=""
        className="absolute inset-0 w-full h-full object-contain opacity-[0.12]"
        style={{ filter: "hue-rotate(260deg) saturate(0.3)" }}
        aria-hidden="true"
      />

      {/* Deployment markers */}
      {activeMarkers.map((marker, i) => {
        const size = marker.size === "lg" ? 10 : marker.size === "md" ? 7 : 5;
        const isLatest = marker.step === visibleStep;

        return (
          <div
            key={`${marker.label}-${i}`}
            className="absolute transition-opacity"
            style={{
              left: `${marker.x}%`,
              top: `${marker.y}%`,
              transform: "translate(-50%, -50%)",
              opacity: 1,
              transitionDuration: "600ms",
              transitionTimingFunction: "ease-out",
            }}
          >
            {isLatest && (
              <span
                className="absolute rounded-full bg-boost-green-light/20 animate-ping"
                style={{
                  width: `${size * 3}px`,
                  height: `${size * 3}px`,
                  left: `${-size}px`,
                  top: `${-size}px`,
                }}
              />
            )}
            <div
              className="rounded-full bg-boost-green-light"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                boxShadow: `0 0 ${size * 2}px rgba(54, 181, 149, 0.4)`,
              }}
            />
          </div>
        );
      })}

      {/* Step label */}
      <div className="absolute bottom-3 left-4 flex items-center gap-2">
        <span className="text-[10px] text-boost-dark font-semibold tabular-nums">
          {MILESTONES[visibleStep]?.year}
        </span>
        <span className="text-[10px] text-boost-muted">
          {MILESTONES[visibleStep]?.label}
        </span>
      </div>
    </div>
  );
}

/* ─── Proof cards ─── */
const PROOF_CARDS = [
  {
    key: "certifications",
    title: "Certifications & compliance",
    items: [
      { label: "ISO 27001", detail: "Information security management — annually audited" },
      { label: "SOC 2 Type II", detail: "Service organisation controls — continuous monitoring" },
      { label: "GDPR compliant", detail: "EU data residency, DPA, right-to-erasure, audit access" },
      { label: "EU AI Act ready", detail: "High-risk AI system documentation and transparency" },
    ],
  },
  {
    key: "coverage",
    title: "Industry coverage",
    items: [
      { label: "Banking", detail: "60+ deployments — retail, corporate, neobank" },
      { label: "Insurance", detail: "40+ deployments — mutual, DTC, broker" },
      { label: "Pension", detail: "25+ deployments — occupational, private, fund" },
      { label: "Government", detail: "30+ deployments — public services, tax, welfare" },
      { label: "Telco & Energy", detail: "35+ deployments — billing, outage, service" },
    ],
  },
  {
    key: "recognition",
    title: "Analyst recognition",
    items: [
      { label: "Gartner", detail: "Recognised in Competitive Landscape for Enterprise Conversational AI" },
      { label: "Deloitte", detail: "Strategic partner for conversational AI in financial services" },
      { label: "Forrester", detail: "Cited for enterprise NLU accuracy and compliance-first architecture" },
    ],
  },
];

function ProofCards({ visible }: { visible: boolean }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {PROOF_CARDS.map((card, ci) => {
        const isExpanded = expanded === card.key;
        return (
          <div
            key={card.key}
            className="transition-all"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(10px)",
              transitionDuration: "500ms",
              transitionDelay: `${200 + ci * 120}ms`,
            }}
          >
            <button
              onClick={() => setExpanded(isExpanded ? null : card.key)}
              className="w-full text-left group"
            >
              <div className={`rounded-xl border p-4 transition-all ${
                isExpanded
                  ? "bg-white border-boost-border shadow-sm"
                  : "bg-boost-surface/50 border-transparent hover:border-boost-border/50"
              }`}>
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-boost-dark">{card.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-boost-muted tabular-nums">{card.items.length}</span>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={`text-boost-muted/40 group-hover:text-boost-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                <div
                  className="overflow-hidden transition-all"
                  style={{
                    maxHeight: isExpanded ? "400px" : "0px",
                    opacity: isExpanded ? 1 : 0,
                    transitionDuration: "300ms",
                  }}
                >
                  <div className="mt-3 pt-3 border-t border-boost-border/40 space-y-2.5">
                    {card.items.map((item) => (
                      <div key={item.label} className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-boost-green-light/60 shrink-0" />
                        <div>
                          <p className="text-[12px] font-medium text-boost-dark">{item.label}</p>
                          <p className="text-[11px] text-boost-muted leading-relaxed">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main section ─── */
export default function TrustValidationSection({ guide, sectionNumber }: { guide: GuideData; sectionNumber?: string }) {
  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal({ once: true });
  const { ref: mapRef, isVisible: mapVisible } = useScrollReveal({ once: true, threshold: 0.2 });
  const { ref: proofRef, isVisible: proofVisible } = useScrollReveal({ once: true });

  const convCount = useCountUp({ target: 250, enabled: heroVisible, duration: 2000 });
  const deployCount = useCountUp({ target: 500, enabled: heroVisible, duration: 1800 });

  /**
   * Timeline loop behaviour:
   *  1. When the map scrolls into view, land on the newest year first
   *     (MILESTONES[last]) — that's the most impressive, high-recency state.
   *  2. Pause ~1.5s so the user reads "where we are today".
   *  3. Slowly cycle through all years from oldest → newest and loop.
   *  4. Any click on a year freezes the cycle on that year — user wins.
   */
  const [activeStep, setActiveStep] = useState(MILESTONES.length - 1);
  const [userOverride, setUserOverride] = useState(false);
  const stepTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const startTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!mapVisible || userOverride) return;

    // Brief "show newest first" pause, then start the cycle from the beginning
    startTimerRef.current = setTimeout(() => {
      if (userOverride) return;
      let step = 0;
      setActiveStep(step);
      stepTimerRef.current = setInterval(() => {
        step = (step + 1) % MILESTONES.length;
        setActiveStep(step);
      }, 2500); // slow cycle — read-time per year
    }, 1500);

    return () => {
      clearTimeout(startTimerRef.current);
      clearInterval(stepTimerRef.current);
    };
  }, [mapVisible, userOverride]);

  const handleYearClick = (i: number) => {
    clearInterval(stepTimerRef.current);
    clearTimeout(startTimerRef.current);
    setUserOverride(true);
    setActiveStep(i);
  };

  return (
    <section>
      <SectionHeader
        number={sectionNumber ?? "07"}
        title="Platform Credibility"
        subtitle="Enterprise conversational AI, purpose-built for regulated industries"
      />

      {/* ── Zone 1: Hero stats ── */}
      <div ref={heroRef} className="mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 mb-6">
          <div
            className="transition-all"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(16px)",
              transitionDuration: "700ms",
            }}
          >
            <p className="text-5xl sm:text-6xl font-bold text-boost-dark tabular-nums leading-none">
              {convCount > 0 ? `${convCount}M` : "—"}
              <span className="text-boost-green-light text-3xl sm:text-4xl ml-1">+</span>
            </p>
            <p className="text-sm text-boost-muted mt-2">Automated conversations annually</p>
          </div>
          <div
            className="transition-all"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(16px)",
              transitionDuration: "700ms",
              transitionDelay: "200ms",
            }}
          >
            <p className="text-5xl sm:text-6xl font-bold text-boost-dark tabular-nums leading-none">
              {deployCount > 0 ? `${deployCount}` : "—"}
              <span className="text-boost-green-light text-3xl sm:text-4xl ml-1">+</span>
            </p>
            <p className="text-sm text-boost-muted mt-2">Enterprise deployments across 6 continents</p>
          </div>
        </div>
        <p
          className="text-boost-muted text-sm leading-relaxed max-w-xl transition-all"
          style={{ opacity: heroVisible ? 1 : 0, transitionDuration: "500ms", transitionDelay: "600ms" }}
        >
          Not a general-purpose chatbot retrofitted for enterprise. A platform engineered from
          the ground up for compliance-first organisations where hallucination isn&apos;t a quirk — it&apos;s
          a regulatory event.
        </p>
      </div>

      {/* ── Zone 2: World map with expansion timeline ── */}
      <div ref={mapRef} className="mb-10">
        <p className="text-[10px] font-bold text-boost-muted uppercase tracking-[0.15em] mb-3">
          Global expansion
        </p>
        <WorldMap visibleStep={activeStep} />

        {/* Year timeline strip below map */}
        <div className="flex items-center gap-1 mt-3">
          {MILESTONES.map((m, i) => (
            <button
              key={m.year}
              onClick={() => handleYearClick(i)}
              className={`flex-1 py-1.5 rounded text-center transition-all ${
                i <= activeStep
                  ? i === activeStep
                    ? "bg-boost-green-light/10 text-boost-green text-[11px] font-semibold"
                    : "text-boost-dark text-[10px] font-medium"
                  : "text-boost-muted/40 text-[10px]"
              }`}
            >
              {m.year}
            </button>
          ))}
        </div>
      </div>

      {/* ── Zone 3: Proof cards + quote ── */}
      <div ref={proofRef}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          <div>
            <p className="text-[10px] font-bold text-boost-muted uppercase tracking-[0.15em] mb-3 lg:mb-5">
              Trust signals
            </p>
            <ProofCards visible={proofVisible} />
          </div>

          <div
            className="transition-all"
            style={{
              opacity: proofVisible ? 1 : 0,
              transform: proofVisible ? "translateY(0)" : "translateY(10px)",
              transitionDuration: "500ms",
              transitionDelay: "400ms",
            }}
          >
            <p className="text-[10px] font-bold text-boost-muted uppercase tracking-[0.15em] mb-3 lg:mb-5">
              Industry voice
            </p>
            <blockquote className="rounded-xl bg-boost-purple/[0.03] border border-boost-purple/10 p-5">
              <p className="text-[13px] text-boost-dark leading-relaxed italic">
                &ldquo;boost.ai stands out for its enterprise-grade NLU accuracy and its ability to
                maintain compliance guardrails while leveraging generative AI — a combination
                few vendors achieve.&rdquo;
              </p>
              <footer className="mt-3 flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-boost-purple/10 flex items-center justify-center">
                  <span className="text-boost-purple text-[9px] font-bold">D</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-boost-dark">Deloitte Digital</p>
                  <p className="text-[10px] text-boost-muted">Conversational AI Market Assessment, 2024</p>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
