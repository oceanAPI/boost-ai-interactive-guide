"use client";

import { useState } from "react";
import type { GuideData } from "@/lib/types";
import { assetPath } from "@/lib/asset-path";
import BoostIcon from "@/components/BoostIcon";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function NextStepsSection({
  guide,
}: {
  guide: GuideData;
}) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <section>
      <div
        ref={ref}
        className={`relative overflow-hidden rounded-2xl transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
        style={{
          background: "linear-gradient(135deg, #59195d 0%, #451149 40%, #208269 100%)",
        }}
      >
        {/* Subtle brand shape */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={assetPath("/brand/boost_brandshape_white.svg")}
          alt=""
          className="absolute -top-4 -right-4 w-56 opacity-[0.03] pointer-events-none rotate-12"
          aria-hidden="true"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={assetPath("/brand/boost_brandshape_white.svg")}
          alt=""
          className="absolute -bottom-8 -left-8 w-40 opacity-[0.03] pointer-events-none -rotate-45"
          aria-hidden="true"
        />

        <div className="relative z-10 px-6 sm:px-10 py-10 sm:py-14">
          {/* Section label */}
          <div className="flex items-center gap-2 mb-6 justify-center">
            <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">
              What&apos;s next
            </span>
            <span className="w-8 h-px bg-white/20" />
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assetPath("/brand/boost_logo-_negative.svg")}
              alt="boost.ai"
              className="h-6 w-auto opacity-80"
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 text-center">
            Ready to transform {guide.company_name}&apos;s customer experience?
          </h2>
          <p className="text-sm text-white/50 max-w-md mx-auto mb-10 text-center leading-relaxed">
            From this guide to production in 6–8 weeks.
          </p>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {/* Primary CTA — Schedule Demo (no link yet) */}
            <div className="group relative rounded-xl p-5 text-left bg-boost-green">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                  <BoostIcon name="headset" variant="white" size={20} />
                </div>
                <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Coming soon</span>
              </div>
              <h3 className="font-semibold text-sm text-white mb-1">Schedule a Demo</h3>
              <p className="text-xs text-white/70 leading-relaxed">
                See boost.ai in action — a live walkthrough tailored to your use cases.
              </p>
            </div>

            {/* Technical Deep-Dive (no link yet) */}
            <div className="group rounded-xl p-5 text-left bg-white/[0.07] border border-white/[0.1]">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <BoostIcon name="cogs" variant="white" size={20} />
                </div>
                <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Coming soon</span>
              </div>
              <h3 className="font-semibold text-sm text-white mb-1">Technical Deep-Dive</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Architecture review covering integration, security, and deployment.
              </p>
            </div>

            {/* Share This Guide */}
            <button
              onClick={handleCopy}
              className="group rounded-xl p-5 text-left transition-all duration-200 bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.1]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  {copied ? (
                    <svg className="w-5 h-5 text-boost-green-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <BoostIcon name="desktop-network" variant="white" size={20} />
                  )}
                </div>
                {copied ? (
                  <span className="text-[11px] text-boost-green-light font-medium">Copied!</span>
                ) : (
                  <svg className="w-4 h-4 text-white/30 group-hover:translate-x-0.5 group-hover:text-white/50 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                )}
              </div>
              <h3 className="font-semibold text-sm text-white mb-1">Share This Guide</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Send this interactive guide to stakeholders in your organization.
              </p>
            </button>
          </div>

          {/* Footer tagline */}
          <div className="flex items-center justify-center gap-3 mt-10">
            <span className="w-6 h-px bg-white/15" />
            <p className="text-white/30 text-[11px] tracking-wide">Trust every conversation</p>
            <span className="w-6 h-px bg-white/15" />
          </div>
        </div>
      </div>
    </section>
  );
}
