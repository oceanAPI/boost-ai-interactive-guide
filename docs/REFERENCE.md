---

> **Status: PARTIALLY STALE — last verified 2026-04-20**
> This file is a lookup resource, not an onboarding doc. Use it to find
> where a specific element lives (CSS tokens, animations, UI components,
> hooks, orchestrator code paths). Do NOT trust it for "what does the app
> do overall" — for that, read `docs/ARCHITECTURE.md`.
>
> **Trust rule (from project memory):** when REFERENCE.md disagrees with
> `src/app/globals.css` or `src/**/_types.ts`, trust the code.

## Freshness map

**Trust these sections** (verified current 2026-04-20):
- Color System (design tokens match globals.css)
- CSS Animation Reference (keyframes still match)
- UI Component Library (all listed components exist)
- Hooks table (useScrollReveal, useCountUp in use)
- Orchestrator / Flow / Agent architecture (code paths current)
- Topic Data Architecture (topic-registry mapping valid)

**Do NOT trust these sections** (known stale):
- Page Architecture tree — predates audience-defaults layer and 9 new CE sections
- Section 09 / 10 numbering — drifts as sections change
- Home redirect description — `/` is now the 3-card audience chooser
- Admin / Form Builder — now 10 collapsible sections, not 6-step linear
- Agent Data Architecture — missing pension, wealth_management, fintech, credit_union, security industries
- Missing entirely: Pac-Man (FeedbackBacklog), Cloudflare Worker, Feed-me-log, customer-fixtures.ts, audience-sections.ts, company-patterns.ts

---

# Interactive Guide — Complete Reference Map

> **How to use this document:** Find the visual element you want to change, then follow the file path and component name to make targeted edits. Each entry includes the exact file, exported component, and notable internal sub-components.

---

## Page Architecture (high-level)

```
src/app/guide/GuideClient.tsx          ← The main page renderer
  ├── GuideNav                         ← Sticky top navigation bar
  ├── HeroSection          (Section 01)
  ├── OrchestratorSection  (Section 02)
  ├── TopicHubSection      (Section 03)
  ├── Topic Sections       (Sections 04–07, from registry)
  │   ├── RoadmapSection          (04 — Implementation)
  │   ├── IntegrationArchSection  (05 — Integrations)
  │   ├── SecurityComplianceSection (06 — Security)
  │   └── WaysOfWorkingSection    (07 — Ways of Working)
  ├── DemoPreviewSection   (Section 08)
  ├── ROISection           (Section 09)
  └── NextStepsSection     (Section 10)
```

---

## Global Files

| What | File | Notes |
|------|------|-------|
| **CSS theme & animations** | `src/app/globals.css` | All color variables (`--color-boost-*`), keyframe animations, scroll-reveal classes, print styles |
| **Tailwind config** | `postcss.config.mjs` | Tailwind v4 PostCSS plugin |
| **Root layout** | `src/app/layout.tsx` | `<html>` wrapper, Geist fonts, metadata |
| **Home redirect** | `src/app/page.tsx` | Redirects `/` → `/admin` |
| **Guide page (server)** | `src/app/guide/page.tsx` | URL param decoding, Suspense boundary |
| **Guide page (client)** | `src/app/guide/GuideClient.tsx` | Section ordering, scroll tracking, navigation, search registration |
| **Asset path helper** | `src/lib/asset-path.ts` | `assetPath()` — prepends basePath for production |
| **TypeScript types** | `src/lib/types.ts` | `GuideData`, `ChannelVolumes`, `PricingModel`, etc. |
| **URL encoding** | `src/lib/url-encoding.ts` | `encodeGuideData()` / `decodeGuideData()` |

---

## Navigation & Search

### Sticky Nav Bar
| File | `src/components/GuideNav.tsx` |
|------|------|
| **Component** | `GuideNav` |
| **What it renders** | Logo + company name, scrollable section pills, search button |
| **Props** | `sections`, `activeSection`, `companyName`, `agents`, `topics`, `demoScripts`, `onNavigate`, `onOpenAgent` |
| **To change** | Nav layout, pill styling, logo, active indicator |

### Global Search (⌘K)
| File | `src/components/GuideSearch.tsx` |
|------|------|
| **Component** | `GuideSearch` |
| **What it renders** | Search modal overlay, text input, categorized results (Section/Agent/Topic/Demo) |
| **To change** | Search algorithm, result categories, keyboard shortcut, result card styling |

---

## Section 01 — Hero

| File | `src/components/sections/HeroSection.tsx` |
|------|------|
| **Component** | `HeroSection` |
| **Props** | `guide: GuideData` |

### Visual Elements

| Element | Where in file | How to find it |
|---------|---------------|----------------|
| **Constellation background** | Internal `ConstellationField` component | Canvas-based particle animation. Change dot count, speed, colors here |
| **Purple/green gradient orbs** | JSX with classes `orbFloat1`, `orbFloat2` | Floating radial gradient blobs behind content |
| **boost.ai logo** | `<BoostLogo />` usage | See `src/components/BoostLogo.tsx` |
| **"Prepared for [Company]"** heading | `<h1>` with `guide.company_name` | Top of return JSX |
| **Contact name & role badge** | Conditional on `guide.contact_name` | Purple pill with role |
| **Company URL link** | Conditional on `guide.company_url` | External link below heading |
| **Stat cards row** | Three `HeroStat` internal components | Conversations automated, monthly savings, automation rate |
| **Scroll-down hint** | Bouncing arrow at bottom | `scrollDot` animation class |

### Sub-Components (same file)
- `HeroStat` — Single stat card with animated counter
- `ConstellationField` — Canvas particle network

---

## Section 02 — Boost Agent Orchestrator

### Main Section
| File | `src/components/sections/OrchestratorSection.tsx` |
|------|------|
| **Component** | `OrchestratorSection` |
| **Props** | `guide`, `onRegisterOpenAgent` |

| Element | Where | Notes |
|---------|-------|-------|
| **Section header** | `<SectionHeader>` | "Boost Agent Orchestrator" title |
| **Pre-built flow view** | Default state (`!builderMode`) | Shows orchestrator card → topic groups → agent cards |
| **"Try it" button** | Green button on orchestrator card | Switches to `builderMode` |
| **Agent Orchestrator card** | `<FlowNodeCard category="agentic">` | Central purple-green card |
| **Topic group columns** | `TopicGroupColumn` internal component | Desktop: vertical columns; Mobile: accordion |
| **Agent cards** | `AgentCard` internal component | Clickable → opens AgentModal |
| **Dashed connector lines** | `DashedLine` helper | Vertical/horizontal dashed borders |
| **Agent detail modal** | `<AgentModal>` | Full-screen modal with agent flow |

### Builder Mode (interactive)
| File | `src/components/sections/orchestrator/OrchestratorBuilder.tsx` (404 lines) |
|------|------|
| **Component** | `OrchestratorBuilder` |
| **Props** | `availableAgents`, `onSelectAgent`, `onSelectOrchestrator`, `onExit` |

| Element | File | Notes |
|---------|------|-------|
| **Back button** | `OrchestratorBuilder.tsx` | Green pill, returns to pre-built view |
| **Orchestrator card (clickable)** | `OrchestratorBuilder.tsx` | `<button>` wrapping `<FlowNodeCard>` |
| **Agent groups** | `OrchestratorBuilder.tsx` | `BuilderGroupColumn` / `MobileBuilderGroup` internal components |
| **Shared types** | `builder-types.ts` | `BuilderGroup`, `KnowledgeEntry`, `HookEntry`, `OrchestratorBuilderProps` |
| **Dashed connector lines** | `DashedLine.tsx` | Reusable vertical/horizontal dashed border |
| **Add group popover** | `AddGroupPopover.tsx` | Text input to name new group |
| **Add agent dropdown** | `AddAgentDropdown.tsx` | "Create new agent" at top, then agent list |
| **Create Agent modal** | `CreateAgentModal.tsx` | Full agent creation wizard with save logic |
| **Knowledge editor** | `KnowledgeEditor.tsx` | 5 tabs: URL, Upload, Document, Connector, Existing |
| **Hook editor** | `HookEditor.tsx` | Hook list + type picker (API/Action) |
| **API Hook creator** | `ApiHookCreator.tsx` | Code editor + input keys |
| **Action Hook creator** | `ActionHookCreator.tsx` | 3-step wizard: type → content → preview |
| **Custom card chat preview** | `ActionHookCreator.tsx` step 3 | Mini chat with rendered banking card |

### Agent Detail Modal
| File | `src/components/sections/orchestrator/AgentModal.tsx` |
|------|------|
| **Component** | `AgentModal` |
| **Props** | `agent`, `allAgents`, `onClose`, `onSelectAgent` |

| Element | Notes |
|---------|-------|
| **Header** | Agent name, icon, description, automation rate badge |
| **Capabilities list** | Cards from `agent.capabilities[]` |
| **Quick Actions** | FAQ bar chart from `agent.quickActions[]` |
| **Flow diagram** | Uses `<FlowDiagram>` — shows knowledge → guardrails → hooks → responses |
| **Connected agents** | Only for orchestrator — grid of all agents |

### Flow Diagram
| File | `src/components/sections/orchestrator/FlowDiagram.tsx` |
|------|------|
| **Component** | `FlowDiagram` |
| **Props** | `flow: AgentFlow` |

| Element | Notes |
|---------|-------|
| **Knowledge sources row** | Green cards from `flow.knowledgeSources` |
| **Guardrails row** | Purple cards from `flow.guardrails` |
| **Action hooks row** | Orange cards from `flow.actionHooks` |
| **Standard responses row** | Muted cards from `flow.standardResponses` |
| **Connector lines** | Dashed vertical lines between rows |
| **Count badges** | Circle with number above each column |

### Flow Node Card
| File | `src/components/sections/orchestrator/FlowNodeCard.tsx` |
|------|------|
| **Component** | `FlowNodeCard` |

| Category | Color | Used for |
|----------|-------|----------|
| `agentic` | green-light bg | Orchestrator card, agent cards in builder |
| `knowledge` | green-light bg | Knowledge source nodes |
| `guardrail` | purple bg | Guardrail nodes |
| `actionHook` | orange bg | Action hook nodes |
| `process` | green bg | Process nodes |
| `standardResponse` | muted bg | Standard response nodes |

### Other Orchestrator Files
| File | Component | Purpose |
|------|-----------|---------|
| `orchestrator/DashedLine.tsx` | `DashedLine` | Reusable dashed connector line (vertical/horizontal) |
| `orchestrator/builder-types.ts` | — | Shared types: `BuilderGroup`, `KnowledgeEntry`, `HookEntry`, etc. |
| `orchestrator/FlowConnector.tsx` | `FlowConnector` | SVG connector line between flow nodes |
| `orchestrator/OrchestratorExplainer.tsx` | `OrchestratorExplainer` | Educational walkthrough modal |

---

## Section 03 — Deep Dive (Topic Hub)

| File | `src/components/sections/TopicHubSection.tsx` |
|------|------|
| **Component** | `TopicHubSection` |
| **Props** | `guide`, `onNavigate` |

| Element | Notes |
|---------|-------|
| **Section header** | "Deep Dive" with section number 03 |
| **Topic cards grid** | 4 clickable cards in 2×2 grid |
| **Individual topic card** | `TopicCard` internal component — icon, name, description, colored top border |
| **Scroll navigation** | Clicking a card calls `onNavigate(topic.sectionId)` |

---

## Section 04 — Implementation & Roadmap

| File | `src/components/sections/RoadmapSection.tsx` |
|------|------|
| **Component** | `RoadmapSection` |
| **Props** | `guide`, `sectionNumber`, `headerBlocks`, `contentBlocks` |

| Element | Notes |
|---------|-------|
| **Gantt chart** | 12-week timeline with phase color bands |
| **Phase headers** | Discovery (wk 1-2), Build (wk 3-6), Pilot (wk 7-9), Scale (wk 10-12) |
| **Swimlanes** | Key Milestones, Agent Config, Integrations, Knowledge Mgmt, etc. |
| **Lane items** | Horizontal bars positioned by start/end week |
| **Detail panel** | Click a lane item to see owner, deliverables, detail text |

### Roadmap Data
| File | `src/data/roadmap.ts` |
|------|------|
| **Exports** | `ROADMAP_PHASES`, `ROADMAP_LANES`, `TOTAL_WEEKS` |
| **To change** | Phase names/durations, lane items, deliverables, owners |

---

## Section 05 — Integrations & Architecture

| File | `src/components/sections/IntegrationArchSection.tsx` |
|------|------|
| **Component** | `IntegrationArchSection` |
| **Props** | `guide`, `sectionNumber`, `headerBlocks`, `contentBlocks` |

| Element | Notes |
|---------|-------|
| **Architecture diagram** | Channels → Orchestrator → Backend systems |
| **Channel nodes** | Left column — chat, voice, email, social icons |
| **Central orchestrator** | Middle — boost.ai orchestrator card |
| **Backend nodes** | Right column — CRM, knowledge bases, APIs |
| **Flow connectors** | Animated dashed lines with `flowRight`/`flowDown` animations |
| **Integration badges** | Shows which integrations are selected in the guide config |

### Integration Data
| File | `src/data/integrations.ts` |
|------|------|
| **Exports** | `ALL_INTEGRATIONS`, `INTEGRATION_CATEGORIES` |
| **To change** | Available integrations, category grouping, icons |

---

## Section 06 — Security & Compliance

| File | `src/components/sections/SecurityComplianceSection.tsx` |
|------|------|
| **Component** | `SecurityComplianceSection` |
| **Props** | `guide`, `sectionNumber`, `headerBlocks`, `contentBlocks` |

| Element | Notes |
|---------|-------|
| **Generative Action Flow** | Step-by-step flow diagram: Input → Guardrails → Processing → Output → Response |
| **Expandable guardrail cards** | Hallucination detection, PII protection, etc. |
| **Data protection section** | Encryption, GDPR, data residency |
| **Audit trail section** | Logging, compliance reporting |
| **Compliance checklist** | SOC2, ISO27001, GDPR badges |

---

## Section 07 — Ways of Working

| File | `src/components/sections/WaysOfWorkingSection.tsx` |
|------|------|
| **Component** | `WaysOfWorkingSection` |
| **Props** | `guide`, `sectionNumber`, `headerBlocks`, `contentBlocks` |

| Element | Notes |
|---------|-------|
| **Row 1 (default open)** | Implementation Plan + Team & Responsibilities — row-synced toggle |
| **Row 2 (default closed)** | Hypercare Handoff + Ongoing Partnership — row-synced toggle |
| **Implementation plan card** | Phase breakdown with timeline |
| **Team card** | Stakeholder roles grid |
| **Hypercare card** | Support transition plan |
| **Partnership card** | Ongoing engagement model |
| **Row-synced state** | `row1Open`/`row2Open` — expanding one card expands its sibling |

---

## Section 08 — Live Demo

| File | `src/components/sections/DemoPreviewSection.tsx` |
|------|------|
| **Component** | `DemoPreviewSection` |
| **Props** | `guide` |

| Element | Notes |
|---------|-------|
| **Tab switcher** | Tabs for different demo scripts (chat, escalation) |
| **Chat conversation** | Alternating user/bot message bubbles |
| **Message animation** | Messages appear one-by-one with delay |
| **Bot avatar** | boost.ai icon |
| **Transcript actions** | Copy/download buttons |

### Demo Script Data
| File | `src/data/demo-scripts.ts` |
|------|------|
| **Functions** | `getDemoScript(companyName, areas)`, `getEscalatedDemoScript(companyName)` |
| **To change** | Conversation messages, bot responses, escalation flow |

---

## Section 09 — ROI Calculator

| File | `src/components/sections/ROISection.tsx` |
|------|------|
| **Component** | `ROISection` |
| **Props** | `guide` |

| Element | Notes |
|---------|-------|
| **Volume slider** | Monthly conversations input |
| **Cost slider** | Cost per conversation input |
| **Before/After comparison** | Side-by-side cost cards |
| **Cost breakdown chart** | Horizontal bar chart |
| **Impact grid** | 4 metric cards: cost reduction %, FTE equivalent, automation rate, break-even months |

### ROI Calculation Logic
| File | `src/lib/roi-calculator.ts` |
|------|------|
| **Function** | `calculateROI(params)` |
| **To change** | Cost formulas, FTE ratio (1500 convos/FTE), platform cost, break-even logic |

---

## Section 10 — Next Steps

| File | `src/components/sections/NextStepsSection.tsx` |
|------|------|
| **Component** | `NextStepsSection` |
| **Props** | `guide` |

| Element | Notes |
|---------|-------|
| **Gradient background** | Purple → green gradient |
| **Schedule Demo card** | CTA (coming soon badge) |
| **Technical Deep-Dive card** | CTA (coming soon badge) |
| **Share Guide card** | Copy URL to clipboard with success feedback |
| **Footer tagline** | "The future of customer service" |

---

## UI Component Library

All reusable UI components in `src/components/ui/`:

| File | Component | Purpose | Key Props |
|------|-----------|---------|-----------|
| `SectionHeader.tsx` | `SectionHeader` | Section title with number | `number`, `title`, `subtitle`, `centered` |
| `StatCounter.tsx` | `StatCounter` | Animated count-up number | `value`, `suffix`, `label`, `color` |
| `ExpandableCard.tsx` | `ExpandableCard` | Collapsible content card | `title`, `accentColor`, `defaultOpen`, `open`, `onToggle` |
| `TabGroup.tsx` | `TabGroup` | Tab navigation with indicator | `tabs`, `activeTab`, `onTabChange`, `size` |
| `AnimatedCard.tsx` | `AnimatedCard` | Card with hover scale effect | `children` |
| `Badge.tsx` | `Badge` | Inline label pill | `variant`, `size`, `children` |
| `CalloutBanner.tsx` | `CalloutBanner` | Highlighted callout box | `heading`, `body`, `variant` |
| `FeatureLink.tsx` | `FeatureLink` | Clickable feature item | `title`, `description` |
| `ProgressRing.tsx` | `ProgressRing` | Circular progress SVG | `value`, `size`, `color` |
| `Tooltip.tsx` | `Tooltip` | Hover tooltip | `content`, `children` |

**Barrel export:** `src/components/ui/index.ts`

---

## Utility Components

| File | Component | Purpose |
|------|-----------|---------|
| `src/components/BoostIcon.tsx` | `BoostIcon` | SVG icon loader from `/icons/purple/` |
| `src/components/BoostLogo.tsx` | `BoostLogo` | boost.ai brand logo |
| `src/components/SparkleDecoration.tsx` | `SparkleDecoration` | Animated sparkle effect |

---

## Agent Data Architecture

### Type Definitions
| File | `src/data/agents/_types.ts` |
|------|------|

```
SpecialistAgent {
  key: string               ← Unique ID (e.g., "account_services")
  name: string              ← Display name
  icon: string              ← Icon key for BoostIcon
  automationRate: number    ← 0-100 percentage
  avgResolutionTime: string ← e.g., "45s"
  topTopic: string          ← Primary topic category
  description: string       ← Short description
  capabilities: AgentCapability[]
  quickActions: QuickAction[]
  flow: AgentFlow {
    knowledgeSources: FlowNode[]
    guardrails: FlowNode[]
    actionHooks: FlowNode[]
    processes: FlowNode[]
    standardResponses: FlowNode[]
  }
}
```

### Agent Registry
| File | Purpose |
|------|---------|
| `src/data/agents/index.ts` | Public API: `getOrchestratorConfig()`, `getAgentsForGuide()` |
| `src/data/agents/banking/index.ts` | Banking agents grouped into `BANKING_TOPIC_GROUPS` |
| `src/data/agents/insurance/index.ts` | Insurance agents grouped into `INSURANCE_TOPIC_GROUPS` |

### Individual Banking Agents (one file each)
| File | Agent Name | Topic Group |
|------|-----------|-------------|
| `banking/account-services.ts` | Account Services | Everyday Banking |
| `banking/cards-and-payments.ts` | Cards & Payments | Everyday Banking |
| `banking/digital-banking.ts` | Digital Banking | Everyday Banking |
| `banking/mobile-bank-application.ts` | Mobile Bank App | Everyday Banking |
| `banking/payment.ts` | Payment | Everyday Banking |
| `banking/prices.ts` | Prices | Everyday Banking |
| `banking/lending-and-mortgages.ts` | Lending & Mortgages | Loans |
| `banking/consumer-loans.ts` | Consumer Loans | Loans |
| `banking/carloan.ts` | Car Loan | Loans |
| `banking/credit-cards.ts` | Credit Cards | Loans |
| `banking/insurance-general.ts` | Insurance General | Insurance |
| `banking/auto-insurance.ts` | Auto Insurance | Insurance |
| `banking/pension.ts` | Pension | Savings & Investments |
| `banking/stocks-and-funds.ts` | Stocks & Funds | Savings & Investments |
| `banking/bank-fraud.ts` | Bank Fraud | Other Services |
| `banking/general-inquiries.ts` | General Inquiries | Other Services |
| `banking/customer-relationship.ts` | Customer Relationship | Standalone (no group) |

### Individual Insurance Agents
| File | Agent Name |
|------|-----------|
| `insurance/claims.ts` | Claims |
| `insurance/coverage-and-policy.ts` | Coverage & Policy |
| `insurance/billing-and-payments.ts` | Billing & Payments |

---

## Topic Data Architecture

### Type Definitions
| File | `src/data/topics/_types.ts` |
|------|------|

Content block types: `TextBlockData`, `StatsBlockData`, `ListBlockData`, `TableBlockData`, `CalloutBlockData`, `StepsBlockData`

### Topic Registry
| File | Purpose |
|------|---------|
| `src/data/topics/index.ts` | `ALL_TOPICS` (hub order), `TOPIC_SECTIONS` (page order), `getTopicsForGuide()` |
| `src/data/topics/registry.tsx` | Maps topic keys → specialized React components |

### Topic → Component Mapping
| Topic Key | Component File | Section |
|-----------|---------------|---------|
| `implementation` | `RoadmapSection.tsx` | 04 |
| `integrations` | `IntegrationArchSection.tsx` | 05 |
| `security-compliance` | `SecurityComplianceSection.tsx` | 06 |
| `ways-of-working` | `WaysOfWorkingSection.tsx` | 07 |

### Topic Content Data
| File | Topic |
|------|-------|
| `src/data/topics/implementation.ts` | Implementation & Rollout |
| `src/data/topics/integrations.ts` | Integrations & Deployment |
| `src/data/topics/security-compliance.ts` | Security & Compliance |
| `src/data/topics/ways-of-working.ts` | Ways of Working |

---

## Other Data Files

| File | Purpose | Key Exports |
|------|---------|-------------|
| `src/data/roadmap.ts` | Gantt chart data | `ROADMAP_PHASES`, `ROADMAP_LANES`, `TOTAL_WEEKS` |
| `src/data/integrations.ts` | Integration catalog | `ALL_INTEGRATIONS`, `INTEGRATION_CATEGORIES` |
| `src/data/demo-scripts.ts` | Chat demo conversations | `getDemoScript()`, `getEscalatedDemoScript()` |
| `src/data/guide-content.ts` | Static content | `COMPARISON_TABLE`, `getTimeline()` |
| `src/data/case-studies.ts` | Customer success stories | Case study objects |
| `src/data/roles.ts` | Stakeholder role definitions | Role objects |

---

## Hooks

| File | Hook | Purpose |
|------|------|---------|
| `src/hooks/useScrollReveal.ts` | `useScrollReveal()` | IntersectionObserver for scroll-triggered animations. Returns `[ref, isVisible]` |
| `src/hooks/useCountUp.ts` | `useCountUp()` | Animated number counter from 0 → target |

---

## Admin / Form Builder

| File | `src/app/admin/page.tsx` |
|------|------|
| **Component** | Admin form page |

| Element | Notes |
|---------|-------|
| **Step 1: Organization Info** | Company name, URL, contact name/role |
| **Step 2: Service Focus** | Industry checkboxes (Banking, Insurance, etc.) |
| **Step 3: Volumes & Pricing** | Channel volume inputs, cost per conversation, pricing model radio |
| **Step 4: Deployment** | Market count, FTE sliders |
| **Step 5: Integrations** | Multi-category checkbox grid |
| **Step 6: Notes** | Free-text textarea |
| **Generate Guide button** | Encodes form data → navigates to `/guide?data=...` |

### Internal Components (same file)
- `CollapsibleSection` — Numbered step accordion
- `FieldLabel` — Form label with optional indicator

---

## CSS Animation Reference

All defined in `src/app/globals.css`:

| Animation | Used For |
|-----------|----------|
| `fadeIn` | General fade-in (opacity 0→1) |
| `modalIn` | Modal overlays (scale + slide + fade) |
| `sectionFadeIn` | Section scroll-reveal (slide up + fade) |
| `sparkle` | Decorative sparkle pulse |
| `progressGrow` | Progress bar width animation |
| `loadProgress` | Upload simulation progress |
| `heroFadeIn` | Hero section entrance |
| `heroAccentLine` | Hero decorative line |
| `scrollDot` | Scroll hint bounce |
| `orbFloat1` / `orbFloat2` | Background orb floating |
| `flowRight` / `flowDown` | Data flow animation on connectors |
| `drawLine` | SVG stroke drawing |
| `progressRing` | Circular progress animation |

---

## Color System

Defined as CSS custom properties in `globals.css`, consumed as Tailwind classes (`bg-boost-purple`, `text-boost-green`, etc.):

| Variable | Value | Usage |
|----------|-------|-------|
| `--color-boost-purple` | `#59195d` | Primary brand, headers, guardrails |
| `--color-boost-purple-dark` | `#451149` | Darker variant |
| `--color-boost-green` | `#208269` | CTA buttons, success, processes |
| `--color-boost-green-light` | `#36b595` | Agent cards, knowledge sources |
| `--color-boost-orange` | `#ef8b00` | Action hooks, warnings |
| `--color-boost-lavender` | `#d1c7d2` | Borders, subtle accents |
| `--color-boost-gold` | `#d5b000` | Highlights |
| `--color-boost-pink` | `#e383b7` | Accent |
| `--color-boost-bg` | `#ffffff` | Page background |
| `--color-boost-surface` | `#f7f5f8` | Card/surface background |
| `--color-boost-border` | `#e2dce5` | Borders |
| `--color-boost-muted` | `#7a6b80` | Secondary text |
| `--color-boost-dark` | `#2d1832` | Primary text |
| `--color-boost-text` | `#1e1e1e` | Body text |
| `--color-boost-connector` | `#36b595` | Flow diagram connectors |

---

## Quick-Find Cheat Sheet

**"I want to change..."**

| What | Go to |
|------|-------|
| The company name in the header | `GuideNav.tsx` → `companyName` prop |
| A stat number on the hero | `HeroSection.tsx` → `HeroStat` components |
| The animated background dots | `HeroSection.tsx` → `ConstellationField` |
| Which agents appear in the orchestrator | `src/data/agents/banking/index.ts` → `BANKING_TOPIC_GROUPS` |
| An agent's capabilities or flow | `src/data/agents/banking/<agent-name>.ts` |
| The orchestrator flow diagram colors | `FlowNodeCard.tsx` → category color mapping |
| The agent detail modal layout | `AgentModal.tsx` |
| The builder "create agent" wizard | `orchestrator/CreateAgentModal.tsx` |
| The knowledge editor tabs | `orchestrator/KnowledgeEditor.tsx` |
| The hook creator (API/Action) | `orchestrator/ApiHookCreator.tsx` / `orchestrator/ActionHookCreator.tsx` |
| The custom card chat preview | `orchestrator/ActionHookCreator.tsx` step 3 |
| The add agent dropdown | `orchestrator/AddAgentDropdown.tsx` |
| Builder shared types | `orchestrator/builder-types.ts` |
| A topic card in the hub | `TopicHubSection.tsx` → `TopicCard` |
| The Gantt roadmap | `RoadmapSection.tsx` + `src/data/roadmap.ts` |
| The integration architecture diagram | `IntegrationArchSection.tsx` |
| Security guardrail flow | `SecurityComplianceSection.tsx` |
| Ways of Working expandable cards | `WaysOfWorkingSection.tsx` |
| The demo chat conversation | `DemoPreviewSection.tsx` + `src/data/demo-scripts.ts` |
| ROI calculator sliders & formulas | `ROISection.tsx` + `src/lib/roi-calculator.ts` |
| Next steps CTA buttons | `NextStepsSection.tsx` |
| The admin form fields | `src/app/admin/page.tsx` |
| Global colors or fonts | `src/app/globals.css` |
| An animation timing/style | `src/app/globals.css` → `@keyframes` |
| A reusable UI component | `src/components/ui/<ComponentName>.tsx` |
| Icon rendering | `src/components/BoostIcon.tsx` |
| How sections are ordered on the page | `src/app/guide/GuideClient.tsx` → `SECTIONS` array |
| Which component renders for a topic | `src/data/topics/registry.tsx` → `TOPIC_COMPONENTS` |
