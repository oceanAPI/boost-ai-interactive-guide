import type { SpecialistAgent, TopicGroup } from "../_types";

// Group A — Alarm & System
import alarmOperation from "./alarm-operation";
import alarmTroubleshooting from "./alarm-troubleshooting";
import alarmInternet from "./alarm-internet";
import appSupport from "./app-support";

// Group B — Devices
import accessControl from "./access-control";
import intrusionSensors from "./intrusion-sensors";
import videoCameras from "./video-cameras";
import environmentalSensors from "./environmental-sensors";
import hubPeripherals from "./hub-peripherals";

// Group C — Customer Management
import customerRelationship from "./customer-relationship";
import subscription from "./subscription";
import payment from "./payment";
import service from "./service";

// Group D — Sector Alarm General
import generalInquiries from "./general-inquiries";
import companyInformation from "./company-information";
import feedbackComments from "./feedback-comments";

// Group E — Response & Monitoring
import falseAlarm from "./false-alarm";
import monitoringEscalation from "./monitoring-escalation";
import emergencyResponse from "./emergency-response";
import riparaCasaExpress from "./ripara-casa-express";

// ─── Flat list of all security agents ───

export const SECURITY_AGENTS: SpecialistAgent[] = [
  alarmOperation,
  alarmTroubleshooting,
  alarmInternet,
  appSupport,
  accessControl,
  intrusionSensors,
  videoCameras,
  environmentalSensors,
  hubPeripherals,
  customerRelationship,
  subscription,
  payment,
  service,
  generalInquiries,
  companyInformation,
  feedbackComments,
  falseAlarm,
  monitoringEscalation,
  emergencyResponse,
  riparaCasaExpress,
];

// ─── Topic Groups (matches admin panel structure) ───

export const SECURITY_TOPIC_GROUPS: TopicGroup[] = [
  {
    key: "alarm_system",
    label: "Alarm & System",
    icon: "shield-medal",
    agents: [alarmOperation, alarmTroubleshooting, alarmInternet, appSupport],
  },
  {
    key: "devices",
    label: "Devices",
    icon: "cogs",
    agents: [accessControl, intrusionSensors, videoCameras, environmentalSensors, hubPeripherals],
  },
  {
    key: "customer_management",
    label: "Customer management",
    icon: "bank",
    agents: [customerRelationship, subscription, payment, service],
  },
  {
    key: "sector_alarm_general",
    label: "Sector Alarm general",
    icon: "speech",
    agents: [generalInquiries, companyInformation, feedbackComments],
  },
  {
    key: "response_monitoring",
    label: "Response & monitoring",
    icon: "headset",
    agents: [falseAlarm, monitoringEscalation, emergencyResponse, riparaCasaExpress],
  },
];
