"use client";

import type { GuideData } from "@/lib/types";
import BoostLogo from "@/components/BoostLogo";
import SparkleDecoration from "@/components/SparkleDecoration";

export default function HeroSection({ guide }: { guide: GuideData }) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(to bottom, #59195d 0%, #59195d 40%, #3a2a5a 60%, #208269 85%, #36b595 100%)",
      }}
    >
      <div className="relative">
        <SparkleDecoration />
        <div className="relative z-10 text-center px-8 max-w-3xl mx-auto pt-16 pb-24">
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

          <p className="text-xl text-white/70 mt-6 leading-relaxed">
            Your AI-powered customer service transformation — from first contact to full resolution.
          </p>
        </div>

        {/* Stat boxes floating on the gradient transition */}
        <div className="relative z-10 flex items-center justify-center gap-4 -mt-8 pb-10">
          <div className="px-6 py-4 bg-white rounded-xl shadow-lg border border-white/20 text-center min-w-[140px]">
            <span className="text-boost-green font-bold text-3xl">80%+</span>
            <p className="text-xs text-boost-muted mt-1">Avg Automation</p>
          </div>
          <div className="px-6 py-4 bg-white rounded-xl shadow-lg border border-white/20 text-center min-w-[140px]">
            <span className="text-boost-green font-bold text-3xl">6-8</span>
            <p className="text-xs text-boost-muted mt-1">Weeks to Live</p>
          </div>
          <div className="px-6 py-4 bg-white rounded-xl shadow-lg border border-white/20 text-center min-w-[140px]">
            <span className="text-boost-green font-bold text-3xl">90%</span>
            <p className="text-xs text-boost-muted mt-1">Cost Reduction</p>
          </div>
        </div>
      </div>
    </section>
  );
}
