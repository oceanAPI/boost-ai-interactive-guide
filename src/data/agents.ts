export interface AgentCapability {
  title: string;
  description: string;
}

export interface SpecialistAgent {
  key: string;
  name: string;
  automationRate: number;
  avgResolutionTime?: string;
  topTopic?: string;
  description: string;
  capabilities: AgentCapability[];
  quickActions: string[];
}

export const SPECIALIST_AGENTS: SpecialistAgent[] = [
  {
    key: "claims",
    name: "Claims Agent",
    automationRate: 82,
    avgResolutionTime: "~2 min",
    topTopic: "Claim Status",
    description:
      "FNOL, status updates, document submission, repair shop routing, settlement inquiries.",
    capabilities: [
      { title: "First Notice of Loss (FNOL)", description: "Guides policyholders through initial claim filing with structured data collection" },
      { title: "Claim status updates", description: "Real-time status queries — where is my claim, when will I hear back?" },
      { title: "Document submission", description: "Routes and confirms receipt of photos, police reports, and medical records" },
      { title: "Settlement inquiries", description: "Explains payment timelines, check status, and direct deposit options" },
      { title: "Repair shop network", description: "Connects auto claimants with approved DRP shops and towing services" },
      { title: "Medical claim guidance", description: "Workers' comp and health claim intake with appropriate escalation triggers" },
      { title: "Fraud screening guardrail", description: "Flags anomalous claim patterns for human review before proceeding" },
      { title: "Claim denial explanations", description: "Provides policy-grounded explanations for coverage decisions" },
      { title: "Re-open claim requests", description: "Validates eligibility and routes reopening requests appropriately" },
      { title: "Subrogation inquiries", description: "Answers third-party liability and recovery questions" },
    ],
    quickActions: ["First notice of loss", "Claim status", "Document upload", "Repair routing", "Settlement ETA", "Subrogation"],
  },
  {
    key: "billing",
    name: "Billing & Payments",
    automationRate: 84,
    description:
      "Premium queries, payment deferrals, eFaktura, billing errors, payment method changes.",
    capabilities: [
      { title: "Premium inquiries", description: "Instant answers on premium amounts, due dates, and payment history" },
      { title: "Payment deferrals", description: "Process deferral requests with policy-compliant grace period handling" },
      { title: "Billing error resolution", description: "Identify and resolve common billing discrepancies automatically" },
      { title: "Payment method changes", description: "Update credit card, bank account, or autopay settings securely" },
      { title: "eFaktura setup", description: "Guide customers through digital invoicing enrollment" },
      { title: "Autopay management", description: "Enable, modify, or cancel automatic payment arrangements" },
    ],
    quickActions: ["Pay my bill", "Payment deferral", "Billing error", "Change payment method", "Autopay setup", "Premium increase"],
  },
  {
    key: "coverage",
    name: "Coverage & Policy",
    automationRate: 79,
    description:
      "Coverage explanations, policy documents, endorsement requests, renewals, recommendations.",
    capabilities: [
      { title: "Coverage explanations", description: "Break down policy coverage in plain language tailored to the customer" },
      { title: "Policy document delivery", description: "Instant access to ID cards, declarations pages, and policy documents" },
      { title: "Endorsement requests", description: "Process policy modifications and endorsement additions" },
      { title: "Renewal management", description: "Handle renewal quotes, comparisons, and acceptance workflows" },
      { title: "Coverage gap analysis", description: "Identify potential coverage gaps and recommend appropriate additions" },
      { title: "Policy cancellation", description: "Process cancellation requests with retention-aware workflows" },
    ],
    quickActions: ["What does my policy cover", "Get my ID card", "Add endorsement", "Cancel policy", "Renewal quote", "Coverage gaps"],
  },
  {
    key: "auto",
    name: "Auto Insurance",
    automationRate: 81,
    description:
      "Auto quotes, bonus tracking, glass damage, roadside assist, fleet policies.",
    capabilities: [
      { title: "Auto quoting", description: "Generate and compare auto insurance quotes with personalized pricing" },
      { title: "Glass damage claims", description: "Fast-track windshield and glass damage claims processing" },
      { title: "Roadside assistance", description: "Dispatch towing, lockout, and emergency services" },
      { title: "Vehicle management", description: "Add, remove, or modify vehicles on existing policies" },
      { title: "Bonus/discount tracking", description: "Track safe driver bonuses and applicable discount programs" },
      { title: "Teen driver programs", description: "Manage young driver additions with training program discounts" },
    ],
    quickActions: ["Auto quote", "Glass damage", "Roadside assist", "Add a vehicle", "Bonus status", "Teen driver"],
  },
  {
    key: "home",
    name: "Home & Property",
    automationRate: 78,
    description:
      "Homeowners, renters, water damage, catastrophe claims, flood, fire, burglary.",
    capabilities: [
      { title: "Water damage claims", description: "Structured intake for water damage with mitigation guidance" },
      { title: "Fire & catastrophe claims", description: "Priority handling for fire, storm, and natural disaster claims" },
      { title: "Renters insurance", description: "Quote and manage renters policies with coverage explanations" },
      { title: "Flood inquiries", description: "Navigate flood insurance requirements and NFIP coordination" },
      { title: "Roof & structural claims", description: "Process roof damage claims with contractor network routing" },
      { title: "Burglary & theft", description: "File theft claims with police report integration" },
    ],
    quickActions: ["Water damage claim", "Report a fire", "Renters coverage", "Flood query", "Roof claim", "Pest damage"],
  },
  {
    key: "life",
    name: "Life & Benefits",
    automationRate: 77,
    description:
      "Life coverage, disability, critical illness, beneficiary changes, claims.",
    capabilities: [
      { title: "Life coverage information", description: "Explain policy details, cash value, and coverage amounts" },
      { title: "Disability claims", description: "Process short-term and long-term disability claim intake" },
      { title: "Critical illness", description: "Handle critical illness benefit inquiries and claims" },
      { title: "Beneficiary changes", description: "Securely process beneficiary designation updates" },
      { title: "Policy cost breakdowns", description: "Explain premiums, fees, and cost of insurance charges" },
      { title: "Claims processing", description: "Guide beneficiaries through life insurance claim procedures" },
    ],
    quickActions: ["Life coverage info", "Disability claim", "Critical illness", "Change beneficiary", "Policy cost", "Claim process"],
  },
];

export const INDUSTRIES = [
  { key: "insurance", label: "Insurance" },
  { key: "banking", label: "Banking" },
  { key: "wealth_management", label: "Wealth Management" },
  { key: "credit_union", label: "Credit Union" },
  { key: "fintech", label: "Fintech" },
  { key: "pension", label: "Pension & Retirement" },
] as const;
