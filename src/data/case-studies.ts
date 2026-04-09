export interface CaseStudyMetric {
  metric: string;
  value: string;
  improvement?: string;
}

export interface CaseStudy {
  id: string;
  companyType: string;
  companyDescription: string;
  relevantIndustries: string[];
  challenge: string;
  solution: string;
  results: CaseStudyMetric[];
  timeline: string;
  quote?: {
    text: string;
    author: string;
    role: string;
  };
}

// Placeholder case studies — replace with real customer stories
export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "insurer-nordic",
    companyType: "Insurance",
    companyDescription: "Large Nordic insurer serving 2M+ policyholders",
    relevantIndustries: ["insurance"],
    challenge: "Customer service team was overwhelmed with 80,000+ monthly inquiries across claims, billing, and policy changes. Average wait times exceeded 15 minutes during peak periods.",
    solution: "Deployed boost.ai with specialist agents for claims intake, billing inquiries, and policy servicing. Integrated with existing Genesys contact center for seamless human handoff.",
    results: [
      { metric: "Automation Rate", value: "87%", improvement: "from 0%" },
      { metric: "Avg Wait Time", value: "< 10 sec", improvement: "from 15 min" },
      { metric: "Annual Savings", value: "$3.2M", improvement: "62% cost reduction" },
      { metric: "CSAT Score", value: "4.6/5", improvement: "from 3.8/5" },
    ],
    timeline: "8 weeks from kickoff to production",
    quote: {
      text: "The speed of deployment was remarkable. We went from concept to live in under two months, and the automation rates exceeded our expectations from week one.",
      author: "Head of Digital",
      role: "Nordic Insurance Company",
    },
  },
  {
    id: "bank-retail",
    companyType: "Banking",
    companyDescription: "Mid-size retail bank with 500K+ customers",
    relevantIndustries: ["banking", "fintech"],
    challenge: "Digital transformation initiative required modernizing customer service across chat, voice, and mobile channels while maintaining strict regulatory compliance.",
    solution: "Implemented boost.ai agent orchestrator with billing, account services, and fraud alert agents. Connected to core banking platform via API connector with full authentication flow.",
    results: [
      { metric: "Conversations Automated", value: "45K/mo", improvement: "from manual handling" },
      { metric: "Cost per Contact", value: "$0.42", improvement: "from $9.50" },
      { metric: "Compliance Score", value: "100%", improvement: "zero violations" },
      { metric: "Channel Coverage", value: "5 channels", improvement: "from 2" },
    ],
    timeline: "6 weeks to first channel, 10 weeks full rollout",
  },
  {
    id: "credit-union",
    companyType: "Credit Union",
    companyDescription: "US credit union with 150K+ members",
    relevantIndustries: ["credit_union"],
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
