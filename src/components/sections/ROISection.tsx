"use client";

import { useState, useMemo } from "react";
import type { GuideData } from "@/lib/types";
import { getAgentsForGuide } from "@/data/agents";
import { calculateROI, detectCurrency, formatWithCurrency } from "@/lib/roi-calculator";
import { SectionHeader, StatCounter } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function ROISection({
  guide,
}: {
  guide: GuideData;
}) {
  const { ref, isVisible } = useScrollReveal({ once: true });

  // Default values from guide data
  const totalVolumeFromGuide = Object.values(guide.channel_volumes).reduce((s, v) => s + (v || 0), 0);
  const costFromGuide = parseFloat(guide.conversation_cost?.replace(/[^0-9.]/g, "") || "0");

  const agents = getAgentsForGuide(guide.areas_of_interest, guide.selected_variants);
  const avgRate = agents.length > 0
    ? Math.round(agents.reduce((s, a) => s + a.automationRate, 0) / agents.length)
    : 0;

  // Interactive slider state
  const [volume, setVolume] = useState(totalVolumeFromGuide || 10000);
  const [cost, setCost] = useState(costFromGuide || 8);
  const currency = detectCurrency(guide.conversation_cost);
  const fmt = (n: number) => formatWithCurrency(n, currency);

  const roi = useMemo(
    () => calculateROI({
      monthlyConversations: volume,
      costPerConversation: cost,
      pricingModel: guide.pricing_model || "fixed",
      automationRate: avgRate,
      markets: guide.deployment_markets || 1,
    }),
    [volume, cost, guide.pricing_model, avgRate, guide.deployment_markets],
  );

  const savingsBarWidth = roi.currentMonthlyCost > 0
    ? Math.round((roi.monthlySavings / roi.currentMonthlyCost) * 100)
    : 0;

  return (
    <section>
      <SectionHeader
        number="08"
        title="ROI Calculator"
        subtitle={`Projected return on investment for ${guide.company_name}`}
      />

      <div ref={ref} className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        {/* Interactive sliders */}
        <div className="bg-boost-surface rounded-xl border border-boost-border p-6 mb-6">
          <h3 className="text-sm font-semibold text-boost-dark mb-4">Adjust Your Numbers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-boost-muted">Monthly Conversations</label>
                <span className="text-sm font-bold text-boost-dark tabular-nums">{volume.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={500}
                max={200000}
                step={500}
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full accent-boost-green-light"
              />
              <div className="flex justify-between text-[10px] text-boost-muted mt-1">
                <span>500</span><span>200K</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-boost-muted">Cost per Conversation</label>
                <span className="text-sm font-bold text-boost-dark tabular-nums">${cost.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={1}
                max={25}
                step={0.5}
                value={cost}
                onChange={(e) => setCost(parseFloat(e.target.value))}
                className="w-full accent-boost-green-light"
              />
              <div className="flex justify-between text-[10px] text-boost-muted mt-1">
                <span>$1</span><span>$25</span>
              </div>
            </div>
          </div>
        </div>

        {/* Big savings number */}
        <div className="text-center mb-8">
          <p className="text-xs text-boost-muted uppercase tracking-wider mb-2">Projected Annual Savings</p>
          <div className="text-3xl sm:text-5xl md:text-6xl font-bold text-boost-green tabular-nums">
            {fmt(roi.annualSavings)}
          </div>
          <p className="text-sm text-boost-muted mt-2">
            {roi.roiPercentage}% cost reduction · Break-even in {roi.breakEvenMonths} month{roi.breakEvenMonths > 1 ? "s" : ""}
          </p>
        </div>

        {/* Before / After comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Before */}
          <div className="rounded-xl border border-boost-border bg-white p-5">
            <p className="text-xs text-boost-muted uppercase tracking-wider mb-3">Current State</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-boost-text-secondary">Monthly conversations</span>
                <span className="font-semibold text-boost-dark tabular-nums">{volume.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-boost-text-secondary">Cost per conversation</span>
                <span className="font-semibold text-boost-dark">${cost.toFixed(2)}</span>
              </div>
              <div className="border-t border-boost-border pt-3 flex justify-between items-center">
                <span className="text-sm font-medium text-boost-dark">Total monthly cost</span>
                <span className="font-bold text-lg text-boost-dark">{fmt(roi.currentMonthlyCost)}</span>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="rounded-xl border-2 border-boost-green-light/30 bg-boost-green-light/5 p-5">
            <p className="text-xs text-boost-green uppercase tracking-wider mb-3">With boost.ai</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-boost-text-secondary">Automated ({avgRate}%)</span>
                <span className="font-semibold text-boost-green tabular-nums">{roi.automatedConversations.toLocaleString()} @ ${roi.aiCostPerConversation}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-boost-text-secondary">Human handled</span>
                <span className="font-semibold text-boost-dark tabular-nums">{roi.humanConversations.toLocaleString()} @ ${cost.toFixed(2)}</span>
              </div>
              <div className="border-t border-boost-green-light/20 pt-3 flex justify-between items-center">
                <span className="text-sm font-medium text-boost-dark">New monthly cost</span>
                <span className="font-bold text-lg text-boost-green">{fmt(roi.newMonthlyCost)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost breakdown bar */}
        <div className="bg-white rounded-xl border border-boost-border p-5 mb-8">
          <p className="text-xs text-boost-muted uppercase tracking-wider mb-3">Monthly Cost Breakdown</p>
          <div className="h-8 rounded-full overflow-hidden bg-boost-surface flex">
            <div
              className="bg-boost-green-light/80 h-full transition-all duration-1000 flex items-center justify-center"
              style={{ width: `${100 - savingsBarWidth}%` }}
            >
              <span className="text-[10px] text-white font-medium px-2 truncate">
                New cost: {fmt(roi.newMonthlyCost)}
              </span>
            </div>
            <div
              className="bg-boost-green h-full transition-all duration-1000 flex items-center justify-center"
              style={{ width: `${savingsBarWidth}%` }}
            >
              <span className="text-[10px] text-white font-medium px-2 truncate">
                Savings: {fmt(roi.monthlySavings)}
              </span>
            </div>
          </div>
        </div>

        {/* Impact grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-boost-border p-4 text-center">
            <StatCounter value={roi.roiPercentage} suffix="%" label="Cost Reduction" color="green" size="md" />
          </div>
          <div className="bg-white rounded-xl border border-boost-border p-4 text-center">
            <StatCounter value={roi.fteEquivalent} suffix="" label="FTE Equivalent" color="purple" size="md" />
          </div>
          <div className="bg-white rounded-xl border border-boost-border p-4 text-center">
            <StatCounter value={roi.automatedConversations} suffix="" label="Automated / mo" color="green" size="sm" />
          </div>
          <div className="bg-white rounded-xl border border-boost-border p-4 text-center">
            <StatCounter value={roi.breakEvenMonths} suffix=" mo" label="Break-even" color="purple" size="md" />
          </div>
        </div>
      </div>
    </section>
  );
}
