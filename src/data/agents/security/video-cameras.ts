import type { SpecialistAgent } from "../_types";

const agent: SpecialistAgent = {
  key: "security_video_cameras",
  name: "Video & cameras",
  icon: "video-camera",
  automationRate: 76,
  avgResolutionTime: "~2 min",
  topTopic: "Can't see live view",
  description: "Indoor camera detectors and outdoor HD video cameras — live view, recording retention, night mode, motion zones, privacy shutter, cloud-clip retrieval.",
  capabilities: [
    { title: "Live-view troubleshooting", description: "Reconnect live streaming when it shows a spinner, buffering or failed state" },
    { title: "Motion zones & privacy masks", description: "Configure detection zones, privacy masks for neighbours and schedule-based recording" },
    { title: "Clip retrieval", description: "Retrieve, download and share a past event clip within the retention window" },
    { title: "Night-mode tuning", description: "Adjust IR / low-light behaviour and diagnose washed-out or glarey scenes" },
    { title: "Retention & GDPR", description: "Explain retention windows, legal-basis and how a customer can purge footage" },
  ],
  quickActions: ["Live view won't load", "Download a clip", "Set a privacy zone", "Night view is blurry", "How long is footage kept?"],
  variants: ["security:residential", "security:commercial", "security:hybrid"],
  flow: {
    knowledgeSources: [
      { id: "sec-vc-kb-cameras", name: "Camera model library", type: "document", icon: "books", description: "Feature matrix + setup steps for indoor and outdoor camera models" },
      { id: "sec-vc-kb-retention", name: "Retention & GDPR policy", type: "document", icon: "hierarchy-document", description: "Retention windows, legal-basis and customer purge rights per market" },
      { id: "sec-vc-kb-clip-api", name: "Clip service", type: "api", icon: "database-connection", description: "List and generate download links for the customer's recent clips" },
    ],
    guardrails: [
      { id: "sec-vc-gr-auth", name: "Owner-only clips", type: "auth", icon: "lock-security", description: "Clip downloads are restricted to the verified account owner" },
      { id: "sec-vc-gr-pii", name: "Face-redact reminder", type: "pii", icon: "hand-protection", description: "When sharing clips, remind the customer about third-party face-redaction obligations" },
    ],
    actionHooks: [
      { id: "sec-vc-ah-clip", name: "Generate clip link", type: "webhook", icon: "video-player", description: "Creates a signed, short-lived download link for a specified event clip" },
      { id: "sec-vc-ah-zones", name: "Apply motion zones", type: "webhook", icon: "design-setting", description: "Sets detection zones and privacy masks on the camera" },
    ],
    processes: [
      { id: "sec-vc-pr-live", name: "Live-view recovery", type: "workflow", icon: "hierarchy", description: "Checks camera online state, app permissions and router NAT in order" },
    ],
    standardResponses: [
      { id: "sec-vc-sr-link", name: "Clip link ready", type: "confirmation", icon: "check-symbol-check", description: "Shares the download link with expiry and retention reminder" },
    ],
  },
};

export default agent;
