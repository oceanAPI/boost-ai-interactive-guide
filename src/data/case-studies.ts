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
  headline: string; // The one-line hook
  relevantIndustries: string[];
  channel: "chat" | "voice" | "both";
  image: string;
  /** Brandfetch CDN URL (or local path) for the company logo. Used in cards where the hero photo isn't ideal. */
  logoUrl?: string;
  challenge: string;
  solution: string;
  results: CaseStudyMetric[];
  journey?: CaseStudyPhase[];
  timeline: string;
  videoUrl?: string;
  sourceUrl?: string; // Link to the original case study on boost.ai
  quote?: {
    text: string;
    author: string;
    role: string;
  };
  context?: {
    size?: string;
    employees?: string;
    industry?: string;
  };
}

/**
 * Real case studies sourced from boost.ai/case-studies.
 *
 * Image paths are placeholders — drop JPGs named after each id into
 * /public/photos/case-studies/ to wire them up. Logos come from
 * Brandfetch in the section component so cards render cleanly even
 * before hero images are in place.
 */
export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "dnb-aino",
    companyType: "Banking",
    headline: "DNB automates 20% of all service traffic with Aino",
    companyDescription: "Scandinavia's biggest bank by market value, serving customers across Norway.",
    relevantIndustries: ["banking", "fintech"],
    channel: "chat",
    image: "/photos/case-studies/dnb-aino.png",
    logoUrl: "https://cdn.brandfetch.io/dnb.no",
    videoUrl: "https://vimeo.com/505132407",
    context: { industry: "Banking" },
    challenge: "DNB's contact center received several thousand chat conversations daily, many easily handled by agents but consuming valuable time and resources. The bank had to use part-time temporary workers to manage the enormous volume of incoming chat traffic.",
    solution: "Boost.ai deployed Aino, an AI chatbot built to handle a broad spectrum of inquiries including credit cards, loans, and account interactions. The solution uses advanced Natural Language Understanding to automate high-volume queries and seamlessly route complex interactions to human agents.",
    results: [
      { metric: "Chat traffic automated", value: "50-60%" },
      { metric: "Total service traffic automated", value: "20-22%", improvement: "across chat, phone and email" },
      { metric: "Topics covered from day one", value: "2,500" },
      { metric: "Time to production", value: "8 weeks" },
      { metric: "Daily automated interactions", value: "10,000+" },
      { metric: "CSAT score", value: "68%", improvement: "Q3 2020, all-time high" },
    ],
    timeline: "Launched October 2018; 50%+ automation in 6 months",
    sourceUrl: "https://boost.ai/case-studies/ai-chatbot-banking/",
    quote: {
      text: "Our chatbot AINO is the most efficient employee in DNB.",
      author: "Ingjerd Blekeli Spiten",
      role: "Group EVP of Personal Banking, DNB",
    },
  },
  {
    id: "dnb-juno",
    companyType: "Banking",
    headline: "Juno — the internal AI agent powering DNB's frontline",
    companyDescription: "Norway's largest bank, serving retail and corporate customers nationwide.",
    relevantIndustries: ["banking", "fintech"],
    channel: "chat",
    image: "/photos/case-studies/dnb-juno.png",
    logoUrl: "https://cdn.brandfetch.io/dnb.no",
    context: { industry: "Banking" },
    challenge: "DNB's customer service agents struggled to access the various routines and processes needed to help customers across phone, email, and live chat. Manual document management was inefficient and time-consuming, causing delays and degrading the customer experience.",
    solution: "DNB deployed Juno, an internal virtual agent on the boost.ai platform, to help agents instantly access department-specific routines. Using platform filtering, Juno serves seven business units without separate bots, integrates with APIs and RPA systems, and auto-checks system status to flag disruptions to agents.",
    results: [
      { metric: "Daily active users", value: "1,200" },
      { metric: "Conversations per month", value: "80,000" },
      { metric: "Inquiries answered in 2022", value: "2 million" },
      { metric: "Topics covered", value: "3,400+" },
      { metric: "Aino chat automation rate", value: "50%", improvement: "incoming chat traffic" },
      { metric: "Business units served", value: "7" },
    ],
    timeline: "Launched March 2020",
    sourceUrl: "https://boost.ai/case-studies/how-dnb-transformed-customer-service-operations-and-enhanced-human-agent-efficiency-with-conversational-ai/",
    quote: {
      text: "Juno has been a game-changer for our customer service agents. It has made it a lot easier to find information, making their jobs easier and customers receive faster and more accurate responses to their inquiries.",
      author: "Maia Sognefest",
      role: "Juno Product Manager, DNB",
    },
  },
  {
    id: "sparebank-1-ostlandet",
    companyType: "Banking",
    headline: "SpareBank 1 Østlandet writes the GenAI playbook for banks",
    companyDescription: "A leading Norwegian savings bank serving over 496,000 customers.",
    relevantIndustries: ["banking", "fintech"],
    channel: "chat",
    image: "/photos/case-studies/sparebank-1-ostlandet.png",
    logoUrl: "https://cdn.brandfetch.io/sparebank1.no",
    context: { size: "496,000+ customers", industry: "Banking" },
    challenge: "In 2018, SpareBank 1 Østlandet saw growing demand for digital service channels as customer expectations evolved and competitors deployed chatbots. The bank sought a scalable solution to enable intuitive customer engagement across its website.",
    solution: "SpareBank 1 Østlandet deployed boost.ai's conversational AI platform starting in 2018, launching their AI Agent 'Ida.' In December 2024 they became one of the first banks globally to put boost.ai's Generative Action into a customer-facing context, using LLMs within pre-approved guardrails for compliance and safety.",
    results: [
      { metric: "Conversations handled by Ida", value: "2.3 million", improvement: "since launch" },
      { metric: "Conversations since Generative Action launch", value: "85,000", improvement: "since December 1, 2024" },
      { metric: "Customer inquiries routed through Ida", value: "28%", improvement: "all channels" },
      { metric: "Automation rate", value: "41%" },
      { metric: "Powered by generative AI", value: "10%", improvement: "6,800+ conversations since Dec 2024" },
    ],
    timeline: "Partnership from 2017; Ida launched 2018; Generative Action Dec 2024",
    sourceUrl: "https://boost.ai/case-studies/how-sparebank-1-ostlandet-is-writing-the-playbook-for-generative-ai-adoption-in-banks/",
    quote: {
      text: "People used to talk about chatbots negatively, but that's changing. Now, customers want to test it, engage with it, and see how it performs.",
      author: "Marthe Stramrud",
      role: "AI Trainer, SpareBank 1 Østlandet",
    },
  },
  {
    id: "islandsbanki",
    companyType: "Banking",
    headline: "Íslandsbanki automates 50% of online traffic in 6 months",
    companyDescription: "An Icelandic financial services company providing banking solutions nationwide.",
    relevantIndustries: ["banking", "fintech"],
    channel: "chat",
    image: "/photos/case-studies/islandsbanki.png",
    logoUrl: "https://cdn.brandfetch.io/islandsbanki.is",
    context: { industry: "Banking" },
    challenge: "Íslandsbanki needed to scale personalized customer support without adding headcount, including 24/7 self-service in Icelandic — a language with very little available training data for conversational AI.",
    solution: "Boost.ai's platform, integrated with Genesys Cloud, powers a hyper-personalized virtual agent that automates customer interactions through chat, reduces agent workload, and enables self-service outside business hours.",
    results: [
      { metric: "Online traffic automated", value: "50%", improvement: "within 6 months" },
      { metric: "Customers viewing AI positively", value: "85-90%" },
      { metric: "Icelandic language mastery", value: "a few days" },
    ],
    timeline: "6 months to 50% automation",
    sourceUrl: "https://boost.ai/case-studies/unlock-hyper-personalized-customer-experiences-with-boost-ai-and-genesys-cloud/",
  },
  {
    id: "genesys-partnership",
    companyType: "Partnership",
    headline: "Boost.ai + Genesys Cloud: voice handover for regulated industries",
    companyDescription: "Partnership joining boost.ai's conversational AI platform with Genesys Cloud's contact-center infrastructure.",
    relevantIndustries: ["banking", "fintech", "insurance", "telecom"],
    channel: "both",
    image: "/photos/case-studies/genesys-partnership.png",
    logoUrl: "/logos/genesys.png",
    videoUrl: "https://www.youtube.com/watch?v=NwI-1ohb__s",
    context: { industry: "Partnership" },
    challenge: "Regulated industries need hyper-personalized customer service across chat AND voice while maintaining compliance, security, and seamless handover to human agents. Stitching those capabilities together from separate vendors creates fragmented experiences and fragile integrations.",
    solution: "Boost.ai's GenAI platform deploys inside Genesys Cloud, giving a single conversational brain across chat and voice. The Genesys voice handover demo shows how a customer conversation started with the AI agent passes cleanly — with full context — to a Genesys-routed human agent when escalation is needed.",
    results: [
      { metric: "Deployed in production", value: "Íslandsbanki", improvement: "50% online automation in 6 months" },
      { metric: "Channels covered", value: "Chat + Voice" },
      { metric: "Positive AI perception", value: "85-90%", improvement: "Íslandsbanki customers" },
    ],
    timeline: "Joint solution — available via both boost.ai and Genesys AppFoundry",
    sourceUrl: "https://boost.ai/case-studies/unlock-hyper-personalized-customer-experiences-with-boost-ai-and-genesys-cloud/",
  },
  {
    id: "aspire-general-insurance",
    companyType: "Insurance",
    headline: "Aspire scales voice automation to 53% across 37K monthly calls",
    companyDescription: "A tech-forward affordable insurance provider serving policyholders and brokers in the US.",
    relevantIndustries: ["insurance"],
    channel: "both",
    image: "/photos/case-studies/aspire-general-insurance.png",
    logoUrl: "https://cdn.brandfetch.io/aspiregeneral.com",
    context: { industry: "Insurance" },
    challenge: "Aspire saw dramatic post-pandemic growth that strained its contact center and drove up wait times. Its legacy live chat vendor went out of business, forcing a scramble for a new solution. With call volumes rising and agents bogged down by repetitive questions, Aspire needed a scalable system to match business expansion.",
    solution: "Aspire built on its successful boost.ai chat deployment by launching a Voice AI Agent in 2023 to handle high-volume phone inquiries. The voice bot replaced a standard touchtone IVR, handling policy lookups and payment status queries via secure, read-only database integration through API calls for real-time policy updates.",
    results: [
      { metric: "Spanish voice automation rate", value: "53%" },
      { metric: "English voice automation rate", value: "43%" },
      { metric: "Automated interactions per month", value: "37,000+" },
      { metric: "Contact center capacity", value: "Doubled", improvement: "without increasing headcount" },
      { metric: "English YTD automation rate", value: "45%" },
    ],
    timeline: "Chat in 2021; voice launched 2023",
    sourceUrl: "https://boost.ai/case-studies/how-aspire-general-insurance-scaled-voice-automation-to-53-and-handled-37k-monthly-calls/",
    quote: {
      text: "We took a thoughtful approach to language, asking native speakers how something would naturally be said in conversation.",
      author: "Rick Magdaleno",
      role: "Business System Analyst, Aspire General Insurance",
    },
  },
  {
    id: "tryg",
    companyType: "Insurance",
    headline: "Tryg runs three AI agents across three Nordic markets",
    companyDescription: "The Nordics' second-largest non-life insurer, serving 4M+ customers across Denmark, Norway, and Sweden.",
    relevantIndustries: ["insurance"],
    channel: "chat",
    image: "/photos/case-studies/tryg.png",
    logoUrl: "https://cdn.brandfetch.io/tryg.com",
    videoUrl: "https://vimeo.com/511542233",
    context: { size: "4 million+ customers", industry: "Insurance" },
    challenge: "Insurance is an inherently complex industry that can often leave consumers struggling with policy wording and product information. Tryg wanted to tackle this customer service challenge while also maximising the efficiency of its support staff across three principal markets: Denmark, Norway, and Sweden.",
    solution: "Tryg deployed three distinct virtual agents on boost.ai's no-code conversational AI platform: Mia in Norway for customer-facing claims and product support, Rosa in Denmark for internal employee support, and Ebbe in Sweden for customer assistance, with API integrations for automated tasks.",
    results: [
      { metric: "Mia automation rate", value: "80%", improvement: "cases handled without human support" },
      { metric: "Mia conversations (2020)", value: "200,000" },
      { metric: "Mia topics covered", value: "5,000" },
      { metric: "Rosa accuracy rate", value: "95%" },
      { metric: "Rosa daily users", value: "750", improvement: "Tryg employees" },
      { metric: "Rosa topics covered", value: "1,200+" },
    ],
    timeline: "Norway Oct 2018 · Denmark Aug 2018 · Sweden Apr 2020 (rolled out in 3 weeks)",
    sourceUrl: "https://boost.ai/case-studies/tryg-case-study-conversational-ai/",
    quote: {
      text: "Working with artificial intelligence helps to assist our internal and external processes and to deliver fantastic customer experiences.",
      author: "Morten Hübbe",
      role: "CEO, Tryg",
    },
  },
  {
    id: "telenor",
    companyType: "Telecom",
    headline: "Scandinavia's largest telco raises CX with Telmi",
    companyDescription: "One of Scandinavia's largest telcos, serving millions across the Nordics.",
    relevantIndustries: ["telecom"],
    channel: "chat",
    image: "/photos/case-studies/telenor.png",
    logoUrl: "https://cdn.brandfetch.io/telenor.com",
    videoUrl: "https://vimeo.com/387423701",
    context: { industry: "Telecom" },
    challenge: "In 2023, telcos ranked last in customer satisfaction against other private-sector industries. Customers increasingly expected technical fluency and fast responses, pushing telecom companies to invest in better service infrastructure and strategies.",
    solution: "Telenor deployed Telmi, a conversational AI virtual agent built by boost.ai and accessible via the company website. Telmi uses deep learning and natural language technologies to interact at an advanced conversational level, with 20+ unique integrations letting logged-in customers request PUK codes, upgrade data plans, view invoices, and access account details.",
    results: [
      { metric: "Unique integrations", value: "20+", improvement: "one of the most advanced virtual agents of its kind" },
    ],
    timeline: "Launched January 2019",
    sourceUrl: "https://boost.ai/case-studies/enhancing-telecom-customer-experience-with-conversational-ai/",
    quote: {
      text: "Integrations are a key part of Telmi's functionality, giving our customers agency over the process by incorporating their subscription and services into every interaction.",
      author: "Jens Mosbergvik",
      role: "Head of Operational Support, Customer Care",
    },
  },
  {
    id: "a1-slovenia",
    companyType: "Telecom",
    headline: "A1 Slovenia's NPS jumps 113 points with GenAI agent Lumi",
    companyDescription: "Leading integrated communications provider in Slovenia with 700K+ mobile and 100K+ fixed-line customers.",
    relevantIndustries: ["telecom"],
    channel: "chat",
    image: "/photos/case-studies/a1-slovenia.png",
    logoUrl: "https://cdn.brandfetch.io/a1.si",
    context: { size: "800,000+ customers", industry: "Telecom" },
    challenge: "A1 Slovenia faced rising customer expectations for seamless digital support while its previous chatbot operated on static flows, acting more as a query filter than a resolution tool. The lack of flexibility caused customer drop-off before transfers and frequently resulted in lost context during escalations, making complex inquiries hard to answer accurately.",
    solution: "A1 deployed Lumi, a hybrid AI agent on boost.ai's Conversational AI Platform using Generative Action. Lumi handles both routine and complex inquiries by dynamically selecting between predefined answers and LLM-generated context-aware responses, integrated with A1's knowledge base and NLU capabilities.",
    results: [
      { metric: "NPS increase (Lumi-only interactions)", value: "+113 pts", improvement: "from ~-53 to 60" },
      { metric: "NPS increase (escalated interactions)", value: "+35 pts", improvement: "vs prior chatbot" },
      { metric: "Interactions handled by Lumi", value: "53.3%" },
      { metric: "Escalation likelihood reduction", value: "70%", improvement: "for queries using generative AI" },
    ],
    timeline: "Launched March 2024",
    sourceUrl: "https://boost.ai/case-studies/a1-slovenia-drives-major-customer-happiness-increase-with-generative-ai/",
    quote: {
      text: "Lumi has helped transform how we interact with our customers. It improves efficiency and creates a clear pathway to delivering even more personalized service offerings.",
      author: "Burcu Begič",
      role: "Director of Customer Service & Experience, A1 Slovenia",
    },
  },
  {
    id: "fibia",
    companyType: "Telecom",
    headline: "Fibia automates 53% of inquiries with generative AI",
    companyDescription: "A major provider of high-speed fiber broadband in Denmark.",
    relevantIndustries: ["telecom"],
    channel: "chat",
    image: "/photos/case-studies/fibia.png",
    logoUrl: "https://cdn.brandfetch.io/fibia.dk",
    context: { industry: "Telecom" },
    challenge: "Fibia handled a consistently high volume of customer inquiries, from account-specific requests to general package and service FAQs. This demand placed increasing strain on customer service teams and highlighted the need for a solution that could support routine service while evolving into a trusted extension of the team.",
    solution: "Boost.ai's no-code conversational AI platform let Fibia launch an AI Agent with minimal ramp-up and zero backend development. The agent initially focused on routine queries, then expanded with Generative Action — boost.ai's per-topic LLM functionality — to move beyond predefined answers and produce context-aware responses.",
    results: [
      { metric: "Automation rate", value: "53%" },
      { metric: "Escalation rate", value: "-50%", improvement: "dropped to 4.6%" },
      { metric: "Positive feedback increase", value: "+20%", improvement: "after adopting generative AI" },
      { metric: "Positive feedback share", value: "66%+", improvement: "two-thirds of conversations" },
      { metric: "Avg chat duration reduction", value: "-3 min" },
      { metric: "Avg conversation length", value: "2 messages" },
    ],
    timeline: "Ongoing — generative AI rollout with Generative Action",
    sourceUrl: "https://boost.ai/case-studies/how-fibia-is-elevating-customer-experience-with-a-future-ready-ai-strategy/",
  },
  {
    id: "hallon",
    companyType: "Telecom",
    headline: "Hallon automates 65% of inquiries with Berry",
    companyDescription: "A Swedish telecom subsidiary of Tre offering digital-first customer service.",
    relevantIndustries: ["telecom"],
    channel: "chat",
    image: "/photos/case-studies/hallon.png",
    logoUrl: "https://cdn.brandfetch.io/hallon.se",
    context: { industry: "Telecom" },
    challenge: "As Hallon's customer base rapidly expanded, the company faced significant challenges managing surging inquiries. Traditional customer service methods were strained with growing email backlogs and high dropped chat frequencies, underscoring the critical need for a scalable solution.",
    solution: "Hallon implemented Berry, a conversational AI-powered virtual agent built on the boost.ai platform. Using boost.ai's no-code conversation builder and pre-built telecom content, Berry was deployed in under six months to handle common inquiries and streamline customer service processes.",
    results: [
      { metric: "Resolution rate", value: "90%" },
      { metric: "Inquiries fully automated", value: "65%" },
      { metric: "Avg monthly conversations", value: "40,000" },
      { metric: "Email queue time", value: "< 5 min", improvement: "from a 1-month backlog" },
      { metric: "Deployment timeframe", value: "6 months" },
    ],
    timeline: "Deployed in under 6 months",
    sourceUrl: "https://boost.ai/case-studies/how-hallon-transformed-front-line-customer-service-while-automating-65-of-inquiries/",
    quote: {
      text: "The efficiency difference is night and day. We had a month's backlog in our support emails, and now with Berry, we have less than five-minute queue times.",
      author: "Oskar Lindhé",
      role: "Product Owner, Hallon",
    },
  },
  {
    id: "tourradar",
    companyType: "Travel",
    headline: "TourRadar saves 780+ hours monthly with generative AI",
    companyDescription: "Adventure booking platform connecting travelers to 50,000+ organized tours across 160+ countries.",
    relevantIndustries: ["travel", "ecommerce"],
    channel: "chat",
    image: "/photos/case-studies/tourradar.png",
    logoUrl: "https://cdn.brandfetch.io/tourradar.com",
    context: { size: "2M+ travelers", industry: "Travel" },
    challenge: "TourRadar's support team handled 5,000+ chat interactions monthly while serving 2 million+ travelers across time zones. They needed to handle everything from simple itinerary questions to complex tour recommendations, while avoiding rigid templated chatbot responses and the burden of constant content updates.",
    solution: "TourRadar deployed boost.ai's platform with advanced generative AI, including Generative Action for dynamic, context-aware responses grounded in approved knowledge sources. The AI Agent handles booking details, account support, cancellations, and payment issues across 31+ topics, with direct CRM integration for agent assistance.",
    results: [
      { metric: "Customer inquiries handled by AI", value: "82%" },
      { metric: "Live chat deflection", value: "50% → 80%" },
      { metric: "Response accuracy rate", value: "98%" },
      { metric: "Hours saved per month", value: "780+" },
      { metric: "CSAT for AI-handled chats", value: "60%" },
      { metric: "Escalation rate", value: "20%" },
    ],
    timeline: "Launched August 2024",
    sourceUrl: "https://boost.ai/case-studies/how-tourradar-created-a-more-seamless-customer-experience-and-saved-780-hours-monthly-with-generative-ai/",
    quote: {
      text: "Since switching to boost.ai, we've gone from a rigid, keyword-based chatbot to a 24/7 AI Agent that now handles 80% of live chat inquiries with 98% accuracy.",
      author: "Nadine Tesch",
      role: "Head of Customer Support EMEA, TourRadar",
    },
  },
];
