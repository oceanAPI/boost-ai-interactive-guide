import type { SpecialistAgent, TopicGroup } from "../../../agents/_types";

import billingInvoices from "./billing-and-invoices";
import planSubscription from "./plan-and-subscription";
import deviceSupport from "./device-support";
import networkTroubleshooting from "./network-troubleshooting";
import numberPorting from "./number-porting";
import channelPackages from "./channel-packages";

export const TELCO_AGENTS: SpecialistAgent[] = [
  billingInvoices,
  planSubscription,
  deviceSupport,
  networkTroubleshooting,
  numberPorting,
  channelPackages,
];

// Billing is the standalone universal entry — every customer hits it regardless
// of whether they're mobile, broadband, or B2B.
export const TELCO_STANDALONE: SpecialistAgent[] = [
  billingInvoices,
];

export const TELCO_TOPIC_GROUPS: TopicGroup[] = [
  {
    key: "tc_account",
    label: "Account & plan",
    icon: "user-profile",
    agents: [
      planSubscription,
      numberPorting,
    ],
  },
  {
    key: "tc_tech",
    label: "Connectivity & devices",
    icon: "desktop-network",
    agents: [
      deviceSupport,
      networkTroubleshooting,
    ],
  },
  {
    key: "tc_entertainment",
    label: "TV & entertainment",
    icon: "video-player",
    agents: [
      channelPackages,
    ],
  },
];
