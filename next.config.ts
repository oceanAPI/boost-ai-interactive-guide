import type { NextConfig } from "next";

/**
 * Server runtime on Vercel (was: static export on GitHub Pages).
 *
 * The static-export + basePath config was removed when auth landed —
 * Auth.js v5 + the `proxy.ts` route guard require a Node runtime, which
 * `output: "export"` cannot provide. Vercel serves the app at the domain
 * root, so there is no basePath / assetPrefix any more.
 *
 * `src/lib/asset-path.ts` still wraps every static asset URL, but its
 * prefix is now empty — kept as the seam so reintroducing a basePath
 * later is a one-line change.
 */
const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
