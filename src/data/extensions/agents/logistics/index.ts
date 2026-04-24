import type { SpecialistAgent, TopicGroup } from "../../../agents/_types";

import parcelTracking from "./parcel-tracking";
import deliveryManagement from "./delivery-management";
import claims from "./claims";
import pickupBooking from "./pickup-booking";
import shippingRates from "./shipping-rates";
import sustainability from "./sustainability";

export const LOGISTICS_AGENTS: SpecialistAgent[] = [
  parcelTracking,
  deliveryManagement,
  claims,
  pickupBooking,
  shippingRates,
  sustainability,
];

// Parcel Tracking is the universal entry — every recipient and most senders
// hit it first.
export const LOGISTICS_STANDALONE: SpecialistAgent[] = [
  parcelTracking,
];

export const LOGISTICS_TOPIC_GROUPS: TopicGroup[] = [
  {
    key: "lg_recipient",
    label: "Recipient services",
    icon: "home",
    agents: [
      deliveryManagement,
      claims,
    ],
  },
  {
    key: "lg_sender",
    label: "Sender services",
    icon: "hand-to-hand",
    agents: [
      pickupBooking,
      shippingRates,
    ],
  },
  {
    key: "lg_impact",
    label: "Impact & sustainability",
    icon: "light",
    agents: [
      sustainability,
    ],
  },
];
