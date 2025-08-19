export interface Lead {
  id: string;
  user_id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  source: 'manual' | 'ai_agent';
  status: string;
  priority: string;
  ai_agent_batch_id?: string;
  ai_confidence_score?: number;
  ai_generated_notes?: string;
  score: number;
  is_qualified: boolean;
  qualified_at?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country: string;
  estimated_value?: number;
  expected_close_date?: string;
  industry?: string;
  company_size?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  last_contacted_at?: string;
  
  // Enhanced Business Intelligence Fields
  business_summary?: string;
  business_history?: string;
  technology_stack?: string;
  growth_indicators?: string;
  recent_activities?: string;
  
  // Contact Intelligence Fields
  contact_discovery_method?: string;
  additional_contacts?: AdditionalContact[];
  contact_verification?: string;
  
  // Opportunity Analysis Fields
  automation_opportunities?: string;
  budget_indicators?: string;
  decision_timeline?: string;
  competitive_landscape?: string;
  
  // Verification & Quality Fields
  business_verification?: string;
  relevance_justification?: string;
  verification_sources?: string[];
  selection_reasoning?: string;
  
  // Company URLs
  website_url?: string;
  linkedin_url?: string;
}

export interface AdditionalContact {
  name: string;
  title: string;
  role: string;
  contact_method: string;
}

export interface NewLead {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  source: 'manual' | 'ai_agent';
  status?: string;
  priority?: string;
  ai_agent_batch_id?: string;
  ai_confidence_score?: number;
  ai_generated_notes?: string;
  score?: number;
  is_qualified?: boolean;
  qualified_at?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  estimated_value?: number;
  expected_close_date?: string;
  industry?: string;
  company_size?: string;
  notes?: string;
  tags?: string[];
  
  // Enhanced Business Intelligence Fields
  business_summary?: string;
  business_history?: string;
  technology_stack?: string;
  growth_indicators?: string;
  recent_activities?: string;
  
  // Contact Intelligence Fields
  contact_discovery_method?: string;
  additional_contacts?: AdditionalContact[];
  contact_verification?: string;
  
  // Opportunity Analysis Fields
  automation_opportunities?: string;
  budget_indicators?: string;
  decision_timeline?: string;
  competitive_landscape?: string;
  
  // Verification & Quality Fields
  business_verification?: string;
  relevance_justification?: string;
  verification_sources?: string[];
  selection_reasoning?: string;
  
  // Company URLs
  website_url?: string;
  linkedin_url?: string;
}

export interface Activity {
  id: string;
  lead_id: string;
  user_id: string;
  organization_id: string;
  activity_type: string;
  subject: string;
  description?: string;
  outcome?: string;
  scheduled_at?: string;
  completed_at?: string;
  is_completed: boolean;
  follow_up_date?: string;
  follow_up_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface NewActivity {
  lead_id: string;
  activity_type: string;
  subject: string;
  description?: string;
  outcome?: string;
  scheduled_at?: string;
  completed_at?: string;
  is_completed?: boolean;
  follow_up_date?: string;
  follow_up_notes?: string;
}

export interface AIBatch {
  id: string;
  organization_id: string;
  user_id: string;
  batch_name?: string;
  search_criteria?: Record<string, unknown>;
  total_leads_generated: number;
  leads_qualified: number;
  ai_model_version?: string;
  processing_duration_seconds?: number;
  created_at: string;
  completed_at?: string;
}

export interface NewAIBatch {
  batch_name?: string;
  search_criteria?: Record<string, unknown>;
  ai_model_version?: string;
  processing_duration_seconds?: number;
}

export interface LeadSource {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewLeadSource {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface LeadStats {
  total_leads: number;
  qualified_leads: number;
  manual_leads: number;
  ai_generated_leads: number;
  average_score: number;
  conversion_rate: number;
}

export interface LeadGrowth {
  period: string;
  total_leads: number;
  qualified_leads: number;
  growth_rate: number;
}

export const LEAD_STATUSES = [
  'new',
  'contacted',
  'qualified',
  'proposal_sent',
  'negotiating',
  'closed_won',
  'closed_lost',
  'nurturing',
  'converted'
] as const;

export const LEAD_PRIORITIES = [
  'low',
  'medium',
  'high',
  'urgent'
] as const;

export const ACTIVITY_TYPES = [
  'call',
  'email',
  'meeting',
  'demo',
  'proposal',
  'follow_up',
  'note'
] as const;

export const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+'
] as const;

export type LeadStatus = typeof LEAD_STATUSES[number];
export type LeadPriority = typeof LEAD_PRIORITIES[number];
export type ActivityType = typeof ACTIVITY_TYPES[number];
export type CompanySize = typeof COMPANY_SIZES[number];