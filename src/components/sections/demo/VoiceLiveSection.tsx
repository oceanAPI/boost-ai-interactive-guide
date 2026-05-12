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
import {
  createVoiceSession,
  DEFAULT_VOICE_EXTERNAL_ID,
} from "@/lib/boost-voice";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  VOICE_DEMOS,
  PILLAR_ACCENT_TEXT,
  PILLAR_ACCENT_BG,
  PILLAR_ACCENT_BG_SOFT,
  type VoiceDemo,
  type DemoGlyph,
} from "@/data/voice-demos";
import {
  AudioPresets,
  Room,
  RoomEvent,
  Track,
  type RemoteTrack,
  type RemoteTrackPublication,
  type RemoteParticipant,
} from "livekit-client";

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

/** Live event entry rendered in the right-hand "What's happening"
 *  panel. Each entry fades in as it's appended so the prospect can
 *  watch the conversation thinking. Kinds drive the leading glyph
 *  + accent colour: `system` (neutral chrome — connection, mic
 *  permission), `route` (orchestrator routing decision), `user`
 *  (user-spoken turn), `agent` (agent reply, possibly very short
 *  preview), `error` (red). */
type VoiceEventKind = "system" | "route" | "user" | "agent" | "error";

interface VoiceEvent {
  key: string;
  kind: VoiceEventKind;
  /** Single-line label. Kept short — events panel is a glance read. */
  label: string;
  /** Optional secondary detail rendered smaller below the label. */
  detail?: string;
  /** ISO timestamp — rendered as relative time inside the panel. */
  at: string;
}

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
  /** The demo selected from the gallery. When non-null AND phase is
   *  idle, the pre-flight panel renders the value-prop + Start CTA.
   *  When the session is running, the chosen demo drives the header
   *  strip and the routing-inspector accent colour. */
  const [selectedDemo, setSelectedDemo] = useState<VoiceDemo | null>(null);
  /** Skill / specialist agent name surfaced from the tenant's
   *  response. Updated after every successful agent turn. Shown
   *  as a small pill above the transcript to make the orchestrator's
   *  routing decisions visible to the prospect. */
  const [routedSkill, setRoutedSkill] = useState<string | null>(null);
  /** Live event stream rendered in the right-hand "What's happening"
   *  panel. Appended at every lifecycle moment (session start,
   *  primer sent, routing change, response received, call ended)
   *  so the prospect can watch the conversation think. */
  const [events, setEvents] = useState<VoiceEvent[]>([]);

  /* ── Refs ──────────────────────────────────────────────── */
  /** Live recognition instance. Held in a ref so the unmount cleanup
   *  can abort it without React re-renders. */
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  /** Active synthesis utterance. Cleared when speech ends so the
   *  barge-in handler can cancel it from another event handler. */
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  /** AbortController for in-flight /chat/v2 requests. */
  const fetchAbortRef = useRef<AbortController | null>(null);
  /** Active LiveKit Room when in production-voice mode. Held in a
   *  ref so the unmount cleanup + endSession can disconnect
   *  without re-renders. */
  const roomRef = useRef<Room | null>(null);
  /** Audio element used to play the agent's remote audio track.
   *  Created once, attached to / detached from tracks as they
   *  publish + unpublish. */
  const audioEl = useRef<HTMLAudioElement | null>(null);
  /** Mirrors the last response's barge_in flag. When true, the
   *  speech-recognition onspeechstart handler will cancel the
   *  in-flight TTS — the agent yields the floor the moment the
   *  user starts talking. Held in a ref so the recognition event
   *  handler reads the freshest value without a closure-stale
   *  re-render. */
  const bargeInActiveRef = useRef<boolean>(false);
  /** True when the agent has signalled end_call on the last
   *  response. After the closing TTS finishes, the session tears
   *  down. Ref-based for the same reason as bargeInActiveRef. */
  const endCallPendingRef = useRef<boolean>(false);

  /* ── Feature detection — WebRTC + getUserMedia capability ──
   *  LiveKit needs the browser to support RTCPeerConnection +
   *  navigator.mediaDevices.getUserMedia. Both are standard on
   *  Chrome / Edge / Firefox / Safari since 2017+. The check is
   *  memoised so the banner doesn't flicker on each render. */
  const supportStatus = useMemo(() => {
    if (typeof window === "undefined") return { ok: false, reason: "ssr" };
    const hasPeerConnection = typeof RTCPeerConnection !== "undefined";
    const hasGetUserMedia = !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );
    if (!hasPeerConnection) {
      return {
        ok: false as const,
        reason:
          "This browser doesn't support WebRTC. Try Chrome, Edge, Firefox, or Safari.",
      };
    }
    if (!hasGetUserMedia) {
      return {
        ok: false as const,
        reason:
          "This browser doesn't support microphone capture. Try Chrome, Edge, Firefox, or Safari.",
      };
    }
    return { ok: true as const, reason: null };
  }, []);

  /* ── Helpers ───────────────────────────────────────────── */

  /** Push a new event onto the live event stream. Events fade in
   *  one-by-one in the right-hand panel. */
  const appendEvent = useCallback(
    (kind: VoiceEventKind, label: string, detail?: string) => {
      setEvents((prev) => [
        ...prev,
        {
          key: `evt-${prev.length}-${Math.random().toString(36).slice(2, 8)}`,
          kind,
          label,
          detail,
          at: new Date().toISOString(),
        },
      ]);
    },
    [],
  );

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
   *  done so the user can respond.
   *
   *  Two voice-flavoured branches in the lifecycle:
   *   - If endCallPendingRef is set when the utterance ends, run
   *     the session-teardown path instead of returning to listening.
   *     This is how the agent's farewell line plays out fully
   *     before the recognition + connection are torn down.
   *   - If the utterance is cancelled (barge-in), the onend handler
   *     still fires and we honour the resulting phase via the
   *     `cancelled` flag carried in onerror. */
  const speak = useCallback((text: string) => {
    if (!text.trim()) {
      // No speakable content — handle end_call here too, since
      // an end_call with empty text should still tear down.
      if (endCallPendingRef.current) {
        endCallPendingRef.current = false;
        recognitionRef.current?.abort();
        recognitionRef.current = null;
        if (typeof window !== "undefined") {
          window.speechSynthesis?.cancel();
        }
        setPhase("ended");
        return;
      }
      setPhase("listening");
      return;
    }
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.0;
    utt.pitch = 1.0;
    utt.onstart = () => setPhase("speaking");
    utt.onend = () => {
      utteranceRef.current = null;
      if (endCallPendingRef.current) {
        endCallPendingRef.current = false;
        recognitionRef.current?.abort();
        recognitionRef.current = null;
        setPhase("ended");
        return;
      }
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
   *  whatever the agent replies with.
   *
   *  Reads three voice-flavoured response signals:
   *   - response.elements + ssml → speak via SpeechSynthesis
   *   - res.end_call → defer session teardown until the closing
   *     line finishes playing (handled inside speak())
   *   - res.barge_in → if true, mark the utterance as interruptible
   *     so the recognition onspeechstart can cancel it
   *
   *  Also surfaces the orchestrator's routing decision via
   *  conversation.state.skill — that's what powers the routing-
   *  inspector pill above the transcript. */
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

        // Surface routing for the inspector pill. Tenants without
        // a configured skill name just leave the previous value
        // standing — no flicker. Emit an event when the skill
        // changes so the audience can see the routing decision.
        const skill = res.conversation?.state?.skill;
        if (typeof skill === "string" && skill.trim()) {
          const trimmed = skill.trim();
          if (trimmed !== routedSkill) {
            appendEvent("route", "Routed to specialist", trimmed);
          }
          setRoutedSkill(trimmed);
        }

        // Carry the voice flags into refs the lifecycle handlers
        // read. Reset before each turn so a previous barge_in
        // doesn't bleed into the next response.
        bargeInActiveRef.current = !!res.barge_in;
        endCallPendingRef.current = !!res.end_call;

        if (res.response) {
          appendBotMessage(res.response);
          const speakable = extractSpeakableText(res.response);
          // Append a short preview event so the side panel mirrors
          // what the agent just said without duplicating the whole
          // bubble.
          if (speakable) {
            appendEvent(
              "agent",
              "Agent reply",
              speakable.length > 80 ? speakable.slice(0, 77) + "…" : speakable,
            );
          }
          if (res.end_call) {
            appendEvent("system", "Agent ended the call");
          }
          if (res.barge_in) {
            appendEvent("system", "Barge-in armed", "You can interrupt the agent");
          }
          speak(speakable);
        } else if (endCallPendingRef.current) {
          // No closing line, but end_call set → tear down now.
          endCallPendingRef.current = false;
          recognitionRef.current?.abort();
          recognitionRef.current = null;
          appendEvent("system", "Agent ended the call");
          setPhase("ended");
        } else {
          setPhase("listening");
        }
      } catch (err) {
        if (ctrl.signal.aborted) return;
        const msg =
          err instanceof Error ? err.message : "Voice request failed";
        appendEvent("error", "Request failed", msg);
        setErrorMessage(msg);
        setPhase("error");
      }
    },
    [tenant, conversationId, appendBotMessage, speak, appendEvent, routedSkill],
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
            appendEvent(
              "user",
              "You said",
              transcript.length > 80 ? transcript.slice(0, 77) + "…" : transcript,
            );
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
    /** Barge-in: when the user starts speaking AND the last response
     *  was marked barge_in: true, cancel the in-flight TTS so the
     *  agent yields the floor immediately. Without barge_in the
     *  utterance plays through and the user has to wait. */
    rec.onspeechstart = () => {
      if (!bargeInActiveRef.current) return;
      if (typeof window === "undefined") return;
      window.speechSynthesis?.cancel();
      utteranceRef.current = null;
      // Don't change phase here — the recognition onresult will
      // fire shortly and post the user's turn, which transitions
      // through thinking → speaking → listening normally.
    };
    return rec;
  }, [appendUserMessage, sendUserTurn, appendEvent]);

  /* ── Effect: SpeechRecognition restart is now disabled. LiveKit's
   *     localParticipant.setMicrophoneEnabled(true) owns the
   *     microphone for the whole session — Web Speech API would
   *     conflict for the audio stream. The buildRecognition helper
   *     is kept around for a possible future fallback path. */
  void buildRecognition;

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
      // Disconnect the LiveKit Room on unmount so nothing leaks
      // — e.g. user navigates away mid-call.
      const room = roomRef.current;
      if (room) {
        void room.disconnect();
        roomRef.current = null;
      }
    };
  }, []);

  /* ── Handlers ──────────────────────────────────────────── */

  /** Kick off the voice session against boost.ai's WebRTC (LiveKit)
   *  voice gateway.
   *
   *  Flow:
   *    1. POST /api/voice/v1/session with the demo's external_id
   *    2. Receive { url, access_token } from LiveKit
   *    3. Create a Room, wire its events to our event stream
   *    4. Connect to the room
   *    5. Enable microphone capture (browser asks for permission)
   *    6. Subscribe to the agent's audio track and play it through
   *       a hidden <audio> element
   *
   *  The voice agent on the tenant side is already configured to
   *  pick up calls on this external_id and run its flow. We don't
   *  need to send a "demoN" primer — the external_id is the
   *  entrypoint mapping.
   *
   *  Today's external_id is shared across all six demos (one
   *  voice agent demonstrates the full flow). When per-demo
   *  entrypoints are provisioned tenant-side, we read them from
   *  the demo record and pass the right one here. */
  const startSession = useCallback(
    async (demo: VoiceDemo | null) => {
      if (!supportStatus.ok) return;
      setErrorMessage(null);
      setMessages([]);
      setEvents([]);
      setRoutedSkill(null);
      bargeInActiveRef.current = false;
      endCallPendingRef.current = false;
      setSelectedDemo(demo);
      setPhase("starting");
      appendEvent(
        "system",
        "Opening voice session",
        demo ? `Entrypoint: ${demo.id}` : "Freeform call",
      );

      const ctrl = new AbortController();
      fetchAbortRef.current = ctrl;

      try {
        // Step 1+2: POST /api/voice/v1/session and receive LiveKit
        // connection params.
        const session = await createVoiceSession(
          tenant,
          DEFAULT_VOICE_EXTERNAL_ID,
          ctrl.signal,
        );
        if (ctrl.signal.aborted) return;
        appendEvent(
          "system",
          "LiveKit credentials issued",
          new URL(session.url).host,
        );

        // Step 3: Create the Room and wire events. Lazy-init
        // audio element with low-latency-friendly attrs.
        //   - autoplay: start playback the moment a track attaches
        //   - playsInline: required on iOS to play without entering
        //     fullscreen, eliminates a UA gesture-handling delay
        //   - preload="none": don't fetch ahead, stream what's
        //     coming in directly through the WebRTC track
        if (!audioEl.current && typeof document !== "undefined") {
          audioEl.current = document.createElement("audio");
          audioEl.current.autoplay = true;
          audioEl.current.setAttribute("playsinline", "");
          audioEl.current.preload = "none";
        }
        // Low-latency room config. Highlights:
        //   - audioPreset.speech: 24kbps Opus tuned for voice, lower
        //     latency than the music-quality default
        //   - dtx: skip silent audio packets (frees bandwidth +
        //     speeds up packet pacing on resumed speech)
        //   - red: packet-loss redundancy without retransmit delay
        //   - autoGainControl OFF: removes 10-30ms of pre-publish
        //     processing in Chrome; echo cancellation + noise
        //     suppression stay on (without them voice loops back
        //     into the mic)
        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
          publishDefaults: {
            audioPreset: AudioPresets.speech,
            dtx: true,
            red: true,
          },
          audioCaptureDefaults: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: false,
          },
        });
        roomRef.current = room;

        room.on(RoomEvent.Connected, () => {
          appendEvent("system", "Connected to room", room.name);
          setPhase("listening");
        });
        room.on(RoomEvent.Disconnected, (reason) => {
          appendEvent(
            "system",
            "Disconnected",
            typeof reason === "string" ? reason : String(reason ?? ""),
          );
        });
        room.on(
          RoomEvent.TrackSubscribed,
          (
            track: RemoteTrack,
            publication: RemoteTrackPublication,
            participant: RemoteParticipant,
          ) => {
            if (track.kind === Track.Kind.Audio) {
              appendEvent("agent", "Agent audio connected", participant.identity);
              if (audioEl.current) {
                track.attach(audioEl.current);
              }
            }
          },
        );
        room.on(
          RoomEvent.TrackUnsubscribed,
          (track: RemoteTrack) => {
            if (track.kind === Track.Kind.Audio && audioEl.current) {
              track.detach(audioEl.current);
            }
          },
        );
        room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
          // Speaker-detection drives the perceived state. The
          // 'thinking' transition is a UX trick: the moment the
          // local participant stops being an active speaker AND no
          // remote speaker has taken over yet, we flip to 'thinking'
          // so the silent gap before the agent responds feels
          // intentional (instead of broken).
          const localIdentity = room.localParticipant.identity;
          const remoteSpeaking = speakers.some(
            (p) => p.identity !== localIdentity,
          );
          const localSpeaking = speakers.some(
            (p) => p.identity === localIdentity,
          );
          setPhase((p) => {
            if (p === "ended" || p === "error") return p;
            if (remoteSpeaking) return "speaking";
            if (localSpeaking) return "listening";
            // No active speakers — user just finished, agent hasn't
            // started yet. Show 'thinking' to mask the gap.
            return "thinking";
          });
        });
        // LiveKit Transcription API — agents that stream STT
        // results publish them as transcription segments per
        // participant. We render each final segment as a bubble
        // in the transcript AND echo a short preview to the
        // events panel. Interim (non-final) segments could feed
        // a live caption, but we keep the panel quiet until the
        // segment finalises. */
        room.on(
          RoomEvent.TranscriptionReceived,
          (segments, participant) => {
            const isLocal =
              participant?.identity === room.localParticipant.identity;
            for (const seg of segments) {
              if (!seg.final || !seg.text?.trim()) continue;
              const text = seg.text.trim();
              const now = new Date().toISOString();
              setMessages((prev) => [
                ...prev,
                {
                  key: `${isLocal ? "user" : "bot"}-${seg.id ?? now}`,
                  id: seg.id,
                  source: isLocal ? "client" : "bot",
                  elements: [{ type: "text", payload: { text } }],
                  date_created: now,
                  language: seg.language,
                },
              ]);
              appendEvent(
                isLocal ? "user" : "agent",
                isLocal ? "You said" : "Agent said",
                text.length > 80 ? text.slice(0, 77) + "…" : text,
              );
            }
          },
        );
        room.on(RoomEvent.DataReceived, (payload, participant) => {
          // Voice agents sometimes send transcripts / events as
          // LiveKit data messages. Surface them in the events
          // panel without trying to parse strictly.
          try {
            const text = new TextDecoder().decode(payload);
            appendEvent(
              "agent",
              "Agent data",
              text.length > 80 ? text.slice(0, 77) + "…" : text,
            );
          } catch {
            // Binary or undecodable — ignore.
          }
          void participant;
        });

        // Step 4: Connect to LiveKit.
        await room.connect(session.url, session.access_token);
        if (ctrl.signal.aborted) {
          await room.disconnect();
          return;
        }

        // Step 5: Enable microphone. Browser asks for permission
        // here. LiveKit handles publishing the local audio track
        // to the room.
        try {
          await room.localParticipant.setMicrophoneEnabled(true);
          appendEvent("system", "Microphone published");
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Microphone denied";
          appendEvent("error", "Microphone failed", msg);
          setErrorMessage(`Microphone error: ${msg}`);
          // Don't tear down the connection — the user may still
          // hear the agent even without a working mic.
        }
      } catch (err) {
        if (ctrl.signal.aborted) return;
        const msg =
          err instanceof Error ? err.message : "Voice session failed";
        appendEvent("error", "Voice session failed", msg);
        setErrorMessage(msg);
        setPhase("error");
      }
    },
    [tenant, supportStatus.ok, appendEvent],
  );

  const endSession = useCallback(() => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    if (typeof window !== "undefined") {
      window.speechSynthesis?.cancel();
    }
    fetchAbortRef.current?.abort();
    // Tear down the LiveKit room. disconnect() is idempotent.
    const room = roomRef.current;
    if (room) {
      void room.disconnect();
      roomRef.current = null;
    }
    bargeInActiveRef.current = false;
    endCallPendingRef.current = false;
    appendEvent("system", "Call ended");
    setPhase("ended");
  }, [appendEvent]);

  /** Return to the gallery from any post-call state. Clears the
   *  transcript, the routing inspector, the events stream, and the
   *  demo selection so the user sees the full gallery again. Doesn't
   *  touch the conversationId — a fresh START fires on next
   *  selection. */
  const resetToGallery = useCallback(() => {
    setSelectedDemo(null);
    setMessages([]);
    setEvents([]);
    setRoutedSkill(null);
    setErrorMessage(null);
    setPhase("idle");
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
              ? "Talk to a live AI Agent on your tenant. Real voice — boost.ai's managed WebRTC stack with ElevenLabs + Speechmatics, end-to-end."
              : "Talk to a live AI Agent. Real voice — boost.ai's managed WebRTC stack with ElevenLabs + Speechmatics, end-to-end."
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
            /* ─── Unified console — carousel + split panel ─── *
                Always shows the carousel at the top so the user can
                switch demos at any time (active demo restarts the
                call). Split panel below: mic + transcript on the
                left, live event stream on the right. */
            <VoiceConsole
              selectedDemo={selectedDemo}
              phase={phase}
              messages={messages}
              events={events}
              routedSkill={routedSkill}
              tenant={tenant}
              errorMessage={errorMessage}
              statusLabel={statusLabel}
              statusDotClass={statusDotClass}
              onSelectDemo={(d) => {
                // Two-click intent: carousel just selects, mic
                // button starts. If a call is in flight when the
                // user switches demos, tear it down — they're
                // signalling "not this demo, the other one" — and
                // wait for them to click mic to start the new one.
                if (
                  phase === "listening" ||
                  phase === "thinking" ||
                  phase === "speaking" ||
                  phase === "starting"
                ) {
                  endSession();
                }
                setSelectedDemo(d);
                // Clear any prior transcript / events from the
                // last demo so the events panel starts fresh when
                // the user clicks mic.
                setMessages([]);
                setEvents([]);
                setRoutedSkill(null);
                setErrorMessage(null);
                setPhase("idle");
              }}
              onStart={() => startSession(selectedDemo)}
              onEnd={endSession}
            />
          )}

        </div>
      </div>
    </section>
  );
}

/* ─── Demo glyph renderer ──────────────────────────────────── *
 * Renders the SVG paths from a VoiceDemo.glyph in a fixed 24×24
 * viewBox. Stroke-based by default; switches to fill when the
 * glyph opts in via `filled: true`.
 *
 * When `animateIn` is true, each path's strokeDasharray gets
 * animated via the .voice-demo-glyph CSS keyframes — the icon
 * draws itself in over 900ms, staggered per-path. The `delay`
 * prop adds an extra offset so the gallery's six icons cascade
 * in sequence rather than all firing at once. */
function DemoGlyphSvg({
  glyph,
  className,
  animateIn = false,
  delay = 0,
}: {
  glyph: DemoGlyph;
  className?: string;
  animateIn?: boolean;
  delay?: number;
}) {
  if (glyph.filled) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        data-animate-in={animateIn ? "true" : undefined}
        aria-hidden="true"
      >
        {glyph.paths.map((d, i) => (
          <path
            key={i}
            d={d}
            style={
              animateIn
                ? { animationDelay: `${delay + i * 60}ms` }
                : undefined
            }
          />
        ))}
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      data-animate-in={animateIn ? "true" : undefined}
      aria-hidden="true"
    >
      {glyph.paths.map((d, i) => (
        <path
          key={i}
          d={d}
          style={
            animateIn
              ? { animationDelay: `${delay + i * 60}ms` }
              : undefined
          }
        />
      ))}
    </svg>
  );
}

/* ─── VoiceConsole — carousel + split panel ─── *
 *
 * The unified voice surface. Always visible in three bands:
 *
 *   1. Carousel — compact horizontal icon row, 6 demos, click any
 *      to switch. Active demo gets a pillar accent ring + scale.
 *   2. Active demo header — title + tagline. Fades/slides when the
 *      active demo changes (key-based remount under the hood).
 *   3. Split panel — LEFT: mic button + transcript bubbles + status.
 *      RIGHT: live event stream that fades in events as the
 *      conversation progresses (session opened, primer sent, routed
 *      to specialist, user spoke, agent replied, call ended).
 *
 * Mic button is contextual: idle → big "Start" button, listening →
 * pulsing ring around the mic icon (animated bars suggest signal),
 * speaking → muted-tone + label, thinking → spinner, ended →
 * "Restart" CTA. */
function VoiceConsole(props: {
  selectedDemo: VoiceDemo | null;
  phase: Phase;
  messages: ChatMessage[];
  events: VoiceEvent[];
  routedSkill: string | null;
  tenant: string;
  errorMessage: string | null;
  statusLabel: string;
  statusDotClass: string;
  onSelectDemo: (demo: VoiceDemo) => void;
  onStart: () => void;
  onEnd: () => void;
}) {
  const {
    selectedDemo,
    phase,
    messages,
    events,
    routedSkill,
    tenant,
    errorMessage,
    statusLabel,
    statusDotClass,
    onSelectDemo,
    onStart,
    onEnd,
  } = props;

  // Pillar accent that drives the active demo's colour treatment.
  const activeAccent = selectedDemo?.pillar ?? "voice";

  return (
    <div data-testid="voice-console">
      {/* ─── Carousel header — compact icon row ─── */}
      <DemoCarousel
        demos={VOICE_DEMOS}
        selectedId={selectedDemo?.id ?? null}
        onSelect={onSelectDemo}
      />

      {/* ─── Active demo title + tagline ─── */}
      <ActiveDemoHeader demo={selectedDemo} />

      {/* ─── Split panel — voice LEFT, events RIGHT ─── */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* LEFT — voice column */}
        <div className="rounded-2xl border border-boost-border bg-white shadow-sm overflow-hidden flex flex-col">
          {/* Header strip */}
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-boost-border bg-boost-surface/40">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
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
            {routedSkill ? (
              <span
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em] ${PILLAR_ACCENT_BG_SOFT[activeAccent]} ${PILLAR_ACCENT_TEXT[activeAccent]}`}
                data-testid="voice-routed-skill"
              >
                <span aria-hidden="true">✓</span>
                <span>{routedSkill}</span>
              </span>
            ) : null}
          </div>

          {/* Mic button + transcript */}
          <div className="flex-1 px-5 py-6 flex flex-col items-center">
            <MicButton
              phase={phase}
              accent={activeAccent}
              onStart={onStart}
              onEnd={onEnd}
              hasSelection={!!selectedDemo}
            />

            {/* Transcript bubbles */}
            <div
              className="w-full mt-6 space-y-3 max-h-[300px] overflow-y-auto"
              data-testid="voice-transcript"
            >
              {messages.map((msg) => (
                <VoiceBubble key={msg.key} message={msg} />
              ))}
            </div>
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

        {/* RIGHT — events column */}
        <EventsPanel events={events} tenant={tenant} />
      </div>

      {/* Curiosity hooks — the follow-up-question generator */}
      <CuriosityHooks />
    </div>
  );
}

/* ─── DemoCarousel — compact icon row ─── *
 * Six demos in a single horizontal row. Active demo gets a soft
 * pillar-tinted ring + slight scale. Click any to switch active.
 * Smaller than the previous editorial-list icons (40px vs 64px) so
 * the carousel feels lightweight. */
function DemoCarousel({
  demos,
  selectedId,
  onSelect,
}: {
  demos: typeof VOICE_DEMOS;
  selectedId: string | null;
  onSelect: (demo: VoiceDemo) => void;
}) {
  return (
    <div
      className="flex items-center justify-center gap-2 sm:gap-4 py-2"
      data-testid="voice-demo-carousel"
      role="tablist"
      aria-label="Voice demos"
    >
      {demos.map((demo) => {
        const isActive = demo.id === selectedId;
        return (
          <button
            key={demo.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(demo)}
            data-testid={`voice-demo-card-${demo.id}`}
            title={demo.label}
            className={`group flex-shrink-0 inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              isActive
                ? `${PILLAR_ACCENT_BG_SOFT[demo.pillar]} ${PILLAR_ACCENT_TEXT[demo.pillar]} ring-2 ring-offset-2 scale-110`
                : "text-boost-muted hover:text-boost-dark hover:bg-boost-surface"
            }`}
            style={
              isActive
                ? ({
                    "--tw-ring-color": `rgb(${PILLAR_RGB[demo.pillar]})`,
                  } as React.CSSProperties)
                : undefined
            }
          >
            <DemoGlyphSvg glyph={demo.glyph} className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        );
      })}
    </div>
  );
}

/* ─── ActiveDemoHeader ─── *
 * Title + tagline of the currently selected demo. Re-mounts (via
 * `key={demo.id}`) when the active changes so the fade-in animation
 * re-fires — gives the carousel selection a satisfying confirm. */
function ActiveDemoHeader({ demo }: { demo: VoiceDemo | null }) {
  if (!demo) {
    return (
      <div className="text-center mt-4 mb-2">
        <h3 className="text-xl sm:text-2xl font-bold text-boost-dark tracking-tight">
          Pick a demo above
        </h3>
        <p className="text-sm text-boost-text-secondary mt-1.5 max-w-[52ch] mx-auto">
          Each demo is three minutes. Click an icon to switch — the AI
          Agent restarts with the new flow.
        </p>
      </div>
    );
  }
  return (
    <div
      key={demo.id}
      className="text-center mt-4 mb-2 animate-voice-fade-in"
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-[0.18em] mb-1 ${PILLAR_ACCENT_TEXT[demo.pillar]}`}
      >
        {demo.id}
      </p>
      <h3 className="text-xl sm:text-2xl font-bold text-boost-dark tracking-tight">
        {demo.label}
      </h3>
      <p className="text-sm text-boost-text-secondary mt-1.5 max-w-[58ch] mx-auto leading-relaxed">
        {demo.tagline}
      </p>
    </div>
  );
}

/* ─── MicButton — contextual call control ─── *
 * Replaces the old "Start voice call" / "End call" buttons with a
 * single button whose visual reflects phase. During listening, an
 * animated set of pulsing rings + bars imitates voice signal — feels
 * live without needing a real Web Audio AnalyserNode (saved for
 * Phase 3 alongside the production-voice swap). */
function MicButton({
  phase,
  accent,
  onStart,
  onEnd,
  hasSelection,
}: {
  phase: Phase;
  accent: VoiceDemo["pillar"];
  onStart: () => void;
  onEnd: () => void;
  hasSelection: boolean;
}) {
  const inCall =
    phase === "starting" ||
    phase === "listening" ||
    phase === "thinking" ||
    phase === "speaking";
  const isIdle = phase === "idle";
  const isEnded = phase === "ended" || phase === "error";

  const handleClick = useCallback(() => {
    if (inCall) onEnd();
    else onStart();
  }, [inCall, onStart, onEnd]);

  const label = useMemo(() => {
    if (isIdle) return hasSelection ? "Start the demo" : "Pick a demo above";
    if (phase === "starting") return "Opening…";
    if (phase === "listening") return "Speak now — tap to end";
    if (phase === "thinking") return "Thinking…";
    if (phase === "speaking") return "Agent speaking — tap to end";
    if (isEnded) return "Restart this demo";
    return "Pick a demo above";
  }, [phase, isIdle, isEnded, hasSelection]);

  const disabled = isIdle && !hasSelection;

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        data-testid="voice-mic-button"
        className={`group relative inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 ${
          disabled
            ? "bg-boost-surface text-boost-muted/40 cursor-not-allowed"
            : inCall
              ? `${PILLAR_ACCENT_BG_SOFT[accent]} ${PILLAR_ACCENT_TEXT[accent]} hover:scale-105 cursor-pointer`
              : `${PILLAR_ACCENT_BG[accent]} text-white hover:scale-105 cursor-pointer shadow-lg`
        }`}
        style={
          !disabled
            ? ({
                "--tw-ring-color": `rgb(${PILLAR_RGB[accent]})`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {/* Pulsing rings — listening / speaking. Three rings staggered
            so the radial wave feels continuous. */}
        {phase === "listening" || phase === "speaking" ? (
          <>
            <span
              aria-hidden="true"
              className={`absolute inset-0 rounded-full ${PILLAR_ACCENT_BG[accent]} opacity-30 animate-ping`}
            />
            <span
              aria-hidden="true"
              className={`absolute inset-[-8px] rounded-full ${PILLAR_ACCENT_BG[accent]} opacity-15 animate-ping`}
              style={{ animationDelay: "300ms" }}
            />
            <span
              aria-hidden="true"
              className={`absolute inset-[-16px] rounded-full ${PILLAR_ACCENT_BG[accent]} opacity-10 animate-ping`}
              style={{ animationDelay: "600ms" }}
            />
          </>
        ) : null}

        {/* Spinner ring — starting / thinking */}
        {phase === "starting" || phase === "thinking" ? (
          <span
            aria-hidden="true"
            className={`absolute inset-[-2px] rounded-full border-2 border-transparent border-t-current animate-spin ${PILLAR_ACCENT_TEXT[accent]}`}
          />
        ) : null}

        {/* Glyph — mic for idle/listening, stop for in-call non-listening */}
        <span className="relative">
          {phase === "listening" ? (
            <MicWaveBars accent={accent} />
          ) : inCall ? (
            <StopIcon className="w-7 h-7 sm:w-8 sm:h-8" />
          ) : (
            <MicIcon className="w-8 h-8 sm:w-10 sm:h-10" />
          )}
        </span>
      </button>
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.14em] text-boost-dark text-center"
        data-testid="voice-mic-label"
      >
        {label}
      </p>
    </div>
  );
}

/* ─── MicWaveBars — fake-but-believable waveform animation ─── *
 * Five vertical bars whose heights animate via CSS keyframes,
 * staggered so the row pulses like a real audio level meter. When
 * we wire the production WebRTC (LiveKit) integration we'll replace
 * this with real signal-driven heights from AnalyserNode data. */
function MicWaveBars({ accent }: { accent: VoiceDemo["pillar"] }) {
  return (
    <span className="inline-flex items-end gap-[3px] h-7 sm:h-8">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`block w-[3px] rounded-full ${PILLAR_ACCENT_BG[accent]} voice-wave-bar`}
          style={{
            height: "100%",
            animationDelay: `${i * 90}ms`,
          }}
        />
      ))}
    </span>
  );
}

/* ─── EventsPanel — live event stream ─── *
 * Right-hand column. Empty state until first event arrives, then
 * events fade in from below one-by-one. Each event renders as a
 * compact row: kind glyph, label, optional detail, timestamp. */
/* ─── CuriosityHooks — follow-up question chips ─── *
 *
 * Replaces the wall-of-text footer with five tappable chips. Each
 * is a question a prospect is likely to have but might not ask
 * unprompted — clicking opens a small inline panel with a sharp
 * answer + a "talk to a specialist" hint.
 *
 * Sleek and quiet by default. The chips themselves are the value:
 * even un-tapped they raise the questions the rep wants to be in
 * the room when the prospect asks.
 *
 * Adding a chip is one new record below. Same data shape as the
 * voice-demos list — table-friendly when a backend exists.
 */
interface CuriosityHook {
  id: string;
  label: string;
  question: string;
  answer: string;
}

const CURIOSITY_HOOKS: CuriosityHook[] = [
  {
    id: "brand-voice",
    label: "Brand voice",
    question: "Can it use our brand voice?",
    answer:
      "Yes — Voice Cloning lets you record a sample voice and assign it per agent. Powered by ElevenLabs, managed inside the boost.ai admin panel. No separate vendor contract on your side.",
  },
  {
    id: "sub-processors",
    label: "Sub-processors",
    question: "Does our legal team need to vet ElevenLabs and Speechmatics?",
    answer:
      "No. boost.ai contracts with every sub-processor on your behalf and lists them on the Trust Center. You sign one DPA with us; we handle the rest.",
  },
  {
    id: "latency",
    label: "Latency",
    question: "How fast is the agent in production?",
    answer:
      "End-to-end first-byte 600–1200ms depending on agent flow complexity. The demo here runs on the same WebRTC adaptive-streaming path your customers will use — what you hear is production-grade.",
  },
  {
    id: "multimodal",
    label: "Voice ↔ chat",
    question: "Can it switch between voice and chat mid-conversation?",
    answer:
      "Yes — Multimodal Conversations let a customer start on a call, finish via SMS, and continue on web chat. Same conversation_id, same context, zero re-auth.",
  },
  {
    id: "migration",
    label: "Existing voice solution",
    question: "What if we already have a voice solution?",
    answer:
      "Boost Voice migration runs an 8-phase playbook: Align → Assess → Enable → Test → Fix and plan → Ready → Go Live → Hypercare. Two-week Hypercare is the typical close. Net-new customers skip Align/Assess and start at Enable.",
  },
];

function CuriosityHooks() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useMemo(
    () => CURIOSITY_HOOKS.find((h) => h.id === openId) ?? null,
    [openId],
  );
  return (
    <div className="mt-7" data-testid="voice-curiosity-hooks">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-boost-muted mb-3 text-center">
        Curious about something?
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {CURIOSITY_HOOKS.map((hook) => {
          const isActive = hook.id === openId;
          return (
            <button
              key={hook.id}
              type="button"
              onClick={() => setOpenId(isActive ? null : hook.id)}
              data-testid={`voice-curiosity-${hook.id}`}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-boost-purple text-white shadow-sm"
                  : "bg-boost-surface text-boost-dark border border-boost-border hover:border-boost-purple/40 hover:bg-white"
              }`}
            >
              <span>{hook.label}</span>
              <span
                aria-hidden="true"
                className={`transition-transform duration-200 ${
                  isActive ? "rotate-180" : ""
                }`}
              >
                ↓
              </span>
            </button>
          );
        })}
      </div>
      {open ? (
        <div
          key={open.id}
          className="mt-4 mx-auto max-w-2xl rounded-xl border border-boost-border bg-white px-5 py-4 shadow-sm animate-voice-fade-in"
          data-testid="voice-curiosity-answer"
        >
          <p className="text-[13px] font-semibold text-boost-dark mb-1.5 leading-snug">
            {open.question}
          </p>
          <p className="text-[12px] text-boost-text-secondary leading-relaxed">
            {open.answer}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function EventsPanel({
  events,
  tenant,
}: {
  events: VoiceEvent[];
  tenant: string;
}) {
  return (
    <div
      className="rounded-2xl border border-boost-border bg-white shadow-sm overflow-hidden flex flex-col"
      data-testid="voice-events-panel"
    >
      <div className="px-5 py-3 border-b border-boost-border bg-boost-surface/40 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-boost-dark">
          What's happening
        </p>
        <p className="text-[10px] text-boost-muted tabular-nums truncate">
          {tenant}
        </p>
      </div>
      <div className="flex-1 px-4 py-4 space-y-2.5 min-h-[280px] max-h-[480px] overflow-y-auto">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-boost-muted mb-2">
              Idle
            </p>
            <p className="text-[12px] text-boost-text-secondary leading-relaxed max-w-[28ch]">
              Routing, intent matches, and replies will stream in here
              as you talk to the agent.
            </p>
          </div>
        ) : (
          events.map((evt) => <EventRow key={evt.key} event={evt} />)
        )}
      </div>
    </div>
  );
}

/* ─── EventRow — one entry in the events stream ─── *
 * Fades in from a 6px translateY on mount via the
 * `animate-voice-fade-in` class. Kind drives the leading glyph +
 * accent. */
function EventRow({ event }: { event: VoiceEvent }) {
  const kindStyle = useMemo(() => {
    switch (event.kind) {
      case "system":
        return { dot: "bg-boost-muted", label: "text-boost-dark" };
      case "route":
        return { dot: "bg-boost-purple", label: "text-boost-purple" };
      case "user":
        return { dot: "bg-boost-green-light", label: "text-boost-dark" };
      case "agent":
        return { dot: "bg-boost-green", label: "text-boost-dark" };
      case "error":
        return { dot: "bg-red-500", label: "text-red-700" };
    }
  }, [event.kind]);
  return (
    <div
      className="flex items-start gap-2.5 animate-voice-fade-in"
      data-testid={`voice-event-${event.kind}`}
    >
      <span
        aria-hidden="true"
        className={`flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full ${kindStyle.dot}`}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-[12px] font-semibold leading-tight ${kindStyle.label}`}>
          {event.label}
        </p>
        {event.detail ? (
          <p className="text-[11px] text-boost-text-secondary leading-snug mt-0.5">
            {event.detail}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* ─── Gallery — editorial-list, 2026-flavoured ─── *
 *
 * Three signals that make this feel current:
 *   1. Cursor-follow spotlight — a soft pillar-coloured radial
 *      gradient tracks the mouse across the gallery surface. Adds
 *      depth without chrome.
 *   2. Icon path draw-in — each SVG path strokes itself in on mount
 *      via stroke-dasharray, staggered 80ms per row. The icons feel
 *      authored, not stamped.
 *   3. Hover: animated underline draws left→right under the title,
 *      icon glows in pillar colour, arrow stretches into a longer
 *      chevron line. One coherent gesture, not five layered effects.
 *
 * Click → straight into the call. No pre-flight stop. The demo's
 * value-prop content surfaces inside the in-call view instead. */
function DemoGallery({
  onPick,
  onFreeChat,
}: {
  onPick: (demo: VoiceDemo) => void;
  onFreeChat: () => void;
}) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoveredDemo = useMemo(
    () => VOICE_DEMOS.find((d) => d.id === hoveredId) ?? null,
    [hoveredId],
  );

  // Cursor-follow spotlight — updates CSS custom properties so the
  // radial gradient anchors to the cursor without re-rendering. The
  // accent colour switches to the hovered demo's pillar.
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = spotlightRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--cursor-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--cursor-y", `${e.clientY - rect.top}px`);
  }, []);

  return (
    <div data-testid="voice-demo-gallery">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-boost-muted mb-2">
        Pick a demo
      </p>
      <h3 className="text-2xl sm:text-[32px] font-bold text-boost-dark leading-[1.05] mb-1 max-w-[34ch] tracking-tight">
        Six features. Three minutes each.
      </h3>
      <p className="text-sm text-boost-text-secondary leading-relaxed mb-7 max-w-[58ch]">
        Click any row — the AI Agent picks up the demo live. No setup,
        no preamble.
      </p>

      <div
        ref={spotlightRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredId(null)}
        className="relative overflow-hidden rounded-2xl"
        style={
          {
            /* Pillar-coloured spotlight follows the cursor. The
             *  --spotlight-color CSS var swaps per hovered demo so
             *  the colour reflects the demo's pillar accent. */
            "--cursor-x": "50%",
            "--cursor-y": "50%",
            "--spotlight-color": hoveredDemo
              ? PILLAR_RGB[hoveredDemo.pillar]
              : "89 25 93", // boost-purple
            background:
              "radial-gradient(420px circle at var(--cursor-x) var(--cursor-y), rgba(var(--spotlight-color), 0.06), transparent 70%)",
            transition: "background 400ms ease",
          } as React.CSSProperties
        }
      >
        <div ref={ref}>
          <ul className="relative border-t border-boost-border/70">
            {VOICE_DEMOS.map((demo, i) => (
              <li
                key={demo.id}
                className="border-b border-boost-border/70 transition-all duration-500"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible
                    ? "translateY(0)"
                    : "translateY(10px)",
                  transitionDelay: `${100 + i * 80}ms`,
                }}
              >
                <button
                  type="button"
                  onClick={() => onPick(demo)}
                  onMouseEnter={() => setHoveredId(demo.id)}
                  onFocus={() => setHoveredId(demo.id)}
                  data-testid={`voice-demo-card-${demo.id}`}
                  className="group relative block w-full text-left px-3 sm:px-5 py-5 sm:py-7 transition-colors focus-visible:outline-none"
                >
                  <div className="relative flex items-center gap-5 sm:gap-7">
                    {/* Icon — large, pillar-tinted, glow on hover */}
                    <span
                      className={`relative flex-shrink-0 inline-flex items-center justify-center w-14 h-14 sm:w-[68px] sm:h-[68px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 ${
                        PILLAR_ACCENT_BG_SOFT[demo.pillar]
                      } ${PILLAR_ACCENT_TEXT[demo.pillar]}`}
                    >
                      {/* Soft glow expands behind icon on hover */}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-[-12px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl ${
                          PILLAR_ACCENT_BG_SOFT[demo.pillar]
                        }`}
                      />
                      <span className="relative">
                        <DemoGlyphSvg
                          glyph={demo.glyph}
                          className="w-7 h-7 sm:w-9 sm:h-9"
                        />
                      </span>
                    </span>

                    {/* Title + tagline */}
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`relative text-base sm:text-xl font-semibold tracking-tight text-boost-dark inline-block`}
                      >
                        <span
                          className="relative inline-block transition-colors duration-300 group-hover:text-[var(--accent-color)]"
                          style={
                            {
                              "--accent-color": `rgb(${PILLAR_RGB[demo.pillar]})`,
                            } as React.CSSProperties
                          }
                        >
                          {demo.label}
                        </span>
                        {/* Animated underline draws left→right on hover */}
                        <span
                          aria-hidden="true"
                          className="absolute left-0 right-full bottom-[-3px] h-[2px] origin-left transition-all duration-500 ease-out group-hover:right-0"
                          style={{
                            backgroundColor: `rgb(${PILLAR_RGB[demo.pillar]})`,
                          }}
                        />
                      </h4>
                      <p className="text-[12px] sm:text-[13px] text-boost-text-secondary leading-snug mt-1">
                        {demo.tagline}
                      </p>
                    </div>

                    {/* Animated chevron — line + arrowhead, line draws
                        on hover so the static → becomes a long
                        purposeful arrow. */}
                    <span
                      aria-hidden="true"
                      className="flex-shrink-0 flex items-center"
                    >
                      <svg
                        viewBox="0 0 32 12"
                        className="h-3 w-8 transition-all duration-500 ease-out group-hover:w-12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          color: `rgb(${PILLAR_RGB[demo.pillar]})`,
                        }}
                      >
                        <line
                          x1="0"
                          y1="6"
                          x2="28"
                          y2="6"
                          className="opacity-30 group-hover:opacity-100 transition-opacity duration-500"
                          strokeDasharray="28"
                          strokeDashoffset="20"
                          style={{
                            transition: "stroke-dashoffset 500ms ease-out",
                          }}
                        />
                        <polyline points="22,2 28,6 22,10" />
                      </svg>
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Freeform escape hatch */}
      <div className="mt-7 text-center">
        <button
          type="button"
          onClick={onFreeChat}
          data-testid="voice-free-chat"
          className="text-[11px] font-semibold uppercase tracking-[0.14em] text-boost-muted hover:text-boost-purple transition-colors"
        >
          Or open a freeform call instead →
        </button>
      </div>

    </div>
  );
}

/* ─── Pillar RGB tuples — used to drive inline-style hover colours
 *  and the spotlight gradient. Mirrors the Tailwind class colours
 *  one-for-one. */
const PILLAR_RGB: Record<VoiceDemo["pillar"], string> = {
  voice: "89 25 93", // boost-purple
  agentic: "54 181 149", // boost-green-light
  adoption: "243 156 18", // boost-gold (approx)
  scalability: "54 181 149", // boost-green-light fallback
};

/* ─── Pre-flight panel — value prop before the call starts ─── *
 * Shown after a card is picked, before the user clicks Start. Sells
 * the value prop, explains the tech, sets expectation for what
 * they'll hear. */
function PreFlightPanel({
  demo,
  tenant,
  onStart,
  onBack,
}: {
  demo: VoiceDemo;
  tenant: string;
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <div
      className="rounded-2xl border border-boost-border bg-white shadow-sm overflow-hidden"
      data-testid="voice-preflight"
    >
      {/* Header */}
      <div
        className={`px-6 py-4 border-b border-boost-border ${PILLAR_ACCENT_BG_SOFT[demo.pillar]}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span
              className={`flex-shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white ${PILLAR_ACCENT_TEXT[demo.pillar]}`}
            >
              <DemoGlyphSvg glyph={demo.glyph} className="w-6 h-6" />
            </span>
            <div className="min-w-0">
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.18em] mb-1 ${PILLAR_ACCENT_TEXT[demo.pillar]}`}
              >
                {demo.id} · About to start
              </p>
              <h3 className="text-xl font-bold text-boost-dark leading-tight">
                {demo.label}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onBack}
            data-testid="voice-preflight-back"
            className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted hover:text-boost-dark transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Body — value prop + tech explanation + expected behavior */}
      <div className="px-6 py-5 space-y-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-boost-muted mb-2">
            Why it matters
          </p>
          <p className="text-sm text-boost-text-secondary leading-relaxed max-w-[62ch]">
            {demo.valueProp}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-boost-muted mb-2">
            What's happening under the hood
          </p>
          <p className="text-sm text-boost-text-secondary leading-relaxed max-w-[62ch]">
            {demo.techExplanation}
          </p>
        </div>
        <div
          className={`px-4 py-3 rounded-lg border ${PILLAR_ACCENT_BG_SOFT[demo.pillar]} border-boost-border`}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-boost-muted mb-1">
            What to listen for
          </p>
          <p className="text-[13px] text-boost-dark leading-relaxed">
            {demo.expectedBehavior}
          </p>
        </div>
      </div>

      {/* Start CTA */}
      <div className="px-6 py-4 border-t border-boost-border bg-boost-surface/30 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[10px] text-boost-muted tabular-nums">
          {tenant}
        </p>
        <button
          type="button"
          onClick={onStart}
          data-testid="voice-preflight-start"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-boost-purple text-white text-[12px] font-bold uppercase tracking-[0.14em] hover:bg-boost-purple/90 transition-colors shadow-sm"
        >
          <MicIcon className="w-4 h-4" />
          <span>Start the demo</span>
        </button>
      </div>
    </div>
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
