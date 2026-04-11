/* ─── Topic Hub data types ─── */

export interface TextBlockData {
  type: "text";
  heading?: string;
  body: string;
}

export interface StatsBlockData {
  type: "stats";
  heading?: string;
  items: { value: number; suffix?: string; prefix?: string; label: string }[];
}

export interface ListBlockData {
  type: "list";
  heading?: string;
  variant?: "bullet" | "check" | "numbered";
  items: { title: string; description?: string }[];
}

export interface TableBlockData {
  type: "table";
  heading?: string;
  columns: string[];
  rows: Record<string, string>[];
  highlightColumn?: string; // column key to highlight (e.g. "boost.ai")
}

export interface CalloutBlockData {
  type: "callout";
  heading?: string;
  body: string;
  variant?: "green" | "purple" | "neutral";
}

export interface StepsBlockData {
  type: "steps";
  heading?: string;
  items: { title: string; description: string; detail?: string }[];
}

export type TopicContentBlock =
  | TextBlockData
  | StatsBlockData
  | ListBlockData
  | TableBlockData
  | CalloutBlockData
  | StepsBlockData;

export interface TopicEntry {
  key: string;
  /** Unique section ID used for navigation and tracking (e.g. "topic-implementation") */
  sectionId: string;
  name: string;
  shortDescription: string;
  icon: string;
  color: string; // Tailwind border-color class, e.g. "border-boost-green"
  headerContent?: TopicContentBlock[]; // rendered above special section content (e.g. above roadmap)
  content: TopicContentBlock[];
}
