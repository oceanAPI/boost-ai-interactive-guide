"use client";

import { COMPARISON_TABLE } from "@/data/guide-content";

export default function ComparisonSection() {
  return (
    <section className="section-enter">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-boost-dark mb-2">Why boost.ai — Not the Alternatives</h2>
        <p className="text-boost-muted">Faster, smarter, and proven in production at scale</p>
      </div>

      <div className="bg-white border border-boost-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-boost-border bg-boost-surface">
                <th className="text-left p-4 text-boost-muted font-medium">Capability</th>
                <th className="text-left p-4 text-boost-green font-semibold">boost.ai</th>
                <th className="text-left p-4 text-boost-muted font-medium">Generic LLM</th>
                <th className="text-left p-4 text-boost-muted font-medium">Legacy IVR / Chatbot</th>
                <th className="text-left p-4 text-boost-muted font-medium">Build In-House</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_TABLE.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-boost-border/50 ${
                    idx % 2 === 0 ? "bg-boost-surface/50" : "bg-white"
                  }`}
                >
                  <td className="p-4 text-boost-dark font-medium">{row.capability}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 text-boost-green font-medium">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-boost-green-light">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {row.boostai}
                    </span>
                  </td>
                  <td className="p-4 text-boost-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-boost-lavender">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      {row.genericLLM}
                    </span>
                  </td>
                  <td className="p-4 text-boost-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-boost-lavender">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      {row.legacyIVR}
                    </span>
                  </td>
                  <td className="p-4 text-boost-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-boost-lavender">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      {row.buildInHouse}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-boost-muted mt-4 text-center">
        boost.ai has deployed 200+ virtual agents across insurance, banking, and financial services.
      </p>
    </section>
  );
}
