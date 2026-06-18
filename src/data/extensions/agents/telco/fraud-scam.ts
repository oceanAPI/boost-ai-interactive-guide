import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "tc_fraud_scam",
  name: "Fraud & Scam Protection",
  icon: "shield-medal",
  automationRate: 74,
  avgResolutionTime: "~3 min",
  topTopic: "I got a suspicious SMS",
  description:
    "Reports and protections against SMS phishing (smishing), number spoofing, premium-SMS scams, account takeover attempts, and device loss. Connects to the shared Nordic anti-fraud infrastructure and consumer-protection authorities.",
  capabilities: [
    { title: "Report smishing / phishing SMS",description: "One-flow report including the sender number, body, and evidence routing to the anti-fraud team" },
    { title: "Block & unblock numbers",       description: "Block abusive numbers at network level or through the customer's app-level block list" },
    { title: "Premium-SMS dispute",            description: "Dispute a premium-SMS charge and refund eligibility via the policy-aligned calculator" },
    { title: "Account-takeover response",      description: "Rapid-response flow when a customer reports unauthorised changes or activities on their account" },
    { title: "Lost / stolen device handoff",   description: "Trigger device-lost workflow — SIM suspend, IMEI block, police-report guidance" },
    { title: "Safety education",               description: "Surface the national consumer-protection resources and common current scams in the market" },
  ],
  quickActions: ["Report suspicious SMS", "Block a number", "Premium-SMS dispute", "My account was hacked", "Lost / stolen device", "Current scams"],
  flow: {
    knowledgeSources: [
      { id: "tc-fs-kb-antifraud",    name: "Anti-fraud Platform API", type: "api",      icon: "computer-api",       description: "Shared anti-fraud platform for reports, blocking, and known-bad-number lists" },
      { id: "tc-fs-kb-consumer",     name: "Consumer-protection Hub", type: "document", icon: "hierarchy-document", description: "National consumer-protection advisory and current active-scam alerts" },
      { id: "tc-fs-kb-imei",         name: "IMEI Blocklist Service",   type: "api",      icon: "computer-api",       description: "Cross-operator IMEI blocklist for lost/stolen device workflow" },
    ],
    guardrails: [
      { id: "tc-fs-gr-no-false-promise",name: "No Blanket Promises", type: "guardrail",icon: "shield-medal",      description: "Never promises to recover funds or identify perpetrators — sets realistic expectations up-front" },
      { id: "tc-fs-gr-pii",             name: "Heightened PII Care", type: "pii",      icon: "lock-security",     description: "Fraud-report evidence handled with elevated confidentiality; no external echo" },
    ],
    actionHooks: [
      { id: "tc-fs-ah-submit-report",   name: "Submit Fraud Report", type: "api",      icon: "finger-tap",         description: "Submits a structured fraud report into the shared anti-fraud queue with reference number" },
      { id: "tc-fs-ah-block-number",    name: "Block Number",        type: "api",      icon: "lock",               description: "Applies a network-level or customer-level block on the abusive number" },
    ],
    processes: [
      { id: "tc-fs-pr-device-lost",     name: "Lost-device Workflow",type: "workflow", icon: "hierarchy",          description: "Coordinated SIM-suspend → IMEI-block → replacement-order → police-guidance" },
      { id: "tc-fs-pr-escalate",        name: "Security Desk Escalation",type: "transfer",icon: "headset",         description: "Priority routing to the security desk when account-takeover is suspected" },
    ],
    standardResponses: [
      { id: "tc-fs-sr-report-filed",    name: "Report Filed",        type: "standard",icon: "thumbs-up",           description: "Acknowledgement with reference and expected turnaround from the anti-fraud team" },
      { id: "tc-fs-sr-fallback",        name: "Escalation Routed",    type: "fallback",icon: "route",               description: "Fallback confirming the escalation is routed and a specialist will be in touch" },
    ],
  },
  variants: ["telco:mobile", "telco:broadband"],
  tier: "primary",
};

export default agent;
