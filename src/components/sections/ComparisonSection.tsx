"use client";

import { useState } from "react";
import { COMPARISON_TABLE } from "@/data/guide-content";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

function Cell({ value, detail }: { value: "yes" | "partial" | "no"; detail?: string }) {
  const [showDetail, setShowDetail] = useState(false);

  const icons = {
    yes: <span className="text-boost-green text-lg">✓</span>,
    partial: <span className="text-boost-orange text-lg">~</span>,
    no: <span className="text-boost-lavender text-lg">✗</span>,
  };

  return (
    <td
      className="px-4 py-3 text-center relative cursor-default"
      onMouseEnter={() => setShowDetail(true)}
      onMouseLeave={() => setShowDetail(false)}
    >
      {icons[value]}
      {detail && showDetail && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 px-3 py-2 bg-boost-dark text-white text-xs rounded-lg shadow-lg w-48 text-left">
          {detail}
        </div>
      )}
    </td>
  );
}

const COLUMNS = [
  { key: "boost", label: "boost.ai", highlight: true },
  { key: "llm", label: "Generic LLM", highlight: false },
  { key: "ivr", label: "Legacy IVR", highlight: false },
  { key: "diy", label: "Build In-House", highlight: false },
];

export default function ComparisonSection() {
  const { ref, isVisible } = useScrollReveal({ once: true });

  return (
    <section>
      <SectionHeader
        number="07"
        title="Why boost.ai"
        subtitle="How purpose-built financial services AI compares to the alternatives"
      />

      <div
        ref={ref}
        className={`overflow-x-auto rounded-xl border border-boost-border bg-white transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <table className="w-full min-w-[600px]">
          <thead>
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-boost-muted w-1/5">Capability</th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-sm font-semibold text-center ${
                    col.highlight
                      ? "text-boost-green bg-boost-green-light/5 border-b-2 border-boost-green-light"
                      : "text-boost-dark"
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_TABLE.map((row, i) => (
              <tr key={row.capability} className={i % 2 === 0 ? "bg-boost-surface/30" : ""}>
                <td className="px-4 py-3 text-sm font-medium text-boost-dark">{row.capability}</td>
                <Cell value={row.boost as "yes" | "partial" | "no"} detail={row.boostDetail} />
                <Cell value={row.llm as "yes" | "partial" | "no"} detail={row.llmDetail} />
                <Cell value={row.ivr as "yes" | "partial" | "no"} detail={row.ivrDetail} />
                <Cell value={row.diy as "yes" | "partial" | "no"} detail={row.diyDetail} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
