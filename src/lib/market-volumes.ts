import type { ChannelVolumes, MarketVolumes } from "./types";

/** Slugify a market name to a stable React key.
 *  "United Kingdom" → "united-kingdom". Keeps a- z, 0-9, dashes. */
export function slugifyMarketKey(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `market-${Date.now().toString(36)}`;
}

/** Sum channel volumes across markets to produce the rollup that
 *  consumers (ROI, Impact, Commercial, SoW) read today via
 *  `channel_volumes`. */
export function rollupMarketVolumes(markets: MarketVolumes[]): ChannelVolumes {
  const out: ChannelVolumes = {};
  for (const market of markets) {
    for (const ch of ["chat", "voice", "email", "social"] as const) {
      const val = market.volumes?.[ch];
      if (typeof val === "number" && val > 0) {
        out[ch] = (out[ch] ?? 0) + val;
      }
    }
  }
  return out;
}

/** Default empty market record for the admin "Add market" affordance.
 *  Country code optional; sales rep can fill it post-creation. */
export function createEmptyMarket(name = ""): MarketVolumes {
  return {
    key: name ? slugifyMarketKey(name) : `market-${Date.now().toString(36)}`,
    name,
    volumes: {},
  };
}
