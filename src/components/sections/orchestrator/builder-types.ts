import type { SpecialistAgent } from "@/data/agents";

export interface BuilderGroup {
  id: string;
  label: string;
  agentKeys: string[];
}

export interface OrchestratorBuilderProps {
  availableAgents: SpecialistAgent[];
  onSelectAgent: (agent: SpecialistAgent) => void;
  onSelectOrchestrator: () => void;
  onExit: () => void;
}

export type KnowledgeEntry = {
  id: string;
  type: "url" | "upload" | "document" | "connector";
  title: string;
};

export type KnowledgeTab = "url" | "upload" | "document" | "connector" | "existing";

export type HookEntry = {
  id: string;
  hookType: "api" | "action";
  name: string;
  description: string;
  inputKeys: { name: string; type: string; description: string; required: boolean }[];
  customCardJson?: {
    type: string;
    title: string;
    subtitle?: string;
    image?: string | null;
    fields?: { label: string; value: string }[];
    actions?: { label: string; type: string }[];
  };
};
