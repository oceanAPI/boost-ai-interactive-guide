"use client";

import type { GuideData } from "@/lib/types";
import BoostLogo from "@/components/BoostLogo";
import SparkleDecoration from "@/components/SparkleDecoration";

export default function HeroSection({ guide }: { guide: GuideData }) {
  return (
    <section className="relative overflow-hidden rounded-2xl">
      {/* Purple top area */}
      <div className="relative min-h-[55vh] flex items-center justify-center bg-gradient-to-br from-boost-purple via-boost-purple-dark to-boost-purple-deeper">
        <SparkleDecoration />
        <div className="relative z-10 text-center px-8 max-w-3xl pb-16">
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
      </div>

      {/* Green band with stat boxes floating on top */}
      <div className="relative bg-gradient-to-b from-boost-green to-boost-green-light py-10">
        {/* Stat boxes */}
        <div className="relative z-10 flex items-center justify-center gap-4 -mt-20">
          <div className="px-6 py-4 bg-white rounded-xl shadow-lg border border-boost-border text-center min-w-[140px]">
            <span className="text-boost-green font-bold text-3xl">80%+</span>
            <p className="text-xs text-boost-muted mt-1">Avg Automation</p>
          </div>
          <div className="px-6 py-4 bg-white rounded-xl shadow-lg border border-boost-border text-center min-w-[140px]">
            <span className="text-boost-green font-bold text-3xl">6-8</span>
            <p className="text-xs text-boost-muted mt-1">Weeks to Live</p>
          </div>
          <div className="px-6 py-4 bg-white rounded-xl shadow-lg border border-boost-border text-center min-w-[140px]">
            <span className="text-boost-green font-bold text-3xl">90%</span>
            <p className="text-xs text-boost-muted mt-1">Cost Reduction</p>
          </div>
        </div>
      </div>
    </section>
  );
}
