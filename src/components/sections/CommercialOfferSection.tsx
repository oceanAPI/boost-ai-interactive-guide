"use client";

import { useState, useMemo } from "react";
import type { GuideData } from "@/lib/types";
import type { PricingModel } from "@/lib/types";
import { getAgentsForGuide } from "@/data/agents";
import { calculateROI, resolveCurrency, formatWithCurrency } from "@/lib/roi-calculator";
import { calculatePricing, calculateResourcePlan, formatUSD, type PricingConfig } from "@/lib/pricing-calculator";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

/* ─────────────────────────────────────────────────────────────────────
 *  Commercial Offer — "Your investment, your terms"
 *
 *  NOT a generic 3-column pricing table. Reflects what the AE already
 *  selected in admin (pricing model: fixed/usage/outcome) and presents
 *  a focused, personalised proposal with ROI context.
 *
 *  The selected model is the hero. Alternatives are collapsed under
 *  progressive disclosure. Investment breakdown is a table (tables are
 *  more trustworthy than cards for pricing). An ROI aside connects
 *  back to the calculator section.
 * ───────────────────────────────────────────────────────────────────── */

/* ─── Pricing model details ─── */
interface ModelDetail {
  key: PricingModel;
  name: string;
  tagline: string;
  description: string;
  priceLabel: string;
  bestFor: string;
}

const MODELS: ModelDetail[] = [
  {
    key: "fixed",
    name: "Fixed Price",
    tagline: "Predictable costs, unlimited scale",
    description:
      "A flat monthly platform fee based on expected volume tier. No per-conversation charges. Ideal for organisations that want budget certainty and plan to scale aggressively — the more you automate, the lower your effective cost.",
    priceLabel: "Monthly platform fee",
    bestFor: "High-volume operations wanting budget certainty",
  },
  {
    key: "usage",
    name: "Pay by Usage",
    tagline: "Scale up, scale down — commit for a discount",
    description:
      "Per-conversation pricing that tracks actual month-to-month usage. Commit to a monthly baseline and unlock up to 10%+ off your per-conversation rate; anything above the baseline is charged at the standard rate. Best for organisations that want flexibility and reward for planning ahead.",
    priceLabel: "Per conversation · commit for discount",
    bestFor: "Variable volumes that can commit to a baseline",
  },
  {
    key: "outcome",
    name: "Pay by Outcome",
    tagline: "We succeed when you succeed",
    description:
      "Pricing tied to successfully resolved conversations. You only pay when the AI delivers a confirmed resolution — no charge for handovers or abandoned sessions. The strongest alignment between platform cost and business value.",
    priceLabel: "Per resolved conversation",
    bestFor: "Outcome-driven organisations wanting shared accountability",
  },
];

/* ─── Investment line items ─── */
const INVESTMENT_LINES = [
  {
    category: "Platform",
    items: [
      { label: "Platform license", detail: "NLU engine, orchestrator, analytics, guardrails", included: true },
      { label: "Knowledge base", detail: "Managed knowledge layer with version control", included: true },
      { label: "Unlimited AI trainers", detail: "No per-seat charges for your team", included: true },
    ],
  },
  {
    category: "Implementation",
    items: [
      { label: "Onboarding & setup", detail: "Environment provisioning, SSO, integrations", included: true },
      { label: "Agent design workshop", detail: "Collaborative session to map your conversation flows", included: true },
      { label: "Knowledge import", detail: "Migration of existing FAQ, scripts, and training data", included: true },
    ],
  },
  {
    category: "Ongoing",
    items: [
      { label: "Customer success manager", detail: "Dedicated CSM with quarterly business reviews", included: true },
      { label: "Platform updates", detail: "Continuous improvements, new features, security patches", included: true },
      { label: "Technical support", detail: "Business-hours support with priority SLA", included: true },
    ],
  },
  {
    category: "Optional add-ons",
    items: [
      { label: "Voice AI channel", detail: "Conversational voice agent with IVR replacement", included: false },
      { label: "Additional markets", detail: "Multi-language, multi-region deployment", included: false },
      { label: "Premium SLA", detail: "24/7 support, 99.9% uptime guarantee, dedicated infra", included: false },
    ],
  },
];

/* ─── 2026 Invoice view ─────────────────────────────────────────────
 *  Rendered when `guide.pricing_config` is present. Line-item invoice
 *  pulled from the same CSV the revenue team uses internally. This
 *  isn't a marketing cards view — it's the deal as scoped. Monthly +
 *  annual totals at the bottom. Groups: Platform / Usage / Add-ons. */
function pricingConfigHasContent(cfg?: PricingConfig): boolean {
  if (!cfg) return false;
  return Boolean(
    cfg.chat_va_external || cfg.chat_va_internal || cfg.voice_va ||
    cfg.chat_expected_monthly || cfg.voice_expected_monthly ||
    cfg.success_package && cfg.success_package !== "none" ||
    (cfg.environments?.length ?? 0) > 0 ||
    cfg.human_chat_enabled || cfg.van_enabled ||
    Object.values(cfg.integrations_by_tier ?? {}).some((n) => (n ?? 0) > 0),
  );
}

function InvoiceBlock({ guide }: { guide: GuideData }) {
  const cfg = guide.pricing_config;
  if (!cfg) return null;
  const invoice = calculatePricing(cfg);
  const groups: Array<{ title: string; lines: typeof invoice.platform }> = [
    { title: "Platform subscriptions",       lines: invoice.platform },
    { title: "Usage (chat + voice)",         lines: invoice.usage },
    { title: "Add-ons & services",           lines: invoice.addons },
  ];
  const totalAnnual = invoice.annualTotal;

  return (
    <div className="rounded-xl border border-boost-border bg-white mb-10 overflow-hidden">
      <div className="px-6 py-4 bg-boost-surface/60 border-b border-boost-border flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <p className="text-[10px] font-bold text-boost-purple uppercase tracking-[0.15em]">
            Your invoice — per 2026 pricing
          </p>
          <h3 className="text-lg font-bold text-boost-dark mt-0.5">
            Line-item breakdown in USD
          </h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-boost-muted uppercase tracking-[0.15em]">
            Annual
          </p>
          <p className="text-2xl font-bold text-boost-dark">{formatUSD(totalAnnual)}</p>
          <p className="text-[11px] text-boost-muted">{formatUSD(invoice.monthlyTotal)} / month</p>
        </div>
      </div>
      <div className="divide-y divide-boost-border">
        {groups.map((g) => g.lines.length === 0 ? null : (
          <div key={g.title} className="px-6 py-4">
            <p className="text-[10px] font-bold text-boost-muted uppercase tracking-[0.15em] mb-2">
              {g.title}
            </p>
            <div className="space-y-1.5">
              {g.lines.map((l, i) => (
                <div key={i} className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-boost-dark">{l.label}</p>
                    {l.detail && <p className="text-[11px] text-boost-muted">{l.detail}</p>}
                  </div>
                  <p className="text-[13px] font-semibold text-boost-dark whitespace-nowrap">
                    {formatUSD(l.monthly)}<span className="text-[10px] text-boost-muted font-normal"> / mo</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-3 bg-boost-surface/60 border-t border-boost-border flex items-baseline justify-between">
        <p className="text-[11px] text-boost-muted">
          {invoice.chatTier && <>Chat lands in <span className="text-boost-dark font-semibold">{invoice.chatTier.name}</span> · ${invoice.chatTier.pricePerConversation.toFixed(2)}/conv. </>}
          {invoice.voiceTier && <>Voice lands in <span className="text-boost-dark font-semibold">{invoice.voiceTier.name}</span>.</>}
        </p>
        <p className="text-[13px] font-bold text-boost-dark">
          Monthly total: {formatUSD(invoice.monthlyTotal)}
        </p>
      </div>
    </div>
  );
}

/* ─── Resource plan block ──────────────────────────────────────────
 *  Per-role hours + implementation cost, plus a summary of the
 *  ongoing monthly (platform + usage + success package). Scales
 *  with the same complexity inputs that stretch the roadmap phases,
 *  so the two views tell one story. */
function ResourcePlanBlock({ guide }: { guide: GuideData }) {
  const cfg = guide.pricing_config;
  const ig = guide.integrations ?? {};
  const integrationCount =
    (ig.channel?.length || 0) +
    (ig.human_handover?.length || 0) +
    (ig.openid?.length || 0) +
    (ig.utility?.length || 0) +
    (ig.voice?.length || 0);
  const teamSize =
    (guide.resources?.stakeholder_owners || 0) +
    (guide.resources?.ai_trainers || 0) +
    (guide.resources?.technical_resources || 0);
  const bundledSuccess = !!(cfg?.success_package && cfg.success_package !== "none");

  const plan = calculateResourcePlan({
    deployment_markets: guide.deployment_markets,
    integration_count: integrationCount,
    customer_team_size: teamSize,
    bundled_success_package: bundledSuccess,
  });

  // Ongoing monthly from the pricing invoice (platform + usage + add-ons).
  const ongoingMonthly = cfg ? calculatePricing(cfg).monthlyTotal : 0;

  return (
    <div className="rounded-xl border border-boost-border bg-white mb-10 overflow-hidden">
      <div className="px-6 py-4 bg-boost-surface/60 border-b border-boost-border flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <p className="text-[10px] font-bold text-boost-green uppercase tracking-[0.15em]">
            Implementation resource plan
          </p>
          <h3 className="text-lg font-bold text-boost-dark mt-0.5">
            Who does the work · hours · one-time cost
          </h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-boost-muted uppercase tracking-[0.15em]">
            Complexity factor
          </p>
          <p className="text-[14px] font-bold text-boost-dark">
            ×{plan.complexityMultiplier.toFixed(2)}
          </p>
          <p className="text-[10px] text-boost-muted">markets · integrations · team</p>
        </div>
      </div>

      {/* Role table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-[10px] font-bold text-boost-muted uppercase tracking-[0.12em] border-b border-boost-border">
              <th className="text-left px-6 py-2.5">Role</th>
              <th className="text-right px-3 py-2.5">Rate</th>
              <th className="text-right px-3 py-2.5">Hours</th>
              <th className="text-right px-3 py-2.5 hidden md:table-cell">Disc.</th>
              <th className="text-right px-3 py-2.5 hidden md:table-cell">Build</th>
              <th className="text-right px-3 py-2.5 hidden md:table-cell">Pilot</th>
              <th className="text-right px-3 py-2.5 hidden md:table-cell">Scale</th>
              <th className="text-right px-6 py-2.5">Cost</th>
            </tr>
          </thead>
          <tbody>
            {plan.lines.map((l) => (
              <tr key={l.role.key} className="border-b border-boost-border/50 last:border-0">
                <td className="px-6 py-3">
                  <p className="text-boost-dark font-semibold">{l.role.label}</p>
                  <p className="text-[11px] text-boost-muted">{l.role.blurb}</p>
                </td>
                <td className="text-right px-3 py-3 text-boost-muted tabular-nums">
                  ${l.role.hourlyRateUSD}/h
                </td>
                <td className="text-right px-3 py-3 text-boost-dark tabular-nums">
                  {l.hours}
                </td>
                <td className="text-right px-3 py-3 hidden md:table-cell text-boost-muted tabular-nums">{l.phaseHours.Discovery}</td>
                <td className="text-right px-3 py-3 hidden md:table-cell text-boost-muted tabular-nums">{l.phaseHours.Build}</td>
                <td className="text-right px-3 py-3 hidden md:table-cell text-boost-muted tabular-nums">{l.phaseHours.Pilot}</td>
                <td className="text-right px-3 py-3 hidden md:table-cell text-boost-muted tabular-nums">{l.phaseHours.Scale}</td>
                <td className="text-right px-6 py-3 text-boost-dark font-semibold tabular-nums">
                  {l.cost > 0
                    ? formatUSD(l.cost)
                    : <span className="text-boost-muted font-normal italic">in Success Pkg</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals — implementation one-time + ongoing monthly */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-boost-border border-t border-boost-border">
        <div className="px-6 py-4">
          <p className="text-[10px] font-bold text-boost-muted uppercase tracking-[0.15em]">
            Implementation · one-time
          </p>
          <p className="text-2xl font-bold text-boost-purple mt-1">
            {formatUSD(plan.implementationTotal)}
          </p>
          <p className="text-[11px] text-boost-muted mt-0.5">
            Across Discovery · Build · Pilot · Scale
          </p>
        </div>
        <div className="px-6 py-4">
          <p className="text-[10px] font-bold text-boost-muted uppercase tracking-[0.15em]">
            Ongoing · monthly after go-live
          </p>
          <p className="text-2xl font-bold text-boost-green mt-1">
            {ongoingMonthly > 0 ? formatUSD(ongoingMonthly) : "—"}
          </p>
          <p className="text-[11px] text-boost-muted mt-0.5">
            Platform + usage + {bundledSuccess ? "Success Package" : "add-ons"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main section ─── */
export default function CommercialOfferSection({ guide, sectionNumber }: { guide: GuideData; sectionNumber?: string }) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [showAlternatives, setShowAlternatives] = useState(false);

  const selectedKey = guide.pricing_model || "fixed";
  const selectedModel = MODELS.find((m) => m.key === selectedKey) ?? MODELS[0];
  const alternativeModels = MODELS.filter((m) => m.key !== selectedKey);

  // ROI context
  const totalVolume = Object.values(guide.channel_volumes).reduce((s, v) => s + (v || 0), 0);
  const costNum = parseFloat(guide.conversation_cost?.replace(/[^0-9.]/g, "") || "0");
  const agents = getAgentsForGuide(guide.areas_of_interest, guide.selected_variants);
  const avgRate = agents.length > 0
    ? Math.round(agents.reduce((s, a) => s + a.automationRate, 0) / agents.length)
    : 80;

  const currency = resolveCurrency(guide.currency, guide.conversation_cost);
  const roi = useMemo(
    () =>
      calculateROI({
        monthlyConversations: totalVolume || 10000,
        costPerConversation: costNum || 8,
        pricingModel: selectedKey,
        automationRate: avgRate,
        markets: guide.deployment_markets || 1,
        currency,
      }),
    [totalVolume, costNum, selectedKey, avgRate, guide.deployment_markets, currency],
  );

  const formatCurrency = (n: number) => formatWithCurrency(n, currency);

  return (
    <section>
      <SectionHeader
        number={sectionNumber ?? "10"}
        title="Commercial Offer"
        subtitle={`Platform investment tailored to ${guide.company_name || "your organisation"}`}
      />

      <div ref={ref}>
        {/* ── Line-item invoice (2026 pricing) ── */}
        {pricingConfigHasContent(guide.pricing_config) && <InvoiceBlock guide={guide} />}

        {/* ── Implementation resource plan ── */}
        {pricingConfigHasContent(guide.pricing_config) && <ResourcePlanBlock guide={guide} />}

        {/* ── Selected pricing model (hero treatment) ── */}
        <div
          className="rounded-xl border border-boost-border bg-white p-6 sm:p-8 mb-6 transition-all"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(12px)",
            transitionDuration: "600ms",
          }}
        >
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-[10px] font-bold text-boost-green uppercase tracking-[0.15em] mb-1.5">
                Selected model
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-boost-dark">
                {selectedModel.name}
              </h3>
              <p className="text-sm text-boost-muted mt-1">{selectedModel.tagline}</p>
            </div>
            <span className="shrink-0 px-3 py-1.5 rounded-lg bg-boost-green-light/8 border border-boost-green-light/15 text-[11px] font-semibold text-boost-green">
              {selectedModel.priceLabel}
            </span>
          </div>

          <p className="text-sm text-boost-text-secondary leading-relaxed max-w-2xl mb-5">
            {selectedModel.description}
          </p>

          <p className="text-[11px] text-boost-muted">
            Best for: <span className="text-boost-dark font-medium">{selectedModel.bestFor}</span>
          </p>
        </div>

        {/* ── Alternative models (collapsed by default) ── */}
        <div className="mb-10">
          <button
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="text-[12px] text-boost-muted hover:text-boost-dark transition-colors flex items-center gap-1.5"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform ${showAlternatives ? "rotate-90" : ""}`}
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
            {showAlternatives ? "Hide" : "Compare"} alternative pricing models
          </button>

          {showAlternatives && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {alternativeModels.map((model) => (
                <div
                  key={model.key}
                  className="rounded-lg border border-boost-border/60 bg-boost-surface/30 p-5"
                >
                  <p className="text-[10px] font-bold text-boost-muted uppercase tracking-[0.15em] mb-1">
                    Alternative
                  </p>
                  <h4 className="text-base font-semibold text-boost-dark mb-1">
                    {model.name}
                  </h4>
                  <p className="text-[12px] text-boost-muted leading-relaxed mb-3">
                    {model.tagline}
                  </p>
                  <p className="text-[11px] text-boost-muted">
                    Best for: <span className="text-boost-dark">{model.bestFor}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Investment breakdown ── */}
        <div
          className="transition-all"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(12px)",
            transitionDuration: "600ms",
            transitionDelay: "200ms",
          }}
        >
          <p className="text-[10px] font-bold text-boost-muted uppercase tracking-[0.15em] mb-5">
            What&apos;s included
          </p>

          <div className="space-y-6">
            {INVESTMENT_LINES.map((group) => (
              <div key={group.category}>
                <p className="text-xs font-semibold text-boost-dark mb-2.5">
                  {group.category}
                </p>
                <div className="space-y-0">
                  {group.items.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 py-2.5 border-b border-boost-border/40 last:border-0"
                    >
                      {/* Included indicator */}
                      <span className="mt-0.5 shrink-0">
                        {item.included ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-boost-green-light">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span className="inline-block w-3.5 h-3.5 text-center text-[10px] font-bold text-boost-muted/50">+</span>
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] ${item.included ? "text-boost-dark" : "text-boost-muted"}`}>
                          {item.label}
                        </p>
                        <p className="text-[11px] text-boost-muted/70 mt-0.5">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ROI context panel ── */}
        {(totalVolume > 0 || costNum > 0) && (
          <div
            className="mt-10 rounded-xl bg-boost-surface/50 p-5 sm:p-6 transition-all"
            style={{
              opacity: isVisible ? 1 : 0,
              transitionDuration: "600ms",
              transitionDelay: "400ms",
            }}
          >
            <p className="text-[10px] font-bold text-boost-muted uppercase tracking-[0.15em] mb-3">
              Estimated return
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <p className="text-2xl font-bold text-boost-green tabular-nums">
                  {formatCurrency(roi.annualSavings)}
                </p>
                <p className="text-[11px] text-boost-muted">Annual savings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-boost-dark tabular-nums">
                  {roi.roiPercentage}%
                </p>
                <p className="text-[11px] text-boost-muted">Cost reduction</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-boost-dark tabular-nums">
                  {roi.breakEvenMonths} mo
                </p>
                <p className="text-[11px] text-boost-muted">Break-even</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-boost-dark tabular-nums">
                  {roi.fteEquivalent}
                </p>
                <p className="text-[11px] text-boost-muted">FTE equivalent</p>
              </div>
            </div>
            <p className="text-[11px] text-boost-muted mt-4">
              Based on {(totalVolume || 10000).toLocaleString()} monthly conversations at{" "}
              {formatCurrency(costNum || 8)} per conversation. See the full interactive calculator for detailed modelling.
            </p>
          </div>
        )}

        {/* ── Contract terms (expandable) ── */}
        <details className="mt-8 group">
          <summary className="text-[12px] text-boost-muted hover:text-boost-dark cursor-pointer transition-colors flex items-center gap-1.5 list-none">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="transition-transform group-open:rotate-90"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
            Contract terms &amp; SLA commitments
          </summary>
          <div className="mt-4 space-y-3 text-[12px] text-boost-muted leading-relaxed max-w-xl">
            <p>
              <span className="font-medium text-boost-dark">Contract length:</span>{" "}
              12 or 24 months with annual renewal option. Volume tier adjustments at each anniversary.
            </p>
            <p>
              <span className="font-medium text-boost-dark">SLA:</span>{" "}
              99.5% uptime (standard), 99.9% (premium). Response time: 4 hours (standard), 1 hour (premium).
            </p>
            <p>
              <span className="font-medium text-boost-dark">Data residency:</span>{" "}
              EU (default), with US and APAC options. All data encrypted at rest and in transit. SOC 2 Type II and ISO 27001 certified.
            </p>
            <p>
              <span className="font-medium text-boost-dark">Exit terms:</span>{" "}
              Full data export in standard formats. 90-day transition support. No lock-in beyond the contract term.
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}
