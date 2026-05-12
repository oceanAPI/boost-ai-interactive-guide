"use client";

/* ──────────────────────────────────────────────────────────────
 *  VoiceLiveSection — live voice demo against a boost.ai tenant
 *
 *  Phase 1 — Core voice loop:
 *    - User taps mic → browser prompts for permission
 *    - Web Speech API SpeechRecognition transcribes user speech
 *    - Transcript POSTed to /chat/v2 with `voice: true`
 *    - Boost.ai response (text + SSML) → Web Speech API
 *      SpeechSynthesis speaks the reply
 *    - Bubble transcript UI mirrors LiveChatSection vocabulary
 *
 *  Honest framing: voice quality here is the BROWSER's default TTS
 *  (system voice). Production Boost Voice uses ElevenLabs +
 *  Speechmatics and sounds substantially better. This demo proves
 *  the conversation brain works end-to-end; for the polished sound,
 *  customers call the phone number provisioned during their POC.
 *
 *  Phases NOT yet built (commit roadmap):
 *    Phase 2 — end_call teardown, barge_in interrupt, mic waveform,
 *              connection pill, comprehensive error states
 *    Phase 3 — post-call DataFunnelPanel analyzer (Export API)
 *    Phase 4 — iOS Safari edge cases + tab-switch graceful pause
 * ────────────────────────────────────────────────────────────── */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  postText,
  startConversation,
  type ChatElement,
  type ChatMessage,
  type ChatResponse,
} from "@/lib/boost-chat";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface VoiceLiveSectionProps {
  /** Tenant domain, e.g. `"financewizard.boost.ai"`. No protocol. */
  tenant: string;
  /** `"live"` → default demo tenant, `"custom_live"` → customer's. */
  mode: "live" | "custom_live";
  sectionNumber?: string;
}

/** Lifecycle phases. Drives the mic button label, panel state, and
 *  whether the SpeechRecognition / SpeechSynthesis engines are
 *  allowed to fire. */
type Phase =
  | "idle"          // ready to start — mic button is "Start voice call"
  | "starting"      // requesting mic permission + opening boost.ai conv
  | "listening"     // SpeechRecognition active, capturing user speech
  | "thinking"      // request in flight to /chat/v2
  | "speaking"      // SpeechSynthesis playing the agent's reply
  | "ended"         // session torn down — mic button is "Call again"
  | "error";        // unrecoverable error — see errorMessage

/* ─── Browser-API typings (Web Speech API is not in stock lib.dom) ─ */

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEventLike) => void) | null;
  onend: ((ev: Event) => void) | null;
  onspeechstart: ((ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionCtor {
  new (): SpeechRecognitionLike;
}

/** Resolve the SpeechRecognition constructor across vendor prefixes.
 *  Chrome/Edge use the prefixed `webkitSpeechRecognition`; Firefox
 *  doesn't ship it at all; Safari has partial support behind the
 *  unprefixed name (iOS 14.5+). Returns null on unsupported. */
function resolveSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Strip SSML tags + decode common XML entities so the response can
 *  be handed to browser SpeechSynthesis as plain text. The browser's
 *  speak-utterance API doesn't accept SSML, so the prosody hints
 *  are lost — that's an acceptable Phase 1 tradeoff. */
function ssmlToText(ssml: string): string {
  return ssml
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract speakable text from a ChatResponse — prefer SSML when
 *  present (voice-flavoured), fall back to plain text elements. */
function extractSpeakableText(response: ChatResponse): string {
  const parts: string[] = [];
  for (const el of response.elements) {
    if (el.type === "ssml") {
      parts.push(ssmlToText(el.payload.ssml));
    } else if (el.type === "text") {
      parts.push(el.payload.text);
    } else if (el.type === "html") {
      // Strip HTML tags as a last-ditch fallback. Plain text is
      // preferable, but sometimes a tenant only returns html.
      const stripped = el.payload.html.replace(/<[^>]+>/g, "").trim();
      if (stripped) parts.push(stripped);
    }
  }
  return parts.join(" ").trim();
}

/* ─── Component ─────────────────────────────────────────────── */

export default function VoiceLiveSection({
  tenant,
  mode,
  sectionNumber,
}: VoiceLiveSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });

  /* ── State ─────────────────────────────────────────────── */
  const [phase, setPhase] = useState<Phase>("idle");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* ── Refs ──────────────────────────────────────────────── */
  /** Live recognition instance. Held in a ref so the unmount cleanup
   *  can abort it without React re-renders. */
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  /** Active synthesis utterance. Cleared when speech ends so Phase 2
   *  barge-in can cancel it from another event handler. */
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  /** AbortController for in-flight /chat/v2 requests. */
  const fetchAbortRef = useRef<AbortController | null>(null);

  /* ── Feature detection (memoised so the support-check banner
   *     doesn't flicker on each render) ─────────────────── */
  const supportStatus = useMemo(() => {
    if (typeof window === "undefined") return { ok: false, reason: "ssr" };
    const hasRecognition = !!resolveSpeechRecognition();
    const hasSynthesis = "speechSynthesis" in window;
    if (!hasRecognition) {
      return {
        ok: false as const,
        reason:
          "This browser doesn't support Web Speech recognition. Try Chrome or Edge on desktop.",
      };
    }
    if (!hasSynthesis) {
      return {
        ok: false as const,
        reason:
          "This browser doesn't support speech synthesis. Try Chrome or Edge.",
      };
    }
    return { ok: true as const, reason: null };
  }, []);

  /* ── Helpers ───────────────────────────────────────────── */

  /** Append a user-side bubble to the transcript. */
  const appendUserMessage = useCallback((transcript: string) => {
    const now = new Date().toISOString();
    setMessages((prev) => [
      ...prev,
      {
        key: `user-${now}-${Math.random().toString(36).slice(2, 8)}`,
        source: "client",
        elements: [{ type: "text", payload: { text: transcript } }],
        date_created: now,
      },
    ]);
  }, []);

  /** Append a bot-side bubble using the full element list from a
   *  ChatResponse so SSML / text / links all render. */
  const appendBotMessage = useCallback((response: ChatResponse) => {
    setMessages((prev) => [
      ...prev,
      {
        key: `bot-${response.id ?? Math.random().toString(36).slice(2, 8)}`,
        id: response.id,
        source: response.source ?? "bot",
        elements: response.elements ?? [],
        date_created: response.date_created ?? new Date().toISOString(),
        avatar_url: response.avatar_url,
        language: response.language,
      },
    ]);
  }, []);

  /** Speak a string via the browser's SpeechSynthesis. Sets phase to
   *  "speaking" while audio plays, drops back to "listening" once
   *  done so the user can respond. */
  const speak = useCallback((text: string) => {
    if (!text.trim()) {
      setPhase("listening");
      return;
    }
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.0;
    utt.pitch = 1.0;
    utt.onstart = () => setPhase("speaking");
    utt.onend = () => {
      utteranceRef.current = null;
      setPhase((p) => (p === "speaking" ? "listening" : p));
    };
    utt.onerror = () => {
      utteranceRef.current = null;
      setPhase((p) => (p === "speaking" ? "listening" : p));
    };
    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, []);

  /** Send a user transcript to /chat/v2 with voice: true, then speak
   *  whatever the agent replies with. */
  const sendUserTurn = useCallback(
    async (transcript: string) => {
      if (!conversationId) return;
      const ctrl = new AbortController();
      fetchAbortRef.current = ctrl;
      setPhase("thinking");
      try {
        const res = await postText(
          tenant,
          conversationId,
          transcript,
          ctrl.signal,
          /* voice */ true,
        );
        if (ctrl.signal.aborted) return;
        if (res.response) {
          appendBotMessage(res.response);
          const speakable = extractSpeakableText(res.response);
          speak(speakable);
        } else {
          setPhase("listening");
        }
        // Phase 2 will branch here on res.end_call / res.barge_in.
      } catch (err) {
        if (ctrl.signal.aborted) return;
        const msg =
          err instanceof Error ? err.message : "Voice request failed";
        setErrorMessage(msg);
        setPhase("error");
      }
    },
    [tenant, conversationId, appendBotMessage, speak],
  );

  /** Lazy-build the SpeechRecognition instance and wire its events.
   *  Returns null on unsupported browsers. */
  const buildRecognition = useCallback((): SpeechRecognitionLike | null => {
    const Ctor = resolveSpeechRecognition();
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.continuous = false; // one-shot — yields control after each utterance
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (ev) => {
      // Walk the result set for the first final transcript.
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const result = ev.results[i];
        if (result.isFinal) {
          const transcript = result[0].transcript.trim();
          if (transcript) {
            appendUserMessage(transcript);
            void sendUserTurn(transcript);
          }
          break;
        }
      }
    };
    rec.onerror = (ev) => {
      if (ev.error === "no-speech" || ev.error === "aborted") {
        // Benign — user paused or session aborted. Stay in listening
        // so the user can try again without a full error state.
        return;
      }
      setErrorMessage(`Mic error: ${ev.error}`);
      setPhase("error");
    };
    rec.onend = () => {
      // SpeechRecognition stops automatically after each final
      // result. We'll restart it from the phase-transition effect
      // below when we're back in listening state.
    };
    return rec;
  }, [appendUserMessage, sendUserTurn]);

  /* ── Effect: when phase enters "listening", start a fresh
   *     recognition round so the user can speak again. ──── */
  useEffect(() => {
    if (phase !== "listening") return;
    if (!recognitionRef.current) {
      recognitionRef.current = buildRecognition();
    }
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.start();
    } catch {
      // Already started — ignore.
    }
  }, [phase, buildRecognition]);

  /* ── Effect: cleanup on unmount or phase change away ──── */
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      utteranceRef.current = null;
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
      fetchAbortRef.current?.abort();
    };
  }, []);

  /* ── Handlers ──────────────────────────────────────────── */

  /** Kick off the voice session: START conversation, render the bot's
   *  greeting (if any), then drop into listening for the first user
   *  turn. */
  const startSession = useCallback(async () => {
    if (!supportStatus.ok) return;
    setErrorMessage(null);
    setMessages([]);
    setPhase("starting");
    const ctrl = new AbortController();
    fetchAbortRef.current = ctrl;
    try {
      const res = await startConversation(
        tenant,
        {
          language: "en-US",
          page_url:
            typeof window !== "undefined" ? window.location.href : undefined,
          voice: true,
        },
        ctrl.signal,
      );
      if (ctrl.signal.aborted) return;
      const newId = res.conversation?.id ?? null;
      if (!newId) {
        setErrorMessage(
          "No conversation ID returned by the tenant. Voice may not be enabled.",
        );
        setPhase("error");
        return;
      }
      setConversationId(newId);
      if (res.response) {
        appendBotMessage(res.response);
        const speakable = extractSpeakableText(res.response);
        speak(speakable); // speak() will transition to "speaking" then "listening"
      } else {
        setPhase("listening");
      }
    } catch (err) {
      if (ctrl.signal.aborted) return;
      const msg = err instanceof Error ? err.message : "Failed to start";
      setErrorMessage(msg);
      setPhase("error");
    }
  }, [tenant, supportStatus.ok, appendBotMessage, speak]);

  const endSession = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
    fetchAbortRef.current?.abort();
    setPhase("ended");
  }, []);

  /* ── Status copy ────────────────────────────────────────── */
  const statusLabel = useMemo<string>(() => {
    switch (phase) {
      case "idle":
        return "Ready";
      case "starting":
        return "Opening session…";
      case "listening":
        return "Listening — speak now";
      case "thinking":
        return "Thinking…";
      case "speaking":
        return "Speaking";
      case "ended":
        return "Call ended";
      case "error":
        return "Error";
    }
  }, [phase]);

  const statusDotClass = useMemo<string>(() => {
    switch (phase) {
      case "idle":
        return "bg-boost-muted/50";
      case "starting":
      case "thinking":
        return "bg-boost-gold animate-pulse";
      case "listening":
        return "bg-boost-green-light animate-pulse";
      case "speaking":
        return "bg-boost-purple animate-pulse";
      case "ended":
        return "bg-boost-muted/40";
      case "error":
        return "bg-red-500";
    }
  }, [phase]);

  /* ── Render ─────────────────────────────────────────────── */

  return (
    <section
      className="bg-white py-16 sm:py-20"
      data-section="voice-live"
    >
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeader
          number={sectionNumber}
          title="Voice Preview"
          subtitle={
            mode === "custom_live"
              ? "Talk to a live AI Agent on your tenant. Voice quality uses your browser's TTS; production Boost Voice with ElevenLabs sounds smoother."
              : "Talk to a live AI Agent. Voice quality uses your browser's TTS; production Boost Voice with ElevenLabs sounds smoother."
          }
        />

        <div
          ref={ref}
          className="transition-all duration-700"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(12px)",
          }}
        >
          {/* Unsupported-browser fallback */}
          {!supportStatus.ok ? (
            <div
              className="rounded-2xl border border-boost-border bg-boost-surface/60 px-6 py-8 text-center"
              data-testid="voice-unsupported"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-boost-muted mb-2">
                Voice unavailable
              </p>
              <p className="text-sm text-boost-text-secondary leading-relaxed max-w-[52ch] mx-auto">
                {supportStatus.reason}
              </p>
              <p className="mt-4 text-[12px] text-boost-muted leading-relaxed max-w-[52ch] mx-auto">
                For production-quality voice, prospects call the dedicated demo
                phone number provisioned during the POC. This browser demo is
                an alternative for screen-shared walkthroughs.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-boost-border bg-white shadow-sm overflow-hidden">
              {/* Header strip — status + tenant */}
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-boost-border bg-boost-surface/40">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    aria-hidden="true"
                    className={`flex-shrink-0 w-2 h-2 rounded-full ${statusDotClass}`}
                  />
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.14em] text-boost-dark truncate"
                    data-testid="voice-status-label"
                  >
                    {statusLabel}
                  </p>
                </div>
                <p className="text-[10px] text-boost-muted tabular-nums truncate">
                  {tenant}
                </p>
              </div>

              {/* Transcript bubbles */}
              <div
                className="px-5 py-6 min-h-[280px] max-h-[420px] overflow-y-auto space-y-3"
                data-testid="voice-transcript"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-10">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-boost-muted mb-2">
                      How this works
                    </p>
                    <p className="text-sm text-boost-text-secondary leading-relaxed max-w-[48ch]">
                      Tap the mic to start. Your speech is transcribed by the
                      browser and sent to the live AI Agent — the response
                      plays back through your speakers.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <VoiceBubble key={msg.key} message={msg} />
                  ))
                )}
              </div>

              {/* Controls */}
              <div className="px-5 py-4 border-t border-boost-border bg-boost-surface/30 flex items-center justify-center gap-3">
                {phase === "idle" || phase === "ended" || phase === "error" ? (
                  <button
                    type="button"
                    onClick={startSession}
                    data-testid="voice-start-button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-boost-purple text-white text-[12px] font-bold uppercase tracking-[0.14em] hover:bg-boost-purple/90 transition-colors shadow-sm"
                  >
                    <MicIcon className="w-4 h-4" />
                    <span>
                      {phase === "idle" ? "Start voice call" : "Call again"}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={endSession}
                    data-testid="voice-end-button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-boost-dark text-white text-[12px] font-bold uppercase tracking-[0.14em] hover:bg-boost-dark/90 transition-colors shadow-sm"
                  >
                    <StopIcon className="w-4 h-4" />
                    <span>End call</span>
                  </button>
                )}
              </div>

              {/* Error banner */}
              {phase === "error" && errorMessage ? (
                <div
                  className="px-5 py-3 border-t border-red-200 bg-red-50/60"
                  data-testid="voice-error"
                >
                  <p className="text-[12px] text-red-700">{errorMessage}</p>
                </div>
              ) : null}
            </div>
          )}

          {/* Honest framing — the real-voice escape hatch */}
          <p className="mt-5 text-[12px] text-boost-muted leading-relaxed text-center max-w-3xl mx-auto">
            Voice quality here is the browser's default TTS. Production Boost
            Voice runs on ElevenLabs and Speechmatics with sub-second latency
            — to hear the real thing, call the demo number provisioned during
            your POC.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── Bubble — minimal subset of LiveChatSection's renderer ─── *
 * Voice transcripts only ever carry text / ssml / html elements in
 * practice; we render text + html literally, and SSML as the
 * extracted speakable string (since the audio has already played). */
function VoiceBubble({ message }: { message: ChatMessage }) {
  const isUser = message.source === "client";
  const align = isUser ? "justify-end" : "justify-start";
  const bubble = isUser
    ? "bg-boost-purple text-white"
    : "bg-boost-surface text-boost-dark border border-boost-border";
  const radius = isUser
    ? "rounded-2xl rounded-br-md"
    : "rounded-2xl rounded-bl-md";
  return (
    <div className={`flex ${align}`}>
      <div className={`${bubble} ${radius} max-w-[80%] px-4 py-2.5 text-[13px] leading-relaxed`}>
        {message.elements.map((el, i) => (
          <VoiceBubbleElement key={i} element={el} />
        ))}
      </div>
    </div>
  );
}

function VoiceBubbleElement({ element }: { element: ChatElement }) {
  if (element.type === "text") {
    return <p>{element.payload.text}</p>;
  }
  if (element.type === "ssml") {
    return <p>{ssmlToText(element.payload.ssml)}</p>;
  }
  if (element.type === "html") {
    // Render plain-text strip — voice transcripts shouldn't carry
    // rich HTML, but be defensive.
    return <p>{element.payload.html.replace(/<[^>]+>/g, "")}</p>;
  }
  // Other element types (links, image, video) are chat-flavoured
  // and not expected in a voice transcript. Render nothing.
  return null;
}

/* ─── Icons ─── */

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
    </svg>
  );
}
