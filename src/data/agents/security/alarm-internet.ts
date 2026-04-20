import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "security_alarm_internet",
  name: "Alarm & internet",
  icon: "cloud-network-3671763",
  automationRate: 78,
  avgResolutionTime: "~2 min",
  topTopic: "System offline",
  description: "Alarm goes offline, loses cloud connection or switches to cellular backup. Covers Wi-Fi setup, router changes, cellular failover explanations and reconnect flows.",
  capabilities: [
    { title: "Offline diagnosis", description: "Walk the customer through checking router, cable, cellular signal and hub LEDs" },
    { title: "Wi-Fi reconfiguration", description: "Move the hub to a new SSID or password without a factory reset" },
    { title: "Cellular failover explainer", description: "Explain what the cellular backup covers, usage limits and how to test it" },
    { title: "Router-change support", description: "Guided reconnect after a fibre / provider swap" },
    { title: "Latency & missed-event triage", description: "Diagnose why recent events arrived late or not at all" },
  ],
  quickActions: ["My alarm is offline", "Change Wi-Fi password", "Is cellular backup active?", "Router was replaced", "Why did the event not arrive?"],
  flow: {
    knowledgeSources: [
      { id: "sec-ai-kb-network", name: "Connectivity playbook", type: "document", icon: "hierarchy-document", description: "Expected LED patterns, cellular behaviour and reconnect scripts per hub model" },
      { id: "sec-ai-kb-status", name: "Hub connectivity state", type: "api", icon: "database-connection", description: "Live uplink state, last-seen timestamp and failover mode" },
    ],
    guardrails: [
      { id: "sec-ai-gr-auth", name: "Auth required", type: "auth", icon: "lock-security", description: "Network changes require authenticated account access" },
      { id: "sec-ai-gr-scope", name: "Scope boundary", type: "policy", icon: "shield-medal", description: "Does not troubleshoot the customer's router beyond Wi-Fi credentials; escalates to ISP" },
    ],
    actionHooks: [
      { id: "sec-ai-ah-reboot", name: "Reboot hub", type: "webhook", icon: "refresh-idea", description: "Sends a remote reboot command to the hub and reads the recovery state" },
      { id: "sec-ai-ah-cellular-test", name: "Cellular heartbeat", type: "webhook", icon: "target-selection", description: "Forces a cellular heartbeat test and returns signal quality" },
    ],
    processes: [
      { id: "sec-ai-pr-reconnect", name: "Wi-Fi reconnect", type: "workflow", icon: "hierarchy", description: "Step-by-step reconnect flow tailored to hub firmware + router type" },
    ],
    standardResponses: [
      { id: "sec-ai-sr-online", name: "Back online", type: "confirmation", icon: "check-symbol-check", description: "Confirms the hub is reporting normal uplink again" },
      { id: "sec-ai-sr-failover", name: "On cellular backup", type: "informational", icon: "cloud-network-3671763", description: "Explains the alarm is protected on cellular while the home link is down" },
    ],
  },
};

export default agent;
