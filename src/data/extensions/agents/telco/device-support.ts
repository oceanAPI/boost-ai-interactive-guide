import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "tc_device_support",
  name: "Device Support",
  icon: "mobile",
  automationRate: 80,
  avgResolutionTime: "~3 min",
  topTopic: "Device not working",
  description:
    "Hardware-centric troubleshooting for handsets, routers, and set-top-boxes. Covers diagnostics, warranty / repair, device-insurance claims, factory-reset, and APN / device-config help. SIM-level journeys live in the SIM & eSIM agent.",
  capabilities: [
    { title: "Guided troubleshooting",       description: "Step-by-step diagnostics for handset, router, and TV box issues" },
    { title: "Warranty & repair lookup",     description: "Check warranty state, book a repair, or offer trade-in and replacement" },
    { title: "Device-insurance claim start",  description: "Initiate a device-insurance claim for damage, loss, or theft with evidence collection" },
    { title: "Factory-reset walkthroughs",   description: "Model-specific reset guides that preserve data where possible" },
    { title: "APN & configuration help",     description: "Resolve data / MMS / voicemail settings issues per handset model" },
    { title: "Trade-in & upgrade path",      description: "Quote trade-in value and bridge to the upgrade journey when a device is end-of-life" },
  ],
  quickActions: ["Troubleshoot", "Warranty", "Insurance claim", "Factory reset", "APN settings", "Trade-in"],
  flow: {
    knowledgeSources: [
      { id: "tc-ds-kb-diag",     name: "Device Diagnostic Tree",  type: "document", icon: "hierarchy",          description: "Structured diagnostic decision-tree per device family" },
      { id: "tc-ds-kb-models",   name: "Model Reference",         type: "document", icon: "hierarchy-document", description: "Model-specific support articles for each handset / router / STB currently in the wild" },
      { id: "tc-ds-kb-warr-api", name: "Warranty & Repair API",   type: "api",      icon: "computer-api",       description: "Live warranty-state lookup and repair-booking system" },
    ],
    guardrails: [
      { id: "tc-ds-gr-no-bypass",name: "No Security Bypass",      type: "guardrail", icon: "shield-medal",      description: "Refuses to provide instructions that bypass device security (iCloud lock, SIM lock)" },
      { id: "tc-ds-gr-pii",      name: "PII Protection",          type: "pii",       icon: "lock-security",     description: "IMEI and account data handled only on authenticated accounts" },
    ],
    actionHooks: [
      { id: "tc-ds-ah-book-repair",name: "Book Repair",           type: "api",       icon: "calendar-day",      description: "Books a repair slot at the customer's nearest authorised repair centre" },
      { id: "tc-ds-ah-file-claim", name: "File Insurance Claim",   type: "form",      icon: "finger-tap",        description: "Opens a structured device-insurance claim with evidence capture" },
    ],
    processes: [
      { id: "tc-ds-pr-verify",   name: "Identity Verification",    type: "verification", icon: "check-symbol-check", description: "Strong-auth before device-linked actions such as warranty-override or IMEI change" },
      { id: "tc-ds-pr-escalate", name: "Escalate to Tech Specialist",type: "transfer",  icon: "headset",           description: "Hand-off to technical support when diagnostics fail" },
    ],
    standardResponses: [
      { id: "tc-ds-sr-booked",   name: "Repair Booked",           type: "standard",  icon: "thumbs-up",         description: "Confirms the repair slot with location, ETA, and what to bring" },
      { id: "tc-ds-sr-fallback", name: "Escalate Needed",         type: "fallback",  icon: "route",             description: "Graceful fallback when automation can't resolve the device issue" },
    ],
  },
  variants: ["telco:mobile", "telco:broadband"],
  tier: "primary",
};

export default agent;
