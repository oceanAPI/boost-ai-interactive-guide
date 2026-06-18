import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "tc_data_usage",
  name: "Data Usage & Caps",
  icon: "bar-chart",
  automationRate: 87,
  avgResolutionTime: "~1.5 min",
  topTopic: "How much data have I used?",
  description:
    "Transparency and control over data consumption — usage dashboards, spending caps, EU out-of-bundle cap (€50), and alert preferences.",
  capabilities: [
    { title: "Usage dashboard lookup",   description: "Show real-time data / minutes / SMS usage against included inclusions" },
    { title: "Spending-cap management",  description: "Set or change the monthly out-of-bundle spending cap to avoid bill-shock" },
  ],
  quickActions: ["How much have I used?", "Set spending cap", "Alert me at…"],
  flow: {
    knowledgeSources: [
      { id: "tc-du-kb-usage-api", name: "Usage Platform API", type: "api", icon: "computer-api", description: "Live usage platform for real-time consumption data" },
    ],
    guardrails: [
      { id: "tc-du-gr-bill-shock", name: "Bill-shock Prevention",type: "guardrail",icon: "shield-medal",description: "Never raises a cap without showing the potential cost risk first" },
    ],
    actionHooks: [
      { id: "tc-du-ah-set-cap",   name: "Set Cap",            type: "api", icon: "refresh-idea",description: "Applies the new spending cap to the subscription" },
    ],
    processes: [
      { id: "tc-du-pr-verify",    name: "Account Verification",type: "verification",icon: "check-symbol-check",description: "Light strong-auth before cap change" },
    ],
    standardResponses: [
      { id: "tc-du-sr-confirm",   name: "Cap Updated",         type: "standard",icon: "thumbs-up",description: "Confirms the new cap is in force with the effective date" },
    ],
  },
  variants: ["telco:mobile", "telco:broadband"],
  tier: "light",
};

export default agent;
