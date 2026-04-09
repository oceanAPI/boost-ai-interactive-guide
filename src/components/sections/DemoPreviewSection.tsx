"use client";

import { useState, useEffect, useRef } from "react";
import type { GuideData } from "@/lib/types";
import { getDemoScript } from "@/data/demo-scripts";
import { SectionHeader, Badge } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function DemoPreviewSection({ guide }: { guide: GuideData }) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const script = getDemoScript(guide.company_name, guide.areas_of_interest);
  const [visibleMessages, setVisibleMessages] = useState(1); // show first AI greeting
  const chatEndRef = useRef<HTMLDivElement>(null);

  const allShown = visibleMessages >= script.messages.length;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages]);

  const advance = () => {
    if (!allShown) setVisibleMessages((v) => v + 1);
  };

  const reset = () => setVisibleMessages(1);

  return (
    <section>
      <SectionHeader
        number="10"
        title="Live Demo Preview"
        subtitle={`See how ${guide.company_name}'s customers will experience the AI agent`}
      />

      <div ref={ref} className={`max-w-md mx-auto transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        {/* Phone frame */}
        <div className="rounded-[2rem] border-4 border-boost-dark bg-boost-dark p-2 shadow-2xl">
          {/* Status bar */}
          <div className="bg-white rounded-t-[1.5rem] px-5 pt-3 pb-2 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-boost-dark">{guide.company_name}</p>
              <p className="text-[10px] text-boost-green">AI Agent · Online</p>
            </div>
            <Badge variant="green" size="sm">{script.industry}</Badge>
          </div>

          {/* Chat area */}
          <div className="bg-white h-[420px] overflow-y-auto px-4 py-3 space-y-3">
            {script.messages.slice(0, visibleMessages).map((msg, i) => (
              <div
                key={i}
                className={`animate-in ${
                  msg.sender === "customer" ? "flex justify-end" :
                  msg.sender === "system" ? "flex justify-center" : "flex justify-start"
                }`}
              >
                {msg.sender === "system" ? (
                  <div className="bg-boost-surface rounded-lg px-3 py-1.5 text-[10px] text-boost-muted text-center max-w-[85%]">
                    {msg.text}
                  </div>
                ) : msg.sender === "customer" ? (
                  <div className="bg-boost-purple text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
                    <p className="text-xs leading-relaxed">{msg.text}</p>
                  </div>
                ) : (
                  <div className="max-w-[85%]">
                    {msg.agentLabel && (
                      <p className="text-[10px] text-boost-green mb-1 ml-1">{msg.agentLabel} Agent</p>
                    )}
                    <div className="bg-boost-surface rounded-2xl rounded-bl-sm px-4 py-2.5">
                      <p className="text-xs text-boost-dark leading-relaxed whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Controls */}
          <div className="bg-white rounded-b-[1.5rem] px-4 py-3 border-t border-boost-border">
            <div className="flex gap-2">
              <button
                onClick={advance}
                disabled={allShown}
                className="flex-1 py-2 bg-boost-green-light text-white text-xs font-semibold rounded-xl hover:bg-boost-green disabled:opacity-40 transition-colors"
              >
                {allShown ? "Conversation Complete ✓" : "Next Message →"}
              </button>
              {visibleMessages > 1 && (
                <button
                  onClick={reset}
                  className="px-3 py-2 text-xs text-boost-muted hover:text-boost-dark border border-boost-border rounded-xl transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CTA below phone */}
        <div className="text-center mt-6">
          <p className="text-sm text-boost-muted mb-3">
            This is a simulated preview. Request a live demo with your real data.
          </p>
          <button className="px-6 py-2.5 bg-boost-purple text-white text-sm font-semibold rounded-xl hover:bg-boost-purple-dark transition-colors shadow-lg shadow-boost-purple/20">
            Request Live Demo →
          </button>
        </div>
      </div>
    </section>
  );
}
