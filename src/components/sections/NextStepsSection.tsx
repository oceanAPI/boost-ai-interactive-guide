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
      >
        {/* Deep layered background — matching Overview section */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 0%, rgba(89,25,93,0.5) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 80% 100%, rgba(32,130,105,0.25) 0%, transparent 60%),
              radial-gradient(ellipse 40% 30% at 10% 80%, rgba(54,181,149,0.1) 0%, transparent 60%),
              linear-gradient(180deg, #231528 0%, #1a1020 40%, #141118 100%)
            `,
          }}
        />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
          aria-hidden="true"
        />

        {/* Brand shapes */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={assetPath("/brand/boost_brandshape_white.svg")}
          alt=""
          className="absolute -top-4 -right-4 w-56 opacity-[0.02] pointer-events-none rotate-12"
          aria-hidden="true"
        />

        <div className="relative z-10 px-6 sm:px-10 py-12 sm:py-16">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assetPath("/brand/boost_logo-_negative.svg")}
              alt="boost.ai"
              className="h-6 w-auto opacity-70"
            />
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 text-center leading-snug max-w-lg mx-auto">
            Ready to get started?
          </h2>
          <p className="text-sm text-white/40 max-w-md mx-auto mb-12 text-center leading-relaxed">
            From this guide to production in 6–8 weeks. Here&apos;s how to take the next step.
          </p>

          {/* Action cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {/* Schedule Demo */}
            <div className="rounded-xl p-5 text-left bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] transition-colors">
              <div className="w-9 h-9 rounded-lg bg-boost-green-light/15 flex items-center justify-center mb-4">
                <BoostIcon name="headset" variant="white" size={18} />
              </div>
              <h3 className="font-semibold text-sm text-white mb-1.5">Schedule a Demo</h3>
              <p className="text-[11px] text-white/40 leading-relaxed">
                A live walkthrough tailored to {guide.company_name || "your"} use cases and volumes.
              </p>
            </div>

            {/* Technical Deep-Dive */}
            <div className="rounded-xl p-5 text-left bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] transition-colors">
              <div className="w-9 h-9 rounded-lg bg-boost-purple/20 flex items-center justify-center mb-4">
                <BoostIcon name="cogs" variant="white" size={18} />
              </div>
              <h3 className="font-semibold text-sm text-white mb-1.5">Technical Deep-Dive</h3>
              <p className="text-[11px] text-white/40 leading-relaxed">
                Architecture review covering integration, security, and deployment specifics.
              </p>
            </div>

            {/* Share Guide */}
            <button
              onClick={handleCopy}
              className="rounded-xl p-5 text-left bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-white/[0.08] flex items-center justify-center mb-4">
                {copied ? (
                  <svg className="w-4 h-4 text-boost-green-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <BoostIcon name="desktop-network" variant="white" size={18} />
                )}
              </div>
              <h3 className="font-semibold text-sm text-white mb-1.5">
                {copied ? "Link Copied!" : "Share This Guide"}
              </h3>
              <p className="text-[11px] text-white/40 leading-relaxed">
                Send this interactive guide to stakeholders in your organisation.
              </p>
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-3 mt-12">
            <span className="w-8 h-px bg-white/10" />
            <p className="text-white/20 text-[10px] tracking-widest uppercase">Trust every conversation</p>
            <span className="w-8 h-px bg-white/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
