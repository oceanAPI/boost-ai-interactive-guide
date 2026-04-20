import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "security_access_control",
  name: "Access control",
  icon: "lock-security",
  automationRate: 80,
  avgResolutionTime: "~2 min",
  topTopic: "Lost keytag",
  description: "Keypads, keytags, remote controls and Yale Doorman smart-locks. Lost-tag deactivation, PIN changes, door-lock pairing, firmware updates and physical-key backup guidance.",
  capabilities: [
    { title: "Lost keytag / fob", description: "Deactivate the missing credential immediately and order a replacement" },
    { title: "Keypad PIN management", description: "Change the master PIN or revoke user PINs with audit trail" },
    { title: "Yale Doorman pairing", description: "Pair, unpair and reset Yale Doorman locks and troubleshoot handshake failures" },
    { title: "Battery & signal health", description: "Report and fix low-battery / low-signal states on keypads and locks" },
    { title: "Remote-control replacement", description: "Order and provision a replacement remote without a site visit where possible" },
  ],
  quickActions: ["I lost my keytag", "Change keypad PIN", "Pair a Yale Doorman", "My remote doesn't work", "Order a spare fob"],
  variants: ["security:residential", "security:commercial", "security:hybrid"],
  flow: {
    knowledgeSources: [
      { id: "sec-ac-kb-devices", name: "Access-device catalogue", type: "document", icon: "books", description: "Keypad, keytag, remote and Yale Doorman models with pairing + reset steps" },
      { id: "sec-ac-kb-credentials", name: "Credential registry", type: "api", icon: "database-connection", description: "Active keytags, fobs, PIN users and locks linked to this subscription" },
    ],
    guardrails: [
      { id: "sec-ac-gr-auth", name: "Step-up auth", type: "auth", icon: "lock-security", description: "Deactivating credentials or changing locks requires a verified login, not email alone" },
      { id: "sec-ac-gr-safety", name: "Physical-backup reminder", type: "policy", icon: "shield-medal", description: "Always remind the customer of physical-key backup before remote-unlocking a door" },
    ],
    actionHooks: [
      { id: "sec-ac-ah-deactivate", name: "Deactivate credential", type: "webhook", icon: "close-symbol", description: "Instantly revokes a keytag, fob or PIN from the site" },
      { id: "sec-ac-ah-order", name: "Order replacement", type: "webhook", icon: "hand-to-hand", description: "Orders a keytag / fob / remote with delivery tracking" },
    ],
    processes: [
      { id: "sec-ac-pr-pairing", name: "Yale Doorman pairing", type: "workflow", icon: "hierarchy", description: "Guided pairing flow including master-code setup and test lock-cycle" },
    ],
    standardResponses: [
      { id: "sec-ac-sr-deactivated", name: "Credential deactivated", type: "confirmation", icon: "check-symbol-check", description: "Confirms the lost tag is off the system with the timestamp" },
      { id: "sec-ac-sr-ordered", name: "Replacement on the way", type: "confirmation", icon: "check-symbol-check", description: "Shares order number and expected delivery" },
    ],
  },
};

export default agent;
