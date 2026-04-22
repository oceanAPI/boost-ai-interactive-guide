/* ──────────────────────────────────────────────────────────────
 *  Chat API v2 client — thin fetch wrapper for boost.ai's
 *  virtual-agent conversation protocol.
 *
 *  Docs (as pasted by the user, April 2026):
 *    https://<tenant>/api/chat/v2
 *
 *  Browsers call this module directly. The public endpoints
 *  accept anonymous POST for most commands (tenant decides).
 *  Request-hashing (HMAC-SHA512 via `X-Hub-Signature`) is an
 *  admin-panel toggle; this client does NOT sign by default. If
 *  a tenant enables hashing, we'll wire a signer here as a
 *  follow-up. Today's shipping behavior: plain HTTPS, no auth.
 *
 *  Shape of what we model:
 *    - START  → { command: "START" }           → PostResponse
 *    - POST text/action_link/trigger_action    → PostResponse
 *    - RESUME → { command: "RESUME", ... }     → ResumeResponse
 *    - STOP   → { command: "STOP", ... }       → PostResponse
 *    - DELETE → { command: "DELETE", ... }     → PostResponse
 *
 *  We model only the field surface the live-chat UI needs. The
 *  Chat API returns many more fields; missing ones are accepted
 *  via `[key: string]: unknown` passthrough to stay forward-
 *  compatible without over-typing.
 * ────────────────────────────────────────────────────────────── */

/** Default demo tenant. Used when `demo_mode === "live"` and for
 *  any caller that doesn't pass an explicit tenant. Hardcoded as
 *  a last-resort fallback; env var `NEXT_PUBLIC_BOOST_DEMO_TENANT`
 *  overrides. */
export const DEFAULT_DEMO_TENANT = "financewizard.boost.ai";

/** Resolve the tenant to call for a given mode. Returns the env
 *  override when present, otherwise the hardcoded default. */
export function resolveDemoTenant(override?: string): string {
  const fromEnv =
    typeof process !== "undefined" &&
    (process.env?.NEXT_PUBLIC_BOOST_DEMO_TENANT ?? "").trim();
  return (override || fromEnv || DEFAULT_DEMO_TENANT).trim();
}

/* ─── Conversation state (subset we render) ────────────────── */

export type ChatStatus = "virtual_agent" | "in_human_chat_queue" | "assigned_to_human";

export interface ChatConversationState {
  allow_delete_conversation?: boolean;
  chat_status: ChatStatus;
  max_input_chars: number;
  poll?: boolean;
  is_blocked?: boolean;
  human_is_typing?: boolean;
  skill?: string | null;
  [key: string]: unknown;
}

export interface ChatConversation {
  /** Opaque conversation ID, usable as `conversation_id` in
   *  subsequent commands. Null / missing when authenticated via
   *  user token. */
  id?: string | null;
  /** Hex external identifier. Safe to log/display. Maps to
   *  Export API v4's Conversation.reference for cross-lookup. */
  reference: string;
  state: ChatConversationState;
}

/* ─── Response elements (we render these) ──────────────────── */

export interface HtmlPayload {
  html: string;
  style?: string | null;
}

export interface TextPayload {
  text: string;
  style?: string | null;
}

export interface ImagePayload {
  url: string;
  alt_text?: string | null;
}

export interface VideoPayload {
  url: string;
  source: "ms_stream" | "ms_stream_sharepoint" | "vimeo" | "wistia" | "youtube";
  fullscreen?: boolean | null;
}

export interface ActionLink {
  type: "action_link";
  id: string;
  text: string;
  function?: "APPROVE" | "DENY" | null;
  attributes?: Record<string, unknown> | null;
}

export interface ExternalLink {
  type: "external_link";
  id: string;
  text: string;
  link_target: "_blank" | "_self";
  url: string;
  is_attachment?: boolean | null;
  attributes?: Record<string, unknown> | null;
}

export interface LinksPayload {
  links: Array<ActionLink | ExternalLink>;
}

export type ChatElement =
  | { type: "html"; payload: HtmlPayload }
  | { type: "text"; payload: TextPayload }
  | { type: "image"; payload: ImagePayload }
  | { type: "video"; payload: VideoPayload }
  | { type: "links"; payload: LinksPayload }
  | { type: "json"; payload: { json: Record<string, unknown> } }
  | { type: "ssml"; payload: { ssml: string } };

export interface ChatResponse {
  id?: string;
  avatar_url?: string;
  date_created: string;
  language?: string;
  source: "client" | "bot" | "agent";
  is_human_agent?: boolean;
  elements: ChatElement[];
  [key: string]: unknown;
}

/* ─── Command responses ────────────────────────────────────── */

export interface PostResponse {
  conversation: ChatConversation;
  posted_id?: number;
  is_human_agent?: boolean;
  response?: ChatResponse;
  [key: string]: unknown;
}

export interface ResumeResponse {
  conversation: ChatConversation;
  responses: ChatResponse[];
  [key: string]: unknown;
}

export interface ChatError {
  type?: "error";
  error: string;
  tag?: string;
}

/* ─── Low-level command dispatch ───────────────────────────── */

interface CommandInput {
  tenant: string;
  body: Record<string, unknown>;
  /** AbortSignal to cancel in-flight requests (e.g. on unmount). */
  signal?: AbortSignal;
}

/** Raw POST to /api/chat/v2 on the given tenant. Rejects with a
 *  ChatError-shaped object if the server returns an error, or a
 *  generic Error for network / parse failures. */
async function postCommand<T>({ tenant, body, signal }: CommandInput): Promise<T> {
  const url = `https://${tenant}/api/chat/v2`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const data = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const err = (data && typeof data === "object" ? (data as ChatError) : null);
    throw Object.assign(new Error(err?.error ?? `Chat API ${res.status}`), {
      status: res.status,
      tag: err?.tag,
    });
  }
  // The server sometimes returns an error-shaped JSON with 200 OK
  // (older endpoints). Treat an object with `error` + no
  // `conversation` as an error too.
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    !("conversation" in data)
  ) {
    const err = data as ChatError;
    throw Object.assign(new Error(err.error ?? "Chat API error"), {
      tag: err.tag,
    });
  }
  return data as T;
}

/* ─── Command helpers ──────────────────────────────────────── */

interface StartOptions {
  language?: string;
  page_url?: string;
  client_timezone?: string;
  skip_welcome_message?: boolean;
  disable_gdpr_consent?: boolean;
}

export function startConversation(
  tenant: string,
  options: StartOptions = {},
  signal?: AbortSignal,
): Promise<PostResponse> {
  return postCommand<PostResponse>({
    tenant,
    signal,
    body: { command: "START", ...options },
  });
}

export function postText(
  tenant: string,
  conversation_id: string,
  value: string,
  signal?: AbortSignal,
): Promise<PostResponse> {
  return postCommand<PostResponse>({
    tenant,
    signal,
    body: { command: "POST", conversation_id, type: "text", value },
  });
}

export function postActionLink(
  tenant: string,
  conversation_id: string,
  id: string | number,
  signal?: AbortSignal,
): Promise<PostResponse> {
  return postCommand<PostResponse>({
    tenant,
    signal,
    body: { command: "POST", conversation_id, type: "action_link", id },
  });
}

export function postExternalLink(
  tenant: string,
  conversation_id: string,
  id: string | number,
  signal?: AbortSignal,
): Promise<PostResponse> {
  return postCommand<PostResponse>({
    tenant,
    signal,
    body: { command: "POST", conversation_id, type: "external_link", id },
  });
}

export function resumeConversation(
  tenant: string,
  conversation_id: string,
  options: { language?: string; clean?: boolean } = {},
  signal?: AbortSignal,
): Promise<ResumeResponse> {
  return postCommand<ResumeResponse>({
    tenant,
    signal,
    body: { command: "RESUME", conversation_id, ...options },
  });
}

export function deleteConversation(
  tenant: string,
  conversation_id: string,
  signal?: AbortSignal,
): Promise<PostResponse> {
  return postCommand<PostResponse>({
    tenant,
    signal,
    body: { command: "DELETE", conversation_id },
  });
}

export function stopConversation(
  tenant: string,
  conversation_id: string,
  signal?: AbortSignal,
): Promise<PostResponse> {
  return postCommand<PostResponse>({
    tenant,
    signal,
    body: { command: "STOP", conversation_id },
  });
}

/* ─── UI-shaped message model ──────────────────────────────── */

/** Local representation of a single message bubble in the UI.
 *  Derived from ChatResponse but flattened for rendering. */
export interface ChatMessage {
  /** Stable key for React (server id when present, else client-
   *  generated). */
  key: string;
  /** Server-assigned message ID. Useful for cross-referencing
   *  with the Export API later. */
  id?: string;
  source: "client" | "bot" | "agent";
  /** Rich elements straight from the API. */
  elements: ChatElement[];
  date_created: string;
  avatar_url?: string;
  language?: string;
}
