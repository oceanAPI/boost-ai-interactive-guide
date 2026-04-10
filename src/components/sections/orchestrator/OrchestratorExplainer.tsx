"use client";

import { useState } from "react";

const STEPS = [
  {
    number: 1,
    title: "Message Received",
    short: "Customer sends a message on any connected channel",
    detail: "Whether it's chat, voice, WhatsApp, or any other integrated channel, every customer message enters through the same orchestrator. No separate bots per channel.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    number: 2,
    title: "Intent Classification",
    short: "LLM analyzes the message to understand the request",
    detail: "A boost.ai-hosted LLM classifies the customer's intent. It determines what the customer needs and which specialist agent is best equipped to handle it. This happens in milliseconds.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
  },
  {
    number: 3,
    title: "Agent Routing",
    short: "Routes to the best specialist agent for the request",
    detail: "The orchestrator selects the most suitable specialist agent based on the classified intent. Each agent has its own knowledge base, guardrails, and action hooks tailored to its domain.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="5" r="3" />
        <line x1="12" y1="8" x2="12" y2="14" />
        <path d="M6 20l6-6 6 6" />
      </svg>
    ),
  },
  {
    number: 4,
    title: "Clarification",
    short: "If the request is vague, asks focused follow-up questions",
    detail: "When a request is ambiguous or multi-interpretable, the orchestrator asks short, direct questions — one at a time. It never assumes intent and only asks what's necessary to remove uncertainty.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    number: 5,
    title: "Direct Handling",
    short: "When no agent fits, responds using its own knowledge",
    detail: "For general or out-of-scope questions where no specialist agent is suitable, the orchestrator generates a response directly. It uses its own knowledge base and can trigger global hooks like transfer to a live agent.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default function OrchestratorExplainer() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <div>
      <h3 className="text-[10px] font-bold tracking-widest uppercase text-boost-muted mb-4">
        How the Orchestrator Works
      </h3>

      {/* Desktop: horizontal stepper */}
      <div className="hidden sm:block">
        <div className="flex items-start gap-0">
          {STEPS.map((step, idx) => (
            <div key={step.number} className="flex-1 flex flex-col items-center relative">
              {/* Connector line (not on first) */}
              {idx > 0 && (
                <div
                  className="absolute top-4 right-1/2 w-full h-[1.5px] bg-boost-border -z-10"
                  style={{ left: "-50%" }}
                />
              )}

              {/* Circle */}
              <button
                onClick={() => setExpandedStep(expandedStep === step.number ? null : step.number)}
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  expandedStep === step.number
                    ? "bg-boost-green-light text-white shadow-md"
                    : "bg-white text-boost-green border-2 border-boost-green-light/40 hover:border-boost-green-light"
                }`}
              >
                <span className="text-xs font-bold">{step.number}</span>
              </button>

              {/* Title */}
              <button
                onClick={() => setExpandedStep(expandedStep === step.number ? null : step.number)}
                className="mt-2 text-center cursor-pointer"
              >
                <p className="text-[11px] font-semibold text-boost-dark leading-tight">{step.title}</p>
                <p className="text-[10px] text-boost-muted mt-0.5 leading-tight max-w-[120px] mx-auto">{step.short}</p>
              </button>
            </div>
          ))}
        </div>

        {/* Expanded detail card */}
        {expandedStep !== null && (
          <div className="mt-4 bg-boost-surface rounded-lg border border-boost-border p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-boost-green-light/10 flex items-center justify-center flex-shrink-0 text-boost-green">
              {STEPS[expandedStep - 1].icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-boost-dark">{STEPS[expandedStep - 1].title}</p>
              <p className="text-xs text-boost-muted mt-1 leading-relaxed">{STEPS[expandedStep - 1].detail}</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: vertical timeline */}
      <div className="sm:hidden space-y-0">
        {STEPS.map((step, idx) => (
          <div key={step.number} className="flex gap-3">
            {/* Timeline */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => setExpandedStep(expandedStep === step.number ? null : step.number)}
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  expandedStep === step.number
                    ? "bg-boost-green-light text-white"
                    : "bg-white text-boost-green border-2 border-boost-green-light/40"
                }`}
              >
                <span className="text-[10px] font-bold">{step.number}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className="w-[1.5px] bg-boost-border flex-1 min-h-[16px]" />
              )}
            </div>

            {/* Content */}
            <div className="pb-4 flex-1 min-w-0">
              <button
                onClick={() => setExpandedStep(expandedStep === step.number ? null : step.number)}
                className="text-left w-full"
              >
                <p className="text-xs font-semibold text-boost-dark">{step.title}</p>
                <p className="text-[10px] text-boost-muted">{step.short}</p>
              </button>
              {expandedStep === step.number && (
                <p className="text-[11px] text-boost-muted mt-2 leading-relaxed bg-boost-surface rounded p-2 border border-boost-border">
                  {step.detail}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Link to full article */}
      <div className="mt-4 pt-3 border-t border-boost-border">
        <a
          href="https://boost.elevio.help/en/articles/935"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-boost-green hover:text-boost-green-light transition-colors flex items-center gap-1"
        >
          Read the full technical guide
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </div>
  );
}
