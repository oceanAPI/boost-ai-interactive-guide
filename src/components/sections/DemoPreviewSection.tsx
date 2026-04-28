"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Customer, GuideData } from "@/lib/types";
import { getDemoScript, getEscalatedDemoScript } from "@/data/demo-scripts";
import { SectionHeader, Badge } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import LiveChatSection from "./demo/LiveChatSection";
import { resolveDemoTenant } from "@/lib/boost-chat";

/* ─── Analysis walkthrough steps ─── */
type AnalyzeStep = "idle" | "panel-open" | "review-running" | "review-done" | "back-to-chat";
type CategoryKey = "automated" | "escalated" | "unsolved" | "not-relevant" | null;

/* ─── Category deep-dive content ─── */
const CATEGORY_DETAILS: Record<Exclude<CategoryKey, null>, {
  heading: string;
  description: string;
  items: { label: string; detail: string; icon: string }[];
  cta?: { label: string; hint: string };
}> = {
  automated: {
    heading: "Types of automation",
    description: "Not all automated resolutions are the same. boost.ai tracks the depth of automation to help you understand value.",
    items: [
      { label: "Full self-service", detail: "Customer completed the entire journey without any human involvement — information retrieved, action taken, confirmation sent.", icon: "✓" },
      { label: "Guided resolution", detail: "AI walked the customer through steps (e.g., password reset, form submission) and confirmed completion.", icon: "↻" },
      { label: "Informational", detail: "Customer asked a question and received a complete, accurate answer — no action needed.", icon: "ℹ" },
      { label: "Deflected from queue", detail: "Customer intended to contact a human but the AI resolved the issue, saving an agent interaction.", icon: "⇥" },
    ],
  },
  escalated: {
    heading: "Why conversations escalate",
    description: "Escalation isn't failure — it's smart routing. Understanding the reasons helps optimize what the AI should handle vs. when to involve a human.",
    items: [
      { label: "By design", detail: "The AI was configured to escalate this type of conversation — e.g., complex mortgage applications that require specialist handling.", icon: "◈" },
      { label: "By request", detail: "Customer explicitly requested a human agent — the AI honored the request and routed with full context.", icon: "♦" },
      { label: "By fallback", detail: "The AI encountered an unknown intent and offered escalation as a safety net after multiple failed attempts.", icon: "◆" },
      { label: "Immediate", detail: "Escalation requested in the very first message — customer came in wanting a human from the start.", icon: "▣" },
    ],
  },
  unsolved: {
    heading: "What unsolved means",
    description: "An unsolved conversation is one where the customer left without a resolution. This is your biggest optimization opportunity.",
    items: [
      { label: "Knowledge gap", detail: "The AI didn't have the answer — often fixable by adding content to the knowledge base.", icon: "?" },
      { label: "Customer abandoned", detail: "The customer left mid-conversation — could indicate slow responses, confusing flows, or external reasons.", icon: "✕" },
      { label: "Misunderstood intent", detail: "The AI misclassified what the customer wanted — retraining the intent model fixes this.", icon: "↯" },
      { label: "Technical failure", detail: "An integration or API call failed, preventing the AI from completing the task.", icon: "⚡" },
    ],
    cta: { label: "How do we improve unsolved?", hint: "boost.ai's AI trainers analyze unsolved conversations weekly to close knowledge gaps and retrain intents." },
  },
  "not-relevant": {
    heading: "What 'not relevant' means",
    description: "Not every conversation needs a resolution. These are filtered out so they don't distort your automation metrics.",
    items: [
      { label: "Test conversations", detail: "Internal QA, bot testing, or demo sessions that aren't real customer interactions.", icon: "⚙" },
      { label: "Accidental triggers", detail: "Customer opened the chat by mistake, said hello and left, or sent random characters.", icon: "·" },
      { label: "Spam / abuse", detail: "Jailbreak attempts, profanity, or bot spam — blocked by guardrails and excluded from metrics.", icon: "✗" },
      { label: "Out of scope", detail: "Questions completely unrelated to your business (e.g., 'what's the weather') — the AI politely redirects.", icon: "↗" },
    ],
  },
};

/* ─── Review results per script type ─── */
const REVIEW_RESULTS = {
  automated: {
    category: "Automated" as const,
    categoryKey: "automated" as CategoryKey,
    subtype: "Informational, in-chat",
    summary: "Customer issue resolved without human intervention. Claim filed, reference number provided, next steps communicated.",
    tags: ["insurance", "claims", "water-damage", "first-notice-of-loss", "automated"],
    metrics: [
      { label: "Resolution", value: "Full" },
      { label: "Handover", value: "None" },
      { label: "Confidence", value: "96%" },
    ],
    resultColor: "text-boost-green",
    resultBg: "bg-boost-green/5 border-boost-green/20",
  },
  escalated: {
    category: "Escalated" as const,
    categoryKey: "escalated" as CategoryKey,
    subtype: "Escalated by design",
    summary: "Customer transferred to mortgage specialist. Complex income verification requires human specialist handling — this escalation was intentional.",
    tags: ["banking", "mortgage", "application-status", "income-verification", "escalated-by-design"],
    metrics: [
      { label: "Resolution", value: "Transferred" },
      { label: "Handover", value: "By design" },
      { label: "Context shared", value: "100%" },
    ],
    resultColor: "text-boost-green",
    resultBg: "bg-boost-green/5 border-boost-green/20",
  },
};

/* ─── Router: picks the demo mode based on customer config ──────
 * `customer.demo_mode` is the single source of truth. When it's
 * unset or `"simulated"` we fall through to the legacy scripted
 * demo below (zero behaviour change vs pre-demo-mode shipped
 * builds, so every existing share URL keeps working).
 *
 * Modes:
 *   - "simulated"   → existing scripted demo + AI Review panel
 *   - "live"        → live Chat API v2 against default tenant
 *                     (financewizard.boost.ai or env override)
 *   - "custom_live" → live Chat API v2 against customer.demo_tenant
 *
 * If `"custom_live"` is selected but no tenant is configured, we
 * fall back to the simulated demo rather than render an empty /
 * broken chat. Safer default — avoids a half-configured share URL
 * showing an error page to a prospect.
 * ─────────────────────────────────────────────────────────────── */
export default function DemoPreviewSection({
  guide,
  customer,
  sectionNumber,
}: {
  guide: GuideData;
  customer?: Customer;
  sectionNumber?: string;
}) {
  const mode = customer?.demo_mode ?? "simulated";

  if (mode === "live") {
    const tenant = resolveDemoTenant();
    return (
      <LiveChatSection tenant={tenant} mode="live" sectionNumber={sectionNumber} />
    );
  }
  if (mode === "custom_live") {
    const tenant = (customer?.demo_tenant ?? "").trim();
    if (tenant) {
      return (
        <LiveChatSection
          tenant={tenant}
          mode="custom_live"
          sectionNumber={sectionNumber}
        />
      );
    }
    // Fall through to simulated when no tenant configured — safer
    // than rendering a broken chat on a shared URL.
  }

  return <SimulatedDemoBody guide={guide} sectionNumber={sectionNumber} />;
}

function SimulatedDemoBody({ guide, sectionNumber }: { guide: GuideData; sectionNumber?: string }) {
  const { ref, isVisible } = useScrollReveal({ once: true });

  /* ─── Script cycling: 0 = primary (automated), 1 = banking escalated ─── */
  const [scriptIndex, setScriptIndex] = useState(0);
  const scripts = [
    getDemoScript(guide.company_name, guide.areas_of_interest),
    getEscalatedDemoScript(guide.company_name),
  ];
  const script = scripts[scriptIndex];
  const reviewResult = scriptIndex === 0 ? REVIEW_RESULTS.automated : REVIEW_RESULTS.escalated;

  const [visibleMessages, setVisibleMessages] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playComplete, setPlayComplete] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState<AnalyzeStep>("idle");
  const [expandedCategory, setExpandedCategory] = useState<CategoryKey>(null);
  const [showEscalationPopup, setShowEscalationPopup] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const playGenRef = useRef(0); // generation counter to invalidate stale playNext callbacks

  const allShown = visibleMessages >= script.messages.length;
  const isAnalyzing = analyzeStep !== "idle";
  const isEscalatedScript = scriptIndex === 1;

  /* Scroll INSIDE the chat container only */
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [visibleMessages]);

  /* Auto-play — uses generation counter to prevent stale callbacks after reset */
  const playNext = useCallback(() => {
    const gen = playGenRef.current;
    setVisibleMessages((v) => {
      if (gen !== playGenRef.current) return v; // stale — ignore
      const next = v + 1;
      if (next >= script.messages.length) {
        setIsPlaying(false);
        setPlayComplete(true);
        return script.messages.length;
      }
      const nextMsg = script.messages[next];
      const delay =
        nextMsg?.sender === "system"
          ? 800
          : nextMsg?.sender === "customer"
            ? 1500
            : 2200;
      timerRef.current = setTimeout(playNext, delay);
      return next;
    });
  }, [script.messages]);

  const startPlayback = () => {
    playGenRef.current += 1;
    setIsPlaying(true);
    setPlayComplete(false);
    setAnalyzeStep("idle");
    setExpandedCategory(null);
    timerRef.current = setTimeout(playNext, 1200);
  };

  const reset = () => {
    playGenRef.current += 1; // invalidate any in-flight playNext
    clearTimeout(timerRef.current);
    setVisibleMessages(1);
    setIsPlaying(false);
    setPlayComplete(false);
    setAnalyzeStep("idle");
    setExpandedCategory(null);
    setShowEscalationPopup(false);
    /* Cycle to next script */
    setScriptIndex((i) => (i + 1) % scripts.length);
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  /* ─── Analyze actions ─── */
  const openAnalyze = () => setAnalyzeStep("panel-open");

  const runAiReview = () => {
    setAnalyzeStep("review-running");
    timerRef.current = setTimeout(() => {
      setAnalyzeStep("review-done");
    }, 1800);
  };

  const backToChat = () => setAnalyzeStep("back-to-chat");

  /* ─── Typing indicator ─── */
  const showTyping =
    isPlaying && !allShown && visibleMessages < script.messages.length;
  const nextSender =
    visibleMessages < script.messages.length
      ? script.messages[visibleMessages]?.sender
      : null;

  /* ─── Guide text for each step ─── */
  const guideText: Record<AnalyzeStep, string> = {
    idle: "",
    "panel-open": "This is how every conversation is categorized. Click \"Run AI review\" to see the AI analyze this conversation.",
    "review-running": "AI is reviewing the conversation...",
    "review-done": isEscalatedScript
      ? "The AI classified this as escalated by design. Click the agent name in the chat to explore the escalation flow."
      : "The AI has classified this as an automated resolution. Click inside the chat to see the customer experience.",
    "back-to-chat": isEscalatedScript
      ? "Escalation by design — the AI intentionally transferred this conversation because the topic requires specialist handling."
      : "This is the full picture — AI agents handle conversations end-to-end, with built-in quality review and categorization.",
  };

  return (
    <section>
      <SectionHeader
        number={sectionNumber ?? "08"}
        title="Chat Preview"
        subtitle={`See how ${guide.company_name}'s customers will experience the AI agent`}
      />

      <div
        ref={ref}
        className={`transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Guide text */}
        {isAnalyzing && guideText[analyzeStep] && (
          <div className="max-w-2xl mx-auto mb-4 animate-modal-in">
            <div className="border rounded-lg px-4 py-2.5 text-center bg-boost-green/5 border-boost-green/20">
              <p className="text-xs text-boost-dark leading-relaxed">
                {guideText[analyzeStep]}
              </p>
            </div>
          </div>
        )}

        {/* Main layout — phone + optional analysis panel */}
        <div
          className={`flex flex-col sm:flex-row justify-center items-center sm:items-start gap-6 transition-all duration-700 ease-out ${
            isAnalyzing ? "max-w-3xl mx-auto" : "max-w-md mx-auto"
          }`}
        >
          {/* Phone frame — shrinks and slides left when analyzing */}
          <div
            className={`relative flex-shrink-0 transition-all duration-700 ease-out ${
              isAnalyzing ? "w-[280px]" : "w-full max-w-md"
            }`}
          >
            {/* Analyze button — appears after conversation completes */}
            {playComplete && analyzeStep === "idle" && (
              <div className="absolute -top-3 -right-3 z-10 animate-modal-in">
                <span className="absolute inset-0 rounded-full bg-boost-green/40 animate-ping" />
                <button
                  onClick={openAnalyze}
                  className="relative bg-boost-green text-white text-[11px] font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-boost-green-light transition-all flex items-center gap-1.5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                    <path d="M11 8v6M8 11h6" />
                  </svg>
                  Analyze
                </button>
              </div>
            )}

            <div className="rounded-[2rem] border-4 border-boost-dark bg-boost-dark p-2 shadow-2xl">
              {/* Status bar */}
              <div className="bg-white rounded-t-[1.5rem] px-4 pt-2.5 pb-1.5 flex items-center justify-between">
                <div>
                  <p className={`font-semibold text-boost-dark ${isAnalyzing ? "text-[10px]" : "text-xs"}`}>
                    {guide.company_name}
                  </p>
                  <p className="text-[9px] text-boost-green">AI Agent · Online</p>
                </div>
                <Badge variant="green" size="sm">
                  {script.industry}
                </Badge>
              </div>

              {/* Chat area */}
              <div
                ref={chatContainerRef}
                className={`bg-white overflow-y-auto px-3 py-2 space-y-2 scrollbar-hide transition-all duration-700 ${
                  isAnalyzing ? "h-[340px]" : "h-[420px]"
                }`}
                onClick={analyzeStep === "review-done" && !isEscalatedScript ? backToChat : undefined}
                style={analyzeStep === "review-done" && !isEscalatedScript ? { cursor: "pointer" } : undefined}
              >

                {script.messages.slice(0, visibleMessages).map((msg, i) => (
                  <div
                    key={i}
                    className={`${
                      i === visibleMessages - 1 && visibleMessages > 1
                        ? "animate-modal-in"
                        : ""
                    } ${
                      msg.sender === "customer"
                        ? "flex justify-end"
                        : msg.sender === "system"
                          ? "flex justify-center"
                          : "flex justify-start"
                    }`}
                  >
                    {msg.sender === "system" ? (
                      <div className="bg-boost-surface rounded-lg px-2 py-1 text-[9px] text-boost-muted text-center max-w-[90%]">
                        {msg.text}
                      </div>
                    ) : msg.sender === "customer" ? (
                      <div className="bg-boost-purple text-white rounded-2xl rounded-br-sm px-3 py-2 max-w-[80%]">
                        <p className={`leading-relaxed ${isAnalyzing ? "text-[10px]" : "text-xs"}`}>{msg.text}</p>
                      </div>
                    ) : (
                      <div className="max-w-[85%]">
                        {msg.agentLabel && (
                          <p
                            className={`text-[9px] text-boost-green mb-0.5 ml-1 ${
                              isEscalatedScript && analyzeStep === "review-done"
                                ? "cursor-pointer hover:underline font-semibold"
                                : ""
                            }`}
                            onClick={
                              isEscalatedScript && analyzeStep === "review-done"
                                ? (e) => { e.stopPropagation(); setShowEscalationPopup(true); }
                                : undefined
                            }
                          >
                            {msg.agentLabel} Agent
                            {isEscalatedScript && analyzeStep === "review-done" && (
                              <span className="ml-1 text-boost-muted">← click</span>
                            )}
                          </p>
                        )}
                        <div className="bg-boost-surface rounded-2xl rounded-bl-sm px-3 py-2">
                          <p className={`text-boost-dark leading-relaxed whitespace-pre-line ${isAnalyzing ? "text-[10px]" : "text-xs"}`}>
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {showTyping && (
                  <div
                    className={`flex ${
                      nextSender === "customer" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-3 py-2 ${
                        nextSender === "customer"
                          ? "bg-boost-purple/20 rounded-br-sm"
                          : "bg-boost-surface rounded-bl-sm"
                      }`}
                    >
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-boost-muted/50 sparkle" />
                        <span className="w-1.5 h-1.5 rounded-full bg-boost-muted/50 sparkle sparkle-delay-1" />
                        <span className="w-1.5 h-1.5 rounded-full bg-boost-muted/50 sparkle sparkle-delay-2" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Controls */}
              <div className="bg-white rounded-b-[1.5rem] px-3 py-2 border-t border-boost-border">
                {!isPlaying && !playComplete && visibleMessages === 1 ? (
                  <button
                    onClick={startPlayback}
                    className="w-full py-2 bg-boost-green-light text-white text-[11px] font-semibold rounded-xl hover:bg-boost-green transition-colors flex items-center justify-center gap-2"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Play conversation
                  </button>
                ) : isPlaying ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="h-1 bg-boost-surface rounded-full overflow-hidden">
                        <div
                          className="h-full bg-boost-green transition-all duration-500 rounded-full"
                          style={{
                            width: `${(visibleMessages / script.messages.length) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-[9px] text-boost-muted mt-0.5">
                        {visibleMessages} / {script.messages.length}
                      </p>
                    </div>
                    <button
                      onClick={reset}
                      className="px-2 py-1 text-[9px] text-boost-muted hover:text-boost-dark border border-boost-border rounded-lg transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                ) : analyzeStep === "back-to-chat" ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 py-1 text-center">
                      <p className="text-[10px] font-semibold text-boost-green">
                        {isEscalatedScript ? "Escalated by design" : "Fully automated resolution"}
                      </p>
                      <p className="text-[9px] text-boost-muted">
                        {isEscalatedScript ? "Transferred to mortgage specialist" : "No human intervention needed"}
                      </p>
                    </div>
                    <button
                      onClick={reset}
                      className="px-2 py-1 text-[9px] text-boost-muted hover:text-boost-dark border border-boost-border rounded-lg transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 py-1 text-center">
                      <p className="text-[10px] font-semibold text-boost-green">
                        Complete
                      </p>
                    </div>
                    <button
                      onClick={reset}
                      className="px-2 py-1 text-[9px] text-boost-muted hover:text-boost-dark border border-boost-border rounded-lg transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Analysis Panel ─── */}
          {isAnalyzing && (
            <div className="flex-1 min-w-0 animate-modal-in">
              <div className="bg-white rounded-xl border border-boost-border shadow-lg overflow-hidden">
                {/* Panel header */}
                <div className="bg-boost-surface px-4 py-3 border-b border-boost-border">
                  <p className="text-xs font-semibold text-boost-dark">
                    Conversation review
                  </p>
                  <p className="text-[10px] text-boost-muted">
                    Admin panel · Quality assurance
                  </p>
                </div>

                <div className="p-4 space-y-5">
                  {/* Conversation categories */}
                  <div>
                    <p className="text-[10px] font-bold text-boost-muted uppercase tracking-wider mb-2">
                      Conversation categories
                    </p>
                    <div className="space-y-1.5">
                      {([
                        {
                          label: "Automated",
                          key: "automated" as CategoryKey,
                          color: "bg-boost-green",
                          activeColor: "border-boost-green bg-boost-green/5",
                          textColor: "text-boost-green",
                          aiSelected: (analyzeStep === "review-done" || analyzeStep === "back-to-chat") && reviewResult.categoryKey === "automated",
                        },
                        {
                          label: "Escalated",
                          key: "escalated" as CategoryKey,
                          color: "bg-amber-500",
                          activeColor: "border-amber-500 bg-amber-50",
                          textColor: "text-amber-600",
                          aiSelected: (analyzeStep === "review-done" || analyzeStep === "back-to-chat") && reviewResult.categoryKey === "escalated",
                        },
                        {
                          label: "Unsolved",
                          key: "unsolved" as CategoryKey,
                          color: "bg-red-400",
                          activeColor: "border-red-400 bg-red-50",
                          textColor: "text-red-500",
                          aiSelected: false,
                        },
                        {
                          label: "Not relevant",
                          key: "not-relevant" as CategoryKey,
                          color: "bg-gray-400",
                          activeColor: "border-gray-400 bg-gray-50",
                          textColor: "text-gray-500",
                          aiSelected: false,
                        },
                      ]).map((cat) => {
                        const isExpanded = expandedCategory === cat.key;
                        const detail = cat.key ? CATEGORY_DETAILS[cat.key] : null;
                        return (
                          <div key={cat.label}>
                            <button
                              onClick={() => setExpandedCategory(isExpanded ? null : cat.key)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all text-left ${
                                cat.aiSelected
                                  ? `${cat.activeColor} shadow-sm`
                                  : isExpanded
                                    ? `${cat.activeColor}`
                                    : "border-boost-border bg-white hover:bg-boost-surface"
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full flex-shrink-0 ${cat.color} ${
                                  cat.aiSelected ? `ring-2 ${cat.key === "escalated" ? "ring-amber-300" : "ring-boost-green/30"}` : ""
                                }`}
                              />
                              <span
                                className={`text-xs ${
                                  cat.aiSelected
                                    ? `font-semibold ${cat.textColor}`
                                    : isExpanded
                                      ? `font-semibold ${cat.textColor}`
                                      : "text-boost-dark"
                                }`}
                              >
                                {cat.label}
                              </span>
                              {cat.aiSelected && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={cat.textColor}>
                                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={`${cat.aiSelected ? "" : "ml-auto"} transition-transform duration-300 ${isExpanded ? "rotate-180" : ""} ${isExpanded || cat.aiSelected ? cat.textColor : "text-boost-muted"}`}>
                                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            {/* Expandable detail panel */}
                            <div
                              className="grid transition-all duration-300 ease-out"
                              style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
                            >
                              <div className="overflow-hidden">
                                {detail && (
                                  <div className="pt-2 pb-1 px-1">
                                    <div className={`rounded-lg border-l-[3px] ${cat.key === "automated" ? "border-l-boost-green" : cat.key === "escalated" ? "border-l-amber-500" : cat.key === "unsolved" ? "border-l-red-400" : "border-l-gray-400"} border border-boost-border bg-white p-3 space-y-2.5`}>
                                      <div>
                                        <p className={`text-[11px] font-semibold ${cat.textColor}`}>{detail.heading}</p>
                                        <p className="text-[10px] text-boost-text-secondary leading-relaxed mt-0.5">{detail.description}</p>
                                      </div>
                                      <div className="space-y-1.5">
                                        {detail.items.map((item) => (
                                          <div key={item.label} className="flex gap-2 items-start">
                                            <span className={`text-[10px] w-4 h-4 flex items-center justify-center rounded-sm bg-boost-surface flex-shrink-0 mt-0.5 font-mono ${cat.textColor}`}>{item.icon}</span>
                                            <div className="min-w-0">
                                              <p className="text-[10px] font-semibold text-boost-dark">{item.label}</p>
                                              <p className="text-[9px] text-boost-muted leading-relaxed">{item.detail}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      {detail.cta && (
                                        <div className="pt-1 border-t border-boost-border/50">
                                          <button className={`w-full text-center py-2 rounded-lg text-[10px] font-semibold ${cat.textColor} bg-white border border-current/20 hover:bg-white/80 transition-colors`}>
                                            {detail.cta.label}
                                          </button>
                                          <p className="text-[9px] text-boost-muted mt-1 text-center leading-relaxed">{detail.cta.hint}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <p className="text-[10px] font-bold text-boost-muted uppercase tracking-wider mb-2">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(analyzeStep === "review-done" || analyzeStep === "back-to-chat"
                        ? reviewResult.tags
                        : []
                      ).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-boost-purple/5 text-boost-purple border border-boost-purple/15 animate-modal-in"
                        >
                          {tag}
                        </span>
                      ))}
                      {analyzeStep === "panel-open" && (
                        <span className="text-[10px] text-boost-muted italic">
                          Tags will be added after review
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Run AI review button */}
                  <div>
                    {analyzeStep === "panel-open" && (
                      <button
                        onClick={runAiReview}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-boost-surface border border-boost-border hover:bg-boost-green/5 hover:border-boost-green/30 transition-all group"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-boost-green">
                          <path d="M12 2l2.4 7.4H22l-6.2 4.5L18.2 21 12 16.5 5.8 21l2.4-7.1L2 9.4h7.6L12 2z" fill="currentColor" />
                        </svg>
                        <span className="text-xs font-semibold text-boost-green group-hover:text-boost-green">
                          Run AI review
                        </span>
                      </button>
                    )}

                    {analyzeStep === "review-running" && (
                      <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-boost-green/5 border border-boost-green/20">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-boost-green sparkle" />
                          <span className="w-1.5 h-1.5 rounded-full bg-boost-green sparkle sparkle-delay-1" />
                          <span className="w-1.5 h-1.5 rounded-full bg-boost-green sparkle sparkle-delay-2" />
                        </div>
                        <span className="text-xs text-boost-green font-medium">
                          Analyzing conversation...
                        </span>
                      </div>
                    )}

                    {(analyzeStep === "review-done" || analyzeStep === "back-to-chat") && (
                      <div className={`w-full px-4 py-3 rounded-xl border ${reviewResult.resultBg}`}>
                        <div className="flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={reviewResult.resultColor}>
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className={`text-xs font-semibold ${reviewResult.resultColor}`}>
                            AI review complete
                          </span>
                        </div>
                        <p className="text-[10px] text-boost-text-secondary mt-1.5 leading-relaxed">
                          Classified as <span className={`font-semibold ${reviewResult.resultColor}`}>{reviewResult.category}</span> — {reviewResult.summary}
                        </p>
                        {isEscalatedScript && (
                          <p className="text-[9px] text-boost-muted mt-1 italic">
                            Subtype: {reviewResult.subtype}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Metrics after review */}
                  {(analyzeStep === "review-done" || analyzeStep === "back-to-chat") && (
                    <div className="grid grid-cols-3 gap-2 animate-modal-in">
                      {reviewResult.metrics.map((m) => (
                        <div
                          key={m.label}
                          className="text-center bg-boost-surface rounded-lg py-2 border border-boost-border"
                        >
                          <p className={`text-sm font-bold ${reviewResult.resultColor}`}>
                            {m.value}
                          </p>
                          <p className="text-[9px] text-boost-muted">{m.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reset from analyze */}
              {analyzeStep === "back-to-chat" && (
                <div className="mt-3 text-center">
                  <button
                    onClick={reset}
                    className="text-[10px] text-boost-muted hover:text-boost-dark underline underline-offset-2 transition-colors"
                  >
                    Reset — try {isEscalatedScript ? "automated" : "escalated"} example
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA removed — no "simulated preview" disclaimer */}
      </div>

      {/* ─── Escalation Flow Popup ─── */}
      {showEscalationPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => { setShowEscalationPopup(false); backToChat(); }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup header */}
            <div className="sticky top-0 bg-white border-b border-boost-border px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
              <div>
                <p className="text-sm font-bold text-boost-dark">Escalation by Design</p>
                <p className="text-[11px] text-boost-muted">How AI review classifies this conversation</p>
              </div>
              <button
                onClick={() => { setShowEscalationPopup(false); backToChat(); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-boost-surface transition-colors text-boost-muted"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* What happened */}
              <div className="border-l-[3px] border-l-boost-purple pl-4">
                <p className="text-xs font-semibold text-boost-dark mb-1">What happened in this conversation</p>
                <p className="text-[11px] text-boost-text-secondary leading-relaxed">
                  The customer asked about their mortgage application status. The <strong>Lending & Mortgages Agent</strong> identified
                  the application, found it required additional income verification, and <strong>intentionally transferred</strong> the
                  conversation to a mortgage specialist — sharing full context so the customer doesn't repeat themselves.
                </p>
                <p className="text-[11px] text-boost-text-secondary leading-relaxed mt-2">
                  This is <strong>escalation by design</strong> — the AI was configured to recognize that complex mortgage cases
                  require human specialist handling, and it routed accordingly.
                </p>
              </div>

              {/* How AI Review works */}
              <div>
                <p className="text-xs font-bold text-boost-dark mb-3">How AI review classifies conversations</p>
                <p className="text-[11px] text-boost-muted mb-4 leading-relaxed">
                  The AI review algorithm uses three systems working together to analyze every conversation and assign a category.
                </p>

                <div className="space-y-3">
                  {/* System 1 */}
                  <div className="bg-boost-surface rounded-xl p-4 border border-boost-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-lg bg-boost-purple/10 text-boost-purple text-[10px] font-bold flex items-center justify-center">1</span>
                      <p className="text-[11px] font-semibold text-boost-dark">Rule-based system</p>
                    </div>
                    <p className="text-[10px] text-boost-muted leading-relaxed">
                      Scans each message for concrete signals: Did the agent offer a live chat button? Mention a phone number or email?
                      Labels messages as <span className="font-medium text-boost-dark">escalation offered</span> when these are detected.
                    </p>
                  </div>

                  {/* System 2 */}
                  <div className="bg-boost-surface rounded-xl p-4 border border-boost-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-lg bg-boost-purple/10 text-boost-purple text-[10px] font-bold flex items-center justify-center">2</span>
                      <p className="text-[11px] font-semibold text-boost-dark">Trained system</p>
                    </div>
                    <p className="text-[10px] text-boost-muted leading-relaxed">
                      Works like an intent prediction model — analyzes the words and context of each message.
                      Applies <span className="font-medium text-boost-dark">escalation offered</span> if it thinks the agent offered escalation,
                      and <span className="font-medium text-boost-dark">escalation requested</span> if the customer asked for a human.
                    </p>
                  </div>

                  {/* System 3 */}
                  <div className="bg-boost-surface rounded-xl p-4 border border-boost-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-lg bg-boost-purple/10 text-boost-purple text-[10px] font-bold flex items-center justify-center">3</span>
                      <p className="text-[11px] font-semibold text-boost-dark">Generative AI system</p>
                    </div>
                    <p className="text-[10px] text-boost-muted leading-relaxed">
                      Analyzes the <em>entire</em> conversation holistically and assigns exactly one label:
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[
                        { label: "Helped", color: "bg-boost-green/10 text-boost-green border-boost-green/20" },
                        { label: "Not helped", color: "bg-boost-surface text-red-500 border-boost-border" },
                        { label: "Transfer", color: "bg-boost-surface text-boost-purple border-boost-border" },
                        { label: "Not relevant", color: "bg-boost-surface text-boost-muted border-boost-border" },
                      ].map((l) => (
                        <span key={l.label} className={`text-[9px] font-medium px-2 py-0.5 rounded-full border ${l.color}`}>
                          {l.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Labels → Categories */}
              <div>
                <p className="text-xs font-bold text-boost-dark mb-3">Turning labels into categories</p>
                <div className="space-y-2">
                  {[
                    { name: "Escalated", dot: "bg-amber-500", border: "border-l-amber-500", desc: "Conversations with transferred to human or transfer labels. Sub-classified as by request (customer asked), by fallback (unknown intent + escalation offered), immediate (requested in first message), or by design (all other escalations — like this one)." },
                    { name: "Automated", dot: "bg-boost-green", border: "border-l-boost-green", desc: "Remaining conversations with the helped label. Sub-classified as transactional (API connector executed), informational, URL (URL button clicked), or informational, in-chat (all other resolved conversations)." },
                    { name: "Unsolved", dot: "bg-red-400", border: "border-l-red-400", desc: "Conversations labeled not helped, unless they contain specific escalation patterns." },
                    { name: "Not relevant", dot: "bg-gray-400", border: "border-l-gray-400", desc: "All remaining conversations — trolling, incomprehensible, or not relevant for the AI Agent." },
                  ].map((cat) => (
                    <div key={cat.name} className={`flex gap-3 items-start p-3 rounded-lg border border-boost-border border-l-[3px] ${cat.border} bg-white`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${cat.dot} flex-shrink-0 mt-1`} />
                      <div>
                        <p className="text-[11px] font-semibold text-boost-dark">{cat.name}</p>
                        <p className="text-[10px] text-boost-muted leading-relaxed">{cat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* This conversation */}
              <div className="bg-boost-surface rounded-xl p-4 border border-boost-border">
                <p className="text-[11px] font-semibold text-boost-dark mb-2">This conversation's journey through AI review</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-boost-purple mt-0.5">→</span>
                    <p className="text-[10px] text-boost-muted leading-relaxed">
                      <strong className="text-boost-dark">Rule-based system</strong> detected: <em>transferred to human</em> (live agent transfer occurred)
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-boost-purple mt-0.5">→</span>
                    <p className="text-[10px] text-boost-muted leading-relaxed">
                      <strong className="text-boost-dark">Trained system</strong> detected: <em>escalation offered</em> (agent proactively offered transfer)
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] text-boost-purple mt-0.5">→</span>
                    <p className="text-[10px] text-boost-muted leading-relaxed">
                      <strong className="text-boost-dark">Generative AI</strong> labeled: <em>Transfer</em> (customer was given a transfer)
                    </p>
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-boost-border">
                    <span className="text-[10px] text-boost-green mt-0.5 font-bold">=</span>
                    <p className="text-[10px] text-boost-dark font-semibold leading-relaxed">
                      Category: Escalated · Subtype: By design <span className="font-normal text-boost-muted">(no unknown fallback, no customer request — intentional routing)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Popup footer */}
            <div className="sticky bottom-0 bg-white border-t border-boost-border px-6 py-3 flex justify-end rounded-b-2xl">
              <button
                onClick={() => { setShowEscalationPopup(false); backToChat(); }}
                className="px-4 py-2 bg-boost-dark text-white text-xs font-semibold rounded-lg hover:bg-boost-dark/90 transition-colors"
              >
                Got it — close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
