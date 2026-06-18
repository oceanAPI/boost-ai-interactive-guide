import type { SpecialistAgent, TopicGroup } from "../../../agents/_types";

// ─── Primary (8) ───
import flightStatus      from "./flight-status";
import bookingChanges    from "./booking-changes";
import checkInBoarding   from "./check-in-boarding";
import baggage           from "./baggage";
import disruptionIrrops  from "./disruption-irrops";
import ancillaries       from "./ancillaries";
import refundsChanges    from "./refunds-changes";
import groupsCorporate   from "./groups-corporate";

// ─── Addon (4) ───
import loyalty           from "./loyalty";
import awardRedemption   from "./award-redemption";
import cargoFreight      from "./cargo-freight";
import travelDocuments   from "./travel-documents";

// ─── Light (2) ───
import specialAssistance from "./special-assistance";
import lostFound         from "./lost-found";

export const AIRLINE_AGENTS: SpecialistAgent[] = [
  flightStatus,
  bookingChanges,
  checkInBoarding,
  baggage,
  disruptionIrrops,
  ancillaries,
  refundsChanges,
  groupsCorporate,
  loyalty,
  awardRedemption,
  cargoFreight,
  travelDocuments,
  specialAssistance,
  lostFound,
];

// Flight Status is the universal entry — every passenger journey touches it,
// in-trip or ahead of departure.
export const AIRLINE_STANDALONE: SpecialistAgent[] = [
  flightStatus,
];

export const AIRLINE_TOPIC_GROUPS: TopicGroup[] = [
  {
    key: "al_plan_book",
    label: "Plan & book",
    icon: "calendar-day",
    agents: [
      bookingChanges,
      ancillaries,
      groupsCorporate,
      travelDocuments,
    ],
  },
  {
    key: "al_day_of_travel",
    label: "Day of travel",
    icon: "airplane",
    agents: [
      checkInBoarding,
      baggage,
      specialAssistance,
      lostFound,
    ],
  },
  {
    key: "al_disruption_money",
    label: "Disruption & money back",
    icon: "shield-medal",
    agents: [
      disruptionIrrops,
      refundsChanges,
    ],
  },
  {
    key: "al_loyalty_awards",
    label: "Loyalty & awards",
    icon: "trophy",
    agents: [
      loyalty,
      awardRedemption,
    ],
  },
  {
    key: "al_cargo",
    label: "Cargo",
    icon: "package",
    agents: [
      cargoFreight,
    ],
  },
];
