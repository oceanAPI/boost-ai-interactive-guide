import type { SpecialistAgent } from "../_types";

/**
 * "My pages" / "Mina sidor" self-service agent. Handles the authenticated
 * account experience — identity, login help, profile, preferences, digital-mail.
 * Deflects a huge volume of low-complexity account calls away from human agents.
 */
const agent: SpecialistAgent = {
  key: "account_my_pages",
  name: "Account & My Pages",
  icon: "agent-icon",
  automationRate: 89,
  avgResolutionTime: "~1 min",
  topTopic: "I can't log in",
  description: "Login & BankID help, profile updates, address & contact changes, communication preferences, digital-mail enrolment.",
  capabilities: [
    { title: "Login & BankID help", description: "Diagnoses failed logins, expired BankID, locked accounts with self-serve recovery" },
    { title: "Profile & contact updates", description: "Changes address, phone, email directly with identity verification" },
    { title: "Communication preferences", description: "Opts customer in/out of SMS, email, push, and printed mail per product" },
    { title: "Digital-mail (Kivra) setup", description: "Enrols customer into digital inbox delivery for all policy correspondence" },
    { title: "Household & beneficiary links", description: "Links partners, children, vehicles and properties to the household record" },
    { title: "Paperless enrolment", description: "Switches customers from postal mail to digital channels in one turn" },
  ],
  quickActions: ["I can't log in", "Change address", "Update phone number", "Paperless mail", "Kivra setup", "Link family"],
  flow: {
    knowledgeSources: [
      { id: "iam-kb-account-faq", name: "Account FAQ", type: "faq", icon: "books", description: "Login, identity, profile and preference questions" },
      { id: "iam-kb-crm-api", name: "CRM Profile API", type: "api", icon: "computer-api", description: "Reads and writes customer profile, contact details, preferences" },
      { id: "iam-kb-bankid", name: "BankID Status", type: "api", icon: "computer-api", description: "Checks BankID issuance, expiry, and last-success state" },
    ],
    guardrails: [
      { id: "iam-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents invented profile data or incorrect login instructions" },
      { id: "iam-gr-identity", name: "Strong Identity Verification", type: "compliance", icon: "lock-security", description: "Requires BankID before revealing or changing profile data" },
      { id: "iam-gr-gdpr", name: "GDPR Data Guard", type: "compliance", icon: "lock-security", description: "Ensures data-subject rights (access, rectification, deletion) are followed" },
    ],
    actionHooks: [
      { id: "iam-ah-reset-bankid", name: "Trigger BankID Re-enrol", type: "webhook", icon: "target-selection", description: "Starts BankID re-issuance flow with the bank" },
      { id: "iam-ah-update-profile", name: "Update Profile", type: "webhook", icon: "cogs", description: "Writes verified profile changes to CRM" },
      { id: "iam-ah-transfer", name: "Transfer to Support", type: "transfer", icon: "headset", description: "Escalates locked-account or identity cases to human support" },
    ],
    processes: [
      { id: "iam-pr-address-change", name: "Address Change", type: "workflow", icon: "hierarchy", description: "Validates new address and propagates to all linked policies" },
      { id: "iam-pr-paperless", name: "Paperless Enrolment", type: "workflow", icon: "cogs", description: "Switches delivery preferences across all active products" },
    ],
    standardResponses: [
      { id: "iam-sr-profile-updated", name: "Profile Updated", type: "confirmation", icon: "thumbs-up", description: "Confirms the update with effective date and what changed" },
      { id: "iam-sr-verify-bankid", name: "Verify with BankID", type: "request", icon: "route", description: "Asks the customer to authenticate with BankID before proceeding" },
    ],
  },
};

export default agent;
