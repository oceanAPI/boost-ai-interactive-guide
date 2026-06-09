"use client";

/* ──────────────────────────────────────────────────────────────
 *  LiveChatSection — real-time chat against a boost.ai tenant
 *
 *  Rendered when Customer.demo_mode ∈ { "live" | "custom_live" }.
 *  Uses the Chat API v2 client in `src/lib/boost-chat.ts` to
 *  drive the conversation directly from the browser. Anonymous
 *  by default; public boost.ai tenants accept START without auth.
 *
 *  What this component does:
 *   - Kicks off a new conversation on mount (START)
 *   - Renders each response element (html / text / links /
 *     images / videos) as a chat bubble
 *   - Accepts free-text input + Send
 *   - Clickable action-link buttons → POST action_link
 *   - Reset button → DELETE + START a fresh conversation
 *
 *  What this component deliberately does NOT do (Phase 2/3):
 *   - No side raw-data panel yet (needs Worker + Export API creds)
 *   - No typing indicator (TYPING command unused)
 *   - No feedback thumbs (POST feedback unused)
 *   - No human-chat handoff (POLLSTART / POLL / PollStop unused)
 *
 *  Error handling: shows a friendly inline error + Retry when the
 *  Chat API fails. CORS failures on unknown tenants surface here.
 * ────────────────────────────────────────────────────────────── */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  deleteConversation,
  postActionLink,
  postText,
  startConversation,
  type ChatConversationState,
  type ChatElement,
  type ChatMessage,
  type ChatResponse,
  type PostResponse,
} from "@/lib/boost-chat";
import {
  fetchExportTrace,
  isExportConfigured,
  type ExportTraceError,
  type ExportTraceSuccess,
} from "@/lib/boost-export";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { assetPath } from "@/lib/asset-path";
import DataFunnelPanel from "./DataFunnelPanel";

interface LiveChatSectionProps {
  /** Tenant domain, e.g. `"financewizard.boost.ai"`. No protocol. */
  tenant: string;
  /** `"live"` → default demo tenant, `"custom_live"` → customer's. */
  mode: "live" | "custom_live";
  sectionNumber?: string;
}

/** Lifecycle phases. Keeps render logic compact. */
type ChatPhase =
  | { kind: "idle" }
  | { kind: "starting" }
  | { kind: "ready" }
  | { kind: "posting" }
  | { kind: "error"; message: string };

/** Analyze-button lifecycle. Kept separate from ChatPhase because
 *  the chat can be ready while an analyze fetch is in flight, and
 *  vice versa. */
export type AnalyzePhase =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

function analyzeErrorMessage(err: ExportTraceError): string {
  switch (err.kind) {
    case "not_configured":
      return "Analyse is off-line — Export API is not configured for this deployment.";
    case "not_indexed_after_retries":
      return "Conversation is not yet in the Export index. Wait a moment and try again.";
    case "request_failed":
      return "Could not reach the Export API. Try again.";
    default:
      return "Analyse failed.";
  }
}

/** Map a ChatResponse → ChatMessage (1:1 for MVP). */
function toMessage(res: ChatResponse, fallbackKey: string): ChatMessage {
  return {
    key: res.id ?? fallbackKey,
    id: res.id,
    source: res.source,
    elements: res.elements,
    date_created: res.date_created,
    avatar_url: res.avatar_url,
    language: res.language,
  };
}

/** Derive a key for a client-side echo of a user message that's
 *  not yet been acknowledged by the server. */
function clientEchoKey(seed: string): string {
  return `client-${seed}`;
}

export default function LiveChatSection({
  tenant,
  mode,
  sectionNumber,
}: LiveChatSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [phase, setPhase] = useState<ChatPhase>({ kind: "idle" });
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationRef, setConversationRef] = useState<string | null>(null);
  const [conversationState, setConversationState] =
    useState<ChatConversationState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [maxInputChars, setMaxInputChars] = useState(110);
  const [lastRawResponse, setLastRawResponse] = useState<PostResponse | null>(
    null,
  );
  /** Panel reveal: flips true on the first bot reply that follows
   *  at least one client message. START's welcome does NOT flip it
   *  (no preceding client message). Reset brings it back to false. */
  const [revealPanel, setRevealPanel] = useState(false);
  /** User-turn message IDs collected across the conversation.
   *  These are the Chat API v2 posted_ids, which equal Export API
   *  v4 message.ids — the Worker uses these to find the session. */
  const [postedIds, setPostedIds] = useState<number[]>([]);
  /** Loaded trace from the last successful Analyze. Null = never
   *  analysed OR trace was cleared by a reset. */
  const [exportTrace, setExportTrace] = useState<ExportTraceSuccess | null>(
    null,
  );
  const [analyzePhase, setAnalyzePhase] = useState<AnalyzePhase>({
    kind: "idle",
  });
  /** How many postedIds were included in the most recent successful
   *  analysis. Used to render "(+N new turns)" on the Refresh
   *  button when the user has typed since. */
  const [analyzedPostedCount, setAnalyzedPostedCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const analyzeAbortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /** Append a PostResponse's bot reply + ingest state. */
  const ingestPostResponse = useCallback((res: PostResponse) => {
    setLastRawResponse(res);
    if (res.conversation?.id) {
      setConversationId(res.conversation.id);
    }
    if (res.conversation?.reference) {
      setConversationRef(res.conversation.reference);
    }
    if (res.conversation?.state) {
      setConversationState(res.conversation.state);
      if (res.conversation.state.max_input_chars) {
        setMaxInputChars(res.conversation.state.max_input_chars);
      }
    }
    // Collect posted_id (integer message.id of the user's turn,
    // per Chat API v2). START does NOT carry one; only text + action
    // link posts do. We dedupe to protect against any retries.
    if (typeof res.posted_id === "number") {
      const id = res.posted_id;
      setPostedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }
    if (res.response) {
      const botMsg = toMessage(res.response, `bot-${Date.now()}`);
      setMessages((prev) => {
        // Reveal the data panel on the first bot reply that
        // follows at least one client-sourced turn. Uses the
        // pre-update `prev` so we reliably detect "there was a
        // client message before this bot reply".
        const hadClientTurn = prev.some((m) => m.source === "client");
        if (hadClientTurn) setRevealPanel(true);
        return [...prev, botMsg];
      });
    }
  }, []);

  /** Fire START. Safe to call multiple times — cancels any
   *  in-flight request via AbortController. */
  const start = useCallback(async () => {
    abortRef.current?.abort();
    analyzeAbortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setPhase({ kind: "starting" });
    setMessages([]);
    setConversationId(null);
    setConversationRef(null);
    setConversationState(null);
    setLastRawResponse(null);
    setRevealPanel(false);
    setPostedIds([]);
    setExportTrace(null);
    setAnalyzePhase({ kind: "idle" });
    setAnalyzedPostedCount(0);
    try {
      const res = await startConversation(
        tenant,
        {
          language: typeof navigator !== "undefined" ? navigator.language : undefined,
          page_url: typeof window !== "undefined" ? window.location.href : undefined,
        },
        ctrl.signal,
      );
      ingestPostResponse(res);
      setPhase({ kind: "ready" });
      // Intentionally do NOT auto-focus the input on mount —
      // focus() scrolls the focused element into view, which
      // yanked the page down to the Chat Preview section
      // immediately on guide load. Users scroll to the section
      // themselves; they can click to focus when ready.
    } catch (err) {
      if (ctrl.signal.aborted) return;
      setPhase({
        kind: "error",
        message:
          err instanceof Error
            ? err.message
            : "Could not connect to the demo chat.",
      });
    }
  }, [tenant, ingestPostResponse]);

  /** Kick off the conversation on mount. */
  useEffect(() => {
    void start();
    return () => {
      abortRef.current?.abort();
    };
  }, [start]);

  /** Scroll the chat container to the latest message whenever
   *  the list grows. Scoped to the chat div, not the page. */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length, phase.kind]);

  /** Submit the input field as a user text message. */
  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || !conversationId || phase.kind === "posting") return;
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    // Optimistically append the user message so the UI doesn't
    // feel frozen while waiting for the bot response.
    const echoKey = clientEchoKey(`${Date.now()}-${trimmed.slice(0, 10)}`);
    setMessages((prev) => [
      ...prev,
      {
        key: echoKey,
        source: "client",
        date_created: new Date().toISOString(),
        elements: [{ type: "text", payload: { text: trimmed } }],
      },
    ]);
    setInput("");
    setPhase({ kind: "posting" });
    try {
      const res = await postText(tenant, conversationId, trimmed, ctrl.signal);
      ingestPostResponse(res);
      setPhase({ kind: "ready" });
    } catch (err) {
      if (ctrl.signal.aborted) return;
      // Rewind: the echo stays but we flag failure. A cleaner
      // MVP choice than silently discarding the user's input.
      setPhase({
        kind: "error",
        message: err instanceof Error ? err.message : "Message failed to send.",
      });
    }
  }, [input, conversationId, phase.kind, tenant, ingestPostResponse]);

  /** Click a button inside a links payload. */
  const handleActionLink = useCallback(
    async (id: string | number, text: string) => {
      if (!conversationId || phase.kind === "posting") return;
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      // Optimistically echo the user's choice
      const echoKey = clientEchoKey(`${Date.now()}-btn-${id}`);
      setMessages((prev) => [
        ...prev,
        {
          key: echoKey,
          source: "client",
          date_created: new Date().toISOString(),
          elements: [{ type: "text", payload: { text } }],
        },
      ]);
      setPhase({ kind: "posting" });
      try {
        const res = await postActionLink(tenant, conversationId, id, ctrl.signal);
        ingestPostResponse(res);
        setPhase({ kind: "ready" });
      } catch (err) {
        if (ctrl.signal.aborted) return;
        setPhase({
          kind: "error",
          message:
            err instanceof Error ? err.message : "Button click failed.",
        });
      }
    },
    [conversationId, phase.kind, tenant, ingestPostResponse],
  );

  /** Reset: delete the current conversation, then START fresh. */
  const handleReset = useCallback(async () => {
    if (conversationId) {
      try {
        await deleteConversation(tenant, conversationId);
      } catch {
        // Don't block reset if delete fails — the old conversation
        // will just become orphaned server-side.
      }
    }
    await start();
  }, [conversationId, tenant, start]);

  /** Analyze: call the Worker proxy to enrich the conversation with
   *  Export API v4 data. Safe to call repeatedly (Refresh pattern);
   *  aborts any prior analyze in flight. */
  const handleAnalyze = useCallback(async () => {
    if (postedIds.length === 0) return;
    analyzeAbortRef.current?.abort();
    const ctrl = new AbortController();
    analyzeAbortRef.current = ctrl;
    setAnalyzePhase({ kind: "loading" });
    // Snapshot the count BEFORE we await so we record what we
    // actually sent, not the size at the time the response arrived
    // (the user might have sent more messages during the ~10s
    // indexing wait).
    const sentCount = postedIds.length;
    const result = await fetchExportTrace(postedIds, { signal: ctrl.signal });
    if (ctrl.signal.aborted) return;
    if (result.ok) {
      setExportTrace(result.trace);
      setAnalyzedPostedCount(sentCount);
      setAnalyzePhase({ kind: "idle" });
    } else {
      setAnalyzePhase({
        kind: "error",
        message: analyzeErrorMessage(result.error),
      });
    }
  }, [postedIds]);

  /** Cleanup: abort any in-flight analyze on unmount. */
  useEffect(() => {
    return () => {
      analyzeAbortRef.current?.abort();
    };
  }, []);

  /** Auto-kick-off + auto-refresh. As soon as there's at least one
   *  posted message, fire an Analyze in the background 15 s later
   *  (Export indexing delay). That handles both the first analysis
   *  AND subsequent refreshes on the same timer: any new posted turn
   *  resets the timer so we only fire once per burst of activity.
   *  The user can still click Refresh manually for an immediate fetch. */
  useEffect(() => {
    if (postedIds.length === 0) return; // nothing to analyse yet
    if (postedIds.length <= analyzedPostedCount) return; // already up-to-date
    if (analyzePhase.kind === "loading") return; // already fetching
    const timer = window.setTimeout(() => {
      handleAnalyze();
    }, 15_000);
    return () => window.clearTimeout(timer);
  }, [postedIds.length, analyzedPostedCount, analyzePhase.kind, handleAnalyze]);

  // Hard input block: only while the conversation itself can't accept
  // text (opening / errored / no server id). `posting` NO LONGER gates
  // the textarea — the user can keep typing their next message while
  // the bot is still responding to the previous one. The Send button
  // is the one that waits (see `disableSend` below).
  const disableInput =
    phase.kind === "starting" || phase.kind === "error" || !conversationId;
  // Send is gated on the previous POST settling AND a non-empty input.
  const disableSend =
    disableInput || phase.kind === "posting" || !input.trim();

  const tenantLabel = tenant;
  const modeLabel = mode === "live" ? "Live · demo tenant" : "Live · custom tenant";

  return (
    <section>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title="Live chat preview"
        subtitle={`Real conversation against ${tenantLabel}. Type to test intents, integrations, and flow quality end-to-end.`}
      />

      <div
        ref={ref}
        data-testid="live-chat-section"
        className={`transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Status strip */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`w-1.5 h-1.5 rounded-full ${
                phase.kind === "ready" || phase.kind === "posting"
                  ? "bg-boost-green-light animate-pulse"
                  : phase.kind === "error"
                  ? "bg-boost-orange"
                  : "bg-boost-muted"
              }`}
            />
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
              {modeLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleReset()}
            disabled={phase.kind === "starting"}
            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-purple hover:text-boost-green-light disabled:text-boost-muted/40 disabled:cursor-not-allowed transition-colors"
            data-testid="live-chat-reset"
          >
            Reset conversation
          </button>
        </div>

        {/* Chat + Data funnel — side-by-side once revealed.
            The chat frame keeps its width both pre- and post-reveal;
            only its horizontal position changes. Pre-reveal: single
            flex child in a max-w-6xl wrapper, centered via
            justify-center. Post-reveal: the panel slides in on the
            right, chat stays anchored at its size and drifts left. */}
        <div
          className={`flex flex-col md:flex-row gap-4 transition-all duration-700 ease-out max-w-6xl mx-auto ${
            revealPanel ? "" : "md:justify-center"
          }`}
        >
        {/* Chat frame — same width always; only its neighbours change. */}
        <div
          className="flex-1 min-w-0 md:flex-none md:basis-[58%] h-[78vh] md:h-[600px] md:max-h-[80vh] rounded-2xl border-2 border-boost-purple/25 bg-white overflow-hidden flex flex-col transition-all duration-700 ease-out shadow-[0_6px_24px_-8px_rgba(89,25,93,0.18)]"
        >
          {/* Messages area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-3 bg-boost-surface/30"
            data-testid="live-chat-messages"
          >
            {phase.kind === "starting" && (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-boost-muted">Opening conversation…</p>
              </div>
            )}
            {messages.map((msg) => (
              <MessageBubble
                key={msg.key}
                message={msg}
                onAction={handleActionLink}
              />
            ))}
            {phase.kind === "posting" && (
              <div className="flex gap-1.5 px-4 py-2 text-boost-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-boost-purple animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-boost-purple animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-boost-purple animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}
            {phase.kind === "error" && (
              <div className="rounded-xl border border-boost-orange/50 bg-boost-orange/10 px-4 py-3">
                <p className="text-xs font-semibold text-boost-orange mb-1">Chat error</p>
                <p className="text-xs text-boost-dark/80 mb-2">{phase.message}</p>
                <button
                  type="button"
                  onClick={() => void start()}
                  className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-purple hover:text-boost-green-light transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-boost-border bg-white px-3 py-3 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, maxInputChars))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              disabled={disableInput}
              placeholder={
                disableInput
                  ? "Connecting…"
                  : "Ask anything — policy, accounts, rates, onboarding…"
              }
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-boost-border bg-boost-surface/40 text-boost-dark placeholder:text-boost-muted/70 focus:outline-none focus:ring-2 focus:ring-boost-green-light focus:border-transparent disabled:opacity-60"
              data-testid="live-chat-input"
              maxLength={maxInputChars}
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={disableSend}
              className="px-4 py-2 rounded-lg bg-boost-purple text-white text-sm font-semibold hover:bg-boost-purple/90 disabled:bg-boost-muted/30 disabled:cursor-not-allowed transition-colors"
              data-testid="live-chat-send"
            >
              Send
            </button>
          </div>
        </div>

        {/* Data funnel panel — mounts after first client→bot exchange */}
        {revealPanel && (
          <div className="flex-1 min-w-0 md:basis-[42%] animate-modal-in">
            <DataFunnelPanel
              messages={messages}
              conversationState={conversationState}
              reference={conversationRef}
              tenant={tenant}
              lastRawResponse={lastRawResponse}
              postedIds={postedIds}
              exportTrace={exportTrace}
              analyzePhase={analyzePhase}
              analyzedPostedCount={analyzedPostedCount}
              onAnalyze={handleAnalyze}
              exportEnabled={isExportConfigured()}
            />
          </div>
        )}
        </div>

        {/* Footnote */}
        <p className="text-[10px] text-boost-muted mt-2 leading-relaxed">
          Powered by boost.ai Chat API v2. Nothing in this chat is stored by
          this interactive guide — conversations live in{" "}
          <span className="font-mono text-boost-dark/70">{tenantLabel}</span>'s
          Admin Panel.
        </p>
      </div>
    </section>
  );
}

/* ─── Message bubble ───────────────────────────────────────── */

function MessageBubble({
  message,
  onAction,
}: {
  message: ChatMessage;
  onAction: (id: string | number, text: string) => void;
}) {
  const isClient = message.source === "client";
  const isAgent = message.source === "agent";
  const align = isClient ? "items-end" : "items-start";

  return (
    <div className={`flex flex-col ${align}`}>
      <div className={`flex items-end gap-2 max-w-[85%] ${isClient ? "flex-row-reverse" : "flex-row"}`}>
        {!isClient && (
          <div
            aria-hidden="true"
            className="flex-shrink-0 w-7 h-7 rounded-full bg-boost-purple flex items-center justify-center overflow-hidden"
          >
            {message.avatar_url ? (
              <img
                src={message.avatar_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="w-4 h-4"
                style={{
                  backgroundColor: "white",
                  WebkitMaskImage: `url(${assetPath("/icons/white/chatbot.svg")})`,
                  maskImage: `url(${assetPath("/icons/white/chatbot.svg")})`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                }}
              />
            )}
          </div>
        )}
        <div className="min-w-0 flex-1">
          {message.elements.map((el, i) => (
            <ElementRenderer
              key={`${message.key}-el-${i}`}
              element={el}
              isClient={isClient}
              onAction={onAction}
            />
          ))}
        </div>
      </div>
      {isAgent && (
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-boost-purple/70 ml-9 mt-0.5">
          Human agent
        </span>
      )}
    </div>
  );
}

/* ─── Element renderer ──────────────────────────────────────── */

function ElementRenderer({
  element,
  isClient,
  onAction,
}: {
  element: ChatElement;
  isClient: boolean;
  onAction: (id: string | number, text: string) => void;
}) {
  const bubble = isClient
    ? "bg-boost-purple text-white"
    : "bg-white border border-boost-border text-boost-dark";
  const radius = isClient ? "rounded-2xl rounded-br-sm" : "rounded-2xl rounded-bl-sm";

  switch (element.type) {
    case "text":
      return (
        <div className={`${bubble} ${radius} px-4 py-2.5 text-sm leading-relaxed mb-1.5 whitespace-pre-wrap`}>
          {element.payload.text}
        </div>
      );
    case "html":
      return (
        <div
          className={`${bubble} ${radius} px-4 py-2.5 text-sm leading-relaxed mb-1.5 chat-html`}
          // The boost.ai API sanitizes HTML on its end; we trust
          // the tenant's output here. If the tenant is
          // customer-supplied we may need a local sanitizer pass.
          dangerouslySetInnerHTML={{ __html: element.payload.html }}
        />
      );
    case "image":
      return (
        <div className={`${bubble} ${radius} px-2 py-2 mb-1.5 max-w-full overflow-hidden`}>
          <img
            src={element.payload.url}
            alt={element.payload.alt_text ?? ""}
            className="rounded-lg max-w-full h-auto"
          />
        </div>
      );
    case "video":
      // Render as a lightweight link out — embedding YouTube /
      // Vimeo in a chat bubble at MVP is overkill.
      return (
        <div className={`${bubble} ${radius} px-4 py-2.5 text-sm mb-1.5`}>
          <a
            href={element.payload.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-boost-green-light"
          >
            Open video ({element.payload.source}) ↗
          </a>
        </div>
      );
    case "links":
      return (
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {element.payload.links.map((link) => {
            if (link.type === "action_link") {
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => onAction(link.id, link.text)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-boost-purple/40 bg-white text-xs font-semibold text-boost-purple hover:bg-boost-purple hover:text-white transition-colors"
                >
                  {link.text}
                </button>
              );
            }
            return (
              <a
                key={link.id}
                href={link.url}
                target={link.link_target === "_blank" ? "_blank" : "_self"}
                rel={link.link_target === "_blank" ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-boost-border bg-white text-xs font-semibold text-boost-dark hover:bg-boost-surface transition-colors"
              >
                {link.text} ↗
              </a>
            );
          })}
        </div>
      );
    case "ssml":
      // SSML is voice output — irrelevant in a text-only preview.
      // Fall back to showing a muted placeholder so the user knows
      // something came through.
      return (
        <div className="text-[10px] uppercase tracking-[0.14em] text-boost-muted/60 mb-1.5 px-4">
          (voice response)
        </div>
      );
    case "json":
      // Custom JSON payloads are tenant-specific. Render as a
      // muted debug block for now.
      return (
        <details className={`${bubble} ${radius} px-4 py-2 mb-1.5 text-xs`}>
          <summary className="cursor-pointer">Custom payload</summary>
          <pre className="mt-2 overflow-x-auto text-[10px]">
            {JSON.stringify(element.payload.json, null, 2)}
          </pre>
        </details>
      );
    default:
      return null;
  }
}
