"use client";

import type { SpecialistAgent, FlowNode } from "@/data/agents";
import FlowNodeCard from "./FlowNodeCard";
import type { NodeCategory } from "./FlowNodeCard";
import FlowConnector, { BranchPoint } from "./FlowConnector";

interface FlowDiagramProps {
  agent: SpecialistAgent;
}

/**
 * A single vertical branch: category node card with optional child below.
 */
function FlowBranch({
  node,
  category,
  child,
}: {
  node: FlowNode;
  category: NodeCategory;
  child?: { node: FlowNode; category: NodeCategory };
}) {
  return (
    <div className="flex flex-col items-center">
      <FlowNodeCard node={node} category={category} />
      {child && (
        <>
          <FlowConnector height={24} />
          <FlowNodeCard node={child.node} category={child.category} />
        </>
      )}
    </div>
  );
}

export default function FlowDiagram({ agent }: FlowDiagramProps) {
  const { flow } = agent;

  // Build branches: guardrails get standard responses, action hooks get processes
  const branches: {
    node: FlowNode;
    category: NodeCategory;
    child?: { node: FlowNode; category: NodeCategory };
  }[] = [];

  // Guardrails -> Standard Responses (paired by index)
  flow.guardrails.forEach((g, i) => {
    branches.push({
      node: g,
      category: "guardrail",
      child: flow.standardResponses[i]
        ? { node: flow.standardResponses[i], category: "standardResponse" }
        : undefined,
    });
  });

  // Action Hooks -> Processes (paired by index)
  flow.actionHooks.forEach((ah, i) => {
    const process = flow.processes[i];
    branches.push({
      node: ah,
      category: "actionHook",
      child: process
        ? { node: process, category: "process" }
        : undefined,
    });
  });

  // Knowledge sub-items for the agentic node
  const knowledgeItems = flow.knowledgeSources.map((ks) => ({
    icon: "hierarchy-document",
    label: ks.name,
  }));

  return (
    <div className="overflow-x-auto pb-4 scrollbar-hide">
      <div className="inline-flex flex-col items-center min-w-full">
        {/* Top: AGENTIC node */}
        <FlowNodeCard
          category="agentic"
          name={agent.name}
          description={agent.description}
          subItems={knowledgeItems}
          maxSubItems={3}
          className="min-w-[240px] max-w-[300px]"
        />

        {/* Connector down to branch point */}
        <FlowConnector height={28} />
        <BranchPoint />

        {/* Horizontal dashed line spanning branches + vertical stubs */}
        {branches.length > 1 && (
          <div className="relative w-full" style={{ height: 40 }}>
            {/* Horizontal connector line */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 border-t-[1.5px] border-dashed"
              style={{
                borderColor: "#b2dfdb",
                width: `${Math.min(90, 20 + branches.length * 18)}%`,
              }}
            />
            {/* Vertical stubs down from the horizontal line */}
            <div className="flex justify-center gap-4" style={{ paddingTop: 0 }}>
              {branches.map((b) => (
                <div key={b.node.id} className="flex justify-center" style={{ minWidth: 200 }}>
                  <div
                    className="w-0 border-l-[1.5px] border-dashed"
                    style={{ height: 40, borderColor: "#b2dfdb" }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {branches.length === 1 && <FlowConnector height={32} />}

        {/* Branch nodes in horizontal row */}
        <div className="flex items-start gap-4 justify-center flex-wrap">
          {branches.map((branch) => (
            <FlowBranch
              key={branch.node.id}
              node={branch.node}
              category={branch.category}
              child={branch.child}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
