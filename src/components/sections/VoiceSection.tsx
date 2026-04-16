"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { GuideData } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

/* ─────────────────────────────────────────────────────────────────────
 *  Voice AI — "Outstanding CX doesn't start with Press 1"
 *
 *  The design thesis: show, don't tell. The left side renders a
 *  traditional IVR tree (grey, numbered, rigid, visually frustrating).
 *  The right side renders a natural voice conversation (flowing
 *  transcript with real-time intent badges). The contrast makes the
 *  case without a single metric card.
 *
 *  The voice transcript animates line-by-line on scroll, like the
 *  demo chat section — but with a waveform visual and speaker labels
 *  instead of chat bubbles.
 * ───────────────────────────────────────────────────────────────────── */

/* ─── IVR Tree data ─── */
const IVR_TREE = [
  { level: 0, label: "Welcome to Acme Insurance", type: "system" as const },
  { level: 0, label: "For English, press 1. Para español, oprima 2.", type: "system" as const },
  { level: 1, label: "Press 1 for Claims", type: "option" as const },
  { level: 1, label: "Press 2 for Billing", type: "option" as const },
  { level: 1, label: "Press 3 for Policy changes", type: "option" as const },
  { level: 1, label: "Press 4 for All other inquiries", type: "option" as const },
  { level: 2, label: "You selected: Claims", type: "system" as const },
  { level: 2, label: "Press 1 for Auto claims", type: "option" as const },
  { level: 2, label: "Press 2 for Home claims", type: "option" as const },
  { level: 2, label: "Press 3 to hear these options again", type: "option" as const },
  { level: 3, label: "Your estimated wait time is 12 minutes.", type: "system" as const },
  { level: 3, label: "Your call is important to us. Please stay on the line.", type: "hold" as const },
];

/* ─── Voice transcript data ─── */
const VOICE_TRANSCRIPT = [
  { speaker: "caller" as const, text: "Hi, I was in a fender bender yesterday and need to file a claim.", intent: null },
  { speaker: "agent" as const, text: "I'm sorry to hear that. Let me help you get that claim started right away. Can you confirm your name and policy number?", intent: "FNOL intake" },
  { speaker: "caller" as const, text: "It's Sarah Chen, policy number HM-4482.", intent: null },
  { speaker: "agent" as const, text: "Thank you, Sarah. I can see your auto policy is active. I'll need a few details about the incident — where did it happen?", intent: "Identity verified" },
  { speaker: "caller" as const, text: "Corner of Main and 5th, around 3pm. The other driver ran a red light.", intent: null },
  { speaker: "agent" as const, text: "Got it. I've opened claim #CL-2026-8891 for you. A claims adjuster will contact you within 2 hours. I'm also sending you our approved repair network — would you like me to book an inspection?", intent: "Claim filed" },
  { speaker: "caller" as const, text: "Yes please, as soon as possible.", intent: null },
  { speaker: "agent" as const, text: "Done — you're booked for tomorrow at 10am at Metro Auto Body. They'll send a confirmation text. Anything else I can help with?", intent: "Repair booked" },
];

/* ─── IVR Tree visual ─── */
function IVRTree({ visible }: { visible: boolean }) {
  return (
    <div className="space-y-0">
      {IVR_TREE.map((node, i) => {
        const delay = 200 + i * 120;
        const indent = node.level * 20;

        return (
          <div
            key={i}
            className="transition-all"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-8px)",
              transitionDuration: "400ms",
              transitionDelay: `${delay}ms`,
              paddingLeft: `${indent}px`,
            }}
          >
            {node.level > 0 && (
              <span className="inline-block w-3 h-px bg-boost-border mr-2 align-middle" />
            )}
            <span
              className={`inline-block text-[12px] leading-relaxed py-1 ${
                node.type === "system"
                  ? "text-boost-muted/70 italic"
                  : node.type === "hold"
                    ? "text-boost-muted/50 italic"
                    : "text-boost-muted"
              }`}
            >
              {node.type === "option" && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-boost-border/60 text-[9px] font-bold text-boost-muted/70 mr-1.5 align-text-bottom">
                  {node.label.match(/Press (\d)/)?.[1]}
                </span>
              )}
              {node.type === "hold" && (
                <span className="inline-block mr-1.5 text-boost-muted/30">♪</span>
              )}
              {node.label}
            </span>
          </div>
        );
      })}

      {/* Frustration indicator */}
      <div
        className="mt-4 pt-3 border-t border-dashed border-boost-border/50 transition-all"
        style={{
          opacity: visible ? 1 : 0,
          transitionDuration: "500ms",
          transitionDelay: `${200 + IVR_TREE.length * 120 + 300}ms`,
        }}
      >
        <p className="text-[11px] text-boost-muted/60 italic">
          Average time to reach an agent: 4 min 22 sec
        </p>
        <p className="text-[11px] text-boost-muted/40 italic mt-0.5">
          Caller abandonment rate: 23%
        </p>
      </div>
    </div>
  );
}

/* ─── Voice transcript visual ─── */
function VoiceTranscript({ visible }: { visible: boolean }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (visible && visibleCount < VOICE_TRANSCRIPT.length) {
      intervalRef.current = setInterval(() => {
        setVisibleCount((c) => {
          if (c >= VOICE_TRANSCRIPT.length) {
            clearInterval(intervalRef.current);
            return c;
          }
          return c + 1;
        });
      }, 1400);
    }
    return () => clearInterval(intervalRef.current);
  }, [visible, visibleCount]);

  return (
    <div className="space-y-3">
      {VOICE_TRANSCRIPT.map((line, i) => {
        const isVisible = i < visibleCount;
        const isCaller = line.speaker === "caller";

        return (
          <div
            key={i}
            className="transition-all"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(6px)",
              transitionDuration: "400ms",
            }}
          >
            <div className={`flex gap-3 ${isCaller ? "" : ""}`}>
              {/* Speaker indicator */}
              <div className="flex-shrink-0 mt-0.5">
                {isCaller ? (
                  <div className="w-6 h-6 rounded-full bg-boost-surface border border-boost-border flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-boost-muted">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-boost-green-light/10 border border-boost-green-light/20 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-boost-green-light">
                      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-boost-muted/60 uppercase tracking-wider mb-0.5">
                  {isCaller ? "Caller" : "Voice Agent"}
                </p>
                <p className={`text-[13px] leading-relaxed ${
                  isCaller ? "text-boost-dark" : "text-boost-dark/90"
                }`}>
                  {line.text}
                </p>

                {/* Intent badge — only on agent responses */}
                {line.intent && (
                  <span
                    className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-boost-green-light/8 text-boost-green border border-boost-green-light/15"
                  >
                    <span className="w-1 h-1 rounded-full bg-boost-green-light" />
                    {line.intent}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing indicator when not all visible */}
      {visibleCount > 0 && visibleCount < VOICE_TRANSCRIPT.length && (
        <div className="flex gap-3 items-center">
          <div className="w-6 h-6 rounded-full bg-boost-green-light/10 border border-boost-green-light/20 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-boost-green-light">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" />
            </svg>
          </div>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-boost-green-light/40 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-boost-green-light/40 animate-pulse" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-boost-green-light/40 animate-pulse" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      )}

      {/* Resolution stats — appear after conversation completes */}
      {visibleCount >= VOICE_TRANSCRIPT.length && (
        <div
          className="mt-4 pt-3 border-t border-boost-green-light/10 transition-all"
          style={{
            opacity: visibleCount >= VOICE_TRANSCRIPT.length ? 1 : 0,
            transitionDuration: "500ms",
            transitionDelay: "300ms",
          }}
        >
          <p className="text-[11px] text-boost-green font-medium">
            Resolved in 1 min 48 sec · No transfers · Claim filed + repair booked
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Capability strip ─── */
const CAPABILITIES = [
  {
    label: "Real-time Intent",
    detail: "Understands what the caller wants within the first sentence — no menu trees, no waiting.",
  },
  {
    label: "Natural Conversation",
    detail: "Full-duplex dialogue with barge-in support. Callers speak naturally, not in keywords.",
  },
  {
    label: "Warm Handover",
    detail: "When human expertise is needed, the agent transfers with full context — the customer never repeats themselves.",
  },
  {
    label: "Sentiment Detection",
    detail: "Monitors frustration and urgency in real-time. Adjusts tone or escalates before the caller asks.",
  },
];

/* ─── Main section ─── */
export default function VoiceSection({ guide }: { guide: GuideData }) {
  const { ref: comparisonRef, isVisible: comparisonVisible } = useScrollReveal({ once: true, threshold: 0.15 });
  const { ref: capsRef, isVisible: capsVisible } = useScrollReveal({ once: true });

  return (
    <section>
      <SectionHeader
        number="08"
        title="Voice AI"
        subtitle="Outstanding CX doesn't start with Press 1"
      />

      {/* Editorial opening */}
      <p className="text-boost-dark text-lg leading-relaxed max-w-2xl mb-10">
        The IVR tree was designed for rotary phones. Your customers have moved on.
        Conversational voice replaces rigid menus with a{" "}
        <span className="font-semibold">natural front door</span> — callers say what
        they need, and the AI resolves it in real time.
      </p>

      {/* ── Side-by-side comparison ── */}
      <div ref={comparisonRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-14">
        {/* Left: Traditional IVR (intentionally grey and frustrating) */}
        <div className="rounded-xl bg-boost-surface/70 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-boost-muted/30" />
            <p className="text-[10px] font-bold text-boost-muted/60 uppercase tracking-[0.15em]">
              Traditional IVR
            </p>
          </div>
          <IVRTree visible={comparisonVisible} />
        </div>

        {/* Right: Conversational Voice (warm, flowing, green accents) */}
        <div className="rounded-xl bg-white border border-boost-border p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-boost-green-light" />
            <p className="text-[10px] font-bold text-boost-green uppercase tracking-[0.15em]">
              Conversational Voice AI
            </p>
          </div>
          <VoiceTranscript visible={comparisonVisible} />
        </div>
      </div>

      {/* ── Capabilities ── */}
      <div ref={capsRef}>
        <p className="text-[10px] font-bold text-boost-muted uppercase tracking-[0.15em] mb-5">
          How it works
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CAPABILITIES.map((cap, i) => (
            <div
              key={cap.label}
              className="transition-all"
              style={{
                opacity: capsVisible ? 1 : 0,
                transform: capsVisible ? "translateY(0)" : "translateY(12px)",
                transitionDuration: "500ms",
                transitionDelay: `${200 + i * 100}ms`,
              }}
            >
              <p className="text-sm font-semibold text-boost-dark mb-1.5">
                {cap.label}
              </p>
              <p className="text-[12px] text-boost-muted leading-relaxed">
                {cap.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Closing editorial stat */}
        <p className="text-sm text-boost-muted mt-10 max-w-xl leading-relaxed">
          Organisations that deploy conversational voice see{" "}
          <span className="font-semibold text-boost-dark">40% fewer escalations</span> and{" "}
          <span className="font-semibold text-boost-dark">3× higher caller satisfaction</span>{" "}
          compared to traditional IVR trees.
        </p>
      </div>
    </section>
  );
}
