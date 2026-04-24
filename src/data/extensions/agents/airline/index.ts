import type { SpecialistAgent, TopicGroup } from "../../../agents/_types";

import flightStatus from "./flight-status";
import bookingChanges from "./booking-changes";
import checkInBoarding from "./check-in-boarding";
import baggage from "./baggage";
import loyalty from "./loyalty";
import specialAssistance from "./special-assistance";

export const AIRLINE_AGENTS: SpecialistAgent[] = [
  flightStatus,
  bookingChanges,
  checkInBoarding,
  baggage,
  loyalty,
  specialAssistance,
];

// Flight Status is the universal entry — every passenger journey touches it,
// in-trip or ahead of departure.
export const AIRLINE_STANDALONE: SpecialistAgent[] = [
  flightStatus,
];

export const AIRLINE_TOPIC_GROUPS: TopicGroup[] = [
  {
    key: "al_before_travel",
    label: "Before you travel",
    icon: "calendar-day",
    agents: [
      bookingChanges,
      checkInBoarding,
    ],
  },
  {
    key: "al_on_the_day",
    label: "At the airport",
    icon: "airplane",
    agents: [
      baggage,
      specialAssistance,
    ],
  },
  {
    key: "al_loyalty",
    label: "Loyalty",
    icon: "heart",
    agents: [
      loyalty,
    ],
  },
];
