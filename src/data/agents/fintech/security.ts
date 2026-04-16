import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "ft_security",
  name: "Security",
  icon: "shield-medal",
  automationRate: 87,
  avgResolutionTime: "~1.5 min",
  topTopic: "Suspicious login alert",
  description: "Account security and fraud prevention — two-factor authentication, device trust management, suspicious activity alerts, scam awareness, and account recovery.",
  capabilities: [
    { title: "Two-factor authentication", description: "Enable, disable, or reset 2FA via authenticator app or SMS" },
    { title: "Device trust", description: "View and manage trusted devices, revoke sessions, and approve new logins" },
    { title: "Suspicious activity alerts", description: "Real-time notifications for unusual logins, transactions, or setting changes" },
    { title: "Scam alerts", description: "Proactive warnings about known scam patterns and social-engineering attempts" },
    { title: "Account recovery", description: "Regain access after lockout via identity re-verification" },
    { title: "Security settings", description: "Biometric login, session timeouts, app-lock configuration, and notification preferences" },
  ],
  quickActions: ["Suspicious login alert", "Set up 2FA", "Manage devices", "Account recovery", "Scam protection", "Security settings"],
  flow: {
    knowledgeSources: [
      { id: "ft-sec-kb-faq", name: "Security FAQ", type: "faq", icon: "books", description: "2FA setup, device management, phishing guidance, recovery steps" },
      { id: "ft-sec-kb-auth-api", name: "Authentication API", type: "api", icon: "computer-api", description: "Active sessions, device fingerprints, 2FA status, login history" },
      { id: "ft-sec-kb-fraud-db", name: "Fraud Intelligence Database", type: "database", icon: "database-connection", description: "Known scam patterns, compromised credentials, risk scores" },
    ],
    guardrails: [
      { id: "ft-sec-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents fabricated security statuses or login history" },
      { id: "ft-sec-gr-step-up", name: "Step-up Authentication", type: "compliance", icon: "shield-medal", description: "Requires identity re-verification before sensitive security changes" },
    ],
    actionHooks: [
      { id: "ft-sec-ah-lock", name: "Lock Account", type: "webhook", icon: "target-selection", description: "Immediately locks the account to prevent further unauthorised access" },
      { id: "ft-sec-ah-revoke", name: "Revoke Device Session", type: "webhook", icon: "target-selection", description: "Terminates a specific device session and removes trust" },
      { id: "ft-sec-ah-escalate", name: "Transfer to Fraud Team", type: "transfer", icon: "headset", description: "Urgent handover for confirmed fraud or account takeover" },
    ],
    processes: [
      { id: "ft-sec-pr-recovery", name: "Account Recovery Flow", type: "workflow", icon: "hierarchy", description: "Orchestrates lockout resolution via identity re-verification and 2FA reset" },
      { id: "ft-sec-pr-incident", name: "Security Incident Response", type: "workflow", icon: "cogs", description: "Coordinates account lock, session revocation, and fraud team notification" },
    ],
    standardResponses: [
      { id: "ft-sec-sr-alert-resolved", name: "Alert Resolved", type: "confirmation", icon: "thumbs-up", description: "Confirms suspicious activity was reviewed and resolved with action taken" },
      { id: "ft-sec-sr-2fa-enabled", name: "2FA Enabled", type: "confirmation", icon: "check-symbol-check", description: "Confirms two-factor authentication is active with backup codes provided" },
    ],
  },
  tier: "primary",
};

export default agent;
