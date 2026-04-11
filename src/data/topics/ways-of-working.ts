import type { TopicEntry } from "./_types";

export const WAYS_OF_WORKING: TopicEntry = {
  key: "ways-of-working",
  sectionId: "topic-ways-of-working",
  name: "Ways of Working",
  shortDescription:
    "How boost.ai partners with you — governance model, customer success, training, and ongoing optimization.",
  icon: "handshake",
  color: "border-boost-green-light",
  content: [
    {
      type: "callout",
      body: "boost.ai doesn't just deliver software — we partner with you to build a conversational AI practice. Dedicated customer success, hands-on training, and continuous optimization ensure you achieve measurable outcomes.",
      variant: "green",
    },
    {
      type: "steps",
      heading: "Engagement model",
      items: [
        { title: "Kickoff", description: "Align on goals, success metrics, and team structure", detail: "Joint workshop to define KPIs, map customer journeys, and establish the governance model. Your stakeholders and our delivery team build a shared roadmap." },
        { title: "Build", description: "Configure agents, integrations, and knowledge base", detail: "boost.ai's delivery team configures the platform while your domain experts provide content and business logic. Weekly syncs keep everyone aligned." },
        { title: "Train", description: "Certify your AI trainers and content managers", detail: "Hands-on training sessions for your team on the boost.ai platform. Certification program ensures your people can independently manage and improve agents." },
        { title: "Launch", description: "Phased go-live with real-time monitoring", detail: "Controlled rollout starting with a subset of traffic. Real-time dashboards track automation rate, resolution quality, and customer satisfaction." },
        { title: "Optimize", description: "Continuous improvement with quarterly business reviews", detail: "Ongoing partnership with regular performance reviews, new feature adoption planning, and scaling strategy. Your dedicated CSM drives continuous value." },
      ],
    },
    {
      type: "list",
      heading: "What boost.ai provides",
      variant: "check",
      items: [
        { title: "Dedicated Customer Success Manager", description: "Your strategic partner for adoption, optimization, and growth" },
        { title: "AI Training Team", description: "Expert support for initial build and complex conversation design" },
        { title: "Technical Support", description: "Priority support with defined SLAs for production issues" },
        { title: "Quarterly Business Reviews", description: "Performance analysis, benchmarking, and roadmap alignment" },
        { title: "Platform Updates", description: "Continuous improvement with regular feature releases and security patches" },
        { title: "AI Trainer Certification", description: "Training program for your team to manage agents independently" },
      ],
    },
    {
      type: "list",
      heading: "What you provide",
      variant: "bullet",
      items: [
        { title: "Domain experts", description: "People who understand your products, policies, and customer needs" },
        { title: "Content stakeholders", description: "Owners of the knowledge that agents need to draw from" },
        { title: "Technical resources", description: "IT contact for integration setup and security review" },
        { title: "Test users", description: "Internal team for UAT and feedback before go-live" },
        { title: "Executive sponsor", description: "Decision-maker who champions the initiative and removes blockers" },
      ],
    },
    {
      type: "stats",
      heading: "Partnership metrics",
      items: [
        { value: 4500, suffix: "+", label: "Certified AI trainers globally" },
        { value: 90, suffix: "%+", label: "Customer retention rate" },
        { value: 12, suffix: "+", label: "Avg. agents per enterprise customer" },
      ],
    },
    {
      type: "callout",
      heading: "No unclear accountability",
      body: "Unlike fragmented pilot approaches where no one owns the customer journey end-to-end, boost.ai's governance model defines clear ownership from day one. Your CSM, your AI trainers, and your executive sponsor form a triangle of accountability that drives measurable results.",
      variant: "purple",
    },
  ],
};
