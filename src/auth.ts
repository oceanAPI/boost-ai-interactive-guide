import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Auth.js v5 — Google sign-in gating the /admin authoring surface.
 *
 * Who gets in (signIn callback):
 *   1. Google Workspace accounts whose `hd` (hosted-domain) claim is
 *      "boost.ai" — the only cryptographic proof the account is a real
 *      boost.ai Workspace identity (email suffix alone is spoofable).
 *   2. Fallback: a verified email ending in "@boost.ai" (covers the case
 *      where `hd` is absent / boost.ai isn't a Workspace domain).
 *   3. A small allow-list of named external emails from
 *      ALLOWED_EXTERNAL_EMAILS (comma-separated env var).
 *
 * Everyone else is rejected.
 *
 * Credentials are read from env automatically by Auth.js:
 *   AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, AUTH_SECRET.
 * That's the "swap keys at handoff" seam — tech changes the env vars,
 * never the code.
 *
 * Sessions are JWT (no database adapter) so the guard runs fine in the
 * Node `proxy.ts` runtime.
 */

const ALLOWED_DOMAIN = "boost.ai";

function externalAllowList(): string[] {
  return (process.env.ALLOWED_EXTERNAL_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return false;

      const email = profile?.email?.toLowerCase();
      const verified = profile?.email_verified === true;
      if (!email || !verified) return false;

      // 1. Workspace hosted-domain claim — strongest guarantee.
      const hd = (profile as { hd?: string }).hd;
      if (hd === ALLOWED_DOMAIN) return true;

      // 2. Verified email on the boost.ai domain.
      if (email.endsWith(`@${ALLOWED_DOMAIN}`)) return true;

      // 3. Named external collaborators.
      if (externalAllowList().includes(email)) return true;

      return false;
    },
  },
});
