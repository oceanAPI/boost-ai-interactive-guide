import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "tc_channel_packages",
  name: "TV Channel Packages",
  icon: "video-player",
  automationRate: 78,
  avgResolutionTime: "~2 min",
  topTopic: "Add a channel",
  description:
    "Manages entertainment-bundle and TV-channel subscriptions attached to a broadband product. Handles add / remove / preview.",
  capabilities: [
    { title: "Channel & bundle catalogue", description: "Browse available channel packs and streaming bundles" },
    { title: "Add / remove channel packs", description: "Attach or remove packs with clear pro-ration" },
  ],
  quickActions: ["Browse channels", "Add pack", "Remove pack"],
  flow: {
    knowledgeSources: [
      { id: "tc-cp-kb-catalog", name: "Content Catalogue", type: "api", icon: "computer-api", description: "Current TV and streaming catalogue, with licensing constraints" },
    ],
    guardrails: [
      { id: "tc-cp-gr-parental", name: "Parental Control Awareness", type: "guardrail", icon: "shield-medal", description: "Respects parental-control flags on the account when offering adult or premium channels" },
    ],
    actionHooks: [
      { id: "tc-cp-ah-change", name: "Change Bundle", type: "api", icon: "refresh-idea", description: "Applies the selected bundle change to the subscription" },
    ],
    processes: [
      { id: "tc-cp-pr-verify", name: "Account Ownership Check", type: "verification", icon: "check-symbol-check", description: "Light strong-auth before applying a paid change" },
    ],
    standardResponses: [
      { id: "tc-cp-sr-confirm", name: "Bundle Updated", type: "standard", icon: "thumbs-up", description: "Confirms successful bundle change" },
    ],
  },
  variants: ["telco:broadband"],
  tier: "light",
};

export default agent;
