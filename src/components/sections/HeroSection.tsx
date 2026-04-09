"use client";

import type { GuideData } from "@/lib/types";
import type { StakeholderRole } from "@/data/roles";
import BoostLogo from "@/components/BoostLogo";
import SparkleDecoration from "@/components/SparkleDecoration";
import { StatCounter } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const ROLE_SUBTITLES: Record<StakeholderRole, string> = {
  general: "Your AI-powered customer service transformation — from first contact to full resolution.",
  executive: "Strategic overview: projected ROI, proven results, and path to production.",
  cto: "Technical architecture, security posture, and integration depth for your stack.",
  vp_cx: "Customer experience impact — automation rates, CSAT improvements, and agent capabilities.",
  ops_manager: "Deployment planning, resource requirements, and integration roadmap.",
  ai_trainer: "Platform capabilities, agent building tools, and knowledge management workflows.",
};

function computeDynamicStats(guide: GuideData) {
  const totalVolume = Object.values(guide.channel_volumes).reduce((s, v) => s + (v || 0), 0);
  const costNum = parseFloat(guide.conversation_cost?.replace(/[^0-9.]/g, "") || "0");

  if (totalVolume > 0 && costNum > 0) {
    const automated = Math.round(totalVolume * 0.8);
    const savings = Math.round(automated * costNum * 0.85);
    return [
      { value: automated, suffix: "", label: "Conversations Automated / mo", prefix: "" },
      { value: savings, suffix: "", label: "Projected Monthly Savings", prefix: "$" },
      { value: 80, suffix: "%+", label: "Avg Automation Rate", prefix: "" },
    ];
  }

  return [
    { value: 80, suffix: "%+", label: "Avg Automation", prefix: "" },
    { value: 7, suffix: "", label: "Weeks to Live", prefix: "" },
    { value: 90, suffix: "%", label: "Cost Reduction", prefix: "" },
  ];
}

export default function HeroSection({
  guide,
  role = "general",
}: {
  guide: GuideData;
  role?: StakeholderRole;
}) {
  const { ref: statsRef, isVisible: statsVisible } = useScrollReveal({ once: true });
  const stats = computeDynamicStats(guide);
  const subtitle = ROLE_SUBTITLES[role] || ROLE_SUBTITLES.general;

  return (
    <section
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(to bottom, #59195d 0%, #59195d 40%, #3a2a5a 60%, #208269 85%, #36b595 100%)",
      }}
    >
      <div className="relative">
        <SparkleDecoration />
        <div className="relative z-10 text-center px-8 max-w-3xl mx-auto pt-16 pb-28">
          <div className="flex justify-center mb-8">
            <BoostLogo height={32} color="#ffffff" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            {guide.company_name}
          </h1>

          {guide.contact_name && (
            <p className="text-boost-green-light text-lg mb-2">
              Prepared for {guide.contact_name}
              {guide.contact_role && <span className="text-white/60"> — {guide.contact_role}</span>}
            </p>
          )}

          <p className="text-lg text-white/70 mt-6 leading-relaxed max-w-xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Stat boxes floating on the gradient transition */}
        <div ref={statsRef} className="relative z-10 flex items-center justify-center gap-4 -mt-16 pb-10 px-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="px-6 py-4 bg-white rounded-xl shadow-lg border border-white/20 text-center min-w-[140px] opacity-0 translate-y-4 transition-all duration-500"
              style={{
                opacity: statsVisible ? 1 : 0,
                transform: statsVisible ? "translateY(0)" : "translateY(16px)",
                transitionDelay: `${i * 120}ms`,
              }}
            >
              <StatCounter
                value={stat.value}
                suffix={stat.suffix}
                prefix={stat.prefix}
                label={stat.label}
                color="green"
                size="md"
              />
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center pb-6">
          <svg
            width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2"
            className="bounce opacity-40"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </section>
  );
}
