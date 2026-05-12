/* ──────────────────────────────────────────────────────────────
 *  Boost Voice session client — WebRTC bridge
 *
 *  Mirrors boost-chat.ts's shape, just pointed at the voice
 *  endpoint and returning LiveKit connection params instead of a
 *  chat conversation. The browser then hands those params straight
 *  to the `livekit-client` SDK, which manages the WebRTC peer
 *  connection, audio capture, and audio playback.
 *
 *  Endpoint:
 *    POST https://<tenant>/api/voice/v1/session
 *    Body: { external_id: string }
 *
 *  Response (production):
 *    {
 *      url: "wss://boost-test-servers-XXXX.livekit.cloud",
 *      access_token: "<JWT — short-lived, ~6h>",
 *    }
 *
 *  The access_token's JWT payload carries room name, publish/
 *  subscribe grants, and a tenant-side entrypoint_id that
 *  determines which voice agent picks up. From our side it's
 *  opaque — we hand it to livekit-client and let LiveKit do the
 *  rest.
 *
 *  CORS: same allowlist as /api/chat/v2. Works on prod (oceanapi.
 *  github.io); blocked on localhost dev unless the tenant adds
 *  localhost:3000 to its allowed origins.
 * ────────────────────────────────────────────────────────────── */

export interface VoiceSessionParams {
  /** LiveKit WebSocket server URL (wss://...). Hand straight to
   *  Room.prototype.connect() from livekit-client. */
  url: string;
  /** Signed JWT carrying room name + publish/subscribe grants +
   *  tenant-side entrypoint mapping. Opaque to us. */
  access_token: string;
}

/**
 * Open a Boost Voice session for the given tenant + entrypoint.
 *
 * The `externalId` is a tenant-issued UUID that maps to a
 * configured voice agent flow. One external_id = one agent
 * entrypoint. For multiple demos with different agents, provision
 * one external_id per demo tenant-side and pick the right one when
 * starting the call.
 *
 * @throws Error on network / 4xx / 5xx. Rejects the abort signal
 *   when cancelled.
 */
export async function createVoiceSession(
  tenant: string,
  externalId: string,
  signal?: AbortSignal,
): Promise<VoiceSessionParams> {
  const res = await fetch(`https://${tenant}/api/voice/v1/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ external_id: externalId }),
    signal,
  });
  if (!res.ok) {
    let detail = "";
    try {
      const txt = await res.text();
      detail = txt.slice(0, 200);
    } catch {
      // Ignore — keep the bare status.
    }
    throw new Error(
      `Voice session ${res.status}${detail ? `: ${detail}` : ""}`,
    );
  }
  const data = (await res.json()) as Partial<VoiceSessionParams>;
  if (!data.url || !data.access_token) {
    throw new Error("Voice session response missing url or access_token");
  }
  return { url: data.url, access_token: data.access_token };
}

/* ─── Default external_id ─────────────────────────────────────── *
 * Single tenant-issued entrypoint shipped today. When we provision
 * per-demo entrypoints later, swap this for a map keyed by demo ID.
 *
 * NOTE: this is the FINANCEWIZARD tenant's entrypoint. If you
 * change tenants, you need a new external_id.
 */
export const DEFAULT_VOICE_EXTERNAL_ID =
  "72518cd2-d7f1-4a35-9f97-67b4c358e1e0";
