import { auth } from "@/auth";

/**
 * Route guard. Next.js 16 renamed `middleware.ts` → `proxy.ts` (Node
 * runtime, default export). This gates the authoring surface only:
 *
 *   /admin*    — the guide builder
 *   /admin-x*  — the (unlinked) experimental journey mockup
 *
 * Public on purpose: /, /signin, /guide, /slides, /api/auth. Prospects
 * open shared /guide#data=... links with no login.
 *
 * Unauthenticated requests to a gated path are redirected to /signin
 * with a callbackUrl so they land back where they were headed.
 */
export default auth((req) => {
  if (!req.auth) {
    const signInUrl = new URL("/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/admin/:path*", "/admin-x/:path*"],
};
