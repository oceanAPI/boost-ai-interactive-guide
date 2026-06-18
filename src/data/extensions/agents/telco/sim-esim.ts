import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "tc_sim_esim",
  name: "SIM & eSIM",
  icon: "mobile",
  automationRate: 89,
  avgResolutionTime: "~2 min",
  topTopic: "Activate my SIM",
  description:
    "Full SIM lifecycle — physical SIM activation, eSIM provisioning, SIM swap to a new device, PUK recovery, and lost-or-stolen SIM suspension. The fastest self-serve surface for a lot of day-one subscriber journeys.",
  capabilities: [
    { title: "Physical SIM activation",      description: "Activate a newly-issued physical SIM with automatic line provisioning" },
    { title: "eSIM provisioning",            description: "Deliver the eSIM profile via QR / direct-push and guide install on iPhone and Android" },
    { title: "SIM swap to new device",        description: "Move a subscription cleanly from one SIM to another (e.g. after a device upgrade)" },
    { title: "PUK / PIN recovery",            description: "Return a masked PUK to the authenticated subscriber and walk them through unlock" },
    { title: "Lost / stolen SIM suspension", description: "Immediate suspension of a lost or stolen SIM plus expedited replacement order" },
    { title: "Dual-SIM / family-line setup",  description: "Configure a secondary eSIM profile (travel SIM, watch, secondary line) on an existing device" },
  ],
  quickActions: ["Activate SIM", "Get eSIM", "SIM swap", "I need my PUK", "Suspend lost SIM", "Add second line"],
  flow: {
    knowledgeSources: [
      { id: "tc-se-kb-prov-api",    name: "SIM Provisioning API",    type: "api",      icon: "computer-api",       description: "Live SIM provisioning platform covering physical SIM, eSIM, and SIM-swap operations" },
      { id: "tc-se-kb-esim-models", name: "eSIM Device Catalogue",    type: "document", icon: "hierarchy-document", description: "Per-device eSIM support status — iPhone, Samsung, Pixel, watches, iPads, routers" },
      { id: "tc-se-kb-faq",         name: "SIM & eSIM FAQ",           type: "faq",      icon: "books",              description: "Top troubleshooting articles — signal not coming up, iMessage delays, eSIM stuck in activation" },
    ],
    guardrails: [
      { id: "tc-se-gr-fraud-swap",  name: "SIM-Swap Fraud Check",    type: "guardrail",icon: "shield-medal",      description: "Hardened identity + cooling-off signals to prevent SIM-swap account-takeover attacks" },
      { id: "tc-se-gr-pii",         name: "PII & ICCID Protection",  type: "pii",      icon: "lock-security",     description: "Full ICCID, IMEI, and PUK never echoed in chat; masked display + secure channel delivery" },
    ],
    actionHooks: [
      { id: "tc-se-ah-activate",    name: "Activate SIM / eSIM",     type: "api",      icon: "finger-tap",         description: "Posts the activation and returns a live-service time plus verification handshake" },
      { id: "tc-se-ah-suspend",     name: "Suspend Lost SIM",         type: "api",      icon: "lock",              description: "Immediate suspension of the compromised SIM, triggers replacement order flow" },
    ],
    processes: [
      { id: "tc-se-pr-strong-auth", name: "Hardened Strong-auth",    type: "verification",icon: "check-symbol-check",description: "Elevated authentication for SIM-swap and PUK — multi-factor, device binding, out-of-band confirm" },
      { id: "tc-se-pr-delivery",    name: "Replacement Delivery",    type: "workflow", icon: "route",              description: "Dispatches a replacement physical SIM to the verified address with tracking" },
    ],
    standardResponses: [
      { id: "tc-se-sr-activated",   name: "SIM Activated",            type: "standard",icon: "thumbs-up",           description: "Confirms activation with expected service-live time and first-call test steps" },
      { id: "tc-se-sr-fallback",    name: "Retail / Specialist Help", type: "fallback",icon: "headset",            description: "Fallback routing when a physical interaction or specialist is required" },
    ],
  },
  variants: ["telco:mobile"],
  tier: "primary",
};

export default agent;
