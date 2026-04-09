// /* ─────────────────────────────────────────────
// *  Agent template — copy this file to create a new agent
// *
// *  1. Copy to the appropriate industry folder (e.g. banking/, insurance/)
// *  2. Rename to match the agent's purpose (kebab-case, e.g. "fraud-detection.ts")
// *  3. Uncomment and fill in all fields below
// *  4. Import the agent in the industry's index.ts barrel file
// * ───────────────────────────────────────────── */
//
// import type { SpecialistAgent } from "../_types";
//
// const agent: SpecialistAgent = {
//   key: "unique_agent_key",
//   name: "Agent Display Name",
//   icon: "icon-name",           // BoostIcon name
//   automationRate: 80,
//   avgResolutionTime: "~2 min", // optional
//   topTopic: "Most Common Topic", // optional
//   description: "What this agent handles — shown in the agent card.",
//   capabilities: [
//     { title: "Capability name", description: "What this capability does" },
//   ],
//   quickActions: ["Action 1", "Action 2"],
//   flow: {
//     knowledgeSources: [
//       { id: "prefix-kb-name", name: "Source Name", type: "faq", icon: "books", description: "What this source provides" },
//     ],
//     guardrails: [
//       { id: "prefix-gr-name", name: "Guardrail Name", type: "hallucination", icon: "shield-medal", description: "What this guardrail prevents" },
//     ],
//     actionHooks: [
//       { id: "prefix-ah-name", name: "Hook Name", type: "transfer", icon: "headset", description: "What this hook does" },
//     ],
//     processes: [
//       { id: "prefix-pr-name", name: "Process Name", type: "workflow", icon: "hierarchy", description: "What this process orchestrates" },
//     ],
//     standardResponses: [
//       { id: "prefix-sr-name", name: "Response Name", type: "confirmation", icon: "thumbs-up", description: "When this response is used" },
//     ],
//   },
// };
//
// export default agent;
