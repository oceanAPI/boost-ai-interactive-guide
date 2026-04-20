import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "security_hub_peripherals",
  name: "Hub & peripherals",
  icon: "cogs",
  automationRate: 72,
  avgResolutionTime: "~2 min",
  topTopic: "Siren test",
  description: "Central unit, voice unit, outdoor siren and smart plugs. Firmware updates, voice-unit volume, siren test, smart-plug scheduling, pairing extra devices.",
  capabilities: [
    { title: "Central-unit diagnostics", description: "Hub LED decoding, factory-reset avoidance, re-registration flow" },
    { title: "Voice-unit volume & prompts", description: "Change voice-unit volume, language and silent-arm behaviour" },
    { title: "Siren test", description: "Schedule and run a supervised outdoor siren test without alerting the monitoring centre" },
    { title: "Smart-plug rules", description: "Set schedules and event-triggered rules (e.g. lights on when away-mode triggers)" },
    { title: "Pair new peripheral", description: "Add a new supported device to the hub with minimal fuss" },
  ],
  quickActions: ["Test the outdoor siren", "Turn voice volume down", "Schedule a light", "Pair a smart plug", "Hub LED is red"],
  flow: {
    knowledgeSources: [
      { id: "sec-hp-kb-hub", name: "Hub spec library", type: "document", icon: "books", description: "LED patterns, firmware versions and supported peripheral list per hub generation" },
      { id: "sec-hp-kb-state", name: "Device state", type: "api", icon: "database-connection", description: "Paired peripherals with firmware, battery, signal for this site" },
    ],
    guardrails: [
      { id: "sec-hp-gr-monitoring", name: "Monitoring-mute notice", type: "policy", icon: "shield-medal", description: "Sirentest flow explicitly mutes monitoring for the test window and re-enables after" },
      { id: "sec-hp-gr-auth", name: "Auth required", type: "auth", icon: "lock-security", description: "Firmware updates and pairing require authenticated owner access" },
    ],
    actionHooks: [
      { id: "sec-hp-ah-siren-test", name: "Run siren test", type: "webhook", icon: "target-selection", description: "Runs a supervised siren test with monitoring muted for the window" },
      { id: "sec-hp-ah-firmware", name: "Schedule firmware update", type: "webhook", icon: "refresh-idea", description: "Queues the next firmware update for the hub or a peripheral" },
    ],
    processes: [
      { id: "sec-hp-pr-pair", name: "Pairing flow", type: "workflow", icon: "hierarchy", description: "Guided pairing for each supported peripheral, with post-pair smoke test" },
    ],
    standardResponses: [
      { id: "sec-hp-sr-tested", name: "Siren test complete", type: "confirmation", icon: "check-symbol-check", description: "Confirms the siren was heard and monitoring is back live" },
      { id: "sec-hp-sr-paired", name: "Device paired", type: "confirmation", icon: "check-symbol-check", description: "Confirms the new peripheral is on the system and reporting healthy" },
    ],
  },
};

export default agent;
