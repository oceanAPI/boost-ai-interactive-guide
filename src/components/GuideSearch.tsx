"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { SpecialistAgent } from "@/data/agents";
import type { TopicEntry, TopicContentBlock } from "@/data/topics";
import type { DemoScript } from "@/data/demo-scripts";

/* ─── Types ─── */

interface SearchEntry {
  id: string;
  label: string;           // display name
  category: string;        // "Section" | "Agent" | "Topic" | "Demo"
  sectionId: string;       // which section to scroll to
  agentKey?: string;       // if present, open this agent's modal
  text: string;            // lowercased searchable text
}

interface SearchResult extends SearchEntry {
  snippet: string;
}

interface GuideSearchProps {
  sections: { id: string; label: string }[];
  agents: SpecialistAgent[];
  topics: TopicEntry[];
  demoScripts: DemoScript[];
  onNavigate: (id: string) => void;
  onOpenAgent?: (agentKey: string) => void;
}

/* ─── Index builder ─── */

function extractTopicText(blocks: TopicContentBlock[]): string {
  const parts: string[] = [];
  for (const b of blocks) {
    if (b.heading) parts.push(b.heading);
    if ("body" in b && b.body) parts.push(b.body);
    if ("items" in b && Array.isArray(b.items)) {
      for (const item of b.items) {
        if (typeof item === "object" && item !== null) {
          if ("title" in item) parts.push(item.title);
          if ("description" in item) parts.push(item.description || "");
          if ("detail" in item) parts.push((item as { detail?: string }).detail || "");
          if ("label" in item) parts.push((item as { label?: string }).label || "");
        }
      }
    }
    if ("columns" in b && b.columns) parts.push(b.columns.join(" "));
    if ("rows" in b && b.rows) {
      for (const row of b.rows) {
        parts.push(Object.values(row).join(" "));
      }
    }
  }
  return parts.join(" ");
}

function buildIndex(
  sections: { id: string; label: string }[],
  agents: SpecialistAgent[],
  topics: TopicEntry[],
  demoScripts: DemoScript[],
): SearchEntry[] {
  const entries: SearchEntry[] = [];

  // 1. DOM sections (static rendered content)
  for (const section of sections) {
    const el = document.getElementById(section.id);
    if (!el) continue;
    const text = el.innerText || el.textContent || "";
    entries.push({
      id: `section-${section.id}`,
      label: section.label,
      category: "Section",
      sectionId: section.id,
      text: text.toLowerCase(),
    });
  }

  // 2. Agent modal content — include flow category labels so users can search "API Hook", "Guardrail", etc.
  for (const agent of agents) {
    const flowSections: [string, typeof agent.flow.knowledgeSources][] = [
      ["Knowledge Sources", agent.flow.knowledgeSources],
      ["Guardrails Guardrail", agent.flow.guardrails],
      ["Action Hooks API Hook", agent.flow.actionHooks],
      ["Processes Process", agent.flow.processes],
      ["Standard Responses Response", agent.flow.standardResponses],
    ];
    const parts = [
      agent.name,
      agent.description,
      ...agent.capabilities.map((c) => `${c.title} ${c.description}`),
      ...agent.quickActions,
      ...flowSections.flatMap(([label, nodes]) =>
        (nodes || []).length > 0
          ? [label, ...(nodes || []).map((n) => `${n.name} ${n.description} ${n.type}`)]
          : [],
      ),
    ];
    entries.push({
      id: `agent-${agent.key}`,
      label: agent.name,
      category: "Agent",
      sectionId: "orchestrator",
      agentKey: agent.key,
      text: parts.join(" ").toLowerCase(),
    });
  }

  // 3. Topic content (deep dive sections with all content blocks)
  for (const topic of topics) {
    const allBlocks = [...(topic.headerContent || []), ...topic.content];
    const text = [
      topic.name,
      topic.shortDescription,
      extractTopicText(allBlocks),
    ].join(" ");
    entries.push({
      id: `topic-${topic.key}`,
      label: topic.name,
      category: "Topic",
      sectionId: topic.sectionId,
      text: text.toLowerCase(),
    });
  }

  // 4. Demo scripts
  for (const script of demoScripts) {
    const text = [
      script.title,
      script.industry,
      ...script.messages.map((m) => m.text),
    ].join(" ");
    entries.push({
      id: `demo-${script.industry}`,
      label: `Demo: ${script.title}`,
      category: "Demo",
      sectionId: "demo",
      text: text.toLowerCase(),
    });
  }

  return entries;
}

/* ─── Search logic ─── */

function searchIndex(index: SearchEntry[], query: string, maxResults = 8): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(Boolean);

  const scored: { entry: SearchEntry; score: number; pos: number }[] = [];

  for (const entry of index) {
    const allMatch = words.every((w) => entry.text.includes(w));
    if (!allMatch) continue;

    // Score: prefer more word matches, shorter text (more specific), category priority
    let score = words.length;
    if (entry.category === "Agent") score += 2;     // boost agents
    if (entry.category === "Topic") score += 1;
    if (entry.text.length < 500) score += 1;        // shorter = more specific

    const pos = entry.text.indexOf(words[0]);
    scored.push({ entry, score, pos });
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, maxResults).map(({ entry, pos }) => {
    const start = Math.max(0, pos - 30);
    const end = Math.min(entry.text.length, pos + 60);
    let snippet = entry.text.slice(start, end).replace(/\s+/g, " ").trim();
    if (start > 0) snippet = "..." + snippet;
    if (end < entry.text.length) snippet += "...";
    return { ...entry, snippet };
  });
}

/* ─── Category styling ─── */

const CATEGORY_STYLE: Record<string, { bg: string; text: string }> = {
  Section: { bg: "bg-boost-surface", text: "text-boost-muted" },
  Agent: { bg: "bg-boost-purple/10", text: "text-boost-purple" },
  Topic: { bg: "bg-boost-green/10", text: "text-boost-green" },
  Demo: { bg: "bg-amber-50", text: "text-amber-600" },
};

/* ─── Component ─── */

export default function GuideSearch({
  sections,
  agents,
  topics,
  demoScripts,
  onNavigate,
  onOpenAgent,
}: GuideSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const indexRef = useRef<SearchEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const openSearch = useCallback(() => {
    indexRef.current = buildIndex(sections, agents, topics, demoScripts);
    setOpen(true);
    setQuery("");
    setResults([]);
    setSelectedIdx(0);
  }, [sections, agents, topics, demoScripts]);

  // Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        open ? setOpen(false) : openSearch();
      }
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, openSearch]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    setResults(searchIndex(indexRef.current, query));
    setSelectedIdx(0);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    if (result.agentKey && onOpenAgent) {
      // Navigate to orchestrator section, then open agent modal
      onNavigate(result.sectionId);
      setTimeout(() => onOpenAgent(result.agentKey!), 300);
    } else {
      onNavigate(result.sectionId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIdx]) {
      e.preventDefault();
      handleSelect(results[selectedIdx]);
    }
  };

  const highlightSnippet = (snippet: string) => {
    if (!query.trim()) return snippet;
    const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const regex = new RegExp(
      `(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
      "gi",
    );
    const parts = snippet.split(regex);
    return parts.map((part, i) =>
      words.some((w) => part.toLowerCase() === w) ? (
        <mark key={i} className="bg-boost-green/20 text-boost-dark rounded-sm px-0.5">{part}</mark>
      ) : (
        part
      ),
    );
  };

  // Suggested tags
  const suggestions = useMemo(() => {
    const tags = ["automation", "security", "compliance", "integration", "escalation", "guardrails"];
    // Add agent names as suggestions
    for (const a of agents.slice(0, 3)) {
      const short = a.name.split(" ").slice(0, 2).join(" ");
      if (!tags.includes(short.toLowerCase())) tags.push(short);
    }
    return tags.slice(0, 8);
  }, [agents]);

  return (
    <>
      <button
        onClick={openSearch}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-boost-muted hover:text-boost-dark hover:bg-boost-surface transition-colors"
        aria-label="Search guide"
        title="Search (⌘K)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] sm:pt-[15vh]"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />

          <div className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl border border-boost-border overflow-hidden animate-modal-in">
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-boost-border">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-boost-muted flex-shrink-0">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search this guide..."
                className="flex-1 text-sm text-boost-dark placeholder:text-boost-muted/50 outline-none bg-transparent"
              />
              <button
                onClick={() => setOpen(false)}
                className="text-[10px] text-boost-muted/50 font-mono border border-boost-border rounded px-1.5 py-0.5 hover:bg-boost-surface transition-colors"
              >
                ESC
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto">
              {query.trim() && results.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-boost-muted">
                  No results for &ldquo;{query}&rdquo;
                </div>
              )}

              {results.map((r, i) => {
                const style = CATEGORY_STYLE[r.category] || CATEGORY_STYLE.Section;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r)}
                    onMouseEnter={() => setSelectedIdx(i)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                      i === selectedIdx ? "bg-boost-surface" : "hover:bg-boost-surface/50"
                    }`}
                  >
                    <div className={`flex-shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${style.bg} ${style.text}`}>
                      {r.category}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-boost-dark mb-0.5">{r.label}</p>
                      <p className="text-[11px] text-boost-muted leading-relaxed line-clamp-2">
                        {highlightSnippet(r.snippet)}
                      </p>
                    </div>
                    {i === selectedIdx && (
                      <kbd className="hidden sm:inline flex-shrink-0 text-[10px] text-boost-muted/40 font-mono mt-1">
                        ↵
                      </kbd>
                    )}
                  </button>
                );
              })}

              {!query.trim() && (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-boost-muted/60 mb-3">
                    Search sections, agents, topics, and demos
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {suggestions.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-boost-surface text-boost-muted hover:text-boost-dark hover:bg-boost-border/50 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
