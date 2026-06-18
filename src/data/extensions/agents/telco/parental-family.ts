import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "tc_parental_family",
  name: "Parental & Family Controls",
  icon: "users",
  automationRate: 82,
  avgResolutionTime: "~2 min",
  topTopic: "Manage my child's line",
  description:
    "Family-plan admin — child-line management, content filtering, time-of-day limits, and shared-data allocation across household members.",
  capabilities: [
    { title: "Child-line management",     description: "Add or modify a child's subscription within the family plan, with age-appropriate defaults" },
    { title: "Content filtering & limits", description: "Apply content filters, screen-time windows, and spending limits per line" },
  ],
  quickActions: ["Add child line", "Content filter", "Screen-time limits"],
  flow: {
    knowledgeSources: [
      { id: "tc-pf-kb-family-api",name: "Family Plan API",   type: "api", icon: "computer-api", description: "Family-plan admin API for child-line configuration and parental controls" },
    ],
    guardrails: [
      { id: "tc-pf-gr-age-rules", name: "Age-appropriate Defaults",type: "guardrail",icon: "shield-medal",description: "Child-line creation defaults to the most protective settings for the declared age band" },
    ],
    actionHooks: [
      { id: "tc-pf-ah-apply",     name: "Apply Controls",     type: "api", icon: "refresh-idea",description: "Applies the content / time / spend rules to the target line" },
    ],
    processes: [
      { id: "tc-pf-pr-verify-parent",name: "Parent Verification",type: "verification",icon: "check-symbol-check",description: "Verifies the caller is the account owner and has parental authority for the target line" },
    ],
    standardResponses: [
      { id: "tc-pf-sr-confirm",   name: "Controls Applied",   type: "standard",icon: "thumbs-up",description: "Confirms the controls are in force with a rollback path for the parent" },
    ],
  },
  variants: ["telco:mobile", "telco:broadband"],
  tier: "light",
};

export default agent;
