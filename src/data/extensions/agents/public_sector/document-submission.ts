import type { SpecialistAgent } from "../../../agents/_types";

const agent: SpecialistAgent = {
  key: "ps_document_submission",
  name: "Document Submission",
  icon: "hierarchy-document",
  automationRate: 86,
  avgResolutionTime: "~2 min",
  topTopic: "How do I upload?",
  description:
    "Guides citizens through uploading supporting documents to an open case or application — accepted formats, size limits, verification state, and what happens next.",
  capabilities: [
    { title: "Upload channel guidance",    description: "Explain which upload channels exist (portal, mobile app, post, in-person) and which is fastest" },
    { title: "Format & size rules",        description: "Clarify accepted file types, page limits, and what to do when a document is too large or in the wrong format" },
    { title: "Attach to specific case",    description: "Ensure the uploaded document lands against the correct case reference" },
    { title: "Upload-status lookup",        description: "Check whether a submitted document has been received, processed, or returned for re-submission" },
  ],
  quickActions: ["How to upload", "Accepted formats", "Upload status", "Missing document"],
  flow: {
    knowledgeSources: [
      { id: "ps-ds-kb-upload-rules", name: "Upload Rules",           type: "document", icon: "hierarchy-document", description: "Official list of accepted document types, size limits, and verification requirements" },
      { id: "ps-ds-kb-doc-api",      name: "Document Tracking API",  type: "api",      icon: "computer-api",       description: "Internal API that returns the current status of each submitted document by case reference" },
    ],
    guardrails: [
      { id: "ps-ds-gr-pii",          name: "PII Protection",          type: "pii",         icon: "lock-security", description: "Prevents the agent from ingesting or echoing document contents — state lookups only" },
    ],
    actionHooks: [
      { id: "ps-ds-ah-upload-link",  name: "Open Upload Portal",      type: "link",        icon: "finger-tap",    description: "Deep-links the citizen into the document-upload form pre-attached to their case number" },
      { id: "ps-ds-ah-transfer",     name: "Transfer to Caseworker",  type: "transfer",    icon: "headset",       description: "Hands off when a citizen needs help with an unusual document type or rejection" },
    ],
    processes: [
      { id: "ps-ds-pr-verify-case",  name: "Verify Case Reference",   type: "workflow",    icon: "check-symbol-check", description: "Confirms the case reference exists and is open for document submission before offering upload links" },
    ],
    standardResponses: [
      { id: "ps-ds-sr-upload-ok",    name: "Upload Received",          type: "standard",    icon: "thumbs-up",     description: "Confirmation message when a document has been successfully received and queued for processing" },
      { id: "ps-ds-sr-fallback",     name: "Manual Submission Needed", type: "fallback",    icon: "route",         description: "Graceful fallback pointing to in-person or postal submission when digital fails" },
    ],
  },
  tier: "addon",
};

export default agent;
