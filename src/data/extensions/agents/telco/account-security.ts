import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "tc_account_security",
  name: "Account & Security",
  icon: "lock-security",
  automationRate: 84,
  avgResolutionTime: "~2 min",
  topTopic: "Reset my password",
  description:
    "Owner-level account management — passwords, MitID binding, authorized users, consent records, address change, marketing preferences, and account-recovery after security events.",
  capabilities: [
    { title: "Password / PIN reset",          description: "Self-serve reset of portal password and mobile PIN via verified channels" },
    { title: "MitID / BankID re-binding",      description: "Re-bind the account to a new MitID or BankID identity after phone or ID change" },
    { title: "Authorized users management",   description: "Add, remove, and scope permissions for additional account users (partner, bookkeeper)" },
    { title: "Address & contact details",     description: "Update billing and service addresses, phone, email, and correspondence language" },
    { title: "Consent & marketing preferences",description: "View and change marketing consent, data-sharing opt-ins, and GDPR rights actions" },
    { title: "Account recovery after incident",description: "Restore account access after SIM-swap incident, password breach, or family takeover" },
  ],
  quickActions: ["Reset password", "Re-bind MitID", "Manage users", "Change address", "Marketing prefs", "Recover account"],
  flow: {
    knowledgeSources: [
      { id: "tc-as-kb-iam-api",   name: "Identity & Access API",     type: "api",      icon: "computer-api",       description: "Live connection to the identity platform for credentials, strong-auth, and permission changes" },
      { id: "tc-as-kb-consent",   name: "Consent Ledger",             type: "api",      icon: "computer-api",       description: "Authoritative consent records for marketing and data-sharing with audit history" },
      { id: "tc-as-kb-recovery",  name: "Account-recovery Playbook",  type: "document", icon: "hierarchy-document", description: "Playbook for recovering access after SIM-swap, lost ID, or account-takeover incidents" },
    ],
    guardrails: [
      { id: "tc-as-gr-no-self-promote",name: "No Permission Self-promotion",type: "guardrail",icon: "shield-medal",description: "Blocks any attempt to elevate the caller's own permissions without owner-level authorization" },
      { id: "tc-as-gr-pii",            name: "Heightened PII Protection",  type: "pii",      icon: "lock-security",description: "All identity data handled with elevated protection; masked display and zero transcript persistence" },
    ],
    actionHooks: [
      { id: "tc-as-ah-reset",     name: "Reset Credentials",          type: "api",      icon: "refresh-idea",       description: "Posts the credential reset through strong-auth with a masked delivery channel" },
      { id: "tc-as-ah-add-user",  name: "Add Authorized User",         type: "api",      icon: "user-plus",          description: "Adds a scoped authorized user with consent-captured permission model" },
    ],
    processes: [
      { id: "tc-as-pr-strong-auth",name: "Elevated Strong-auth",      type: "verification",icon: "check-symbol-check",description: "Multi-factor, device-bound authentication before any permission or identity change" },
      { id: "tc-as-pr-incident",   name: "Incident-response Handoff", type: "transfer", icon: "headset",            description: "Hand-off to the security incident desk for suspected fraud or account-takeover" },
    ],
    standardResponses: [
      { id: "tc-as-sr-confirm",    name: "Change Confirmed",           type: "standard",icon: "thumbs-up",           description: "Confirms the security / account change with audit-log reference and rollback path" },
      { id: "tc-as-sr-fallback",   name: "Specialist Review",          type: "fallback",icon: "route",               description: "Fallback when owner-level verification cannot be completed self-serve" },
    ],
  },
  variants: ["telco:mobile", "telco:broadband", "telco:b2b"],
  tier: "primary",
};

export default agent;
