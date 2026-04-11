import type { TopicEntry } from "./_types";

export const WAYS_OF_WORKING: TopicEntry = {
  key: "ways-of-working",
  sectionId: "topic-ways-of-working",
  name: "Ways of Working",
  shortDescription:
    "How boost.ai partners with you — governance model, customer success, training, and ongoing optimization.",
  icon: "handshake",
  color: "border-boost-green-light",
  headerContent: [
    {
      type: "stats",
      heading: "Partnership at a glance",
      items: [
        { value: 12, suffix: " weeks", label: "Standard implementation" },
        { value: 4500, suffix: "+", label: "Certified AI trainers globally" },
        { value: 90, suffix: "%+", label: "Customer retention rate" },
      ],
    },
  ],
  content: [
    {
      type: "callout",
      heading: "No unclear accountability",
      body: "Unlike fragmented pilot approaches where no one owns the customer journey end-to-end, boost.ai's governance model defines clear ownership from day one. Your CSM, your AI trainers, and your executive sponsor form a triangle of accountability that drives measurable results.",
      variant: "purple",
    },
  ],
};
