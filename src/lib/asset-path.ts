/**
 * Resolve a static asset URL.
 *
 * The app moved from GitHub Pages (basePath `/boost-ai-interactive-guide`)
 * to Vercel, which serves at the domain root — so the prefix is now empty
 * and this is effectively a passthrough. The helper is kept (and every
 * asset still routes through it) so reintroducing a basePath later is a
 * one-line change here, not an 18-file edit.
 *
 * next/image with `unoptimized` does NOT auto-prepend a basePath, so
 * keeping every src behind this helper preserves that guarantee.
 */

const basePath = "";

export function assetPath(path: string): string {
  if (path.startsWith("http")) return path;
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}
