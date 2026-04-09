"use client";

import type { GuideData } from "@/lib/types";
import { CASE_STUDIES } from "@/data/case-studies";
import { SectionHeader, ExpandableCard, Badge, StatCounter } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function CaseStudiesSection({ guide }: { guide: GuideData }) {
  const { ref, isVisible } = useScrollReveal({ once: true });

  // Sort: matching industries first
  const sorted = [...CASE_STUDIES].sort((a, b) => {
    const aMatch = a.relevantIndustries.some((i) => guide.areas_of_interest.includes(i));
    const bMatch = b.relevantIndustries.some((i) => guide.areas_of_interest.includes(i));
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  return (
    <section>
      <SectionHeader
        number="06"
        title="Proven Results"
        subtitle="Real outcomes from financial services organizations using boost.ai"
      />

      <div ref={ref} className="space-y-4">
        {sorted.map((cs, i) => {
          const isRelevant = cs.relevantIndustries.some((ind) => guide.areas_of_interest.includes(ind));

          return (
            <div
              key={cs.id}
              className={`transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <ExpandableCard
                title={cs.companyDescription}
                preview={`${cs.results[0].metric}: ${cs.results[0].value} · ${cs.timeline}`}
                icon={
                  <div className="flex items-center gap-1.5">
                    <Badge variant={isRelevant ? "green" : "muted"} size="sm">{cs.companyType}</Badge>
                    {isRelevant && <Badge variant="green" size="sm">Relevant</Badge>}
                  </div>
                }
              >
                <div className="space-y-4">
                  {/* Challenge & Solution */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-boost-muted uppercase mb-1">Challenge</p>
                      <p className="text-sm text-boost-text-secondary leading-relaxed">{cs.challenge}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-boost-muted uppercase mb-1">Solution</p>
                      <p className="text-sm text-boost-text-secondary leading-relaxed">{cs.solution}</p>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {cs.results.map((r) => (
                      <div key={r.metric} className="bg-boost-green-light/5 rounded-lg p-3 text-center border border-boost-green-light/15">
                        <p className="text-lg font-bold text-boost-green">{r.value}</p>
                        <p className="text-[11px] text-boost-muted">{r.metric}</p>
                        {r.improvement && (
                          <p className="text-[10px] text-boost-green-light mt-0.5">{r.improvement}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Quote */}
                  {cs.quote && (
                    <div className="bg-boost-purple/5 rounded-lg p-4 border-l-4 border-boost-purple">
                      <p className="text-sm text-boost-text-secondary italic leading-relaxed">
                        &ldquo;{cs.quote.text}&rdquo;
                      </p>
                      <p className="text-xs text-boost-muted mt-2">
                        — {cs.quote.author}, {cs.quote.role}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-boost-muted">⏱️ {cs.timeline}</p>
                </div>
              </ExpandableCard>
            </div>
          );
        })}
      </div>
    </section>
  );
}
