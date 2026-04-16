/**
 * Image manifest for 2026 roadmap items.
 * Each entry maps a RoadmapItem.id to true when a matching /photos/roadmap-2026/{id}.jpg exists.
 * Used by RoadmapTab to show the slide mockup in the expanded detail panel.
 */

export const ROADMAP_ITEM_IMAGES: Record<string, true> = {
  "adaptive-voice": true,
  "agent-orchestration-a2a": true,
  "agent-orchestration-beta": true,
  "agentic-sounds": true,
  "ai-companion-analytics": true,
  "ai-companion-flow-building": true,
  "ai-review-continuous-improvement": true,
  "conversation-testing-v2": true,
  "custom-sound-effects": true,
  "granular-user-permissions": true,
  "high-agency-control-room": true,
  "improved-topic-analytics": true,
  "integration-service": true,
  "knowledge-transformation": true,
  "multi-instance-management": true,
  "multimodal-conversations": true,
  "new-chat-panel-widget": true,
  "voice-cloning": true,
  "voice-test-studio": true,
  "webrtc-configuration": true,
};

export function hasRoadmapImage(id: string): boolean {
  return ROADMAP_ITEM_IMAGES[id] === true;
}
