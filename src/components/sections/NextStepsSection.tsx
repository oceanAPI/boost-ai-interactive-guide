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

  const steps = [
    {
      iconName: "headset",
      title: "Schedule a Demo",
      description: "See boost.ai in action with a live walkthrough tailored to your use cases.",
      action: "Book a demo",
      primary: true,
    },
    {
      iconName: "cogs",
      title: "Technical Deep-Dive",
      description: "Architecture review with our solutions engineers covering integration, security, and deployment.",
      action: "Request deep-dive",
      primary: false,
    },
    {
      iconName: "desktop-network",
      title: "Share This Guide",
      description: "Send this interactive guide to other stakeholders in your organization.",
      action: copied ? "Copied!" : "Copy link",
      primary: false,
      onClick: handleCopy,
    },
  ];

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
        {/* Brand shape decoration */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={assetPath("/brand/boost_brandshape_white.svg")}
          alt=""
          className="absolute top-6 right-10 w-40 opacity-[0.04] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 px-8 py-12 text-center">
          <div className="flex justify-center mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assetPath("/brand/boost_logo-_negative.svg")}
              alt="boost.ai"
              className="h-7 w-auto"
            />
          </div>

          <h2 className="text-xl sm:text-3xl font-bold text-white mb-3">
            Ready to transform {guide.company_name}&apos;s customer service?
          </h2>
          <p className="text-sm sm:text-base text-white/60 max-w-lg mx-auto mb-8 sm:mb-10">
            From this guide to production in 6-8 weeks. Let&apos;s discuss how boost.ai fits your specific needs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {steps.map((step) => (
              <button
                key={step.title}
                onClick={step.onClick}
                className={`rounded-xl p-5 text-left transition-all card-lift ${
                  step.primary
                    ? "bg-boost-green-light text-white"
                    : "bg-white/10 backdrop-blur-sm border border-white/20 text-white"
                }`}
              >
                <div className="mb-2">
                  <BoostIcon name={step.iconName} variant="white" size={28} />
                </div>
                <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                <p className={`text-xs mb-3 ${step.primary ? "text-white/80" : "text-white/50"}`}>
                  {step.description}
                </p>
                <span className={`text-xs font-semibold ${step.primary ? "text-white" : "text-boost-green-light"}`}>
                  {step.action}
                </span>
              </button>
            ))}
          </div>

          <p className="text-white/50 text-xs mt-8">Trust every conversation</p>
        </div>
      </div>
    </section>
  );
}
