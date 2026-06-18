import type { SpecialistAgent, TopicGroup } from "../../../agents/_types";

// ─── Primary (10) ───
import billingInvoices         from "./billing-and-invoices";
import planSubscription        from "./plan-and-subscription";
import deviceSupport           from "./device-support";
import networkTroubleshooting  from "./network-troubleshooting";
import roaming                 from "./roaming";
import simEsim                 from "./sim-esim";
import newCustomer             from "./new-customer";
import accountSecurity         from "./account-security";
import homeMove                from "./home-move";
import fraudScam               from "./fraud-scam";

// ─── Addon (4) ───
import numberPorting           from "./number-porting";
import businessSme             from "./business-sme";
import complaintsRegulatory    from "./complaints-regulatory";
import partnerServices         from "./partner-services";

// ─── Light (4) ───
import channelPackages         from "./channel-packages";
import prepaidTopup            from "./prepaid-topup";
import dataUsage               from "./data-usage";
import parentalFamily          from "./parental-family";

export const TELCO_AGENTS: SpecialistAgent[] = [
  billingInvoices,
  planSubscription,
  deviceSupport,
  networkTroubleshooting,
  roaming,
  simEsim,
  newCustomer,
  accountSecurity,
  homeMove,
  fraudScam,
  numberPorting,
  businessSme,
  complaintsRegulatory,
  partnerServices,
  channelPackages,
  prepaidTopup,
  dataUsage,
  parentalFamily,
];

// Billing is the universal entry-point — every customer hits it regardless
// of whether they're mobile, broadband, or B2B.
export const TELCO_STANDALONE: SpecialistAgent[] = [
  billingInvoices,
];

export const TELCO_TOPIC_GROUPS: TopicGroup[] = [
  {
    key: "tc_account_lifecycle",
    label: "Account & lifecycle",
    icon: "user-profile",
    agents: [
      newCustomer,
      planSubscription,
      accountSecurity,
      homeMove,
      numberPorting,
    ],
  },
  {
    key: "tc_connectivity_devices",
    label: "Connectivity & devices",
    icon: "desktop-network",
    agents: [
      deviceSupport,
      networkTroubleshooting,
      simEsim,
      roaming,
    ],
  },
  {
    key: "tc_services_bundles",
    label: "Services & bundles",
    icon: "handshake",
    agents: [
      partnerServices,
      channelPackages,
      prepaidTopup,
    ],
  },
  {
    key: "tc_protection_oversight",
    label: "Protection & oversight",
    icon: "shield-medal",
    agents: [
      fraudScam,
      dataUsage,
      parentalFamily,
      complaintsRegulatory,
    ],
  },
  {
    key: "tc_business",
    label: "Business",
    icon: "building-institution",
    agents: [
      businessSme,
    ],
  },
];
