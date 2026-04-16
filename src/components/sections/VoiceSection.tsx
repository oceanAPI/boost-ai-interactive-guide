"use client";

import { useState, useEffect, useRef } from "react";
import type { GuideData } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

/* ─────────────────────────────────────────────────────────────────────
 *  Voice AI — "Outstanding CX doesn't start with Press 1"
 *
 *  Two distinct device UIs side by side:
 *    Left:  A KEYPAD + IVR MENU (grey, rigid, frustrating)
 *    Right: A CALL SCREEN with live waveform + transcript (warm, fast)
 *
 *  Each side is a self-contained "device mockup" with its own visual
 *  language — the contrast makes the case without metric cards.
 * ───────────────────────────────────────────────────────────────────── */

/* ─── IVR menu steps ─── */
const IVR_STEPS = [
  { text: "Welcome to Acme Insurance. Your call is important to us.", type: "system" as const, delay: 800 },
  { text: "For English, press 1.", type: "system" as const, delay: 600 },
  { text: "1", type: "keypress" as const, delay: 1200 },
  { text: "Press 1 for Claims. Press 2 for Billing. Press 3 for Policy changes. Press 4 for All other inquiries.", type: "system" as const, delay: 600 },
  { text: "1", type: "keypress" as const, delay: 1400 },
  { text: "Press 1 for Auto. Press 2 for Home. Press 3 to hear these options again.", type: "system" as const, delay: 600 },
  { text: "1", type: "keypress" as const, delay: 1200 },
  { text: "All agents are currently busy. Your estimated wait time is 12 minutes.", type: "system" as const, delay: 600 },
  { text: "♪  Your call is important to us. Please stay on the line…", type: "hold" as const, delay: 0 },
];

/* ─── Voice transcript lines ─── */
const VOICE_LINES = [
  { speaker: "caller" as const, text: "Hi, I was in a fender bender yesterday and need to file a claim.", time: "0:00", intent: null },
  { speaker: "agent" as const, text: "I'm sorry to hear that, let me help you right away. Can you confirm your name and policy number?", time: "0:04", intent: "FNOL intake" },
  { speaker: "caller" as const, text: "Sarah Chen, policy HM-4482.", time: "0:12", intent: null },
  { speaker: "agent" as const, text: "Thank you Sarah. Your auto policy is active. Where did the incident happen?", time: "0:16", intent: "Identity verified" },
  { speaker: "caller" as const, text: "Corner of Main and 5th, around 3pm. Other driver ran a red light.", time: "0:22", intent: null },
  { speaker: "agent" as const, text: "Claim #CL-2026-8891 is now open. I'm booking you at Metro Auto Body tomorrow at 10am for inspection.", time: "0:28", intent: "Claim filed" },
  { speaker: "caller" as const, text: "That's perfect, thanks.", time: "0:38", intent: null },
  { speaker: "agent" as const, text: "All set. You'll get a confirmation text shortly. Anything else I can help with?", time: "0:42", intent: "Repair booked" },
];

/* ─── Waveform bars — purely decorative CSS animation ─── */
function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-10 my-3">
      {Array.from({ length: 24 }).map((_, i) => {
        // Deterministic "random" height per bar
        const seed = ((i * 7 + 13) % 17) / 17;
        const minH = 4;
        const maxH = active ? 28 : 6;
        const baseH = minH + seed * (maxH - minH);
        return (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: "2.5px",
              height: active ? `${baseH}px` : "4px",
              backgroundColor: active
                ? `rgba(54, 181, 149, ${0.4 + seed * 0.5})`
                : "rgba(255,255,255,0.15)",
              transitionDuration: `${300 + seed * 400}ms`,
              transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              animation: active ? `voice-wave ${0.8 + seed * 0.7}s ease-in-out ${seed * 0.3}s infinite alternate` : "none",
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── IVR Keypad visual ─── */
function Keypad() {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "✱", "0", "#"];
  return (
    <div className="grid grid-cols-3 gap-1.5 w-fit mx-auto mb-4">
      {keys.map((k) => (
        <div
          key={k}
          className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/30 text-sm font-medium"
        >
          {k}
        </div>
      ))}
    </div>
  );
}

/* ─── IVR Device ─── */
function IVRDevice({ visible }: { visible: boolean }) {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const elapsedRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (!visible) return;

    // Start the elapsed timer
    elapsedRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);

    // Reveal IVR steps one by one
    let step = 0;
    const showNext = () => {
      if (step >= IVR_STEPS.length) return;
      step++;
      setVisibleSteps(step);
      if (step < IVR_STEPS.length) {
        timerRef.current = setTimeout(showNext, IVR_STEPS[step]?.delay || 1000);
      }
    };
    timerRef.current = setTimeout(showNext, IVR_STEPS[0].delay);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(elapsedRef.current);
    };
  }, [visible]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="rounded-[1.75rem] bg-[#1a1a1e] border border-white/[0.06] p-3 shadow-2xl flex flex-col h-full">
      {/* Call header */}
      <div className="text-center pt-4 pb-2">
        <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Incoming call</p>
        <p className="text-white/80 text-base font-semibold">Acme Insurance</p>
        <p className="text-white/30 text-xs mt-0.5">+1 (800) 555-0199</p>
        <p className="text-white/20 text-xs mt-1 tabular-nums">{formatTime(elapsed)}</p>
      </div>

      {/* Keypad */}
      <Keypad />

      {/* IVR transcript */}
      <div className="flex-1 overflow-hidden px-2 space-y-1.5 mb-3">
        {IVR_STEPS.slice(0, visibleSteps).map((step, i) => (
          <div
            key={i}
            className="animate-modal-in"
            style={{ animationDuration: "300ms" }}
          >
            {step.type === "keypress" ? (
              <div className="flex justify-end">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-white/60 text-xs font-bold">
                  {step.text}
                </span>
              </div>
            ) : (
              <p className={`text-[11px] leading-relaxed ${
                step.type === "hold"
                  ? "text-white/20 italic"
                  : "text-white/40"
              }`}>
                {step.text}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Call controls */}
      <div className="flex items-center justify-center gap-5 pb-3">
        <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.3"><path d="M1 1l22 22M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 12v-2m14 0v2c0 .76-.12 1.5-.34 2.18"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        </div>
        <div className="w-12 h-12 rounded-full bg-red-500/80 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.3"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
        </div>
      </div>
    </div>
  );
}

/* ─── Voice AI Call Screen ─── */
function VoiceCallScreen({ visible }: { visible: boolean }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [callActive, setCallActive] = useState(false);
  const [resolved, setResolved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (!visible) return;
    setCallActive(true);

    timerRef.current = setInterval(() => {
      setVisibleLines((c) => {
        if (c >= VOICE_LINES.length) {
          clearInterval(timerRef.current);
          setCallActive(false);
          setResolved(true);
          return c;
        }
        return c + 1;
      });
    }, 1600);

    return () => clearInterval(timerRef.current);
  }, [visible]);

  return (
    <div className="rounded-[1.75rem] bg-[#0f1117] border border-boost-green-light/10 p-3 shadow-2xl flex flex-col h-full">
      {/* Call header */}
      <div className="text-center pt-4 pb-1">
        <div className="flex items-center justify-center gap-1.5 mb-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${callActive ? "bg-boost-green-light animate-pulse" : resolved ? "bg-boost-green-light" : "bg-white/20"}`} />
          <p className="text-[10px] uppercase tracking-widest text-boost-green-light/70 font-medium">
            {resolved ? "Resolved" : callActive ? "Connected" : "Connecting"}
          </p>
        </div>
        <p className="text-white/90 text-base font-semibold">Sarah Chen</p>
        <p className="text-white/30 text-xs mt-0.5">Policy HM-4482</p>
      </div>

      {/* Waveform */}
      <Waveform active={callActive} />

      {/* Live transcript */}
      <div className="flex-1 overflow-hidden px-2 space-y-2 mb-3">
        {VOICE_LINES.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className="animate-modal-in"
            style={{ animationDuration: "350ms" }}
          >
            <div className="flex items-start gap-2">
              <span className="text-[9px] text-white/20 tabular-nums mt-0.5 w-6 shrink-0 text-right">
                {line.time}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] leading-relaxed ${
                  line.speaker === "caller" ? "text-white/60" : "text-white/90"
                }`}>
                  <span className={`text-[9px] font-semibold uppercase tracking-wider mr-1.5 ${
                    line.speaker === "caller" ? "text-white/25" : "text-boost-green-light/60"
                  }`}>
                    {line.speaker === "caller" ? "Caller" : "AI"}
                  </span>
                  {line.text}
                </p>
                {line.intent && (
                  <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider bg-boost-green-light/10 text-boost-green-light/80 border border-boost-green-light/10">
                    <span className="w-1 h-1 rounded-full bg-boost-green-light/60" />
                    {line.intent}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Resolution banner */}
        {resolved && (
          <div className="mt-2 pt-2 border-t border-white/[0.06] animate-modal-in">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-boost-green-light font-medium">
                Resolved in 0:48 · No transfers
              </p>
              <div className="flex gap-1">
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-boost-green-light/10 text-boost-green-light/70 uppercase tracking-wider font-semibold">Claim filed</span>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-boost-green-light/10 text-boost-green-light/70 uppercase tracking-wider font-semibold">Repair booked</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Call controls */}
      <div className="flex items-center justify-center gap-5 pb-3">
        <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.4"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${resolved ? "bg-boost-green-light/20" : "bg-boost-green-light/80"}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.4"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
        </div>
      </div>
    </div>
  );
}

/* ─── Capabilities ─── */
const CAPABILITIES = [
  { label: "Real-time Intent", detail: "Understands what the caller wants within the first sentence — no menu trees, no waiting." },
  { label: "Natural Conversation", detail: "Full-duplex dialogue with barge-in support. Callers speak naturally, not in keywords." },
  { label: "Warm Handover", detail: "When human expertise is needed, the agent transfers with full context — no repeating." },
  { label: "Sentiment Detection", detail: "Monitors frustration and urgency in real-time. Adjusts tone or escalates before the caller asks." },
];

/* ─── Main section ─── */
export default function VoiceSection({ guide }: { guide: GuideData }) {
  const { ref: devicesRef, isVisible: devicesVisible } = useScrollReveal({ once: true, threshold: 0.15 });
  const { ref: capsRef, isVisible: capsVisible } = useScrollReveal({ once: true });

  return (
    <section>
      <SectionHeader
        number="08"
        title="Voice AI"
        subtitle="Outstanding CX doesn't start with Press 1"
      />

      <p className="text-boost-dark text-lg leading-relaxed max-w-2xl mb-10">
        The IVR tree was designed for rotary phones. Your customers have moved on.
        Conversational voice replaces rigid menus with a{" "}
        <span className="font-semibold">natural front door</span> — callers say what
        they need, and the AI resolves it in real time.
      </p>

      {/* ── Side-by-side device mockups ── */}
      <div ref={devicesRef} className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-14">
        {/* Left: IVR — intentionally grey and frustrating */}
        <div
          className="transition-all"
          style={{
            opacity: devicesVisible ? 1 : 0,
            transform: devicesVisible ? "translateY(0)" : "translateY(20px)",
            transitionDuration: "700ms",
          }}
        >
          <p className="text-[10px] font-bold text-boost-muted/50 uppercase tracking-[0.15em] mb-3 text-center">
            Traditional IVR
          </p>
          <div className="max-w-[320px] mx-auto" style={{ minHeight: "520px" }}>
            <IVRDevice visible={devicesVisible} />
          </div>
        </div>

        {/* Right: Conversational Voice — warm and efficient */}
        <div
          className="transition-all"
          style={{
            opacity: devicesVisible ? 1 : 0,
            transform: devicesVisible ? "translateY(0)" : "translateY(20px)",
            transitionDuration: "700ms",
            transitionDelay: "200ms",
          }}
        >
          <p className="text-[10px] font-bold text-boost-green uppercase tracking-[0.15em] mb-3 text-center">
            Conversational Voice AI
          </p>
          <div className="max-w-[320px] mx-auto" style={{ minHeight: "520px" }}>
            <VoiceCallScreen visible={devicesVisible} />
          </div>
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
              <p className="text-sm font-semibold text-boost-dark mb-1.5">{cap.label}</p>
              <p className="text-[12px] text-boost-muted leading-relaxed">{cap.detail}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-boost-muted mt-10 max-w-xl leading-relaxed">
          Organisations that deploy conversational voice see{" "}
          <span className="font-semibold text-boost-dark">40% fewer escalations</span> and{" "}
          <span className="font-semibold text-boost-dark">3× higher caller satisfaction</span>{" "}
          compared to traditional IVR trees.
        </p>
      </div>

      {/* Waveform animation keyframes */}
      <style jsx>{`
        @keyframes voice-wave {
          0% { transform: scaleY(1); }
          100% { transform: scaleY(0.3); }
        }
      `}</style>
    </section>
  );
}
