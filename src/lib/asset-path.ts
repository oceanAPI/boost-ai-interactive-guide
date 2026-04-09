/**
 * Prepend the basePath to static asset URLs so they work
 * both in dev (no basePath) and on GitHub Pages (with basePath).
 *
 * next/image with `unoptimized` does NOT auto-prepend basePath,
 * so every src must go through this helper.
 */

const basePath = process.env.NODE_ENV === "production"
  ? "/boost-ai-interactive-guide"
  : "";

export function assetPath(path: string): string {
  if (path.startsWith("http")) return path;
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}
