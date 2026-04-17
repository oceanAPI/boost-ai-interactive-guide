"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { GuideData } from "@/lib/types";
import { SectionHeader, Badge } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

/* ─────────────────────────────────────────────────────────────────────
 *  Voice AI — conversation playback with under-the-hood analysis
 *
 *  Mirrors the Demo chat section's architecture:
 *    - Script-driven playback (swappable later for real recordings)
 *    - Play / pause / reset controls
 *    - "Analyze" button after completion → slides in analysis panel
 *    - Call-screen UI instead of chat bubbles
 *    - Waveform instead of typing indicators
 *
 *  SCAFFOLDING: the script data is placeholder. The user will later
 *  provide actual voice recordings and we'll swap the data source.
 * ───────────────────────────────────────────────────────────────────── */

/* ─── Voice script type ─── */
interface VoiceMessage {
  speaker: "caller" | "agent" | "system";
  text: string;
  time: string;
  /** Which agent handled this — shown in routing indicator */
  handledBy?: string;
  /** Routed to a specialist agent */
  routedTo?: string;
  /** Intent detected — shown as badge on agent responses */
  intent?: string;
  /** Is this a goal-tracked intent (shows trophy icon) */
  isGoal?: boolean;
  /** Under-the-hood detail for analysis panel */
  analysis?: {
    sttConfidence?: number;
    detectedIntent?: string;
    sentiment?: "positive" | "neutral" | "frustrated";
    action?: string;
  };
}

/* ─── Default voice script (placeholder — will be replaced with real recording data) ─── */
const VOICE_SCRIPT: VoiceMessage[] = [
  {
    speaker: "caller", text: "Hi, I was in a fender bender yesterday and I need to file a claim.", time: "0:00",
    handledBy: "Agent Orchestrator",
    analysis: { sttConfidence: 0.97, detectedIntent: "FNOL — First Notice of Loss", sentiment: "neutral" },
  },
  {
    speaker: "agent", text: "I'm sorry to hear that. Let me help you get that claim started right away. Can you confirm your name and policy number?", time: "0:04",
    routedTo: "Claims Agent",
    intent: "FNOL intake",
    analysis: { action: "Requesting identity verification" },
  },
  {
    speaker: "caller", text: "It's Sarah Chen, policy number HM-4482.", time: "0:12",
    handledBy: "Claims Agent",
    analysis: { sttConfidence: 0.99, detectedIntent: "Identity — providing credentials", sentiment: "neutral" },
  },
  {
    speaker: "agent", text: "Thank you, Sarah. I can see your auto policy is active. I'll need a few details about the incident — where did it happen?", time: "0:16",
    intent: "Identity verified",
    analysis: { action: "Policy lookup → HM-4482 confirmed active" },
  },
  {
    speaker: "caller", text: "Corner of Main and 5th, around 3pm yesterday. The other driver ran a red light.", time: "0:22",
    analysis: { sttConfidence: 0.95, detectedIntent: "Incident details — location + cause", sentiment: "neutral" },
  },
  {
    speaker: "agent", text: "Got it. I've opened claim number CL-2026-8891 for you. A claims adjuster will contact you within 2 hours. I'm also sending our approved repair network — would you like me to book an inspection?", time: "0:28",
    intent: "Claim filed",
    isGoal: true,
    analysis: { action: "Claim #CL-2026-8891 created → adjuster notified → repair network sent" },
  },
  {
    speaker: "caller", text: "Yes please, as soon as possible.", time: "0:38",
    analysis: { sttConfidence: 0.98, detectedIntent: "Affirmative — requesting repair booking", sentiment: "positive" },
  },
  {
    speaker: "agent", text: "Done — you're booked at Metro Auto Body tomorrow at 10am. They'll send a confirmation text. Anything else I can help with?", time: "0:42",
    routedTo: "Motor Insurance",
    intent: "Repair booked",
    isGoal: true,
    analysis: { action: "Metro Auto Body → 10am tomorrow → confirmation SMS queued" },
  },
];

/* ─── Analysis categories (for the "under the hood" panel) ─── */
const ANALYSIS_CATEGORIES = [
  {
    key: "stt",
    label: "Speech-to-Text",
    description: "Real-time transcription with speaker diarization. No keywords — full natural language.",
    metric: "97% avg confidence",
    color: "text-boost-green",
  },
  {
    key: "nlu",
    label: "Intent Detection",
    description: "Understands what the caller wants within the first sentence. Maps to specialist agent flows.",
    metric: "4 intents detected",
    color: "text-boost-green",
  },
  {
    key: "sentiment",
    label: "Sentiment Analysis",
    description: "Monitors frustration and urgency in real-time. Adjusts tone or escalates before the caller asks.",
    metric: "Neutral → Positive",
    color: "text-boost-green",
  },
  {
    key: "actions",
    label: "Actions Taken",
    description: "Every API call, database lookup, and workflow trigger — fully auditable.",
    metric: "5 actions",
    color: "text-boost-green",
  },
];

/* ─── Waveform bars ─── */
function Waveform({ active, small }: { active: boolean; small?: boolean }) {
  const count = small ? 16 : 24;
  const maxH = small ? 16 : 28;
  return (
    <div className={`flex items-center justify-center gap-[3px] ${small ? "h-5" : "h-8"}`}>
      {Array.from({ length: count }).map((_, i) => {
        const seed = ((i * 7 + 13) % 17) / 17;
        const h = active ? 4 + seed * (maxH - 4) : 3;
        return (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: small ? "2px" : "2.5px",
              height: `${h}px`,
              backgroundColor: active
                ? `rgba(54, 181, 149, ${0.4 + seed * 0.5})`
                : "rgba(255,255,255,0.12)",
              transitionDuration: `${300 + seed * 400}ms`,
              animation: active ? `voice-wave ${0.8 + seed * 0.7}s ease-in-out ${seed * 0.3}s infinite alternate` : "none",
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── Analyze step type ─── */
type AnalyzeStep = "idle" | "panel-open" | "reviewing" | "review-done";

/* ─── Main section ─── */
export default function VoiceSection({ guide, sectionNumber }: { guide: GuideData; sectionNumber?: string }) {
  const { ref, isVisible } = useScrollReveal({ once: true });

  const [visibleMessages, setVisibleMessages] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playComplete, setPlayComplete] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState<AnalyzeStep>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const playGenRef = useRef(0);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const allShown = visibleMessages >= VOICE_SCRIPT.length;
  const isAnalyzing = analyzeStep !== "idle";

  // Scroll transcript to bottom
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [visibleMessages]);

  // Play next message
  const playNext = useCallback(() => {
    const gen = playGenRef.current;
    setVisibleMessages((v) => {
      if (gen !== playGenRef.current) return v;
      const next = v + 1;
      if (next >= VOICE_SCRIPT.length) {
        setIsPlaying(false);
        setPlayComplete(true);
        return VOICE_SCRIPT.length;
      }
      const delay = VOICE_SCRIPT[next]?.speaker === "caller" ? 1800 : 2400;
      timerRef.current = setTimeout(playNext, delay);
      return next;
    });
  }, []);

  const startPlayback = () => {
    playGenRef.current += 1;
    setIsPlaying(true);
    setPlayComplete(false);
    setAnalyzeStep("idle");
    timerRef.current = setTimeout(playNext, 1400);
  };

  const pausePlayback = () => {
    playGenRef.current += 1;
    clearTimeout(timerRef.current);
    setIsPlaying(false);
  };

  const reset = () => {
    playGenRef.current += 1;
    clearTimeout(timerRef.current);
    setVisibleMessages(1);
    setIsPlaying(false);
    setPlayComplete(false);
    setAnalyzeStep("idle");
  };

  const openAnalyze = () => {
    setAnalyzeStep("panel-open");
    setTimeout(() => setAnalyzeStep("reviewing"), 600);
    setTimeout(() => setAnalyzeStep("review-done"), 2000);
  };

  // Next message speaker for typing indicator
  const nextMsg = VOICE_SCRIPT[visibleMessages];
  const showWaveform = isPlaying && !allShown && nextMsg;

  return (
    <section>
      <SectionHeader
        number={sectionNumber ?? "08"}
        title="Voice Preview"
        subtitle="Outstanding CX doesn't start with Press 1"
      />

      <div
        ref={ref}
        className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        {/* Main layout — call screen + optional analysis panel */}
        <div
          className={`flex flex-col sm:flex-row justify-center items-center sm:items-start gap-6 transition-all duration-700 ease-out ${
            isAnalyzing ? "max-w-3xl mx-auto" : "max-w-md mx-auto"
          }`}
        >
          {/* Call screen frame */}
          <div
            className={`relative flex-shrink-0 transition-all duration-700 ease-out ${
              isAnalyzing ? "w-[280px]" : "w-full max-w-md"
            }`}
          >
            {/* Analyze button */}
            {playComplete && analyzeStep === "idle" && (
              <div className="absolute -top-3 -right-3 z-10 animate-modal-in">
                <span className="absolute inset-0 rounded-full bg-boost-green/40 animate-ping" />
                <button
                  onClick={openAnalyze}
                  className="relative bg-boost-green text-white text-[11px] font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-boost-green-light transition-all flex items-center gap-1.5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /><path d="M11 8v6M8 11h6" />
                  </svg>
                  Analyze
                </button>
              </div>
            )}

            {/* Phone bezel */}
            <div className="rounded-[2rem] border-4 border-boost-dark bg-boost-dark p-2 shadow-2xl">
              {/* Call header */}
              <div className="bg-[#0f1117] rounded-t-[1.5rem] px-4 pt-4 pb-2 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isPlaying ? "bg-boost-green-light animate-pulse" : playComplete ? "bg-boost-green-light" : "bg-white/20"
                  }`} />
                  <p className="text-[9px] uppercase tracking-widest text-boost-green-light/70 font-medium">
                    {playComplete ? "Call ended" : isPlaying ? "Connected" : "Ready"}
                  </p>
                </div>
                <p className={`text-white/90 font-semibold ${isAnalyzing ? "text-xs" : "text-sm"}`}>
                  {guide.company_name || "Customer"}
                </p>
                <p className="text-white/30 text-[10px] mt-0.5">Voice AI Agent</p>

                {/* Waveform */}
                <div className="mt-2">
                  <Waveform active={isPlaying && !allShown} small={isAnalyzing} />
                </div>
              </div>

              {/* Transcript area */}
              <div
                ref={transcriptRef}
                className={`bg-[#0f1117] overflow-y-auto px-3 py-2 space-y-2.5 scrollbar-hide transition-all duration-700 ${
                  isAnalyzing ? "h-[300px]" : "h-[380px]"
                }`}
              >
                {VOICE_SCRIPT.slice(0, visibleMessages).map((msg, i) => (
                  <div
                    key={i}
                    className={`${i === visibleMessages - 1 && visibleMessages > 1 ? "animate-modal-in" : ""}`}
                  >
                    {/* Routing indicator — shows orchestrator/agent routing */}
                    {msg.handledBy && (
                      <div className="flex items-center gap-2 my-1.5 px-1">
                        <div className="flex-1 h-px bg-white/[0.06]" />
                        <span className="text-[8px] text-white/25 whitespace-nowrap">
                          Handled by {msg.handledBy}
                        </span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20 shrink-0">
                          <circle cx="12" cy="12" r="9" /><path d="M12 8v4l2 2" />
                        </svg>
                        <div className="flex-1 h-px bg-white/[0.06]" />
                      </div>
                    )}
                    {msg.routedTo && (
                      <div className="flex items-center gap-2 my-1.5 px-1">
                        <div className="flex-1 h-px bg-white/[0.06]" />
                        <span className="text-[8px] text-white/25 whitespace-nowrap">
                          Routed to → {msg.routedTo}
                        </span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/20 shrink-0">
                          <path d="M16 3h5v5M4 20L21 3" />
                        </svg>
                        <div className="flex-1 h-px bg-white/[0.06]" />
                      </div>
                    )}

                    {/* Agent identification bar */}
                    {msg.speaker === "agent" && (msg.routedTo || msg.handledBy) && (
                      <div className={`rounded-md px-2.5 py-1.5 mb-1.5 ${
                        msg.routedTo ? "bg-boost-purple/15" : "bg-boost-green-light/10"
                      }`}>
                        <p className={`text-[9px] font-semibold ${
                          msg.routedTo ? "text-boost-purple/70" : "text-boost-green-light/70"
                        }`}>
                          {msg.routedTo || "Orchestrator"}
                        </p>
                        <p className="text-[8px] text-white/30">Generated response</p>
                      </div>
                    )}

                    {/* Message bubble */}
                    {msg.speaker === "caller" ? (
                      /* Customer — purple bubble, right-aligned */
                      <div className="flex justify-end">
                        <div className={`bg-boost-purple/30 rounded-2xl rounded-br-sm px-3 py-2 max-w-[85%] ${isAnalyzing ? "" : ""}`}>
                          <p className={`text-white/80 leading-relaxed ${isAnalyzing ? "text-[10px]" : "text-[11px]"}`}>
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Agent — grey bubble, left-aligned, with sparkle icon */
                      <div className="flex items-start gap-2">
                        {/* Green sparkle icon (LLM-generated indicator) */}
                        <div className="shrink-0 mt-1">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-boost-green-light/60">
                            <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" fill="currentColor" />
                            <path d="M5 5l1.5 3.5L10 10 6.5 11.5 5 15l-1.5-3.5L0 10l3.5-1.5L5 5z" fill="currentColor" opacity="0.4" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`bg-white/[0.08] rounded-2xl rounded-bl-sm px-3 py-2 ${isAnalyzing ? "" : ""}`}>
                            <p className={`text-white/80 leading-relaxed ${isAnalyzing ? "text-[10px]" : "text-[11px]"}`}>
                              {msg.text}
                            </p>
                          </div>
                          {/* Goal trophy + intent badge row */}
                          <div className="flex items-center gap-1.5 mt-1 ml-1">
                            {msg.isGoal && (
                              <span className="text-[10px]" title="Goal tracked">🏆</span>
                            )}
                            {msg.intent && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-semibold uppercase tracking-wider bg-boost-green-light/10 text-boost-green-light/80">
                                <span className="w-1 h-1 rounded-full bg-boost-green-light/60" />
                                {msg.intent}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className={`text-[8px] text-white/15 mt-0.5 tabular-nums ${
                      msg.speaker === "caller" ? "text-right mr-1" : "ml-7"
                    }`}>
                      {msg.time}
                    </p>
                  </div>
                ))}

                {/* Waveform typing indicator */}
                {showWaveform && (
                  <div className="flex items-center gap-2 animate-modal-in">
                    <span className="w-7" />
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-boost-green-light/40 animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-boost-green-light/40 animate-pulse" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-boost-green-light/40 animate-pulse" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}

                {/* Resolution banner */}
                {playComplete && (
                  <div className="pt-2 border-t border-white/[0.06] animate-modal-in">
                    <p className="text-[10px] text-boost-green-light font-medium">
                      Resolved in 0:48 · No transfers · Claim filed + repair booked
                    </p>
                  </div>
                )}

                <div style={{ height: 1 }} />
              </div>

              {/* Controls bar */}
              <div className="bg-[#0f1117] rounded-b-[1.5rem] px-4 py-3 flex items-center justify-between">
                <Badge variant="green" size="sm">Voice</Badge>
                <div className="flex items-center gap-2">
                  {!isPlaying && !playComplete && (
                    <button
                      onClick={startPlayback}
                      className="flex items-center gap-1.5 text-[10px] font-semibold text-white/70 hover:text-white transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      Play
                    </button>
                  )}
                  {isPlaying && (
                    <button
                      onClick={pausePlayback}
                      className="flex items-center gap-1.5 text-[10px] font-semibold text-white/70 hover:text-white transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                      Pause
                    </button>
                  )}
                  {(playComplete || visibleMessages > 1) && !isPlaying && (
                    <button
                      onClick={reset}
                      className="flex items-center gap-1.5 text-[10px] font-semibold text-white/40 hover:text-white/70 transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Analysis panel — slides in after "Analyze" ── */}
          {isAnalyzing && (
            <div
              className="flex-1 min-w-0 animate-modal-in"
              style={{ animationDuration: "500ms" }}
            >
              <div className="bg-white rounded-xl border border-boost-border p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-bold text-boost-dark">Under the Hood</p>
                    <p className="text-[10px] text-boost-muted">What the AI processed during this call</p>
                  </div>
                  {analyzeStep === "reviewing" && (
                    <div className="flex items-center gap-1.5 text-[10px] text-boost-muted">
                      <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
                        <path d="M22 12a10 10 0 01-10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                      Analyzing…
                    </div>
                  )}
                  {analyzeStep === "review-done" && (
                    <Badge variant="green" size="sm">Complete</Badge>
                  )}
                </div>

                {/* Analysis categories */}
                <div className="space-y-3">
                  {ANALYSIS_CATEGORIES.map((cat, i) => (
                    <div
                      key={cat.key}
                      className="transition-all"
                      style={{
                        opacity: analyzeStep === "review-done" ? 1 : analyzeStep === "reviewing" ? 0.4 : 0,
                        transform: analyzeStep === "review-done" ? "translateY(0)" : "translateY(8px)",
                        transitionDuration: "400ms",
                        transitionDelay: analyzeStep === "review-done" ? `${i * 100}ms` : "0ms",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-[11px] font-semibold text-boost-dark">{cat.label}</p>
                          <p className="text-[10px] text-boost-muted leading-relaxed mt-0.5">{cat.description}</p>
                        </div>
                        <span className={`text-[10px] font-bold shrink-0 tabular-nums ${cat.color}`}>
                          {cat.metric}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Per-message analysis log */}
                {analyzeStep === "review-done" && (
                  <div className="mt-5 pt-4 border-t border-boost-border">
                    <p className="text-[10px] font-bold text-boost-muted uppercase tracking-[0.12em] mb-3">
                      Message-level detail
                    </p>
                    <div className="space-y-2 max-h-[280px] overflow-y-auto">
                      {VOICE_SCRIPT.filter((m) => m.analysis).map((msg, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-[9px] text-boost-muted tabular-nums w-7 shrink-0 text-right mt-0.5">
                            {msg.time}
                          </span>
                          <div className="flex-1 min-w-0">
                            {msg.speaker === "caller" && msg.analysis?.sttConfidence && (
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-boost-surface text-boost-muted font-medium">
                                  STT {Math.round(msg.analysis.sttConfidence * 100)}%
                                </span>
                                {msg.analysis.detectedIntent && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-boost-green-light/8 text-boost-green font-medium">
                                    {msg.analysis.detectedIntent}
                                  </span>
                                )}
                                {msg.analysis.sentiment && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-boost-surface text-boost-muted font-medium capitalize">
                                    {msg.analysis.sentiment}
                                  </span>
                                )}
                              </div>
                            )}
                            {msg.speaker === "agent" && msg.analysis?.action && (
                              <p className="text-[9px] text-boost-dark/70">
                                <span className="text-boost-purple font-semibold mr-1">Action:</span>
                                {msg.analysis.action}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Waveform animation */}
      <style jsx>{`
        @keyframes voice-wave {
          0% { transform: scaleY(1); }
          100% { transform: scaleY(0.3); }
        }
      `}</style>
    </section>
  );
}
