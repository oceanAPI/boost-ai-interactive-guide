import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "wm_become_client",
  name: "Become a client",
  icon: "user-plus",
  automationRate: 65,
  avgResolutionTime: "~6 min",
  topTopic: "What's your minimum investment?",
  description: "Prospective-client onboarding — minimum-threshold checks, service-tier matching, KYC / AML intake, suitability assessment, mandate selection, and introduction to an assigned wealth manager.",
  capabilities: [
    { title: "Threshold & tier match", description: "Confirms investable assets meet the Private / UHNW / Family Office minimum and proposes the right service tier" },
    { title: "Suitability assessment", description: "Risk profile, investment horizon, liquidity needs, ESG preferences, and complex-product experience" },
    { title: "KYC & source of wealth", description: "Captures identification, corporate structure (if applicable), and source-of-wealth evidence to regulator standard" },
    { title: "Mandate selection", description: "Walks through discretionary, advisory, execution-only options with fee impact and governance comparison" },
    { title: "Advisor introduction", description: "Matches the prospect to a wealth manager by specialism, region, and language; schedules a discovery call" },
    { title: "Welcome & onboarding pack", description: "Issues account-opening documents, custody agreements, and secure-portal credentials on sign-up" },
  ],
  quickActions: ["Minimum investment", "Service tiers", "Risk profile", "Compare mandates", "Meet an advisor", "Open account"],
  flow: {
    knowledgeSources: [
      { id: "wbc-kb-service-tiers", name: "Service Tier Catalogue", type: "document", icon: "hierarchy-document", description: "Private / UHNW / Family Office thresholds, entitlements, and fee schedules" },
      { id: "wbc-kb-mandate-library", name: "Mandate Library", type: "database", icon: "database-connection", description: "Standard discretionary and advisory mandate templates with governance detail" },
      { id: "wbc-kb-identity-api", name: "Identity & Sanctions API", type: "api", icon: "computer-api", description: "Real-time ID check, PEP / sanctions screening, and source-of-wealth analytics" },
    ],
    guardrails: [
      { id: "wbc-gr-kyc", name: "KYC, AML & Source of Wealth", type: "compliance", icon: "lock-security", description: "Enforces identity, sanctions, and source-of-wealth documentation before account opening" },
      { id: "wbc-gr-suitability", name: "Suitability Assessment", type: "compliance", icon: "shield-medal", description: "Blocks mandate selection that exceeds the prospect's risk tolerance or investment knowledge" },
    ],
    actionHooks: [
      { id: "wbc-ah-book-discovery", name: "Book Discovery Call", type: "webhook", icon: "target-selection", description: "Schedules the initial discovery meeting with a matched wealth manager" },
      { id: "wbc-ah-open-account", name: "Open Account", type: "webhook", icon: "banknote", description: "Creates the client file and account structure once KYC and suitability pass" },
      { id: "wbc-ah-welcome-pack", name: "Send Welcome Pack", type: "email", icon: "phone", description: "Delivers onboarding documents, custody agreements, and portal credentials" },
    ],
    processes: [
      { id: "wbc-pr-onboarding", name: "Onboarding Workflow", type: "workflow", icon: "hierarchy", description: "Threshold check → suitability → KYC → mandate → advisor match → account open" },
      { id: "wbc-pr-kyc", name: "KYC & Screening", type: "workflow", icon: "cogs", description: "Runs identity, sanctions, PEP, and source-of-wealth analytics with enhanced-due-diligence escalation" },
    ],
    standardResponses: [
      { id: "wbc-sr-welcome", name: "Welcome Confirmation", type: "confirmation", icon: "thumbs-up", description: "Confirms account opening with assigned advisor, first-meeting date, and portal access" },
      { id: "wbc-sr-advisor-booked", name: "Discovery Booked", type: "confirmation", icon: "check-symbol-check", description: "Confirms discovery call with advisor, time, and agenda" },
    ],
  },
  tier: "primary",
};

export default agent;
