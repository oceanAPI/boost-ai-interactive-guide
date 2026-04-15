export interface CaseStudyMetric {
  metric: string;
  value: string;
  improvement?: string;
}

export interface CaseStudyPhase {
  label: string;
  detail: string;
  metric?: string;
}

export interface CaseStudy {
  id: string;
  companyType: string;
  companyDescription: string;
  headline: string; // The one-line hook, e.g. "Skyrockets automation rate with GenAI"
  relevantIndustries: string[];
  channel: "chat" | "voice" | "both";
  image: string;
  challenge: string;
  solution: string;
  results: CaseStudyMetric[];
  journey?: CaseStudyPhase[]; // The transformation over time
  timeline: string;
  videoUrl?: string;
  quote?: {
    text: string;
    author: string;
    role: string;
  };
  context?: { // Company context — makes it feel real
    size?: string;
    employees?: string;
    industry?: string;
  };
}

// Placeholder case studies — replace with real customer stories
export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "mortgage-lender",
    companyType: "Banking",
    headline: "Skyrockets automation rate with GenAI",
    companyDescription: "Leading mortgage lender with 1M+ customers",
    relevantIndustries: ["banking", "fintech"],
    channel: "both",
    image: "/photos/case-studies/voice-banking.jpg",
    context: { size: "1 million+ customers", employees: "4,000+", industry: "Banking" },
    challenge: "Faced rapidly growing customer inquiry volumes, increasing from 4,000 to over 18,000 monthly conversations. They needed a solution that could scale efficiently, improve automation, and boost customer satisfaction without sacrificing response quality.",
    solution: "Partnered with boost.ai to strategically roll out generative AI capabilities within its AI Agent. Over a seven-month period, they incrementally increased the use of generative AI from 4% to 85% of automated conversations, continuously refining the agent's performance.",
    journey: [
      { label: "Month 1", detail: "Initial deployment with core intents", metric: "4% GenAI usage" },
      { label: "Month 3", detail: "Expanded to payment & escrow flows", metric: "32% GenAI usage" },
      { label: "Month 5", detail: "Full rollout across all channels", metric: "67% GenAI usage" },
      { label: "Month 7", detail: "Optimization & fine-tuning complete", metric: "85% GenAI usage" },
    ],
    results: [
      { metric: "Automation Rate", value: "76%", improvement: "from 12%" },
      { metric: "Customers Served", value: "1M+", improvement: "scaled 4.5×" },
      { metric: "Positive Feedback", value: "+18pt", improvement: "increase in satisfaction" },
      { metric: "GenAI Adoption", value: "2,000%", improvement: "surge in 6 months" },
    ],
    timeline: "7 months from pilot to full scale",
  },
  {
    id: "insurer-nordic",
    companyType: "Insurance",
    headline: "From 15-minute wait times to instant resolution",
    companyDescription: "Large Nordic insurer serving 2M+ policyholders",
    relevantIndustries: ["insurance"],
    channel: "chat",
    image: "/photos/case-studies/chat-insurance.jpg",
    context: { size: "2 million+ policyholders", employees: "3,500+", industry: "Insurance" },
    challenge: "Customer service team was overwhelmed with 80,000+ monthly inquiries across claims, billing, and policy changes. Average wait times exceeded 15 minutes during peak periods.",
    solution: "Deployed boost.ai with specialist agents for claims intake, billing inquiries, and policy servicing. Integrated with existing Genesys contact center for seamless human handoff.",
    journey: [
      { label: "Week 2", detail: "Claims agent live with top 10 intents", metric: "24% automation" },
      { label: "Week 4", detail: "Billing & policy agents deployed", metric: "58% automation" },
      { label: "Week 6", detail: "Genesys integration complete", metric: "74% automation" },
      { label: "Week 8", detail: "Full production across all lines", metric: "87% automation" },
    ],
    results: [
      { metric: "Automation Rate", value: "87%", improvement: "from 0%" },
      { metric: "Avg Wait Time", value: "< 10 sec", improvement: "from 15 min" },
      { metric: "Annual Savings", value: "$3.2M", improvement: "62% cost reduction" },
      { metric: "CSAT Score", value: "4.6/5", improvement: "from 3.8/5" },
    ],
    timeline: "8 weeks from kickoff to production",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    quote: {
      text: "The speed of deployment was remarkable. We went from concept to live in under two months, and the automation rates exceeded our expectations from week one.",
      author: "Head of Digital",
      role: "Nordic Insurance Company",
    },
  },
  {
    id: "credit-union",
    companyType: "Credit Union",
    headline: "Small team, massive reach — 24/7 member service",
    companyDescription: "US credit union with 150K+ members",
    relevantIndustries: ["credit_union"],
    channel: "chat",
    image: "/photos/case-studies/chat-credit-union.jpg",
    context: { size: "150,000+ members", employees: "280", industry: "Credit Union" },
    challenge: "Small member services team struggled to keep up with growing digital demand while maintaining the personal touch credit union members expect.",
    solution: "Deployed boost.ai with a focus on member services, loan inquiries, and account management. The AI trainer tools allowed the CU's existing staff to manage the platform without IT dependency.",
    results: [
      { metric: "Member Satisfaction", value: "92%", improvement: "from 78%" },
      { metric: "After-hours Resolution", value: "68%", improvement: "previously 0%" },
      { metric: "Staff Time Freed", value: "1,200 hrs/mo", improvement: "redirected to complex cases" },
    ],
    timeline: "7 weeks to production",
  },
];
