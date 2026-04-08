export interface ChannelVolumes {
  chat?: number;
  voice?: number;
  email?: number;
  social?: number;
}

export interface IntegrationSelections {
  channel?: string[];
  human_handover?: string[];
  openid?: string[];
  utility?: string[];
  voice?: string[];
}

export interface GuideData {
  id: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  company_url: string;
  contact_name: string;
  contact_role: string;
  industry: string;
  areas_of_interest: string[];
  specific_requirements: string;
  channel_volumes: ChannelVolumes;
  cost_per_employee: string;
  integrations: IntegrationSelections;
  custom_notes: string;
}

export interface GuideFormData {
  company_name: string;
  company_url: string;
  contact_name: string;
  contact_role: string;
  industry: string;
  areas_of_interest: string[];
  specific_requirements: string;
  channel_volumes: ChannelVolumes;
  cost_per_employee: string;
  integrations: IntegrationSelections;
  custom_notes: string;
}
