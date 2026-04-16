/* ─────────────────────────────────────────────
 *  Default content for all sections
 *
 *  These are the fallback values when no industry-
 *  specific override exists. Written for generic
 *  "financial services" positioning.
 *
 *  {{company_name}} is replaced at render time.
 * ───────────────────────────────────────────── */

import type { SectionContentMap } from "./_types";

export const DEFAULTS: SectionContentMap = {

  // ─── Hero ───
  hero: {
    tagline: "Your AI-Powered Customer Experience",
    subtitle: "A tailored automation strategy built for {{company_name}}",
    highlights: [
      "80-90% automation rate across customer-facing channels",
      "6-8 weeks from kickoff to production",
      "Enterprise-grade security and compliance built in",
      "Seamless human handoff when customers need it most",
    ],
  },

  // ─── Case Studies ───
  "case-studies": {
    sectionTitle: "Proven Results",
    sectionSubtitle: "Real outcomes from financial services organizations using boost.ai",
    featuredIds: [], // empty = show all
  },

  // ─── Trust & Validation ───
  "trust-validation": {
    sectionTitle: "Why boost.ai",
    sectionSubtitle: "Building confidence that the technology delivers — today, not someday",
    platformStats: [
      { label: "Enterprise Customers", value: "500+", detail: "across financial services globally" },
      { label: "Conversations Handled", value: "2B+", detail: "and growing every day" },
      { label: "Languages Supported", value: "100+", detail: "with native NLU models" },
      { label: "Average Automation", value: "85%", detail: "across deployed customers" },
    ],
    journeySteps: [
      {
        title: "Discovery & Alignment",
        description: "Map your top inquiry types, define automation targets, identify integration points",
        duration: "Week 1-2",
        milestone: "Solution blueprint signed off",
      },
      {
        title: "Build & Configure",
        description: "Configure specialist agents, load NLP models, connect to your systems",
        duration: "Week 3-4",
        milestone: "Agents handling test traffic",
      },
      {
        title: "Test & Validate",
        description: "UAT with your team, accuracy testing, human handoff validation",
        duration: "Week 5-6",
        milestone: ">95% NLP accuracy confirmed",
      },
      {
        title: "Launch & Optimize",
        description: "Controlled rollout, real-time monitoring, continuous tuning from live data",
        duration: "Week 7-8",
        milestone: "Full production, automation targets met",
      },
    ],
    industryProof: [
      {
        title: "Financial Services Focus",
        description: "Purpose-built for banking, insurance, and wealth management — not a generic chatbot retro-fitted",
        stat: "10+ years in FS",
      },
      {
        title: "Regulatory Ready",
        description: "SOC 2, GDPR, and financial compliance guardrails are native, not bolted on",
        stat: "Zero data leaks",
      },
      {
        title: "No Hallucination Guarantee",
        description: "Controlled generation with source-grounded responses — no making things up",
        stat: "99.9% accuracy",
      },
    ],
    analystQuotes: [
      {
        source: "Gartner",
        quote: "boost.ai is a leader in conversational AI for enterprise customer service",
        year: "2024",
      },
      {
        source: "Forrester",
        quote: "Strong performer with exceptional NLU accuracy and financial services depth",
        year: "2024",
      },
    ],
  },

  // ─── Voice ───
  voice: {
    sectionTitle: "Voice AI",
    sectionSubtitle: "Intelligent voice automation that understands natural speech — not rigid IVR menus",
    capabilities: [
      {
        title: "Natural Speech Understanding",
        description: "Customers speak naturally — no 'press 1 for billing.' The AI understands intent from free-form speech.",
        icon: "microphone",
      },
      {
        title: "Real-Time Sentiment Detection",
        description: "Monitors tone and frustration levels in real-time, escalating to human agents when needed.",
        icon: "heart-pulse",
      },
      {
        title: "Seamless Agent Handoff",
        description: "Full conversation context, intent, and sentiment transferred to the human agent — no repeating.",
        icon: "headset",
      },
      {
        title: "Multi-Language Support",
        description: "Native voice models for 100+ languages with accent and dialect handling.",
        icon: "globe",
      },
    ],
    useCases: [
      {
        title: "Claims FNOL",
        scenario: "Customer calls to report a new claim after an incident",
        outcome: "AI captures all FNOL details, creates claim record, and schedules adjuster — 3 min avg",
      },
      {
        title: "Payment & Billing",
        scenario: "Customer calls about a missed payment or billing question",
        outcome: "AI authenticates, retrieves balance, processes payment or sets up arrangement",
      },
      {
        title: "Account Servicing",
        scenario: "Customer needs address change, card replacement, or PIN reset",
        outcome: "AI handles end-to-end with identity verification — no human needed",
      },
    ],
    stats: [
      { label: "Avg call duration reduction", value: "60%" },
      { label: "First-call resolution", value: "78%" },
      { label: "IVR replacement savings", value: "$2.4M/yr" },
    ],
  },

  // ─── Platform & Vision (was Core Components) ───
  "platform-vision": {
    sectionTitle: "Platform Components",
    sectionSubtitle: "The building blocks that power your AI customer experience",
    components: [
      {
        id: "hybrid-ai",
        name: "Hybrid AI Engine",
        tagline: "Best of both worlds",
        description: "Combines rule-based precision for structured workflows with generative AI for natural conversation. You control what gets generated vs. what stays scripted.",
        features: [
          "Intent-based routing with 99%+ accuracy",
          "Generative responses grounded in approved sources",
          "Per-topic control: scripted, generated, or hybrid",
          "Real-time hallucination detection and blocking",
        ],
        icon: "brain-circuit",
      },
      {
        id: "staging",
        name: "Staging Environment",
        tagline: "Test before you ship",
        description: "Full staging environment mirrors production — test new intents, flows, and integrations without risking live traffic.",
        features: [
          "One-click promote from staging to production",
          "A/B testing for response variants",
          "Regression testing against conversation logs",
          "Rollback in seconds if issues arise",
        ],
        icon: "flask",
      },
      {
        id: "human-chat",
        name: "Human Chat Integration",
        tagline: "Seamless escalation",
        description: "When AI can't resolve, hand off to a human agent with full context. Supports Genesys, Salesforce, Zendesk, and 20+ platforms.",
        features: [
          "Full conversation history transferred",
          "Intent and sentiment data passed to agent",
          "Configurable escalation triggers",
          "Agent can see AI suggestions in real-time",
        ],
        icon: "headset",
      },
      {
        id: "analytics",
        name: "Conversation Analytics",
        tagline: "Insights that drive improvement",
        description: "Deep analytics on every conversation — what's working, what's not, and where to focus next.",
        features: [
          "Real-time automation rate dashboard",
          "Topic trend analysis and emerging intents",
          "Customer satisfaction correlation",
          "AI trainer recommendations for improvement",
        ],
        icon: "chart-bar",
      },
      {
        id: "test-studio",
        name: "Test Studio",
        tagline: "Quality at scale",
        description: "Automated testing framework for conversational AI — run thousands of test conversations and validate accuracy before every release.",
        features: [
          "Batch testing with expected outcome validation",
          "NLU accuracy regression detection",
          "Integration endpoint testing",
          "Scheduled test runs with alerting",
        ],
        icon: "microscope",
      },
    ],
  },

  // ─── Impact: CSAT ───
  "impact-csat": {
    sectionTitle: "Impact on Customer Satisfaction",
    sectionSubtitle: "How AI automation actually improves the customer experience",
    metrics: [
      { label: "CSAT Score", before: "3.8 / 5", after: "4.5 / 5", improvement: "+18%" },
      { label: "First Response Time", before: "8 min", after: "< 5 sec", improvement: "-99%" },
      { label: "First Contact Resolution", before: "62%", after: "84%", improvement: "+35%" },
      { label: "Customer Effort Score", before: "4.2", after: "2.1", improvement: "-50%" },
    ],
    narrative: "When AI handles routine inquiries instantly and accurately, human agents are freed to focus on complex cases where empathy and expertise matter most. The result: faster resolution for simple issues, better service for complex ones, and higher satisfaction across the board.",
    calloutStat: { value: "+18%", label: "average CSAT improvement" },
  },

  // ─── Impact: Automation ───
  "impact-automation": {
    sectionTitle: "Automation Impact",
    sectionSubtitle: "From manual processing to intelligent automation at scale",
    metrics: [
      { label: "Automation Rate", before: "0-15%", after: "80-90%", improvement: "5-6× increase" },
      { label: "Avg Handle Time", before: "8 min", after: "1.5 min", improvement: "-81%" },
      { label: "Conversations/Month", before: "Limited by staff", after: "Unlimited", improvement: "∞ scale" },
      { label: "After-Hours Coverage", before: "0%", after: "100%", improvement: "24/7" },
    ],
    narrative: "Automation isn't about replacing humans — it's about handling the 80% of repetitive inquiries so your team can focus on the 20% that actually need them. The AI learns continuously from every conversation, getting smarter over time.",
    calloutStat: { value: "85%", label: "average automation rate" },
  },

  // ─── Impact: Data ───
  "impact-data": {
    sectionTitle: "Data & Insights Impact",
    sectionSubtitle: "Every conversation becomes a source of business intelligence",
    metrics: [
      { label: "Conversations Analyzed", before: "5% (sampled)", after: "100%", improvement: "20× coverage" },
      { label: "Insight Latency", before: "Monthly reports", after: "Real-time", improvement: "Instant" },
      { label: "Intent Discovery", before: "Manual tagging", after: "Auto-detected", improvement: "Automated" },
      { label: "Trend Detection", before: "Weeks", after: "Hours", improvement: "-95%" },
    ],
    narrative: "Every conversation is automatically analyzed for intent, sentiment, outcome, and emerging trends. Instead of sampling 5% of calls for QA, you get insight from 100% of interactions — surfacing product issues, process gaps, and customer needs in real-time.",
    calloutStat: { value: "100%", label: "conversation coverage" },
  },

  // ─── Impact: Commercial ───
  "impact-commercial": {
    sectionTitle: "Commercial Impact",
    sectionSubtitle: "The financial case for intelligent automation",
    metrics: [
      { label: "Cost per Interaction", before: "$8-12", after: "$0.50-1.00", improvement: "-90%" },
      { label: "Annual Savings", before: "Baseline", after: "$2-5M", improvement: "Typical range" },
      { label: "ROI Timeline", before: "—", after: "3-6 months", improvement: "Fast payback" },
      { label: "Scalability Cost", before: "Linear (hire more)", after: "Near-zero marginal", improvement: "Flat curve" },
    ],
    narrative: "The economics are straightforward: AI handles a conversation for a fraction of the cost of a human agent. At 80%+ automation, the savings compound rapidly. Most customers see full ROI within the first two quarters.",
    calloutStat: { value: "90%", label: "cost reduction per interaction" },
  },

  // ─── Scope of Work ───
  "scope-of-work": {
    sectionTitle: "Scope of Work",
    sectionSubtitle: "What's included in your implementation",
    phases: [
      {
        name: "Discovery",
        weeks: "Week 1-2",
        deliverables: [
          "Inquiry type mapping & prioritization",
          "Agent architecture design",
          "Integration requirements document",
          "KPI & success criteria alignment",
        ],
        color: "#59195d",
      },
      {
        name: "Build",
        weeks: "Week 3-4",
        deliverables: [
          "Specialist agent configuration",
          "NLP model training & tuning",
          "API integrations (core systems)",
          "Guardrails & compliance setup",
        ],
        color: "#208269",
      },
      {
        name: "Validate",
        weeks: "Week 5-6",
        deliverables: [
          "UAT with stakeholder team",
          "NLP accuracy testing (>95% target)",
          "End-to-end integration testing",
          "Human handoff validation",
        ],
        color: "#36b595",
      },
      {
        name: "Launch",
        weeks: "Week 7-8",
        deliverables: [
          "Controlled rollout (20% → 100%)",
          "Real-time monitoring dashboard",
          "Edge case tuning",
          "Handover to BAU team",
        ],
        color: "#ef8b00",
      },
    ],
    includedItems: [
      "Dedicated project manager",
      "Conversational design expertise",
      "Up to 50 initial intents",
      "2 core system integrations",
      "Staging + production environments",
      "30-day post-launch support",
      "AI trainer onboarding & certification",
    ],
    excludedItems: [
      "Custom API development on customer side",
      "Contact center platform licensing",
      "Ongoing content management (optional add-on)",
    ],
  },

  // ─── Authentication Impacts ───
  "auth-impacts": {
    sectionTitle: "Authentication & Personalization",
    sectionSubtitle: "What changes when you know who the customer is",
    preAuth: {
      title: "Before Authentication",
      capabilities: [
        "General FAQ and product information",
        "Branch/office locator",
        "Application status (with reference number)",
        "Public policy/rate information",
        "New customer onboarding",
      ],
      automationRate: "40-60%",
    },
    postAuth: {
      title: "After Authentication",
      capabilities: [
        "Account balance and transaction history",
        "Payment processing and transfers",
        "Claim filing and status updates",
        "Policy changes and endorsements",
        "Personal document requests",
        "Spending insights and recommendations",
      ],
      automationRate: "80-90%",
    },
    methods: [
      {
        name: "SSO / OpenID Connect",
        description: "Leverage existing identity provider — users already logged into your portal are seamlessly authenticated",
        securityLevel: "high",
      },
      {
        name: "OTP Verification",
        description: "One-time passcode sent via SMS or email for quick identity confirmation",
        securityLevel: "standard",
      },
      {
        name: "Knowledge-Based",
        description: "Verify identity through account details, security questions, or reference numbers",
        securityLevel: "basic",
      },
    ],
  },

  // ─── Boost Camp Videos ───
  community: {
    sectionTitle: "Boost Camp",
    sectionSubtitle: "Self-paced training videos to get your team up to speed",
    videos: [
      {
        id: "intro",
        title: "Platform Overview",
        description: "A 10-minute walkthrough of the boost.ai platform and core concepts",
        duration: "10 min",
        videoUrl: "",
        category: "Getting Started",
      },
      {
        id: "ai-trainer",
        title: "AI Trainer Fundamentals",
        description: "Learn to create, test, and optimize intents and responses",
        duration: "15 min",
        videoUrl: "",
        category: "Getting Started",
      },
      {
        id: "analytics-deep",
        title: "Analytics Deep Dive",
        description: "Using conversation analytics to continuously improve automation",
        duration: "12 min",
        videoUrl: "",
        category: "Advanced",
      },
      {
        id: "integrations",
        title: "Integration Setup",
        description: "Connecting boost.ai to your CRM, contact center, and backend systems",
        duration: "18 min",
        videoUrl: "",
        category: "Advanced",
      },
    ],
  },

  // ─── Commercial Offer ───
  "commercial-offer": {
    sectionTitle: "Commercial Proposal",
    sectionSubtitle: "Pricing structured around your needs and scale",
    tiers: [
      {
        name: "Foundation",
        description: "Single channel, core automation — ideal for getting started",
        features: [
          "1 channel (chat or voice)",
          "Up to 25 intents",
          "1 system integration",
          "Staging + production",
          "Email support",
        ],
      },
      {
        name: "Professional",
        description: "Multi-channel with advanced features — the most popular choice",
        features: [
          "2 channels",
          "Up to 75 intents",
          "3 system integrations",
          "Human handoff integration",
          "Analytics dashboard",
          "Dedicated CSM",
        ],
        recommended: true,
      },
      {
        name: "Enterprise",
        description: "Full platform access with custom everything",
        features: [
          "Unlimited channels",
          "Unlimited intents",
          "Unlimited integrations",
          "Custom SLA",
          "On-premise / private cloud option",
          "24/7 priority support",
        ],
      },
    ],
    addOns: [
      { name: "Voice AI", description: "Add intelligent voice automation to any tier" },
      { name: "Managed Service", description: "boost.ai team manages your AI — content updates, optimization, reporting" },
      { name: "Custom Training", description: "On-site or virtual training program tailored to your team" },
    ],
    disclaimers: [
      "Pricing is indicative and subject to final scoping",
      "All tiers include initial implementation and onboarding",
      "Annual commitment with monthly billing available",
    ],
  },

  // ─── Custom Other ───
  "custom-other": {
    sectionTitle: "Additional Information",
    sectionSubtitle: "",
    blocks: [],
  },

  // ─── ROI ───
  roi: {
    sectionTitle: "Return on Investment",
    sectionSubtitle: "See the financial impact of AI automation for {{company_name}}",
    highlights: [
      {
        title: "Cost per contact reduced by 80%",
        description: "AI handles 80-90% of interactions at a fraction of human agent cost.",
        color: "emerald",
      },
      {
        title: "Go live in 6-8 weeks, not months",
        description: "Pre-built intents, NLP models, and no-code builder accelerate deployment.",
        color: "purple",
      },
      {
        title: "CSAT improves as humans focus on complex cases",
        description: "AI handles tier-1, freeing agents for high-value interactions.",
        color: "amber",
      },
      {
        title: "Infinite scale without headcount",
        description: "Handle 10x volume during peak events with zero additional staffing.",
        color: "rose",
      },
    ],
  },

  // ─── Next Steps ───
  "next-steps": {
    sectionTitle: "Next Steps",
    sectionSubtitle: "Your path to AI-powered customer experience",
    steps: [
      {
        number: 1,
        title: "Technical Deep Dive",
        description: "Walk through integrations, security requirements, and architecture with our solutions team",
      },
      {
        number: 2,
        title: "Proof of Concept",
        description: "2-week focused POC on your top use case — see real results with your data",
      },
      {
        number: 3,
        title: "Business Case & Proposal",
        description: "Detailed ROI model and commercial proposal based on POC findings",
      },
      {
        number: 4,
        title: "Kickoff",
        description: "6-8 week implementation with dedicated project team",
      },
    ],
    ctaText: "Let's get started — schedule a technical deep dive this week",
  },
};
