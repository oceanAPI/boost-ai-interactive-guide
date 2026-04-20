/* ──────────────────────────────────────────────────────────────
 *  Customer fixture store (CE-rich pre-fills)
 *
 *  Keyed by `CompanyPattern.key` (see `src/data/company-patterns.ts`).
 *  When the admin's company-detect matches a pattern, the corresponding
 *  fixture here is overlaid on top of `pattern.prefill` so the CE
 *  admin lands with performance telemetry, success plan, agent SWOT,
 *  UAT status, benchmarks, recommendations, and BR context already
 *  populated.
 *
 *  Data source: the 6 delivered BR / inspiration decks in
 *  `customer_excellence_raw_data_pdfs/`. Values here are *plausible
 *  placeholders* patterned after what a real BR contains — they are
 *  a starting point for the CE UI, not ground truth. Swap to a real
 *  backend by replacing `getCustomerFixture` with an HTTP call; no
 *  consumer needs to change.
 *
 *  Contract: additive-only. New fixture fields land as optional
 *  (matching the Customer schema's contract). Removing a fixture is
 *  fine — the admin just falls back to `pattern.prefill` alone.
 * ────────────────────────────────────────────────────────────── */

import type { Customer } from "@/lib/types";

/** Static fixture table. Keys MUST match a key in COMPANY_PATTERNS. */
export const CUSTOMER_FIXTURES: Record<string, Partial<Customer>> = {
  /* ─── H&M ─────────────────────────────────────────
   * Retail, global, multi-market. Boost handles order status,
   * returns, membership, store locator. BR March 2026. */
  hm: {
    lifecycle: "live",
    touch_level: "strategic",
    has_cs_package: true,
    performance: {
      automation_rate: 68,
      previous_automation_rate: 62,
      csat_score: 4.3,
      previous_csat_score: 4.1,
      unknown_rate: 9,
      previous_unknown_rate: 12,
      escalation_rate: 11,
      previous_escalation_rate: 14,
      monthly_conversations: 420000,
      previous_monthly_conversations: 380000,
      markets_live: 16,
      previous_markets_live: 14,
      active_agents: 11,
      previous_active_agents: 9,
      measured_from: "2026-01-01",
      measured_to: "2026-03-01",
    },
    performance_details: {
      automation_rate: {
        narrative: "+6 pts since Q4 2025. Returns agent rollout absorbed the bulk of repetitive return-window queries across SE + DE. Carrier-API integration on the order-status flow added another ~2 pts.",
        history: [
          { at: "2025-07-01", value: 54 },
          { at: "2025-10-01", value: 58 },
          { at: "2026-01-01", value: 62 },
          { at: "2026-03-01", value: 68 },
        ],
        linked_initiative_ids: ["init-hm-001"],
      },
      csat_score: {
        narrative: "Modest +0.2 vs previous period. The upgrade to self-service order-status + clearer returns-policy voice contribute most; returns-agent confusion (noted in customer feedback) was the last drag before the March fix.",
        history: [
          { at: "2025-07-01", value: 3.9 },
          { at: "2025-10-01", value: 4.0 },
          { at: "2026-01-01", value: 4.1 },
          { at: "2026-03-01", value: 4.3 },
        ],
      },
      monthly_conversations: {
        narrative: "Steady growth — +40k vs previous period. Primarily driven by expansion into 2 additional markets going live in Q1 (total markets_live rose from 14 → 16).",
        history: [
          { at: "2025-07-01", value: 310000 },
          { at: "2025-10-01", value: 350000 },
          { at: "2026-01-01", value: 380000 },
          { at: "2026-03-01", value: 420000 },
        ],
        linked_initiative_ids: ["init-hm-002"],
      },
      unknown_rate: {
        narrative: "Dropped 3 pts (12 → 9). Knowledge-base consolidation in March 2026 removed the single biggest source of agent confusion on returns queries.",
        history: [
          { at: "2025-07-01", value: 16 },
          { at: "2025-10-01", value: 14 },
          { at: "2026-01-01", value: 12 },
          { at: "2026-03-01", value: 9 },
        ],
        linked_initiative_ids: ["init-hm-001"],
      },
    },
    governance: {
      executive_review_frequency: "semi-annual",
      business_review_frequency: "quarterly",
      operational_review_frequency: "weekly",
      executive_sponsor: "Helena (VP Customer Service)",
      last_business_review: "2026-03-15",
      next_business_review: "2026-06-15",
      stakeholders: [
        { name: "Helena Lindqvist", role: "VP Customer Service", email: "helena.l@hm.com", is_sponsor: true },
        { name: "Marcus Berg", role: "Head of Digital", email: "marcus.b@hm.com" },
        { name: "Erika Sund", role: "Customer Ops Lead" },
        { name: "Anders Palm", role: "IT / Integration Architect", email: "anders.p@hm.com" },
      ],
      last_business_review_summary: "Q1 recap confirmed +6 pts automation vs previous period. Committed to: returns self-service at 40% containment, 4 EU market expansion, membership agent. Helena raised CSAT concern on returns-policy confusion — fix landed late March.",
      next_business_review_focus: [
        "Review returns-agent containment metric across 3 EU markets",
        "Go-live readiness for PL + CZ + AT + NL expansion",
        "Membership agent post-launch CSAT check-in",
        "Q3 capacity planning: voice-channel feasibility",
      ],
    },
    br_context: {
      meeting_title: "H&M Business Review",
      meeting_date: "2026-03-15",
      attendees: [
        "Helena (VP Customer Service, H&M)",
        "Marcus (Head of Digital, H&M)",
        "boost CSM",
        "boost Solutions Lead",
      ],
      agenda_style: "timed",
      agenda_items: [
        {
          time: "09:00",
          topic: "Welcome + Q1 performance recap",
          owner: "boost CSM",
          notes: "Quick hellos + Q1 snapshot: automation 62% → 68%, CSAT 4.1 → 4.3, 420k monthly convos (up 40k). Frame the story: returns + order-status agents carried the quarter.",
        },
        {
          time: "09:20",
          topic: "Top agents: automation, CSAT, containment",
          owner: "boost CSM",
          notes: "Walk through agent-by-agent performance: order-status (84%/82% SE/DE), returns (rolling out, DE blocked), membership (71% containment on authenticated sessions). Anchor on specific numbers, avoid vague language.",
        },
        {
          time: "09:45",
          topic: "Customer feedback + friction themes",
          owner: "H&M",
          notes: "Helena to share the returns-policy confusion quote from the March survey + how the KB fix landed. Good opener for the DE Legal blocker conversation.",
        },
        { time: "10:15", topic: "Q2 roadmap + new market expansion", owner: "boost Solutions Lead" },
        { time: "10:45", topic: "Actions + next steps", owner: "All" },
      ],
    },
    accepted_initiatives: [
      {
        initiative_id: "init-hm-001",
        issue_id: "issue-returns",
        title: "Returns self-service — deflect 40% of return inquiries",
        accepted_at: "2026-03-15",
        accepted_by: "Helena",
        status: "in-progress",
        target_quarter: "2026-Q2",
        start_date: "2026-04-01",
        end_date: "2026-06-15",
        owner: "Marcus",
        theme: "automation",
        business_impact: "~40% containment on returns = ~8,000 agent-hours/quarter saved.",
        rag_status: "green",
        tasks: [
          { title: "Returns-policy knowledge base consolidated", done: true },
          { title: "Return-window rules encoded per EU market", done: true },
          { title: "Label-generation API integration", done: false },
          { title: "UAT in DE + SE", done: false },
          { title: "Roll out to remaining 14 markets" },
        ],
        notes: "DE regional policy-rule clarification from Legal still pending; may push end date one week if not resolved by Apr 25.",
      },
      {
        initiative_id: "init-hm-002",
        issue_id: "issue-markets",
        title: "Launch in 4 additional EU markets",
        accepted_at: "2026-03-15",
        accepted_by: "Helena",
        status: "accepted",
        target_quarter: "2026-Q3",
        start_date: "2026-05-01",
        end_date: "2026-09-30",
        owner: "boost Solutions Lead",
        theme: "expansion",
        business_impact: "Extends coverage to 20 markets; 12M additional customer-facing interactions/year.",
        rag_status: "green",
        tasks: [
          { title: "Market-selection decision (PL, CZ, AT, NL)", done: true },
          { title: "Local-language training data sourced" },
          { title: "Per-market agent variants configured" },
          { title: "Soft-launch with PL" },
          { title: "Full rollout + CSAT monitoring" },
        ],
      },
      {
        initiative_id: "init-hm-003",
        issue_id: "issue-membership",
        title: "Membership agent — benefits + tier queries",
        accepted_at: "2026-03-15",
        accepted_by: "Helena",
        status: "in-progress",
        target_quarter: "2026-Q2",
        start_date: "2026-04-01",
        end_date: "2026-05-30",
        owner: "Marcus",
        theme: "adoption",
        business_impact: "H&M Members = 180M globally; highest-LTV segment.",
        rag_status: "amber",
        tasks: [
          { title: "Loyalty-system OAuth integration", done: true },
          { title: "Tier-benefits knowledge graph", done: false },
          { title: "Personalised-offer lookup flow" },
          { title: "Soft launch to 5% of members" },
        ],
        notes: "Loyalty-system integration is the critical path; if OAuth scopes aren't finalised by Apr 20, end date slips to mid-Jun.",
      },
    ],
    recommendations: [
      {
        title: "Scale returns agent to apparel vertical first",
        rationale: "Apparel drives 60% of return volume and has the cleanest data. Expected 40%+ containment within 6 weeks.",
        weight: 0.92,
        confidence: "high",
        urgency: "immediate",
        tags: ["automation", "quick-win"],
        expected_outcomes: [
          "40%+ of apparel return-reason intents resolved without an agent",
          "Single-source return-policy knowledge base live in 3 EU markets",
          "Refund-label generation fully automated for qualifying returns",
          "~8,000 agent-hours/quarter freed for complex cases",
        ],
        prerequisites: [
          { label: "Address-verification service live", met: true },
          { label: "Returns-policy KB consolidated", met: true },
          { label: "Legal sign-off on regional policy differences (DE pending)", met: false },
          { label: "Carrier-API credentials for label generation", met: false },
        ],
      },
      {
        title: "Add voice channel for order-status queries",
        rationale: "Chat handles order status well; voice lacks self-service. 30% of voice calls are order status. High ROI on voice deflection.",
        weight: 0.78,
        confidence: "medium",
        urgency: "this-quarter",
        tags: ["voice", "expansion"],
        expected_outcomes: [
          "25% call-volume reduction on order-status voice queue",
          "Mean time to status answer: from 2min hold to <30s self-service",
          "Voice-status agent live in SE + DE markets first",
        ],
        prerequisites: [
          { label: "Carrier tracking-API integration (already live for chat)", met: true },
          { label: "Voice infrastructure (Twilio / Genesys) provisioned", met: false },
          { label: "Voice-NLU training data (SE + DE)", met: false },
        ],
      },
      {
        title: "Integrate loyalty system for authenticated-member flows",
        rationale: "Membership agent is ready but sits behind auth. BankID-style SSO + loyalty-system integration unlocks personalised flows.",
        weight: 0.64,
        confidence: "medium",
        urgency: "this-year",
        tags: ["integration", "adoption"],
        expected_outcomes: [
          "Personalised benefit + tier lookups for 180M H&M Members",
          "Order-status + returns agents become member-aware (tier perks)",
          "Platform for future: early access, birthday rewards, bundle nudges",
        ],
        prerequisites: [
          { label: "OAuth scopes defined with loyalty team", met: false },
          { label: "Token-refresh flow designed", met: false },
          { label: "PII-minimisation review signed off", met: false },
        ],
      },
    ],
    agent_swot: {
      "order-status": {
        strengths: ["High automation (84%)", "Low CSAT complaint rate", "Simple intent, clean NLU"],
        weaknesses: ["Limited to chat; voice under-served", "No personalised ETA for logistics edge cases"],
        opportunities: ["Voice deflection", "Carrier-API integration for real-time tracking"],
        threats: ["Peak-season courier lag produces user frustration the agent can't resolve"],
      },
      returns: {
        strengths: ["Clear return-policy knowledge base", "Reuses address-verification from order-status"],
        weaknesses: ["Manual fallback for item-specific refund rules", "Regional policy drift (EU vs US vs UK)"],
        opportunities: ["Automated refund-rule engine", "Direct-ship label generation"],
        threats: ["Regulatory policy changes in EU consumer-rights directive"],
      },
    },
    uat_status: [
      {
        agent_key: "order-status",
        market: "SE",
        status: "green",
        note: "Live, 84% automation.",
        history: [
          { at: "2026-01-10", status: "amber", note: "Soft-launch: initial NLU tuning." },
          { at: "2025-11-20", status: "red", note: "Build kickoff." },
        ],
      },
      { agent_key: "order-status", market: "DE", status: "green", note: "Live, 79% automation." },
      {
        agent_key: "returns",
        market: "SE",
        status: "amber",
        note: "Rolling out — policy engine still manual in 30% of cases.",
        history: [
          { at: "2026-02-28", status: "red", note: "Pre-rollout: blocked on KB consolidation." },
        ],
      },
      {
        agent_key: "returns",
        market: "DE",
        status: "red",
        note: "Blocked on regional refund-rule clarification from Legal.",
        history: [
          { at: "2026-03-10", status: "amber", note: "Initial UAT attempted; Legal flagged policy gaps." },
        ],
      },
      {
        agent_key: "membership",
        market: "Global",
        status: "amber",
        note: "Needs loyalty-system integration — ETA Q2.",
        history: [
          { at: "2026-02-01", status: "red", note: "Integration scope finalised with loyalty team." },
        ],
      },
    ],
    benchmarks: {
      automation_rate: {
        peer_avg: 62,
        industry_avg: 55,
        label: "Automation %",
        definition: "Share of customer conversations resolved end-to-end by an AI agent, with no human handoff. Higher is better.",
        peer_cohort_description: "12 Nordic + EU retailers with >10M monthly customer interactions, all boost.ai customers.",
        interpretation: "Strongly ahead of peers (+6 pts) and the broader retail industry (+13 pts). Investment in the returns + order-status agents is the main driver.",
        percentile: 78,
      },
      csat_score: {
        peer_avg: 4.1,
        industry_avg: 3.9,
        label: "CSAT score",
        definition: "Post-conversation customer satisfaction score on a 5-point scale. Measured across all channels.",
        peer_cohort_description: "12 Nordic + EU retailers with >10M monthly customer interactions.",
        interpretation: "Slightly ahead of peers (+0.2). The Q1 improvement (4.1 → 4.3) came from the order-status agent upgrade.",
        percentile: 71,
      },
      unknown_rate: {
        peer_avg: 11,
        industry_avg: 14,
        label: "Unknown %",
        definition: "Share of user messages the AI agent couldn't confidently classify — a proxy for NLU coverage. Lower is better.",
        peer_cohort_description: "12 Nordic + EU retailers with >10M monthly customer interactions.",
        interpretation: "Well below peer average (-2 pts) and industry (-5 pts). Knowledge-base consolidation in March 2026 removed a major source of ambiguity.",
        percentile: 82,
      },
    },
    customer_feedback: [
      {
        theme: "Returns clarity",
        sentiment: "negative",
        quote: "I asked three times and got three different answers about the return window.",
        response: "Fix landed in late March — single-source return-policy knowledge base now authoritative.",
      },
      {
        theme: "Order status speed",
        sentiment: "positive",
        quote: "Got my tracking number in seconds, didn't have to wait on hold.",
      },
    ],
    agentic_outcomes: [
      {
        topic: "Order status",
        before: { label: "Avg handle time", value: "4 min 20 sec" },
        after: { label: "Avg handle time", value: "42 sec" },
        narrative: "Self-service flow with carrier integration deflects 84% of order-status queries without an agent touch.",
        evidence: [
          "84% containment rate measured across SE + DE over 6 weeks post-launch",
          "Carrier-tracking API integration reduced wait-for-agent calls by 70%",
          "CSAT on order-status queries held steady at 4.5/5 through the transition",
        ],
        validated_on: "2026-02-15",
      },
      {
        topic: "Returns",
        before: { label: "Policy-rule consistency", value: "3 conflicting answers" },
        after: { label: "Policy-rule consistency", value: "Single source of truth" },
        narrative: "Returns agent now authoritative on the return-window policy — quote-in-customer-feedback fix landed late March.",
        evidence: [
          "Consolidated 12 fragmented KB articles into 1 canonical policy tree",
          "Policy-conflict customer complaints dropped from 17/week to 0 in March",
          "Agent-side override rate fell from 45% to 8%",
        ],
        validated_on: "2026-03-28",
      },
      {
        topic: "Membership",
        before: { label: "Tier-query containment", value: "32%" },
        after: { label: "Tier-query containment", value: "71%" },
        narrative: "Loyalty-system integration unlocked personalised benefit lookups for 180M H&M Members.",
        evidence: [
          "71% tier-query containment across authenticated sessions",
          "OAuth scope review signed off — 180M members eligible",
          "Post-launch CSAT for membership interactions: 4.4/5",
        ],
        validated_on: "2026-03-10",
      },
    ],
  },

  /* ─── CBNA ────────────────────────────────────────
   * US community bank. Retail banking, branch locator, card
   * operations. BR March 2026 + follow-up hackathon. */
  cbna: {
    lifecycle: "live",
    touch_level: "high",
    has_cs_package: true,
    performance: {
      automation_rate: 54,
      previous_automation_rate: 48,
      csat_score: 4.1,
      previous_csat_score: 4.0,
      unknown_rate: 13,
      previous_unknown_rate: 16,
      escalation_rate: 17,
      previous_escalation_rate: 19,
      monthly_conversations: 95000,
      previous_monthly_conversations: 82000,
      markets_live: 1,
      active_agents: 7,
      previous_active_agents: 6,
      measured_from: "2026-01-01",
      measured_to: "2026-03-01",
    },
    governance: {
      executive_review_frequency: "annual",
      business_review_frequency: "quarterly",
      operational_review_frequency: "biweekly",
      executive_sponsor: "Head of Digital Banking",
      last_business_review: "2026-03-17",
      next_business_review: "2026-06-17",
    },
    br_context: {
      meeting_title: "CBNA Business Review",
      meeting_date: "2026-03-17",
      attendees: ["Head of Digital Banking (CBNA)", "VP Customer Operations (CBNA)", "boost CSM"],
      agenda_style: "timed",
      agenda_items: [
        { time: "10:00", topic: "Quarterly recap: volume, automation, CSAT" },
        { time: "10:20", topic: "Card operations agent deep-dive" },
        { time: "10:40", topic: "Hackathon preview — next 2 weeks" },
        { time: "11:00", topic: "Q2 roadmap" },
        { time: "11:20", topic: "Actions" },
      ],
    },
    accepted_initiatives: [
      {
        initiative_id: "init-cbna-001",
        issue_id: "issue-card-ops",
        title: "Card ops agent — lost/stolen + lock/unlock",
        accepted_at: "2026-03-17",
        accepted_by: "Head of Digital Banking",
        status: "in-progress",
        target_quarter: "2026-Q2",
        start_date: "2026-03-20",
        end_date: "2026-05-15",
        owner: "VP Customer Operations",
        theme: "automation",
        business_impact: "Handles 30% of card-ops volume; frees agents for fraud investigations.",
      },
      {
        initiative_id: "init-cbna-002",
        issue_id: "issue-hackathon",
        title: "Hackathon: 3 new intents in 2 weeks",
        accepted_at: "2026-03-17",
        accepted_by: "Head of Digital Banking",
        status: "in-progress",
        target_quarter: "2026-Q2",
        start_date: "2026-03-24",
        end_date: "2026-04-07",
        owner: "boost CSM",
        theme: "adoption",
        business_impact: "Proves rapid-iteration model; sets template for quarterly intent adds.",
      },
    ],
    recommendations: [
      {
        title: "Add fraud-first-response agent",
        rationale: "Fraud escalations average 4 min hold. Triage + first-response via agent = faster handoff, lower complaint rate.",
        weight: 0.86,
        confidence: "high",
        urgency: "this-quarter",
        tags: ["automation", "quality"],
      },
      {
        title: "SMS channel for branch-locator + hours",
        rationale: "Branch-locator is 18% of chat volume. SMS is lighter, matches community-bank customer profile.",
        weight: 0.55,
        confidence: "medium",
        urgency: "this-year",
        tags: ["expansion", "channel"],
      },
    ],
    agent_swot: {
      "account-balance": {
        strengths: ["Fast response", "Clean core-banking integration"],
        weaknesses: ["Can't show pending transactions in real time"],
        opportunities: ["Pending-transaction view via core-banking webhook"],
        threats: ["Core-banking migration planned for 2027 — will need re-integration"],
      },
      "card-ops": {
        strengths: ["Handles lock/unlock + lost/stolen flows"],
        weaknesses: ["No card-activation yet; limited replacement-card logistics"],
        opportunities: ["Expand to card-activation + dispute lodgement"],
        threats: ["Card-network rule changes (Visa / MC) require ongoing maintenance"],
      },
    },
    uat_status: [
      { agent_key: "account-balance", status: "green", note: "Live, 72% automation." },
      { agent_key: "card-ops", status: "amber", note: "Lock/unlock live; lost/stolen in UAT." },
      { agent_key: "branch-locator", status: "green", note: "Live, 88% automation." },
      { agent_key: "fraud-triage", status: "red", note: "Not started — new initiative." },
    ],
    benchmarks: {
      automation_rate: { peer_avg: 48, industry_avg: 42, label: "US community-bank peer cohort" },
      csat_score: { peer_avg: 4.0, industry_avg: 3.8, label: "US community-bank peer cohort" },
      escalation_rate: { peer_avg: 20, industry_avg: 24, label: "US community-bank peer cohort (lower is better)" },
    },
    customer_feedback: [
      {
        theme: "Card block speed",
        sentiment: "positive",
        quote: "Blocked my lost card in under a minute, got a new one in the mail three days later.",
      },
    ],
    agentic_outcomes: [
      {
        topic: "Card lock / unlock",
        before: { label: "Resolution path", value: "Call centre, 8 min hold" },
        after: { label: "Resolution path", value: "Self-service, 45 sec" },
        narrative: "Card-ops agent handles lost / stolen + lock / unlock end-to-end; agents now focus on fraud investigations.",
      },
      {
        topic: "Branch locator",
        before: { label: "Containment rate", value: "12%" },
        after: { label: "Containment rate", value: "88%" },
        narrative: "88% of branch + hours queries resolved without an agent — the simplest high-frequency use case shipped first, paid back fastest.",
      },
    ],
  },

  /* ─── DNA ─────────────────────────────────────────
   * Finnish telecom — mobile, broadband, TV. BR February 2026. */
  dna: {
    lifecycle: "live",
    touch_level: "strategic",
    has_cs_package: true,
    performance: {
      automation_rate: 71,
      previous_automation_rate: 66,
      csat_score: 4.2,
      previous_csat_score: 4.1,
      unknown_rate: 8,
      previous_unknown_rate: 11,
      escalation_rate: 9,
      previous_escalation_rate: 11,
      monthly_conversations: 240000,
      previous_monthly_conversations: 220000,
      markets_live: 1,
      active_agents: 14,
      previous_active_agents: 12,
      measured_from: "2025-11-01",
      measured_to: "2026-01-31",
    },
    governance: {
      executive_review_frequency: "semi-annual",
      business_review_frequency: "quarterly",
      operational_review_frequency: "weekly",
      executive_sponsor: "CCO",
      last_business_review: "2026-02-10",
      next_business_review: "2026-05-10",
    },
    br_context: {
      meeting_title: "DNA Business Review — February 2026",
      meeting_date: "2026-02-10",
      attendees: ["CCO (DNA)", "Head of Self-Service (DNA)", "boost CSM", "boost Architect"],
      agenda_style: "timed",
      agenda_items: [
        { time: "13:00", topic: "Q4 / January metrics recap" },
        { time: "13:20", topic: "Agent architecture walkthrough" },
        { time: "14:00", topic: "Voice-channel expansion" },
        { time: "14:30", topic: "2026 roadmap" },
        { time: "15:00", topic: "Next steps" },
      ],
    },
    accepted_initiatives: [
      {
        initiative_id: "init-dna-001",
        issue_id: "issue-voice",
        title: "Voice channel for outage triage",
        accepted_at: "2026-02-10",
        accepted_by: "CCO",
        status: "in-progress",
        target_quarter: "2026-Q2",
        start_date: "2026-02-15",
        end_date: "2026-06-30",
        owner: "Head of Self-Service",
        theme: "expansion",
        business_impact: "Outage spikes drive 40% of voice volume; self-service triage cuts hold times.",
      },
      {
        initiative_id: "init-dna-002",
        issue_id: "issue-ott",
        title: "TV / OTT troubleshooting agent",
        accepted_at: "2026-02-10",
        accepted_by: "CCO",
        status: "accepted",
        target_quarter: "2026-Q3",
        start_date: "2026-05-01",
        end_date: "2026-08-31",
        theme: "automation",
        business_impact: "OTT support is 15% of chat; fragmented across device types.",
      },
    ],
    recommendations: [
      {
        title: "Commit to voice-outage triage as top priority",
        rationale: "Outage voice volume is the single largest unaddressed inbound. Expected 25% call-volume reduction during outage events.",
        weight: 0.94,
        confidence: "high",
        urgency: "immediate",
        tags: ["voice", "automation"],
      },
      {
        title: "Consolidate broadband + mobile agent pairs",
        rationale: "Two siloed agents today; 18% of queries cross domains. Unified agent reduces handoff churn.",
        weight: 0.71,
        confidence: "medium",
        urgency: "this-quarter",
        tags: ["quality", "adoption"],
      },
    ],
    agent_swot: {
      "mobile-plan": {
        strengths: ["85% automation", "Deep integration with billing"],
        weaknesses: ["Limited multi-SIM handling"],
        opportunities: ["Family-plan management", "Contract-renewal nudges"],
        threats: ["Regulatory changes in EU roaming rules"],
      },
      broadband: {
        strengths: ["Outage-status lookup", "Speed-test triage"],
        weaknesses: ["Can't schedule technician visits"],
        opportunities: ["Technician scheduling via field-ops API"],
        threats: ["Fibre rollout creates data inconsistencies during transition"],
      },
    },
    uat_status: [
      { agent_key: "mobile-plan", status: "green", note: "85% automation." },
      { agent_key: "broadband", status: "green", note: "Outage lookup live." },
      { agent_key: "tv-ott", status: "amber", note: "Concept design only." },
      { agent_key: "voice-triage", status: "amber", note: "Voice pipeline in development." },
    ],
    benchmarks: {
      automation_rate: { peer_avg: 64, industry_avg: 58, label: "Nordic telecom peer cohort" },
      csat_score: { peer_avg: 4.0, industry_avg: 3.8, label: "Nordic telecom peer cohort" },
      unknown_rate: { peer_avg: 10, industry_avg: 13, label: "Nordic telecom peer cohort" },
    },
    customer_feedback: [
      {
        theme: "Outage updates",
        sentiment: "neutral",
        quote: "I got an answer about the outage but it wasn't specific to my area.",
        response: "Area-specific outage lookup rolling out Q2 as part of voice-triage initiative.",
      },
    ],
    agentic_outcomes: [
      {
        topic: "Mobile plan changes",
        before: { label: "Automation rate", value: "44%" },
        after: { label: "Automation rate", value: "85%" },
        narrative: "Billing-system integration unlocked end-to-end self-service plan changes including family-plan splits.",
      },
      {
        topic: "Outage triage",
        before: { label: "Voice hold time (outage spike)", value: "15+ min" },
        after: { label: "Voice hold time (outage spike)", value: "Under 2 min" },
        narrative: "Outage-triage voice agent intercepts 40% of spike volume with area-specific status, freeing human agents for affected-customer follow-up.",
      },
    ],
  },

  /* ─── JUNO ────────────────────────────────────────
   * Nordic digital services customer. Agent-assist focus. BR +
   * workshop October 2025. */
  juno: {
    lifecycle: "live",
    touch_level: "mid",
    has_cs_package: true,
    performance: {
      automation_rate: 58,
      previous_automation_rate: 51,
      csat_score: 4.0,
      previous_csat_score: 3.8,
      unknown_rate: 12,
      escalation_rate: 14,
      monthly_conversations: 45000,
      previous_monthly_conversations: 38000,
      markets_live: 1,
      active_agents: 5,
      previous_active_agents: 4,
      measured_from: "2025-07-01",
      measured_to: "2025-09-30",
    },
    governance: {
      executive_review_frequency: "annual",
      business_review_frequency: "quarterly",
      operational_review_frequency: "biweekly",
      last_business_review: "2025-10-12",
      next_business_review: "2026-01-12",
    },
    br_context: {
      meeting_title: "JUNO BR + Agent-Assist Workshop",
      meeting_date: "2025-10-12",
      attendees: ["Product Lead (JUNO)", "CX Ops Lead (JUNO)", "boost CSM", "boost Workshop Facilitator"],
      agenda_style: "timed",
      agenda_items: [
        { time: "10:00", topic: "Q3 recap + metrics" },
        { time: "10:30", topic: "Agent-assist mode — demo + walkthrough", owner: "boost Workshop Facilitator" },
        { time: "11:30", topic: "Hands-on: prototype top 3 agent-assist prompts", owner: "All" },
        { time: "13:00", topic: "Review prototypes + pick winners" },
        { time: "14:00", topic: "Q4 plan + go-live criteria" },
      ],
    },
    accepted_initiatives: [
      {
        initiative_id: "init-juno-001",
        issue_id: "issue-assist",
        title: "Agent-assist mode for human agents",
        accepted_at: "2025-10-12",
        accepted_by: "Product Lead",
        status: "in-progress",
        start_date: "2025-11-01",
        end_date: "2026-02-28",
        owner: "CX Ops Lead",
        theme: "adoption",
        business_impact: "Cuts agent handle-time by ~20% on complex queries.",
      },
    ],
    recommendations: [
      {
        title: "Double down on agent-assist before expanding self-service",
        rationale: "Human-agent productivity is the biggest near-term lever. Self-service expansion works better once agent-assist is bedded in.",
        weight: 0.81,
        confidence: "high",
        urgency: "this-quarter",
        tags: ["adoption", "quality"],
      },
    ],
    agent_swot: {
      "account-help": {
        strengths: ["Clear ownership", "Good knowledge-base coverage"],
        weaknesses: ["Small training set on edge cases"],
        opportunities: ["Agent-assist enrichment from human-agent traces"],
        threats: ["Talent churn in CX ops team may slow feedback loop"],
      },
    },
    uat_status: [
      { agent_key: "account-help", status: "green", note: "Live." },
      { agent_key: "agent-assist", status: "amber", note: "In pilot with 4 human agents." },
    ],
    benchmarks: {
      automation_rate: { peer_avg: 54, industry_avg: 48 },
      csat_score: { peer_avg: 3.9, industry_avg: 3.7 },
    },
  },

  /* ─── Moi ─────────────────────────────────────────
   * Finnish MVNO. Lean, digital-first. Performance Review +
   * Roadmap March 2026. */
  moi: {
    lifecycle: "live",
    touch_level: "mid",
    has_cs_package: true,
    performance: {
      automation_rate: 76,
      previous_automation_rate: 72,
      csat_score: 4.4,
      previous_csat_score: 4.3,
      unknown_rate: 6,
      previous_unknown_rate: 8,
      escalation_rate: 7,
      previous_escalation_rate: 9,
      monthly_conversations: 28000,
      previous_monthly_conversations: 26000,
      markets_live: 1,
      active_agents: 4,
      previous_active_agents: 4,
      measured_from: "2025-12-01",
      measured_to: "2026-02-28",
    },
    governance: {
      executive_review_frequency: "annual",
      business_review_frequency: "quarterly",
      operational_review_frequency: "monthly",
      executive_sponsor: "Head of CX",
      last_business_review: "2026-03-20",
      next_business_review: "2026-06-20",
    },
    br_context: {
      meeting_title: "Moi — Performance Review & Roadmap",
      meeting_date: "2026-03-20",
      attendees: ["Head of CX (Moi)", "boost CSM"],
      agenda_style: "numbered",
      agenda_items: [
        { topic: "Performance highlights" },
        { topic: "Two-pager: agents + automation" },
        { topic: "2026 roadmap + capacity planning" },
        { topic: "Quick wins for Q2" },
      ],
    },
    accepted_initiatives: [
      {
        initiative_id: "init-moi-001",
        issue_id: "issue-roaming",
        title: "Roaming FAQ agent — EU + long-haul",
        accepted_at: "2026-03-20",
        accepted_by: "Head of CX",
        status: "accepted",
        start_date: "2026-04-15",
        end_date: "2026-06-30",
        theme: "automation",
        business_impact: "Seasonal spike in May-Aug; roaming questions are ~12% of chat volume.",
      },
    ],
    recommendations: [
      {
        title: "Keep team lean — MVNO economics reward high automation / low headcount",
        rationale: "Moi is already at 76% automation with 4 agents. Further expansion should be automation-first, not headcount-first.",
        weight: 0.88,
        confidence: "high",
        urgency: "exploratory",
        tags: ["quality", "adoption"],
      },
      {
        title: "Explore voice-first for the 55+ segment",
        rationale: "25% of Moi customers are 55+; chat adoption lags there. Voice keeps the segment served without expanding agent count.",
        weight: 0.6,
        confidence: "medium",
        urgency: "this-year",
        tags: ["voice", "expansion"],
      },
    ],
    agent_swot: {
      billing: {
        strengths: ["Very high automation (88%)", "Simple pricing model helps"],
        weaknesses: ["No support for one-off discounts or credits"],
        opportunities: ["Proactive bill-shock alerts"],
        threats: ["Competitor price moves can spike enquiry volume overnight"],
      },
    },
    uat_status: [
      { agent_key: "billing", status: "green", note: "88% automation." },
      { agent_key: "roaming", status: "red", note: "Not started." },
    ],
    benchmarks: {
      automation_rate: { peer_avg: 62, industry_avg: 55, label: "MVNO peer cohort" },
      csat_score: { peer_avg: 4.1, industry_avg: 3.9 },
    },
  },

  /* ─── Sanoma ──────────────────────────────────────
   * Nordic media + learning group. Subscription + publication
   * access + learning-platform CX. Inspiration session March 2026. */
  sanoma: {
    lifecycle: "live",
    touch_level: "high",
    has_cs_package: true,
    performance: {
      automation_rate: 63,
      previous_automation_rate: 58,
      csat_score: 4.0,
      previous_csat_score: 3.9,
      unknown_rate: 10,
      escalation_rate: 12,
      monthly_conversations: 68000,
      previous_monthly_conversations: 62000,
      markets_live: 2,
      active_agents: 6,
      previous_active_agents: 5,
      measured_from: "2025-12-01",
      measured_to: "2026-02-28",
    },
    governance: {
      executive_review_frequency: "annual",
      business_review_frequency: "quarterly",
      operational_review_frequency: "monthly",
      executive_sponsor: "Chief Digital Officer",
      last_business_review: "2026-03-08",
      next_business_review: "2026-06-08",
    },
    br_context: {
      meeting_title: "Sanoma — Inspiration Session",
      meeting_date: "2026-03-08",
      attendees: ["CDO (Sanoma)", "Learning Platform PM (Sanoma)", "boost CSM"],
      agenda_style: "timed",
      agenda_items: [
        { time: "09:30", topic: "Welcome + context" },
        { time: "09:45", topic: "External case stories — media + learning" },
        { time: "10:30", topic: "Inspiration: Sanoma's unique agent angles" },
        { time: "11:15", topic: "Top 3 candidates to explore" },
        { time: "12:00", topic: "Close + owners" },
      ],
    },
    accepted_initiatives: [
      {
        initiative_id: "init-sanoma-001",
        issue_id: "issue-learning",
        title: "Student-support agent for learning platform",
        accepted_at: "2026-03-08",
        accepted_by: "Learning Platform PM",
        status: "accepted",
        start_date: "2026-04-01",
        end_date: "2026-08-15",
        owner: "Learning Platform PM",
        theme: "expansion",
        business_impact: "Students are underserved during exam periods; agent off-loads teacher helpdesk.",
      },
    ],
    recommendations: [
      {
        title: "Launch learning-platform agent ahead of autumn term",
        rationale: "Usage spikes in August–September; shipping by mid-August captures full back-to-school cohort.",
        weight: 0.9,
        confidence: "high",
        urgency: "this-quarter",
        tags: ["expansion", "automation"],
      },
      {
        title: "Pilot a personalised-content concierge",
        rationale: "Subscription-heavy business benefits from discovery guidance; conversational surface fits Sanoma's brand.",
        weight: 0.55,
        confidence: "low",
        urgency: "exploratory",
        tags: ["product", "adoption"],
      },
    ],
    agent_swot: {
      subscription: {
        strengths: ["Covers cancellations + pauses + upgrades"],
        weaknesses: ["Limited cross-publication knowledge"],
        opportunities: ["Bundle optimisation nudges"],
        threats: ["Newspaper-market structural decline may reduce chat volume"],
      },
    },
    uat_status: [
      { agent_key: "subscription", status: "green", note: "75% automation." },
      { agent_key: "learning-student", status: "red", note: "Design phase." },
    ],
    benchmarks: {
      automation_rate: { peer_avg: 56, industry_avg: 50, label: "Media peer cohort" },
      csat_score: { peer_avg: 3.9, industry_avg: 3.7 },
    },
  },
};

/**
 * Look up a fixture by company-pattern key. Returns `null` when no
 * fixture exists for the given key — callers should fall back to
 * `pattern.prefill` alone.
 */
export function getCustomerFixture(key: string): Partial<Customer> | null {
  return CUSTOMER_FIXTURES[key] ?? null;
}
