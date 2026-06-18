import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "al_lost_found",
  name: "Lost & Found",
  icon: "search",
  automationRate: 82,
  avgResolutionTime: "~2 min",
  topTopic: "I left something on the plane",
  description:
    "Items lost on the aircraft or in airport areas — file a lost-and-found report, track an open report, and receive return-shipping options when the item is found.",
  capabilities: [
    { title: "File lost-item report",   description: "Submit a structured lost-and-found report with flight, item description, and return contact" },
    { title: "Report status lookup",     description: "Show the live status of an open report and any matches" },
  ],
  quickActions: ["File lost-item report", "Check report status"],
  flow: {
    knowledgeSources: [
      { id: "al-lf-kb-lf",     name: "Lost-and-found Platform",type: "api",icon: "computer-api",description: "Live lost-and-found platform for filing, matching, and return-logistics" },
    ],
    guardrails: [
      { id: "al-lf-gr-pii",    name: "PII Protection",         type: "pii",icon: "lock-security",description: "Contact data scoped to the open report; no cross-report sharing" },
    ],
    actionHooks: [
      { id: "al-lf-ah-file",   name: "File Report",            type: "form",icon: "finger-tap",description: "Files the structured report and returns a reference number for tracking" },
    ],
    processes: [
      { id: "al-lf-pr-verify", name: "Identity Verification",  type: "verification",icon: "check-symbol-check",description: "Light identity verification to file or look up a report" },
    ],
    standardResponses: [
      { id: "al-lf-sr-filed",  name: "Report Filed",           type: "standard",icon: "thumbs-up",description: "Confirms the report is filed with reference number and expected match-window" },
    ],
  },
  tier: "light",
};

export default agent;
