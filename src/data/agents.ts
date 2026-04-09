/* ─────────────────────────────────────────────
 *  Agent data model — scalable per-industry
 *
 *  To add a new agent:
 *    1. Add an entry to the relevant AGENTS_BY_INDUSTRY[industry] array
 *    2. Each agent needs: key, name, icon, automationRate, description,
 *       capabilities[], quickActions[], and a flow {} object
 *    3. The flow object describes the agent's internal architecture
 *       (knowledge sources, guardrails, action hooks, processes, responses)
 *
 *  To add a new industry:
 *    1. Add a key to INDUSTRIES
 *    2. Add AGENTS_BY_INDUSTRY[newKey] = [...]
 * ───────────────────────────────────────────── */

// ─── Flow Architecture Types ───

export interface FlowNode {
  id: string;
  name: string;
  type: string;             // e.g. "faq", "api", "hallucination", "transfer"
  icon: string;             // BoostIcon name
  description: string;
  elevioUrl?: string;       // link to elev.io article for Level 3 (future)
}

export interface AgentFlow {
  knowledgeSources: FlowNode[];
  guardrails: FlowNode[];
  actionHooks: FlowNode[];
  processes: FlowNode[];
  standardResponses: FlowNode[];
}

// ─── Agent Types ───

export interface AgentCapability {
  title: string;
  description: string;
}

export interface SpecialistAgent {
  key: string;
  name: string;
  icon: string;             // BoostIcon name
  automationRate: number;
  avgResolutionTime?: string;
  topTopic?: string;
  description: string;
  capabilities: AgentCapability[];
  quickActions: string[];
  flow: AgentFlow;
}

// ─── Industries ───

export const INDUSTRIES = [
  { key: "insurance", label: "Insurance", description: "Claims, underwriting, policy servicing, and customer retention" },
  { key: "banking", label: "Banking", description: "Retail banking, commercial banking, digital banking services" },
  { key: "wealth_management", label: "Wealth Management", description: "Investment advisory, portfolio management, financial planning" },
  { key: "credit_union", label: "Credit Union", description: "Member services, lending, account management" },
  { key: "fintech", label: "Fintech", description: "Digital payments, lending platforms, neobanking" },
  { key: "pension", label: "Pension & Retirement", description: "Pension administration, retirement planning, fund management" },
] as const;

export type IndustryKey = (typeof INDUSTRIES)[number]["key"];

// ─── Supporting Departments ───

export const SUPPORTING_DEPARTMENTS = [
  "Customer Service",
  "IT / Engineering",
  "Product",
  "Marketing",
  "Legal / Compliance",
  "Operations",
  "HR / People",
  "Finance",
  "Data / Analytics",
  "Security",
] as const;

// ─── Banking Agents ───
// TODO: Replace placeholder agents with real banking agent list from user

const BANKING_AGENTS: SpecialistAgent[] = [
  {
    key: "bank_account_services",
    name: "Account Services",
    icon: "bank",
    automationRate: 85,
    avgResolutionTime: "~1.5 min",
    topTopic: "Account Balance",
    description: "Account inquiries, balance checks, transaction history, account opening, and account maintenance.",
    capabilities: [
      { title: "Balance & transaction inquiries", description: "Real-time account balance and recent transaction lookups" },
      { title: "Account opening", description: "Guide customers through opening checking, savings, and deposit accounts" },
      { title: "Account maintenance", description: "Handle address changes, statement preferences, and account settings" },
      { title: "Direct deposit setup", description: "Assist with setting up or modifying direct deposit instructions" },
      { title: "Account closure", description: "Process account closure requests with retention-aware workflows" },
      { title: "Joint account management", description: "Add or remove authorized signers and joint account holders" },
    ],
    quickActions: ["Check balance", "Recent transactions", "Open account", "Update address", "Direct deposit", "Close account"],
    flow: {
      knowledgeSources: [
        { id: "bs-kb-account-faq", name: "Account FAQ", type: "faq", icon: "books", description: "Frequently asked questions about checking, savings, and deposit accounts" },
        { id: "bs-kb-core-banking", name: "Core Banking API", type: "api", icon: "computer-api", description: "Real-time connection to core banking system for balance and transaction data" },
        { id: "bs-kb-product-docs", name: "Product Documentation", type: "document", icon: "hierarchy-document", description: "Account terms, fee schedules, and product comparison materials" },
      ],
      guardrails: [
        { id: "bs-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents the agent from generating inaccurate account information" },
        { id: "bs-gr-pii", name: "PII Protection", type: "pii", icon: "lock-security", description: "Ensures personal identifiable information is handled securely" },
      ],
      actionHooks: [
        { id: "bs-ah-transfer-human", name: "Transfer to Banker", type: "transfer", icon: "headset", description: "Transfers the conversation to a live banker for complex requests" },
        { id: "bs-ah-send-sms", name: "Send SMS Confirmation", type: "sms", icon: "phone", description: "Sends SMS confirmation for account changes or verification codes" },
      ],
      processes: [
        { id: "bs-pr-kyc", name: "KYC Verification", type: "verification", icon: "check-symbol-check", description: "Triggers know-your-customer identity verification workflow" },
        { id: "bs-pr-account-open", name: "Account Opening", type: "workflow", icon: "hierarchy", description: "Orchestrates the multi-step account opening process" },
      ],
      standardResponses: [
        { id: "bs-sr-confirm", name: "Change Confirmed", type: "confirmation", icon: "thumbs-up", description: "Confirms successful account changes to the customer" },
        { id: "bs-sr-fallback", name: "Unable to Assist", type: "fallback", icon: "route", description: "Graceful fallback when the request cannot be automated" },
      ],
    },
  },
  {
    key: "bank_cards",
    name: "Cards & Payments",
    icon: "banknote",
    automationRate: 83,
    avgResolutionTime: "~2 min",
    topTopic: "Card Block/Replace",
    description: "Credit and debit card management, fraud disputes, payment issues, and card applications.",
    capabilities: [
      { title: "Card blocking & replacement", description: "Instantly block lost/stolen cards and order replacements" },
      { title: "Fraud dispute handling", description: "File and track unauthorized transaction disputes" },
      { title: "PIN management", description: "Reset or change card PIN through secure verification" },
      { title: "Credit limit requests", description: "Process credit limit increase or decrease requests" },
      { title: "Payment issues", description: "Resolve declined transactions, holds, and payment failures" },
      { title: "Card application", description: "Guide customers through credit card applications with instant decisions" },
    ],
    quickActions: ["Block my card", "Report fraud", "Reset PIN", "Credit limit", "Why declined", "Apply for card"],
    flow: {
      knowledgeSources: [
        { id: "bc-kb-card-faq", name: "Card FAQ", type: "faq", icon: "books", description: "Card product FAQs including rewards, fees, and usage policies" },
        { id: "bc-kb-card-api", name: "Card Management API", type: "api", icon: "computer-api", description: "Real-time card status, transactions, and management operations" },
        { id: "bc-kb-fraud-rules", name: "Fraud Detection Rules", type: "document", icon: "hierarchy-document", description: "Internal fraud screening criteria and dispute resolution procedures" },
      ],
      guardrails: [
        { id: "bc-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents inaccurate information about card terms or transactions" },
        { id: "bc-gr-auth", name: "Authentication Required", type: "compliance", icon: "lock-security", description: "Enforces strong customer authentication before card operations" },
      ],
      actionHooks: [
        { id: "bc-ah-block-card", name: "Block Card Immediately", type: "webhook", icon: "target-selection", description: "Triggers immediate card blocking through the card management system" },
        { id: "bc-ah-transfer-fraud", name: "Transfer to Fraud Team", type: "transfer", icon: "headset", description: "Escalates suspected fraud cases to the specialist fraud team" },
        { id: "bc-ah-send-sms", name: "Send Replacement SMS", type: "sms", icon: "phone", description: "Sends SMS with replacement card tracking and delivery details" },
      ],
      processes: [
        { id: "bc-pr-dispute", name: "Dispute Filing", type: "workflow", icon: "hierarchy", description: "Orchestrates the chargeback and dispute resolution workflow" },
        { id: "bc-pr-card-order", name: "Card Ordering", type: "workflow", icon: "cogs", description: "Processes new card orders and replacement card requests" },
      ],
      standardResponses: [
        { id: "bc-sr-blocked", name: "Card Blocked", type: "confirmation", icon: "thumbs-up", description: "Confirms card has been successfully blocked and next steps" },
        { id: "bc-sr-dispute-filed", name: "Dispute Filed", type: "confirmation", icon: "check-symbol-check", description: "Confirms dispute has been filed with estimated resolution time" },
      ],
    },
  },
  {
    key: "bank_lending",
    name: "Lending & Mortgages",
    icon: "balance",
    automationRate: 76,
    avgResolutionTime: "~3 min",
    topTopic: "Loan Status",
    description: "Personal loans, mortgages, refinancing, loan applications, and payment management.",
    capabilities: [
      { title: "Loan application status", description: "Track progress of pending loan and mortgage applications" },
      { title: "Mortgage inquiries", description: "Answer questions about rates, terms, and mortgage products" },
      { title: "Refinancing guidance", description: "Help customers evaluate refinancing options and initiate applications" },
      { title: "Loan payment management", description: "Process payments, set up autopay, and handle deferral requests" },
      { title: "Pre-qualification", description: "Run soft credit checks for pre-qualification estimates" },
      { title: "Document collection", description: "Guide customers through required documentation for loan processing" },
    ],
    quickActions: ["Loan status", "Mortgage rates", "Refinance options", "Make payment", "Pre-qualify", "Upload documents"],
    flow: {
      knowledgeSources: [
        { id: "bl-kb-lending-faq", name: "Lending FAQ", type: "faq", icon: "books", description: "Product information for personal loans, mortgages, and lines of credit" },
        { id: "bl-kb-rates-api", name: "Rate Engine API", type: "api", icon: "computer-api", description: "Live interest rates and personalized rate quotes" },
        { id: "bl-kb-compliance", name: "Lending Compliance", type: "document", icon: "hierarchy-document", description: "TILA, RESPA, and fair lending compliance documentation" },
      ],
      guardrails: [
        { id: "bl-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents inaccurate rate quotes or loan term information" },
        { id: "bl-gr-fair-lending", name: "Fair Lending Compliance", type: "compliance", icon: "hand-protection", description: "Ensures all lending interactions comply with fair lending regulations" },
      ],
      actionHooks: [
        { id: "bl-ah-transfer-lo", name: "Transfer to Loan Officer", type: "transfer", icon: "headset", description: "Connects customer with a loan officer for complex lending decisions" },
        { id: "bl-ah-email-docs", name: "Email Document Checklist", type: "email", icon: "speech", description: "Sends personalized document checklist based on loan type" },
      ],
      processes: [
        { id: "bl-pr-prequalify", name: "Pre-Qualification", type: "workflow", icon: "hierarchy", description: "Runs soft credit pull and returns pre-qualification estimate" },
        { id: "bl-pr-doc-classify", name: "Document Classification", type: "workflow", icon: "cogs", description: "Classifies and validates uploaded loan documents" },
      ],
      standardResponses: [
        { id: "bl-sr-prequalify", name: "Pre-Qualification Result", type: "confirmation", icon: "thumbs-up", description: "Presents pre-qualification results with next steps" },
        { id: "bl-sr-missing-docs", name: "Missing Documents", type: "request", icon: "route", description: "Lists outstanding required documents for the application" },
      ],
    },
  },
  {
    key: "bank_digital",
    name: "Digital Banking",
    icon: "desktop-network",
    automationRate: 88,
    avgResolutionTime: "~1 min",
    topTopic: "Login Issues",
    description: "Online banking, mobile app support, password resets, transfers, and digital enrollment.",
    capabilities: [
      { title: "Password & login issues", description: "Reset passwords, unlock accounts, and resolve MFA issues" },
      { title: "Money transfers", description: "Assist with internal transfers, wire transfers, and Zelle/P2P payments" },
      { title: "Mobile app support", description: "Troubleshoot app issues, push notifications, and mobile deposit" },
      { title: "Digital enrollment", description: "Enroll customers in online and mobile banking services" },
      { title: "Alert management", description: "Set up and manage account alerts and notifications" },
      { title: "Bill pay setup", description: "Help customers configure online bill pay and scheduled payments" },
    ],
    quickActions: ["Reset password", "Transfer money", "App not working", "Enroll online", "Set alerts", "Bill pay"],
    flow: {
      knowledgeSources: [
        { id: "bd-kb-digital-faq", name: "Digital Banking FAQ", type: "faq", icon: "books", description: "Troubleshooting guides for online and mobile banking platforms" },
        { id: "bd-kb-auth-api", name: "Authentication API", type: "api", icon: "computer-api", description: "User authentication, password reset, and MFA management" },
      ],
      guardrails: [
        { id: "bd-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents incorrect technical guidance" },
        { id: "bd-gr-auth", name: "Identity Verification", type: "compliance", icon: "lock-security", description: "Verifies customer identity before account access changes" },
      ],
      actionHooks: [
        { id: "bd-ah-reset-password", name: "Trigger Password Reset", type: "webhook", icon: "target-selection", description: "Sends password reset link to registered email or phone" },
        { id: "bd-ah-transfer-tech", name: "Transfer to Tech Support", type: "transfer", icon: "headset", description: "Escalates complex technical issues to specialized support" },
      ],
      processes: [
        { id: "bd-pr-unlock", name: "Account Unlock", type: "workflow", icon: "hierarchy", description: "Automated account unlock after identity verification" },
        { id: "bd-pr-enrollment", name: "Digital Enrollment", type: "workflow", icon: "cogs", description: "End-to-end digital banking enrollment and activation" },
      ],
      standardResponses: [
        { id: "bd-sr-reset-sent", name: "Reset Link Sent", type: "confirmation", icon: "thumbs-up", description: "Confirms password reset link has been sent" },
        { id: "bd-sr-enrolled", name: "Enrollment Complete", type: "confirmation", icon: "check-symbol-check", description: "Confirms successful digital banking enrollment" },
      ],
    },
  },
  {
    key: "bank_general",
    name: "General Inquiries",
    icon: "speech",
    automationRate: 80,
    avgResolutionTime: "~1.5 min",
    topTopic: "Branch Hours",
    description: "Branch info, hours, ATM locations, general questions, complaints, and feedback.",
    capabilities: [
      { title: "Branch & ATM locator", description: "Find nearest branches and ATMs with hours and services" },
      { title: "General FAQ", description: "Answer common questions about bank products and services" },
      { title: "Complaint handling", description: "Log and route customer complaints to appropriate departments" },
      { title: "Fee inquiries", description: "Explain fees, waiver eligibility, and fee reversal requests" },
      { title: "Rate inquiries", description: "Provide current savings, CD, and deposit rates" },
      { title: "Feedback collection", description: "Collect and route customer feedback and suggestions" },
    ],
    quickActions: ["Find a branch", "ATM near me", "File complaint", "Fee question", "Current rates", "Give feedback"],
    flow: {
      knowledgeSources: [
        { id: "bg-kb-general-faq", name: "General FAQ", type: "faq", icon: "books", description: "Bank-wide FAQ covering products, policies, and common questions" },
        { id: "bg-kb-branch-api", name: "Branch Locator API", type: "api", icon: "globe", description: "Branch and ATM location data with hours and services" },
        { id: "bg-kb-rate-sheet", name: "Rate Sheet", type: "document", icon: "hierarchy-document", description: "Current interest rates for all deposit and lending products" },
      ],
      guardrails: [
        { id: "bg-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents inaccurate information about bank policies or rates" },
        { id: "bg-gr-tone", name: "Tone & Empathy", type: "tone", icon: "heart", description: "Ensures appropriate empathetic tone especially for complaints" },
      ],
      actionHooks: [
        { id: "bg-ah-transfer-cs", name: "Transfer to Customer Service", type: "transfer", icon: "headset", description: "Transfers to a live agent for unresolved inquiries" },
        { id: "bg-ah-log-complaint", name: "Log Complaint", type: "webhook", icon: "target-selection", description: "Creates a formal complaint record in the CRM system" },
      ],
      processes: [
        { id: "bg-pr-fee-reversal", name: "Fee Reversal", type: "workflow", icon: "hierarchy", description: "Evaluates eligibility and processes fee reversal requests" },
      ],
      standardResponses: [
        { id: "bg-sr-branch-info", name: "Branch Information", type: "informational", icon: "thumbs-up", description: "Provides branch details with map link" },
        { id: "bg-sr-complaint-logged", name: "Complaint Logged", type: "confirmation", icon: "check-symbol-check", description: "Confirms complaint has been recorded with reference number" },
      ],
    },
  },
];

// ─── Insurance Agents (existing) ───

const INSURANCE_AGENTS: SpecialistAgent[] = [
  {
    key: "claims",
    name: "Claims Agent",
    icon: "umbrella",
    automationRate: 82,
    avgResolutionTime: "~2 min",
    topTopic: "Claim Status",
    description: "FNOL, status updates, document submission, repair shop routing, settlement inquiries.",
    capabilities: [
      { title: "First Notice of Loss (FNOL)", description: "Guides policyholders through initial claim filing with structured data collection" },
      { title: "Claim status updates", description: "Real-time status queries -- where is my claim, when will I hear back?" },
      { title: "Document submission", description: "Routes and confirms receipt of photos, police reports, and medical records" },
      { title: "Settlement inquiries", description: "Explains payment timelines, check status, and direct deposit options" },
      { title: "Repair shop network", description: "Connects auto claimants with approved DRP shops and towing services" },
      { title: "Fraud screening guardrail", description: "Flags anomalous claim patterns for human review before proceeding" },
    ],
    quickActions: ["First notice of loss", "Claim status", "Document upload", "Repair routing", "Settlement ETA", "Subrogation"],
    flow: {
      knowledgeSources: [
        { id: "ic-kb-claims-faq", name: "Claims FAQ", type: "faq", icon: "books", description: "Frequently asked questions about filing and tracking claims" },
        { id: "ic-kb-policy-api", name: "Policy & Claims API", type: "api", icon: "computer-api", description: "Real-time claim status, policy details, and coverage verification" },
        { id: "ic-kb-repair-network", name: "Repair Network DB", type: "database", icon: "database-connection", description: "Approved repair shops, towing services, and contractor network" },
      ],
      guardrails: [
        { id: "ic-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents inaccurate claim status or coverage information" },
        { id: "ic-gr-fraud", name: "Fraud Screening", type: "compliance", icon: "lock-security", description: "Flags suspicious claim patterns for human review" },
      ],
      actionHooks: [
        { id: "ic-ah-transfer-adjuster", name: "Transfer to Adjuster", type: "transfer", icon: "headset", description: "Routes complex claims to a claims adjuster" },
        { id: "ic-ah-sms-update", name: "Send SMS Update", type: "sms", icon: "phone", description: "Sends claim status updates via SMS" },
        { id: "ic-ah-fnol-workflow", name: "Trigger FNOL Workflow", type: "webhook", icon: "target-selection", description: "Initiates the first notice of loss processing workflow" },
      ],
      processes: [
        { id: "ic-pr-claim-validation", name: "Claim Validation", type: "workflow", icon: "hierarchy", description: "Validates claim details against policy coverage" },
        { id: "ic-pr-doc-classify", name: "Document Classification", type: "workflow", icon: "cogs", description: "Classifies and routes uploaded claim documents" },
      ],
      standardResponses: [
        { id: "ic-sr-filed", name: "Claim Filed", type: "confirmation", icon: "thumbs-up", description: "Confirms claim has been filed with reference number and next steps" },
        { id: "ic-sr-missing-info", name: "Missing Information", type: "request", icon: "route", description: "Requests additional documentation needed to process the claim" },
      ],
    },
  },
  {
    key: "billing",
    name: "Billing & Payments",
    icon: "banknote",
    automationRate: 84,
    description: "Premium queries, payment deferrals, eFaktura, billing errors, payment method changes.",
    capabilities: [
      { title: "Premium inquiries", description: "Instant answers on premium amounts, due dates, and payment history" },
      { title: "Payment deferrals", description: "Process deferral requests with policy-compliant grace period handling" },
      { title: "Billing error resolution", description: "Identify and resolve common billing discrepancies automatically" },
      { title: "Payment method changes", description: "Update credit card, bank account, or autopay settings securely" },
      { title: "eFaktura setup", description: "Guide customers through digital invoicing enrollment" },
      { title: "Autopay management", description: "Enable, modify, or cancel automatic payment arrangements" },
    ],
    quickActions: ["Pay my bill", "Payment deferral", "Billing error", "Change payment method", "Autopay setup", "Premium increase"],
    flow: {
      knowledgeSources: [
        { id: "ib-kb-billing-faq", name: "Billing FAQ", type: "faq", icon: "books", description: "Common billing questions, payment methods, and due date info" },
        { id: "ib-kb-payment-api", name: "Payment Gateway API", type: "api", icon: "computer-api", description: "Real-time payment processing and history" },
      ],
      guardrails: [
        { id: "ib-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents incorrect billing amounts or payment information" },
        { id: "ib-gr-pci", name: "PCI Compliance", type: "compliance", icon: "lock-security", description: "Ensures payment card data is handled per PCI DSS standards" },
      ],
      actionHooks: [
        { id: "ib-ah-transfer", name: "Transfer to Billing Team", type: "transfer", icon: "headset", description: "Escalates complex billing disputes to the billing team" },
      ],
      processes: [
        { id: "ib-pr-deferral", name: "Payment Deferral", type: "workflow", icon: "hierarchy", description: "Processes payment deferral requests within policy guidelines" },
        { id: "ib-pr-method-change", name: "Payment Method Update", type: "workflow", icon: "cogs", description: "Securely updates stored payment methods" },
      ],
      standardResponses: [
        { id: "ib-sr-confirmed", name: "Payment Confirmed", type: "confirmation", icon: "thumbs-up", description: "Confirms successful payment or billing change" },
      ],
    },
  },
  {
    key: "coverage",
    name: "Coverage & Policy",
    icon: "hand-protection",
    automationRate: 79,
    description: "Coverage explanations, policy documents, endorsement requests, renewals, recommendations.",
    capabilities: [
      { title: "Coverage explanations", description: "Break down policy coverage in plain language tailored to the customer" },
      { title: "Policy document delivery", description: "Instant access to ID cards, declarations pages, and policy documents" },
      { title: "Endorsement requests", description: "Process policy modifications and endorsement additions" },
      { title: "Renewal management", description: "Handle renewal quotes, comparisons, and acceptance workflows" },
      { title: "Coverage gap analysis", description: "Identify potential coverage gaps and recommend appropriate additions" },
      { title: "Policy cancellation", description: "Process cancellation requests with retention-aware workflows" },
    ],
    quickActions: ["What does my policy cover", "Get my ID card", "Add endorsement", "Cancel policy", "Renewal quote", "Coverage gaps"],
    flow: {
      knowledgeSources: [
        { id: "icp-kb-coverage-faq", name: "Coverage FAQ", type: "faq", icon: "books", description: "Policy coverage explanations and common questions" },
        { id: "icp-kb-policy-api", name: "Policy Management API", type: "api", icon: "computer-api", description: "Real-time policy details, documents, and endorsement processing" },
      ],
      guardrails: [
        { id: "icp-gr-hallucination", name: "Hallucination Detection", type: "hallucination", icon: "shield-medal", description: "Prevents inaccurate coverage or policy information" },
      ],
      actionHooks: [
        { id: "icp-ah-transfer", name: "Transfer to Agent", type: "transfer", icon: "headset", description: "Routes to a licensed agent for complex policy changes" },
      ],
      processes: [
        { id: "icp-pr-endorsement", name: "Endorsement Processing", type: "workflow", icon: "hierarchy", description: "Processes policy endorsements and modifications" },
        { id: "icp-pr-renewal", name: "Renewal Processing", type: "workflow", icon: "cogs", description: "Generates and processes policy renewal quotes" },
      ],
      standardResponses: [
        { id: "icp-sr-confirmed", name: "Change Confirmed", type: "confirmation", icon: "thumbs-up", description: "Confirms policy change has been applied" },
      ],
    },
  },
];

// ─── Topic Groups & Orchestrator Config ───

export interface TopicGroup {
  key: string;
  label: string;
  icon: string;
  agents: SpecialistAgent[];
}

export interface OrchestratorConfig {
  /** Standalone agents not in any topic group (e.g. "Customer relationship") */
  standaloneAgents: SpecialistAgent[];
  /** Topic groups containing agents */
  topicGroups: TopicGroup[];
}

// ─── Banking Orchestrator (matches admin panel structure) ───

const BANKING_STANDALONE: SpecialistAgent[] = [
  // "Customer relationship" is a standalone agent outside topic groups
  {
    key: "bank_customer_relationship",
    name: "Customer relationship",
    icon: "users",
    automationRate: 82,
    description: "Customer relationship management, retention, and satisfaction.",
    capabilities: [],
    quickActions: [],
    flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] },
  },
];

const BANKING_TOPIC_GROUPS: TopicGroup[] = [
  {
    key: "everyday_banking",
    label: "Everyday banking",
    icon: "bank",
    agents: [
      BANKING_AGENTS.find(a => a.key === "bank_account_services")!,
      BANKING_AGENTS.find(a => a.key === "bank_cards")!,
      { key: "bank_credit_cards", name: "Credit cards", icon: "banknote", automationRate: 83, description: "Credit card applications, rewards, and management.", capabilities: [], quickActions: [], flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] } },
      { key: "bank_mobile_app", name: "Mobile bank application", icon: "desktop-network", automationRate: 88, description: "Mobile banking app support and troubleshooting.", capabilities: [], quickActions: [], flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] } },
      { key: "bank_payment", name: "Payment", icon: "banknote", automationRate: 85, description: "Payment processing, transfers, and payment issues.", capabilities: [], quickActions: [], flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] } },
    ],
  },
  {
    key: "insurance",
    label: "Insurance",
    icon: "umbrella",
    agents: [
      { key: "bank_auto_insurance", name: "Auto insurance", icon: "umbrella", automationRate: 78, description: "Auto insurance quotes, claims, and policy management.", capabilities: [], quickActions: [], flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] } },
      { key: "bank_insurance_general", name: "Insurance", icon: "hand-protection", automationRate: 80, description: "General insurance inquiries and policy information.", capabilities: [], quickActions: [], flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] } },
    ],
  },
  {
    key: "loans",
    label: "Loans",
    icon: "balance",
    agents: [
      { key: "bank_carloan", name: "Carloan", icon: "balance", automationRate: 76, description: "Car loan applications, rates, and management.", capabilities: [], quickActions: [], flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] } },
      { key: "bank_consumer_loans", name: "Consumer loans", icon: "balance", automationRate: 79, description: "Personal and consumer loan inquiries.", capabilities: [], quickActions: [], flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] } },
      BANKING_AGENTS.find(a => a.key === "bank_lending")!,
    ],
  },
  {
    key: "other_bank_services",
    label: "Other bank services",
    icon: "cogs",
    agents: [
      { key: "bank_fraud", name: "Bank fraud", icon: "lock-security", automationRate: 85, description: "Fraud detection, reporting, and prevention.", capabilities: [], quickActions: [], flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] } },
      BANKING_AGENTS.find(a => a.key === "bank_general")!,
      { key: "bank_prices", name: "Prices", icon: "bar-chart", automationRate: 80, description: "Product pricing, fee schedules, and rate information.", capabilities: [], quickActions: [], flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] } },
    ],
  },
  {
    key: "savings",
    label: "Savings",
    icon: "growth-graph",
    agents: [
      { key: "bank_pension", name: "Pension", icon: "users", automationRate: 75, description: "Pension products, contributions, and retirement planning.", capabilities: [], quickActions: [], flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] } },
      { key: "bank_stocks_funds", name: "Stocks and funds", icon: "bar-chart", automationRate: 77, description: "Investment products, stock trading, and fund management.", capabilities: [], quickActions: [], flow: { knowledgeSources: [], guardrails: [], actionHooks: [], processes: [], standardResponses: [] } },
    ],
  },
];

// ─── Orchestrator Config Registry ───

export const ORCHESTRATOR_BY_INDUSTRY: Record<string, OrchestratorConfig> = {
  banking: {
    standaloneAgents: BANKING_STANDALONE,
    topicGroups: BANKING_TOPIC_GROUPS,
  },
  insurance: {
    standaloneAgents: [],
    topicGroups: [
      {
        key: "insurance_agents",
        label: "Insurance",
        icon: "umbrella",
        agents: INSURANCE_AGENTS,
      },
    ],
  },
};

/**
 * Get the orchestrator config for given areas of interest.
 * Merges multiple industries if more than one selected.
 */
export function getOrchestratorConfig(areasOfInterest: string[]): OrchestratorConfig {
  const areas = areasOfInterest.length > 0
    ? areasOfInterest
    : Object.keys(ORCHESTRATOR_BY_INDUSTRY);

  const merged: OrchestratorConfig = { standaloneAgents: [], topicGroups: [] };
  const seenGroups = new Set<string>();

  for (const area of areas) {
    const config = ORCHESTRATOR_BY_INDUSTRY[area];
    if (!config) continue;
    merged.standaloneAgents.push(...config.standaloneAgents);
    for (const group of config.topicGroups) {
      if (!seenGroups.has(group.key)) {
        seenGroups.add(group.key);
        merged.topicGroups.push(group);
      }
    }
  }

  return merged;
}

// ─── Flat agent helpers (for other sections) ───

export function getAgentsForGuide(areasOfInterest: string[]): SpecialistAgent[] {
  const config = getOrchestratorConfig(areasOfInterest);
  const all: SpecialistAgent[] = [...config.standaloneAgents];
  for (const group of config.topicGroups) {
    all.push(...group.agents);
  }
  return all;
}

export const SPECIALIST_AGENTS = [...INSURANCE_AGENTS, ...BANKING_AGENTS];
