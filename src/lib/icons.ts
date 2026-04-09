/**
 * Central icon mapping for the guide.
 * All paths are relative to /public and will be resolved via basePath at runtime.
 * Purple variants are used on light backgrounds, white on dark/purple backgrounds.
 */

export function iconPath(variant: "purple" | "white", name: string): string {
  return `/icons/${variant}/${name}.svg`;
}

export function brandPath(name: string): string {
  return `/brand/${name}`;
}

export function photoPath(name: string): string {
  return `/photos/${name}`;
}

/* ── Section icon mappings ── */

export const SECTION_ICONS = {
  orchestrator: "robot-brain",
  agents: "brain-integration",
  roi: "growth-graph",
  architecture: "computer-network-3671774",
  demo: "chatbot",
  timeline: "time",
  comparison: "shield-medal",
  caseStudies: "man-star",
} as const;

/* ── Agent/Industry icon mappings ── */

export const INDUSTRY_ICONS: Record<string, string> = {
  insurance: "umbrella",
  banking: "bank",
  wealth_management: "growth-graph",
  credit_union: "hand-to-hand",
  fintech: "processor-chip",
  pension: "government",
};

/* ── Feature icon mappings ── */

export const FEATURE_ICONS: Record<string, string> = {
  chat: "chat",
  voice: "phone",
  email: "speech",
  social: "chatting",
  bot: "good-bot",
  ai: "brain-integration",
  security: "lock-security",
  api: "computer-api-3671765",
  network: "cloud-network-3671763",
  database: "database-connection",
  analytics: "bar-chart",
  automation: "cogs",
  knowledge: "books",
  training: "school",
  integration: "integration-artificial-intelligence",
  user: "user-chat",
  handover: "human-interaction",
  globe: "earth",
  search: "global-search",
  settings: "design-setting",
  check: "check-robot",
  star: "star",
  thumbsUp: "thumbs-up",
  hierarchy: "hierarchy-3671707",
  server: "lock-server",
  desktop: "desktop-network",
  password: "computer-password",
  target: "target-selection",
  flag: "goal-flag",
  tap: "finger-tap",
  idea: "refresh-idea",
  wireframe: "wireframe",
  algorithm: "algorithm-3671752",
  headset: "headset",
  plan: "plan-a-b",
  chip: "processor-chip-3671761",
  onlineGrowth: "online-growth",
};

/* ── Photo mappings for lifestyle sections ── */

export const SECTION_PHOTOS: Record<string, string[]> = {
  hero: [],
  orchestrator: [],
  demo: [],
};
