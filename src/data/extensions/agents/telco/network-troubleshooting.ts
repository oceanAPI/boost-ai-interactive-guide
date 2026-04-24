import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "tc_network_troubleshooting",
  name: "Network Troubleshooting",
  icon: "desktop-network",
  automationRate: 76,
  avgResolutionTime: "~3.5 min",
  topTopic: "No signal / slow internet",
  description:
    "Resolves connectivity complaints — coverage checks, outage lookups, speed tests, router reboot guidance, and line faults. Proactively surfaces known outages affecting the customer's location.",
  capabilities: [
    { title: "Outage check",               description: "Proactively notify the customer if a known outage affects their address or cell site" },
    { title: "Coverage lookup",            description: "Show real-time coverage quality at a specific address or cell-ID" },
    { title: "Speed-test guidance",         description: "Walk customer through running a controlled speed test and interpreting results" },
    { title: "Router reboot & reconfigure", description: "Guide router power-cycle and factory-reset steps with line-sync feedback" },
    { title: "Fault reporting & ticket creation",description: "Create a trouble ticket with pre-populated diagnostics" },
    { title: "Scheduled-works notifier",    description: "Surface upcoming planned maintenance affecting the customer's service" },
  ],
  quickActions: ["Outage check", "Coverage at address", "Speed test", "Reboot router", "Report fault", "Planned works"],
  flow: {
    knowledgeSources: [
      { id: "tc-nt-kb-outage",    name: "Outage Status API",       type: "api",      icon: "computer-api",       description: "Live feed of active outages and maintenance windows by geography" },
      { id: "tc-nt-kb-coverage",  name: "Coverage Map Service",    type: "api",      icon: "globe",              description: "Coverage quality service returning expected signal at any address" },
      { id: "tc-nt-kb-diag-tree", name: "Network Diagnostic Tree", type: "document", icon: "hierarchy",          description: "Structured fault-diagnosis steps for mobile, fibre, and DSL services" },
    ],
    guardrails: [
      { id: "tc-nt-gr-privacy",  name: "Location Privacy",        type: "guardrail",icon: "shield-medal", description: "Address and geo-data used only within the troubleshooting context, not persisted" },
    ],
    actionHooks: [
      { id: "tc-nt-ah-ticket",   name: "Create Fault Ticket",     type: "api",      icon: "finger-tap",       description: "Opens a trouble-ticket with pre-populated diagnostic data and customer context" },
      { id: "tc-nt-ah-reboot",   name: "Remote Router Reboot",    type: "api",      icon: "refresh-idea",     description: "Issues a remote reboot command to the customer's managed router" },
    ],
    processes: [
      { id: "tc-nt-pr-verify-service",name: "Verify Service at Address",type: "workflow",icon: "check-symbol-check",description: "Confirms which services are active at the customer's address before running diagnostics" },
      { id: "tc-nt-pr-escalate", name: "Escalate to NOC",          type: "transfer", icon: "headset",           description: "Hands off persistent faults to the Network Operations Centre" },
    ],
    standardResponses: [
      { id: "tc-nt-sr-outage-ack",name: "Known Outage Acknowledged", type: "standard",icon: "thumbs-up",      description: "Confirms a known outage, gives expected time-to-restore, offers proactive notification" },
      { id: "tc-nt-sr-fallback", name: "NOC Escalation",           type: "fallback", icon: "route",            description: "Graceful fallback when self-serve diagnostics can't resolve the fault" },
    ],
  },
  variants: ["telco:mobile", "telco:broadband"],
  tier: "primary",
};

export default agent;
