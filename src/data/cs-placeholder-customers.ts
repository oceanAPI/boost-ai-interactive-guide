import type { Customer } from "@/lib/types";

/* ──────────────────────────────────────────────────────────────
 *  Placeholder Planhat customers (mockup)
 *
 *  Stands in for the Planhat API we'll add later. Each record is a
 *  fully-populated `Customer` — the CE metadata slices that drive the
 *  CSM workspace sections — plus an `instances` list: the customer's
 *  boost.ai/AWS deployments (where their data lives). In production
 *  each selected instance is fetched via the AWS API to dynamically
 *  populate the sections; in this mockup the metadata is already
 *  consolidated on the record, so picking a customer "rains in" a
 *  complete LähiTapiola-class review.
 *
 *  Modeled on the reference deck (LähiTapiola & Turva): insurance-
 *  flavoured, 4-challenge narrative (Agentic · Personalised CX · Sales
 *  · Channels). Names + numbers are fictional.
 * ────────────────────────────────────────────────────────────── */

export interface PlaceholderInstance {
  /** AWS instance id — written into Customer.selected_instance_ids. */
  key: string;
  /** Human label, e.g. "Nordpol — Production (EU-North)". */
  label: string;
  /** Optional AWS region hint. */
  region?: string;
}

export interface PlaceholderCustomer extends Customer {
  /** Stable handle for the picker. */
  handle: string;
  /** The customer's boost.ai/AWS instances (data sources) — the
   *  instance-picker options. Selecting them drives the (future) AWS
   *  metadata fetch. */
  instances: PlaceholderInstance[];
}

/** Shared base so each record only states what differs. */
function base(): Pick<
  Customer,
  | "company_url"
  | "contact_name"
  | "contact_role"
  | "start_date"
  | "specific_requirements"
  | "channel_volumes"
  | "conversation_cost"
  | "currency"
  | "channels"
  | "pricing_model"
  | "deployment_markets"
  | "resources"
  | "integrations"
  | "custom_notes"
> {
  return {
    company_url: "",
    contact_name: "",
    contact_role: "",
    start_date: "",
    specific_requirements: "",
    channel_volumes: {},
    conversation_cost: "",
    currency: "EUR",
    channels: "both",
    pricing_model: "fixed",
    deployment_markets: 1,
    resources: { supporting_departments: [], knowledge_management: false },
    integrations: {},
    custom_notes: "",
  };
}

export const PLACEHOLDER_CUSTOMERS: PlaceholderCustomer[] = [
  {
    ...base(),
    handle: "nordpol",
    company_name: "Nordpol Vakuutus",
    company_url: "nordpol.fi",
    currency: "EUR",
    areas_of_interest: ["claims_agent", "coverage_agent", "invoice_agent", "discount_agent"],
    selected_instance_ids: ["nordpol-prod-eu", "nordpol-voice-eu"],
    instances: [
      { key: "nordpol-prod-eu", label: "Nordpol — Production", region: "eu-north-1" },
      { key: "nordpol-voice-eu", label: "Nordpol — Voice", region: "eu-north-1" },
      { key: "nordpol-sandbox", label: "Nordpol — Sandbox", region: "eu-north-1" },
    ],
    performance: {
      automation_rate: 66,
      previous_automation_rate: 46,
      csat_score: 4.3,
      previous_csat_score: 4.0,
      unknown_rate: 9,
      escalation_rate: 7,
      previous_escalation_rate: 15,
      monthly_conversations: 187000,
      markets_live: 2,
      active_agents: 5,
      measured_from: "2026-01-01",
      measured_to: "2026-05-31",
    },
    performance_details: {
      automation_rate: {
        narrative:
          "Automation climbed from 46% to 66% in two months after the claims agent went live and absorbed the bulk of status-check traffic.",
      },
    },
    benchmarks: {
      automation_rate: {
        peer_avg: 28,
        industry_avg: 31,
        label: "Agentic replies",
        peer_cohort_description: "16 Nordic insurers with activated agentic actions",
        interpretation: "Well ahead of the 28% Nordic insurance average for agentic replies.",
        percentile: 82,
      },
      csat_score: { peer_avg: 4.0, industry_avg: 3.9, label: "CSAT", percentile: 74 },
    },
    agentic_outcomes: [
      {
        topic: "Claims status",
        before: { label: "Avg resolution", value: "2 days" },
        after: { label: "Avg resolution", value: "Instant" },
        narrative: "Self-service claim status removed the #1 call driver.",
        evidence: ["84% contained in 4 weeks", "Escalations on claims down 24%"],
      },
      {
        topic: "Invoice due date",
        before: { label: "Handle time", value: "6 min (agent)" },
        after: { label: "Handle time", value: "40 sec (AI)" },
        narrative: "Customers postpone an invoice in-chat via the billing API.",
      },
    ],
    recommendations: [
      {
        title: "Expose discount-eligibility to the AI Agent",
        rationale: "Top negative-feedback topic; customers can't see if they're close to a discount.",
        urgency: "this-quarter",
        confidence: "high",
        weight: 0.9,
        effort: "low",
        value_label: "Cuts discount escalations, lifts cross-sell",
        expected_outcomes: ["Cut discount escalations", "Lift cross-sell"],
        how_to_proceed: [
          "Map the discount-eligibility rules to a read-only CRM endpoint.",
          "Wire the endpoint into the AI Agent for authenticated sessions.",
          "Pilot on the top discount-query intents, measure escalation drop.",
        ],
        considerations: [
          "Eligibility logic must stay in sync with the policy engine.",
          "Only surface to authenticated users to avoid leaking pricing rules.",
        ],
        resources: [
          { label: "CRM integration guide", url: "https://example.com/crm" },
          { label: "Authentication setup checklist" },
        ],
        tags: ["personalisation", "revenue"],
      },
      {
        title: "Automate document upload for claims",
        rationale: "Manual document chasing drives repeat contacts.",
        urgency: "this-quarter",
        confidence: "medium",
        weight: 0.75,
        effort: "medium",
        value_label: "Fewer repeat contacts on claims",
        expected_outcomes: ["Fewer repeat contacts"],
        how_to_proceed: [
          "Add a secure upload step to the claims journey.",
          "Connect the document store to the claims back-office.",
          "Acknowledge receipt automatically in-conversation.",
        ],
        considerations: [
          "File-type and size validation at the upload boundary.",
          "Retention policy for uploaded claim documents.",
        ],
        resources: [{ label: "Claims journey template" }],
        tags: ["personalisation"],
      },
      {
        title: "Proactive renewal reminders",
        rationale: "Renewal lapses are the largest avoidable churn driver.",
        urgency: "this-year",
        confidence: "medium",
        weight: 0.6,
        effort: "medium",
        value_label: "Reduces renewal-lapse churn",
        how_to_proceed: [
          "Identify policies approaching renewal from the policy engine.",
          "Trigger an account-aware outreach 30 days before renewal.",
        ],
        considerations: ["Outreach consent and channel preference per customer."],
        resources: [{ label: "Proactive outreach playbook" }],
        tags: ["personalisation", "revenue"],
      },
      {
        title: "Boost Voice on top claim intents",
        rationale: "Phone is the largest channel and the least automated.",
        urgency: "exploratory",
        confidence: "low",
        weight: 0.7,
        effort: "high",
        value_label: "Opens the highest-volume channel",
        how_to_proceed: [
          "Select the three highest-volume voice claim intents.",
          "Stand up a Boost Voice pilot on those intents.",
          "Measure automation and CSAT against the phone baseline.",
        ],
        considerations: [
          "Voice baseline is priced per minute, not per conversation.",
          "Requires a migration plan from the existing telephony stack.",
        ],
        resources: [{ label: "Boost Voice migration playbook" }],
        tags: ["channels", "voice"],
      },
    ],
    accepted_initiatives: [
      {
        initiative_id: "init-claims-docs",
        issue_id: "issue-docs",
        accepted_at: "2026-02-10T09:00:00Z",
        accepted_by: "csm@boost.ai",
        status: "in-progress",
        title: "Document upload for claims",
        theme: "automation",
        owner: "Nordpol CX",
        target_quarter: "2026-Q2",
        rag_status: "green",
        business_impact: "Removes manual document chasing on claims.",
        progress_history: [
          { date: "2026-03-01T09:00:00Z", rag_status: "amber", percent_complete: 30, note: "API scoping" },
          { date: "2026-05-01T09:00:00Z", rag_status: "green", percent_complete: 70, note: "Pilot live in FI" },
        ],
      },
      {
        initiative_id: "init-discount",
        issue_id: "issue-discount",
        accepted_at: "2026-02-10T09:00:00Z",
        accepted_by: "csm@boost.ai",
        status: "accepted",
        title: "Discount eligibility check",
        theme: "revenue",
        owner: "Nordpol CX",
        target_quarter: "2026-Q3",
        rag_status: "amber",
      },
    ],
    agent_swot: {
      claims_agent: {
        strengths: ["High containment", "Strong CSAT"],
        weaknesses: ["Edge-case claims escalate"],
        opportunities: ["Document upload"],
        threats: ["Regulatory wording changes"],
      },
    },
    uat_status: [
      { agent_key: "claims_agent", market: "FI", status: "green", note: "Live, stable" },
      { agent_key: "invoice_agent", market: "FI", status: "amber", note: "Billing API latency under review" },
    ],
    governance: {
      business_review_frequency: "quarterly",
      operational_review_frequency: "monthly",
      executive_sponsor: "Head of CX, Nordpol",
      last_business_review: "2026-03-03",
      next_business_review: "2026-06-03",
      last_business_review_summary: "Agreed claims document upload + discount eligibility for Q2/Q3.",
      next_business_review_focus: ["Discount eligibility go-live", "Voice pilot scoping"],
    },
    br_context: {
      meeting_title: "Q2 Business Review — Nordpol Vakuutus",
      meeting_date: "2026-06-03",
      agenda_style: "numbered",
      attendees: ["Head of CX, Nordpol", "CSM, boost.ai"],
      agenda_items: [
        { topic: "Value to date", subtitle: "Automation + CSAT" },
        { topic: "Personalised CX opportunities", subtitle: "Top intents → integrations" },
        { topic: "Success plan", subtitle: "Q2/Q3 initiatives" },
      ],
    },
    personalisation_opportunities: [
      {
        intent: "Check status of my claim",
        solution: "CRM API to check case statuses",
        impact_180d: "12k requests",
        requests: 12000,
        journey_steps: ["authentication", "intent recognition", "claims API", "LLM-generated status"],
      },
      {
        intent: "Eligibility for discounts",
        solution: "CRM API to check if customer is close to eligible discounts",
        impact_180d: "7k requests",
        requests: 7000,
        negative_feedback: true,
        journey_steps: ["authentication", "intent recognition", "policy API", "personalised offer"],
      },
      {
        intent: "Postpone invoice due date",
        solution: "Billing API to check open invoices and postpone by X days",
        impact_180d: "9k requests",
        requests: 9000,
        journey_steps: ["authentication", "intent recognition", "billing API", "confirm new date", "backend update"],
      },
    ],
    revenue_story: {
      proactivity_note:
        "The AI Agent surfaces proactively on the policy page, offering coverage advice with no obligation.",
      lead_metrics: [
        { value: "42%", label: "Higher lead conversion", sublabel: "with the AI Agent" },
        { value: "60%", label: "Win rate", sublabel: "on AI-Agent leads" },
        { value: "25k", label: "Annual leads", sublabel: "to Nordpol sales" },
      ],
      sell_journeys: [
        {
          title: "Cross-sell home cover",
          steps: ["intent recognition", "coverage gap check", "tailored quote", "login", "order link"],
        },
      ],
    },
  },

  {
    ...base(),
    handle: "trygghet",
    company_name: "Trygghet Försäkring",
    company_url: "trygghet.se",
    currency: "SEK",
    areas_of_interest: ["motor_agent", "home_agent", "payment_agent"],
    selected_instance_ids: ["trygghet-prod-se"],
    instances: [
      { key: "trygghet-prod-se", label: "Trygghet — Production", region: "eu-west-1" },
      { key: "trygghet-claims-se", label: "Trygghet — Claims service", region: "eu-west-1" },
    ],
    performance: {
      automation_rate: 53,
      previous_automation_rate: 44,
      csat_score: 4.1,
      previous_csat_score: 4.0,
      escalation_rate: 19,
      previous_escalation_rate: 28,
      monthly_conversations: 92000,
      markets_live: 1,
      active_agents: 4,
      measured_from: "2026-01-01",
      measured_to: "2026-05-31",
    },
    benchmarks: {
      automation_rate: {
        peer_avg: 28,
        industry_avg: 31,
        label: "Agentic replies",
        interpretation: "Around the Nordic insurance average; headroom on motor + claims.",
        percentile: 55,
      },
    },
    agentic_outcomes: [
      {
        topic: "Change mileage",
        before: { label: "Channel", value: "Phone" },
        after: { label: "Channel", value: "In-chat, automated" },
        narrative: "Mileage updates fully automated via the motor API.",
      },
    ],
    recommendations: [
      {
        title: "Add motor self-service: change mileage",
        rationale: "High-volume phone driver, easily automated.",
        urgency: "this-quarter",
        confidence: "high",
        weight: 0.85,
        effort: "low",
        value_label: "Deflects a top phone driver",
        how_to_proceed: [
          "Connect the motor-policy API for mileage updates.",
          "Add the change-mileage flow to the AI Agent.",
          "Route the highest-volume mileage calls to self-service.",
        ],
        considerations: ["Premium recalculation must confirm before commit."],
        resources: [{ label: "Motor API connector guide" }],
        tags: ["personalisation"],
      },
      {
        title: "Cross-sell home cover in-conversation",
        rationale: "Motor customers without home cover are a warm, untapped segment.",
        urgency: "this-year",
        confidence: "medium",
        weight: 0.65,
        effort: "medium",
        value_label: "New revenue from existing customers",
        how_to_proceed: [
          "Identify motor-only customers at the point of a service win.",
          "Offer a tailored home-cover quote in the conversation.",
        ],
        considerations: ["Only offer after the original intent is resolved."],
        resources: [{ label: "In-conversation sell journey template" }],
        tags: ["revenue"],
      },
      {
        title: "Extend self-service to voice",
        rationale: "Phone still carries the bulk of simple motor queries.",
        urgency: "exploratory",
        confidence: "low",
        weight: 0.7,
        effort: "high",
        value_label: "Automates the largest channel",
        how_to_proceed: [
          "Pilot Boost Voice on the change-mileage intent.",
          "Compare automation against the phone baseline.",
        ],
        considerations: ["Per-minute voice economics differ from chat."],
        resources: [{ label: "Boost Voice migration playbook" }],
        tags: ["channels", "voice"],
      },
    ],
    accepted_initiatives: [
      {
        initiative_id: "init-mileage",
        issue_id: "issue-motor",
        accepted_at: "2026-02-20T09:00:00Z",
        accepted_by: "csm@boost.ai",
        status: "in-progress",
        title: "Change mileage automation",
        theme: "automation",
        target_quarter: "2026-Q2",
        rag_status: "green",
        progress_history: [
          { date: "2026-04-01T09:00:00Z", rag_status: "green", percent_complete: 60, note: "Motor API connected" },
        ],
      },
    ],
    uat_status: [{ agent_key: "motor_agent", market: "SE", status: "green", note: "Live" }],
    governance: {
      business_review_frequency: "quarterly",
      executive_sponsor: "CX Lead, Trygghet",
      last_business_review: "2026-03-10",
      next_business_review: "2026-06-10",
    },
    br_context: {
      meeting_title: "Q2 Business Review — Trygghet Försäkring",
      meeting_date: "2026-06-10",
      agenda_style: "numbered",
      agenda_items: [{ topic: "Value to date" }, { topic: "Motor self-service roadmap" }],
    },
    personalisation_opportunities: [
      {
        intent: "Change mileage on car",
        solution: "Motor API to update registered mileage",
        impact_180d: "5k requests",
        requests: 5000,
        journey_steps: ["authentication", "intent recognition", "select car", "enter new mileage", "confirm", "backend update"],
      },
      {
        intent: "Change contact information",
        solution: "CRM API to update customer info",
        impact_180d: "4k requests",
        requests: 4000,
        negative_feedback: true,
        journey_steps: ["authentication", "intent recognition", "CRM API", "confirm"],
      },
    ],
    revenue_story: {
      proactivity_note: "Proactive home-insurance nudge for new-mover customers.",
      lead_metrics: [
        { value: "150", label: "Upsales", sublabel: "in first week" },
        { value: "12 pp", label: "Automation lift", sublabel: "after orchestration" },
      ],
    },
  },

  {
    ...base(),
    handle: "aspire",
    company_name: "Aspire General Insurance",
    company_url: "aspiregeneral.com",
    currency: "USD",
    channels: "voice",
    areas_of_interest: ["claims_agent", "payment_agent", "quote_agent"],
    selected_instance_ids: ["aspire-prod-us", "aspire-voice-us"],
    instances: [
      { key: "aspire-prod-us", label: "Aspire — Production", region: "us-east-1" },
      { key: "aspire-voice-us", label: "Aspire — Voice", region: "us-east-1" },
    ],
    performance: {
      automation_rate: 53,
      previous_automation_rate: 43,
      csat_score: 4.28,
      escalation_rate: 5,
      previous_escalation_rate: 47,
      monthly_conversations: 37000,
      markets_live: 1,
      active_agents: 4,
      measured_from: "2026-02-01",
      measured_to: "2026-05-31",
    },
    performance_details: {
      automation_rate: {
        narrative:
          "Voice-AI breached a 43% completion ceiling to 81% on high-frequency claims, dropping human handovers to 5%.",
      },
    },
    benchmarks: {
      automation_rate: { peer_avg: 35, industry_avg: 31, label: "Voice automation", percentile: 88 },
    },
    agentic_outcomes: [
      {
        topic: "Claims completion (Voice)",
        before: { label: "Completion", value: "43%" },
        after: { label: "Completion", value: "81%" },
        narrative: "Specialized Voice-AI journey captures damage severity + location to generate case files.",
        evidence: ["Human handovers 47% → 5%", "CSAT 4.28"],
      },
    ],
    recommendations: [
      {
        title: "Extend voice automation to coverage verification",
        rationale: "Next-highest voice call driver after claims.",
        urgency: "this-quarter",
        confidence: "high",
        weight: 0.8,
        effort: "medium",
        value_label: "Deflects the #2 voice driver",
        how_to_proceed: [
          "Map coverage-verification logic to the policy API.",
          "Add the verification flow to the existing Boost Voice agent.",
          "Roll out to the highest-volume coverage intents first.",
        ],
        considerations: ["Read-only policy access; no changes via voice initially."],
        resources: [{ label: "Voice agent extension guide" }],
        tags: ["channels", "voice"],
      },
      {
        title: "Authenticate the chat channel",
        rationale: "Unauthenticated chat caps answers at generic, non-account content.",
        urgency: "this-quarter",
        confidence: "high",
        weight: 0.9,
        effort: "low",
        value_label: "Unlocks account-aware answers",
        how_to_proceed: [
          "Add the existing auth step to the chat entry point.",
          "Surface account-aware answers on the top billing intents.",
        ],
        considerations: ["Reuse the voice-channel auth pattern already in place."],
        resources: [{ label: "Authentication setup checklist" }],
        tags: ["personalisation"],
      },
      {
        title: "Proactive claim-status updates",
        rationale: "Status-chasing calls are repetitive and easily pre-empted.",
        urgency: "this-year",
        confidence: "medium",
        weight: 0.6,
        effort: "high",
        value_label: "Removes status-chasing contacts",
        how_to_proceed: [
          "Subscribe to claim-status changes from the back-office.",
          "Send account-aware updates at each status transition.",
        ],
        considerations: ["Channel preference and quiet-hours handling."],
        resources: [{ label: "Proactive outreach playbook" }],
        tags: ["personalisation", "channels"],
      },
    ],
    accepted_initiatives: [
      {
        initiative_id: "init-voice-coverage",
        issue_id: "issue-voice",
        accepted_at: "2026-03-01T09:00:00Z",
        accepted_by: "csm@boost.ai",
        status: "accepted",
        title: "Voice coverage verification",
        theme: "automation",
        target_quarter: "2026-Q3",
        rag_status: "amber",
      },
    ],
    uat_status: [{ agent_key: "claims_agent", status: "green", note: "Bilingual EN/ES live" }],
    governance: {
      business_review_frequency: "quarterly",
      executive_sponsor: "VP Operations, Aspire",
      last_business_review: "2026-03-15",
      next_business_review: "2026-06-15",
    },
    br_context: {
      meeting_title: "Q2 Business Review — Aspire General Insurance",
      meeting_date: "2026-06-15",
      agenda_style: "numbered",
      agenda_items: [{ topic: "Voice automation results" }, { topic: "Coverage verification rollout" }],
    },
    personalisation_opportunities: [
      {
        intent: "Make a claim (Voice)",
        solution: "Voice journey capturing damage severity + location",
        impact_180d: "37k monthly calls",
        requests: 37000,
        journey_steps: ["phone + ZIP auth", "intent recognition", "capture damage details", "generate case file", "confirm"],
      },
    ],
    revenue_story: {
      proactivity_note: "Voice agent offers quote upgrades during coverage calls.",
      lead_metrics: [
        { value: "2x", label: "Service capacity", sublabel: "vs human team" },
        { value: "+37k", label: "Monthly calls", sublabel: "handled" },
      ],
    },
  },
];

/** Fuzzy-search placeholder customers by company name. Empty query
 *  returns all (so the dropdown can show suggestions on focus). */
export function searchPlaceholderCustomers(query: string): PlaceholderCustomer[] {
  const q = query.trim().toLowerCase();
  if (!q) return PLACEHOLDER_CUSTOMERS;
  return PLACEHOLDER_CUSTOMERS.filter((c) => c.company_name.toLowerCase().includes(q));
}
