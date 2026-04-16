export interface BoostCampVideo {
  id: string;
  title: string;
  description: string;
  /** YouTube/Vimeo URL. Leave empty "" to show a branded placeholder card without video */
  url: string;
  duration: string;
  category: "Getting Started" | "Platform" | "Best Practices";
}

// Placeholder entries — replace with real boost.ai training videos when available.
// Empty url renders a branded placeholder card (no video modal).
export const BOOST_CAMP_VIDEOS: BoostCampVideo[] = [
  // Getting Started
  { id: "bc-1", title: "Welcome to boost.ai", description: "Platform overview and first steps for new AI trainers", url: "", duration: "8:30", category: "Getting Started" },
  { id: "bc-2", title: "Your First Agent", description: "Build and deploy a specialist agent in under 30 minutes", url: "", duration: "24:15", category: "Getting Started" },
  // Platform
  { id: "bc-3", title: "Orchestrator Deep Dive", description: "How the agent orchestrator classifies and routes conversations", url: "", duration: "18:45", category: "Platform" },
  { id: "bc-4", title: "Guardrails & Safety", description: "Configure hallucination prevention, PII masking, and compliance rules", url: "", duration: "15:20", category: "Platform" },
  { id: "bc-5", title: "Analytics Dashboard", description: "Track automation rates, CSAT, and conversation insights", url: "", duration: "12:10", category: "Platform" },
  // Best Practices
  { id: "bc-6", title: "Knowledge Base Mastery", description: "Structure content for maximum AI accuracy and coverage", url: "", duration: "20:00", category: "Best Practices" },
  { id: "bc-7", title: "Conversation Design", description: "Write flows that feel human and resolve issues efficiently", url: "", duration: "16:40", category: "Best Practices" },
  { id: "bc-8", title: "Go-Live Checklist", description: "Everything to verify before launching your agents to production", url: "", duration: "11:55", category: "Best Practices" },
];
