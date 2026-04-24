import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "tc_plan_subscription",
  name: "Plan & Subscription",
  icon: "refresh-idea",
  automationRate: 84,
  avgResolutionTime: "~2 min",
  topTopic: "Change my plan",
  description:
    "End-to-end plan lifecycle: compare plans, upgrade, downgrade, add or remove data bundles, and handle renewal choices. Retention-aware — the agent looks for cancel-signals and offers personalised alternatives.",
  capabilities: [
    { title: "Plan comparison",          description: "Compare the customer's current plan against alternatives the customer qualifies for" },
    { title: "Upgrade path",             description: "Offer and confirm plan upgrades with clear pricing and proration" },
    { title: "Downgrade path with retention", description: "Handle downgrades while presenting retention offers tailored to the reason for change" },
    { title: "Bundle & add-on management", description: "Attach or remove data packs, international-call packs, roaming packs, streaming bundles" },
    { title: "Renewal decision support",  description: "Walk customers through end-of-contract choices with clear timeline visibility" },
    { title: "Cancellation with save-offer", description: "Handle cancel requests with a guardrailed save-offer path before terminating service" },
  ],
  quickActions: ["Compare plans", "Upgrade", "Downgrade", "Add a pack", "Renewal options", "Cancel"],
  flow: {
    knowledgeSources: [
      { id: "tc-ps-kb-catalog",     name: "Plan Catalogue",        type: "api",      icon: "computer-api",       description: "Live catalogue of all active plans, bundles, and eligibility criteria" },
      { id: "tc-ps-kb-account",     name: "Customer Account API",  type: "api",      icon: "computer-api",       description: "Current subscription state, contract dates, and usage history used to tailor offers" },
      { id: "tc-ps-kb-ret-playbook",name: "Retention Playbook",    type: "document", icon: "hierarchy-document", description: "Approved retention offers by customer segment and cancel-reason" },
    ],
    guardrails: [
      { id: "tc-ps-gr-offer-limits", name: "Save-Offer Authority Cap", type: "guardrail", icon: "shield-medal", description: "Limits automated save-offers to the policy-defined value ceiling per segment" },
      { id: "tc-ps-gr-pii",          name: "PII Protection",           type: "pii",       icon: "lock-security",description: "Ensures customer data stays scoped to the authenticated account" },
    ],
    actionHooks: [
      { id: "tc-ps-ah-change-plan", name: "Change Plan",           type: "api",    icon: "refresh-idea",    description: "Posts the plan-change request to the billing/provisioning platform with effective date" },
      { id: "tc-ps-ah-add-bundle",  name: "Attach Bundle",          type: "api",    icon: "hand-to-hand",     description: "Adds a selected bundle or add-on to the subscription with confirmation" },
    ],
    processes: [
      { id: "tc-ps-pr-cancel-save", name: "Cancellation Save Flow",type: "workflow",icon: "heart",           description: "Multi-step retention flow that presents alternatives before finalising a cancellation" },
      { id: "tc-ps-pr-verify",      name: "Identity Verification", type: "verification",icon: "check-symbol-check",description: "Strong-auth before any subscription change takes effect" },
    ],
    standardResponses: [
      { id: "tc-ps-sr-confirm",     name: "Plan Change Confirmed", type: "standard",icon: "thumbs-up",        description: "Confirms the plan change with new-plan details and effective date" },
      { id: "tc-ps-sr-fallback",    name: "Agent Review Needed",   type: "fallback",icon: "headset",         description: "Graceful fallback when the change requires human review (e.g. contract still within minimum term)" },
    ],
  },
  variants: ["telco:mobile", "telco:broadband"],
  tier: "primary",
};

export default agent;
