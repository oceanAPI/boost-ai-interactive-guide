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

export type PricingModel = "fixed" | "usage" | "outcome";

export interface ResourceAllocation {
  stakeholder_owners?: number;
  ai_trainers?: number;
  technical_resources?: number;
  supporting_departments?: string[];
  knowledge_management?: boolean;
}

export interface GuideData {
  id: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  company_url: string;
  contact_name: string;
  contact_role: string;
  areas_of_interest: string[];
  specific_requirements: string;
  channel_volumes: ChannelVolumes;
  conversation_cost: string;
  pricing_model: PricingModel;
  deployment_markets: number;
  resources: ResourceAllocation;
  integrations: IntegrationSelections;
  custom_notes: string;
}

export interface GuideFormData {
  company_name: string;
  company_url: string;
  contact_name: string;
  contact_role: string;
  areas_of_interest: string[];
  specific_requirements: string;
  channel_volumes: ChannelVolumes;
  conversation_cost: string;
  pricing_model: PricingModel;
  deployment_markets: number;
  resources: ResourceAllocation;
  integrations: IntegrationSelections;
  custom_notes: string;
}
