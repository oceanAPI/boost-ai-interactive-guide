import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "wm_general",
  name: "General inquiries",
  icon: "speech",
  automationRate: 80,
  avgResolutionTime: "~1.5 min",
  topTopic: "Where are my statements?",
  description: "Firm info, desk operating hours, fee inquiries, complaint handling, and client feedback across every wealth-management service line.",
  capabilities: [
    { title: "Firm FAQ", description: "Answer common questions about services, desks, custody arrangements, and regulatory regime" },
    { title: "Desk hours & contact", description: "Global desk opening hours, trading windows, out-of-hours emergency contact" },
    { title: "Regulated complaints", description: "Log and route FCA / SEC / FINRA complaints to the internal resolutions team with acknowledgement SLAs" },
    { title: "Fee & charge inquiries", description: "Explain mandate fees, performance fees, custody charges, and transaction costs with full disclosure" },
    { title: "Research & publications", description: "Route requests for house-view research, thought leadership, and quarterly market commentary" },
    { title: "Feedback collection", description: "Capture client feedback on service, advisor, or product and route to the appropriate desk head" },
  ],
  quickActions: ["Firm FAQ", "Desk hours", "File complaint", "Fee breakdown", "Request research", "Give feedback"],
  flow: {
    knowledgeSources: [
      { id: "wg-kb-general-faq", name: "Firm FAQ", type: "faq", icon: "books", description: "Firm-wide FAQ covering services, desks, custody, and regulatory regime" },
      { id: "wg-kb-fee-schedule", name: "Fee Schedule", type: "document", icon: "hierarchy-document", description: "Current fee schedule across mandates, performance fees, and custody" },
      { id: "wg-kb-research-library", name: "Research Library", type: "database", icon: "database-connection", description: "House-view research, market commentary, and client publications" },
    ],
    guardrails: [
      { id: "wg-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents inaccurate information about fees, services, or regulatory regime" },
      { id: "wg-gr-tone", name: "Discretion & Tone", type: "tone", icon: "heart", description: "Ensures discreet, private-client-appropriate tone for sensitive inquiries" },
    ],
    actionHooks: [
      { id: "wg-ah-transfer-desk", name: "Transfer to Desk", type: "transfer", icon: "headset", description: "Transfers to the appropriate desk (advisory, trading, tax, custody) for unresolved inquiries" },
      { id: "wg-ah-log-complaint", name: "Log Complaint", type: "webhook", icon: "target-selection", description: "Creates a formal regulated-complaint record with acknowledgement letter" },
      { id: "wg-ah-send-research", name: "Send Research", type: "email", icon: "phone", description: "Delivers requested research publication via the client's preferred channel" },
    ],
    processes: [
      { id: "wg-pr-complaint-intake", name: "Complaint Intake", type: "workflow", icon: "hierarchy", description: "Captures regulated complaint with category, severity, and SLA clock start" },
      { id: "wg-pr-fee-lookup", name: "Fee Lookup", type: "workflow", icon: "cogs", description: "Looks up the client's fee schedule and explains total costs in plain language" },
    ],
    standardResponses: [
      { id: "wg-sr-fees", name: "Fee Explanation", type: "informational", icon: "thumbs-up", description: "Returns a plain-language fee breakdown with total annual cost" },
      { id: "wg-sr-complaint-logged", name: "Complaint Logged", type: "confirmation", icon: "check-symbol-check", description: "Confirms complaint has been recorded with reference and expected response time" },
    ],
  },
  tier: "primary",
};

export default agent;
