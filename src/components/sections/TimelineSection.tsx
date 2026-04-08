"use client";

import type { GuideData } from "@/lib/types";
import { getTimeline } from "@/data/guide-content";

const PHASE_COLORS = [
  { dot: "bg-boost-green-light", num: "bg-boost-green-light text-white" },
  { dot: "bg-boost-purple", num: "bg-boost-purple text-white" },
  { dot: "bg-boost-pink", num: "bg-boost-pink text-white" },
  { dot: "bg-boost-orange", num: "bg-boost-orange text-white" },
];

export default function TimelineSection({ guide }: { guide: GuideData }) {
  const timeline = getTimeline(guide.company_name);

  return (
    <section className="section-enter">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-boost-dark mb-2">From Signed Contract to Live in 8 Weeks</h2>
        <p className="text-boost-muted">
          boost.ai&apos;s fastest-to-value deployment methodology — proven across 50+ financial services clients
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {timeline.map((phase, idx) => {
          const color = PHASE_COLORS[idx];
          return (
            <div key={idx} className="relative">
              {idx < timeline.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-4 h-0.5 bg-boost-border z-0" />
              )}

              <div className="bg-white border border-boost-border rounded-xl p-5 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`w-8 h-8 rounded-full ${color.num} flex items-center justify-center font-bold text-sm`}>
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-xs text-boost-muted">{phase.weeks}</p>
                    <h3 className="text-boost-dark font-semibold text-sm">{phase.title}</h3>
                  </div>
                </div>

                <ul className="space-y-2">
                  {phase.tasks.map((task, taskIdx) => (
                    <li key={taskIdx} className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${color.dot} mt-1.5 flex-shrink-0`} />
                      <span className="text-xs text-boost-muted leading-relaxed">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-boost-green-light/10 border border-boost-green-light/20 rounded-xl text-center">
        <p className="text-sm text-boost-green">
          boost.ai&apos;s pre-built intent library and no-code agent builder dramatically accelerates deployment vs. any competitor.
        </p>
      </div>
    </section>
  );
}
