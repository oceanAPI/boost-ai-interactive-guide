export interface Integration {
  name: string;
  description: string;
  tags?: string[];
}

export interface IntegrationCategory {
  label: string;
  key: string;
  items: Integration[];
}

export const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  {
    label: "Channel",
    key: "channel",
    items: [
      { name: "Vonage WhatsApp & SMS", description: "Connect to Vonage Messages" },
      { name: "A2A", description: "Expose your boost.ai Agentic AI to an A2A network", tags: ["beta"] },
      { name: "Aldeamo Whatsapp", description: "Connect to Aldeamo Whatsapp" },
      { name: "Facebook", description: "Connect to Facebook Messenger" },
      { name: "Genesys Bot Connector", description: "Use with Genesys Bot Connector" },
      { name: "Google Chat", description: "Connect with Google Chat" },
      { name: "LivePerson Bot Connector", description: "Connect through LivePerson Third-Party Bots" },
      { name: "Microsoft Bot Framework", description: "Connect to Microsoft Bot Framework" },
      { name: "NICE Virtual Agent Hub", description: "Integrate with NICE Virtual Agent Hub", tags: ["beta"] },
      { name: "Puzzel Digital Engagement", description: "Connect to Puzzel Digital Engagement", tags: ["beta"] },
      { name: "Symphony", description: "Connect with Symphony" },
      { name: "Twilio SMS", description: "Connect to Twilio SMS" },
      { name: "Twilio WhatsApp", description: "Connect to WhatsApp via Twilio" },
      { name: "Viber", description: "Connect with Viber" },
      { name: "Workplace", description: "Connect to Workplace" },
      { name: "Zendesk Sunshine Conversations", description: "Integrate with Zendesk Sunshine Conversations" },
    ],
  },
  {
    label: "Human Handover",
    key: "human_handover",
    items: [
      { name: "Twilio Flex Conversations", description: "Use Twilio Flex as your human chat provider" },
      { name: "Amazon Connect", description: "Set Amazon Connect as your human chat provider" },
      { name: "Amazon Connect Voice Handover", description: "Set Amazon Connect as your handover provider for voice" },
      { name: "Avaya Aura", description: "Connect to Avaya Aura" },
      { name: "boost.ai", description: "Set boost.ai as your human chat backend" },
      { name: "Custom", description: "Build your own human chat and chat panel" },
      { name: "Dixa", description: "Set Dixa as your human chat provider" },
      { name: "Dynamics 365 Human Chat", description: "Set Dynamics 365 Customer Service Chat as your human chat provider" },
      { name: "eDialog24", description: "Use eDialog24 as your human chat provider" },
      { name: "eGain", description: "Set eGain as your human chat backend" },
      { name: "eGain V2", description: "Set eGain v2 as your human chat provider" },
      { name: "Enghouse Trio", description: "Integrate with Enghouse Trio for human chat" },
      { name: "Five9", description: "Five9 human chat provider" },
      { name: "Freshdesk Human Chat", description: "Connect to Freshdesk Human Chat" },
      { name: "Front Human Chat", description: "Set Front as your human chat provider" },
      { name: "Genesys Cloud Voice Handover", description: "Set Genesys Cloud as your handover provider for voice" },
      { name: "Genesys Engage", description: "Use Genesys Engage as your chatpanel and human chat provider" },
      { name: "Genesys Messaging", description: "Connect to Genesys messaging" },
      { name: "Genesys PureConnect", description: "Set Genesys PureConnect as your human chat backend" },
      { name: "Giosg", description: "Set Giosg as your human chat backend" },
      { name: "Glia", description: "Set Glia as your human chat backend" },
      { name: "Go Contact", description: "Set Go Contact as your human chat provider" },
      { name: "Intercom", description: "Set Intercom as your human chat provider" },
      { name: "Kustomer", description: "Set Kustomer as your human chat backend" },
      { name: "LivePerson", description: "Set LivePerson as your human chat backend" },
      { name: "LivePerson Messaging", description: "Set LivePerson Messaging as your human chat provider" },
      { name: "NICE Digital First Omnichannel", description: "Connect to NICE Digital First Omnichannel" },
      { name: "Nice In Contact Human Chat", description: "Set Nice as your human chat provider" },
      { name: "Puzzel", description: "Use Puzzel as your chatpanel and human chat provider" },
      { name: "Puzzel Chat", description: "Set Puzzel as your human chat provider" },
      { name: "Salesforce Chat", description: "Set Salesforce Chat as your human chat provider" },
      { name: "Salesforce Messaging", description: "Connect to Salesforce Messaging for In-App And Web" },
      { name: "ServiceNow", description: "Set ServiceNow as your human chat provider" },
      { name: "Sinch", description: "Set Sinch as your human chat provider" },
      { name: "Socialboards", description: "Integrate with Socialboards for human chat" },
      { name: "Talkdesk", description: "Use Talkdesk as your human chat provider" },
      { name: "Twilio Flex", description: "Twilio Flex Human chat" },
      { name: "Universal Voice Handover", description: "Configure voice handover for supported contact centers" },
      { name: "Vergic", description: "Use Vergic as your chatpanel and human chat provider" },
      { name: "VIER Human Chat", description: "Set VIER as your human chat provider" },
    ],
  },
  {
    label: "OpenID Connect",
    key: "openid",
    items: [
      { name: "Auth0", description: "Identity provider configuration via OpenID Connect" },
      { name: "Amazon Cognito", description: "Identity provider configuration via OpenID Connect" },
      { name: "Azure", description: "Identity provider configuration via OpenID Connect" },
      { name: "BankID NO", description: "Identity provider configuration via OpenID Connect" },
      { name: "Feide", description: "Identity provider configuration via OpenID Connect" },
      { name: "Google", description: "Identity provider configuration via OpenID Connect" },
      { name: "Nets", description: "Identity provider configuration via OpenID Connect" },
      { name: "Okta", description: "Identity provider configuration via OpenID Connect" },
      { name: "OpenID Connect", description: "Generic OpenID Connect configuration" },
      { name: "PayPal", description: "Identity provider configuration via OpenID Connect" },
      { name: "Signicat", description: "Identity provider configuration via OpenID Connect" },
      { name: "Vipps", description: "Identity provider configuration via OpenID Connect" },
    ],
  },
  {
    label: "Utility",
    key: "utility",
    items: [
      { name: "Amadeus", description: "Connect to Amadeus APIs for flight deals" },
      { name: "Azure Active Directory", description: "Setup Azure Active Directory" },
      { name: "Banno Digital Banking", description: "Connect to Banno digital banking" },
      { name: "CallMiner", description: "Integrate with CallMiner" },
      { name: "Coconut Software", description: "Schedule appointments with Coconut Software" },
      { name: "Corelation", description: "Corelation Core Banking" },
      { name: "Custom Utility Integration", description: "Add configuration for a customer specific integration" },
      { name: "Dynamics 365", description: "Connect to Microsoft Dynamics 365" },
      { name: "Eckoh PCI Payment", description: "Make PCI compliant payments through Eckoh", tags: ["beta"] },
      { name: "Freshworks", description: "Integrate with Freshdesk and Freshservice" },
      { name: "Google Sheets", description: "Connect to the Google Sheets API" },
      { name: "Google Translate", description: "Translate VA responses" },
      { name: "Jack Henry jXchange", description: "Connect to Jack Henry core banking platforms" },
      { name: "Jack Henry Symitar", description: "Connect to Jack Henry core credit union platform" },
      { name: "Lucidtech", description: "Extract key information from documents and images" },
      { name: "Microsoft Excel", description: "Integrate with Microsoft Excel" },
      { name: "Nodemailer", description: "Setup VA to send mails via Nodemailer" },
      { name: "Q2 Digital Banking", description: "Connect to Q2 digital banking", tags: ["beta"] },
      { name: "Salesforce", description: "Integrate with Salesforce REST APIs" },
      { name: "SAML2.0", description: "Setup SAML2.0 SSO authentication" },
      { name: "UiPath", description: "Connect with UiPath RPA" },
      { name: "Vipps Payment", description: "Connect to the Vipps eCommerce API" },
      { name: "Zendesk Ticketing", description: "Integrate with Zendesk Ticketing APIs" },
    ],
  },
  {
    label: "Voice",
    key: "voice",
    items: [
      { name: "Alexa", description: "Connect to Amazon Alexa" },
      { name: "Google Home", description: "Connect to Google Home" },
      { name: "Nice inContact IVR", description: "Connect to Nice inContact IVR" },
      { name: "Twilio Programmable Voice", description: "Connect to Twilio IVR" },
      { name: "VIER Cognitive Voice Gateway", description: "Connect to VIER" },
    ],
  },
];

export const ALL_INTEGRATIONS = INTEGRATION_CATEGORIES.flatMap((cat) =>
  cat.items.map((item) => ({ ...item, category: cat.key, categoryLabel: cat.label }))
);
