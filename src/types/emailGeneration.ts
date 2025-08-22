// Email Generation System TypeScript Interfaces

// Organization Company Information (organization-wide settings)
export interface OrganizationSettings {
  id: string;
  name: string;
  slug: string;
  company_description?: string;
  company_services?: string;
  company_industry?: string;
  company_size?: string;
  company_website?: string;
  value_proposition?: string;
  target_market?: string;
  unique_selling_points?: string;
  case_studies?: string;
  pricing_model?: string;
  created_at: string;
  updated_at: string;
}

// Email Draft Record
export interface EmailDraft {
  id: string;
  user_id: string;
  organization_id: string;
  lead_id: string;
  
  // Three email drafts
  subject_line_1: string;
  email_body_1: string;
  subject_line_2: string;
  email_body_2: string;
  subject_line_3: string;
  email_body_3: string;
  
  // Generation context
  user_comments?: string;
  specific_requirements?: string;
  ai_agent_response?: EmailGenerationResponse;
  generation_status: 'draft' | 'reviewed' | 'sent' | 'archived';
  
  // Metadata
  created_at: string;
  updated_at: string;
}

// New Email Draft (for creation)
export interface NewEmailDraft {
  lead_id: string;
  user_comments?: string;
  specific_requirements?: string;
}

// Email Generation Request (for Flowise API)
export interface EmailGenerationRequest {
  lead_data: {
    first_name: string;
    last_name: string;
    company: string;
    job_title?: string;
    industry?: string;
    email?: string;
    phone?: string;
    website_url?: string;
    linkedin_url?: string;
    business_summary?: string;
    technology_stack?: string;
    growth_indicators?: string;
    automation_opportunities?: string;
    budget_indicators?: string;
    competitive_landscape?: string;
  };
  company_context: {
    company_name: string;
    company_description?: string;
    company_services?: string;
    company_industry?: string;
    value_proposition?: string;
    target_market?: string;
    unique_selling_points?: string;
    case_studies?: string;
    pricing_model?: string;
  };
  user_requirements?: {
    comments?: string;
    specific_requirements?: string;
  };
}

// Email Generation Response (from Flowise API)
export interface EmailGenerationResponse {
  emails: [
    {
      subject: string;
      body: string;
      tone: string;
      approach: string;
    },
    {
      subject: string;
      body: string;
      tone: string;
      approach: string;
    },
    {
      subject: string;
      body: string;
      tone: string;
      approach: string;
    }
  ];
  reasoning?: string;
  personalization_notes?: string;
}

// Email Generation Form Data
export interface EmailGenerationFormData {
  lead_id: string;
  user_comments: string;
  specific_requirements: string;
  tone_preference?: 'professional' | 'casual' | 'urgent' | 'friendly';
  call_to_action?: string;
  include_case_study?: boolean;
  include_pricing?: boolean;
  follow_up_sequence?: boolean;
}

// Organization Settings Update Request
export interface OrganizationSettingsUpdate {
  company_description?: string;
  company_services?: string;
  company_industry?: string;
  company_size?: string;
  company_website?: string;
  value_proposition?: string;
  target_market?: string;
  unique_selling_points?: string;
  case_studies?: string;
  pricing_model?: string;
}