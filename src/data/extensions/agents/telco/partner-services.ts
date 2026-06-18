import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "tc_partner_services",
  name: "Partner Services & Add-ons",
  icon: "handshake",
  automationRate: 84,
  avgResolutionTime: "~2 min",
  topTopic: "Add HBO to my plan",
  description:
    "Third-party bundles and add-ons — streaming (HBO Max, Viaplay, YouSee), music (Spotify, TIDAL), cloud storage, device-insurance — including activation, invoice-vs-partner-billing clarity, and benefit eligibility.",
  capabilities: [
    { title: "Partner catalogue browsing",  description: "Browse bundled streaming, music, storage, and insurance partners currently on offer" },
    { title: "Add-on activation",           description: "Activate a partner subscription with single-sign-on handoff to the partner platform" },
    { title: "Billing clarity",              description: "Explain whether the partner charge appears on the telco invoice or is billed directly by the partner" },
    { title: "Cancel / change partner add-on",description: "Remove or change a bundled partner subscription with proration rules" },
  ],
  quickActions: ["Browse partner offers", "Activate add-on", "Who bills me?", "Cancel add-on"],
  flow: {
    knowledgeSources: [
      { id: "tc-pa-kb-partner-api",name: "Partner Activation API", type: "api",      icon: "computer-api",       description: "Activation and deactivation API across the partner ecosystem with SSO token passing" },
      { id: "tc-pa-kb-catalog",    name: "Partner Catalogue",      type: "document", icon: "hierarchy-document", description: "Current partner catalogue — eligibility, price, inclusions, billing path" },
    ],
    guardrails: [
      { id: "tc-pa-gr-consent",    name: "Billing Consent",        type: "guardrail",icon: "shield-medal",      description: "Explicit consent captured before any partner charge is activated on the account" },
    ],
    actionHooks: [
      { id: "tc-pa-ah-activate",   name: "Activate Partner",       type: "api",      icon: "finger-tap",         description: "Activates the partner subscription with SSO handoff so the customer lands signed-in" },
    ],
    processes: [
      { id: "tc-pa-pr-verify",     name: "Account Verification",   type: "verification",icon: "check-symbol-check",description: "Light strong-auth before activating a paid partner add-on" },
    ],
    standardResponses: [
      { id: "tc-pa-sr-activated",  name: "Partner Activated",      type: "standard",icon: "thumbs-up",           description: "Confirms partner activation with direct link to the partner platform and first-charge date" },
    ],
  },
  variants: ["telco:mobile", "telco:broadband"],
  tier: "addon",
};

export default agent;
