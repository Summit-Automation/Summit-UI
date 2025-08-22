'use server';

import { createClient } from '@/utils/supabase/server';
import { validateOrThrow } from '@/lib/validation/validator';
import { leadGenerationSchema, type LeadGenerationInput } from '@/lib/validation/schemas';

interface LeadData {
  first_name: string;
  last_name: string;
  company: string;
  email?: string;
  phone?: string;
  job_title?: string;
  industry?: string;
  website_url?: string;
  linkedin_url?: string;
  business_summary?: string;
  technology_stack?: string;
  growth_indicators?: string;
  automation_opportunities?: string;
  budget_indicators?: string;
  competitive_landscape?: string;
  // Score and value fields
  score?: number;
  estimated_value?: number;
  ai_confidence_score?: number;
  ai_generated_notes?: string;
  // Location fields
  city?: string;
  state?: string;
  zip_code?: string;
  // Additional AI fields
  company_size?: string;
  notes?: string;
  business_verification?: string;
  selection_reasoning?: string;
}

export async function generateLeads(
  rawFormData: unknown
): Promise<{ success: boolean; message: string; leads?: LeadData[] }> {
  try {
    const supabase = await createClient();

    // SECURITY: Get authenticated user from server-side session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Lead generation authentication failed:', authError?.message);
      return {
        success: false,
        message: 'Authentication required'
      };
    }

    const organizationId = user.user_metadata?.organization_id;
    if (!organizationId) {
      console.error('Organization ID not found for lead generation');
      return {
        success: false,
        message: 'Organization information not found'
      };
    }

    // SECURITY: Rate limiting - check recent lead generation attempts
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentGenerations } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo);

    if (recentGenerations && recentGenerations >= 5) {
      console.warn('Lead generation rate limit exceeded for user:', user.id, 'count:', recentGenerations);
      return {
        success: false,
        message: 'Rate limit exceeded. Please wait before generating more leads.'
      };
    }

    // SECURITY: Validate and sanitize input using Zod schema
    let validatedData: LeadGenerationInput;
    try {
      validatedData = validateOrThrow(leadGenerationSchema, rawFormData);
    } catch (error) {
      console.error('Lead generation validation failed:', error, 'User:', user.id);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Invalid input data'
      };
    }

    // Call Flowise API
    const flowiseResponse = await callFlowiseLeadGenAPI(validatedData);

    if (!flowiseResponse.success) {
      console.error('Flowise lead generation API error:', flowiseResponse.message, 'User:', user.id);
      return {
        success: false,
        message: 'Lead generation service temporarily unavailable'
      };
    }

    const leadData = flowiseResponse.data;
    if (!leadData || leadData.length === 0) {
      console.error('No lead data from AI agent', 'User:', user.id);
      return {
        success: false,
        message: 'No leads found matching your criteria'
      };
    }

    // SECURITY: Save leads to database with user/org validation
    const leadsToInsert = leadData.map(lead => ({
      ...lead,
      user_id: user.id,
      organization_id: organizationId,
      status: 'new',
      priority: 'medium',
      source: 'ai_agent',
    }));

    const { data: savedLeads, error: saveError } = await supabase
      .from('leads')
      .insert(leadsToInsert)
      .select();

    if (saveError) {
      console.error('Lead save failed:', saveError.message, 'User:', user.id);
      return {
        success: false,
        message: 'Failed to save generated leads'
      };
    }

    return {
      success: true,
      message: `Successfully generated and saved ${savedLeads?.length || 0} leads`,
      leads: savedLeads || []
    };

  } catch (error) {
    console.error('Unexpected error in generateLeads:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
}

async function callFlowiseLeadGenAPI(
  validatedData: LeadGenerationInput
): Promise<{ success: boolean; message: string; data?: LeadData[] }> {
  try {
    // SECURITY: Use server-only environment variables
    const apiHost = process.env.FLOWISE_API_URL;
    const chatflowId = process.env.FLOWISE_LEADGEN_ID;

    if (!apiHost || !chatflowId) {
      console.error('FLOWISE_API_URL and FLOWISE_LEADGEN_ID environment variables must be set');
      throw new Error('Lead generation service configuration missing');
    }

    // SECURITY: Validate HTTPS URL
    if (!apiHost.startsWith('https://')) {
      console.error('Flowise API URL must use HTTPS:', apiHost);
      throw new Error('Lead generation service configuration error');
    }

    const flowiseUrl = `${apiHost}/api/v1/prediction/${chatflowId}`;

    // Build secure prompt
    const prompt = `Location: ${validatedData.location}
Business Size: ${validatedData.business_size || 'Any size business'}
Industry Focus: ${validatedData.industry_focus || 'Any relevant industry'}
Specific Criteria: ${validatedData.specific_criteria || 'Standard business criteria'}

Use your comprehensive lead generation system to find and research 1 lesser-known business prospect.`;

    const requestBody = {
      question: prompt,
    };

    const requestBodyString = JSON.stringify(requestBody);
    if (requestBodyString.length > 10000) { // 10KB limit
      throw new Error('Request data too large');
    }

    // SECURITY: Add timeout and proper headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for lead research

    const response = await fetch(flowiseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Summit-Suite/1.0',
      },
      body: requestBodyString,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Flowise lead generation API error: ${response.status} ${response.statusText}`);
      throw new Error('External service error');
    }

    // SECURITY: Limit response size
    const responseText = await response.text();
    if (responseText.length > 100000) { // 100KB limit
      console.error('Flowise lead generation API response too large:', responseText.length);
      throw new Error('Response data too large');
    }
    
    // Parse the response using the EXACT same logic as the original client-side code
    let parsedResponse: LeadData[];
    try {
      const data = JSON.parse(responseText);
      let responseContent = '';

      // EXACT MATCH: Handle different response formats from Flowise
      if (data.text) {
        responseContent = data.text;
      } else if (typeof data === 'string') {
        responseContent = data;
      } else {
        responseContent = JSON.stringify(data);
      }

      console.log('Lead generation response text to parse:', responseContent);

      // EXACT MATCH: Try to extract JSON from the response text (same regex as original)
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      let leadResponse = null;
      
      if (jsonMatch) {
        try {
          leadResponse = JSON.parse(jsonMatch[0]);
          console.log('Lead generation parsed JSON response:', leadResponse);
        } catch (jsonError) {
          console.error('Lead generation JSON parse error:', jsonError);
          throw new Error('Failed to parse lead data from AI response');
        }
      }

      // EXACT MATCH: Handle both single lead and leads array format for backwards compatibility
      let leadsToProcess = [];
      if (leadResponse?.lead) {
        // New single lead format from Flowise agent v2.1
        leadsToProcess = [leadResponse.lead];
      } else if (leadResponse?.leads && Array.isArray(leadResponse.leads)) {
        // Legacy leads array format
        leadsToProcess = leadResponse.leads;
      }

      // Convert to our LeadData format
      const leadDataArray: LeadData[] = [];
      
      for (const lead of leadsToProcess.slice(0, 3)) { // Limit to 3 leads max
        // Validate and sanitize lead data - only require company as mandatory field
        if (lead.company) {
          leadDataArray.push({
            first_name: String(lead.first_name || 'Contact').substring(0, 100),
            last_name: String(lead.last_name || '').substring(0, 100),
            company: String(lead.company || '').substring(0, 200),
            email: lead.email ? String(lead.email).substring(0, 255) : undefined,
            phone: lead.phone ? String(lead.phone).substring(0, 20) : undefined,
            job_title: lead.job_title ? String(lead.job_title).substring(0, 100) : undefined,
            industry: lead.industry ? String(lead.industry).substring(0, 100) : undefined,
            website_url: lead.website_url ? String(lead.website_url).substring(0, 500) : undefined,
            linkedin_url: lead.linkedin_url ? String(lead.linkedin_url).substring(0, 500) : undefined,
            business_summary: lead.business_summary ? String(lead.business_summary).substring(0, 2000) : undefined,
            technology_stack: lead.technology_stack ? String(lead.technology_stack).substring(0, 1000) : undefined,
            growth_indicators: lead.growth_indicators ? String(lead.growth_indicators).substring(0, 1000) : undefined,
            automation_opportunities: lead.automation_opportunities ? String(lead.automation_opportunities).substring(0, 1000) : undefined,
            budget_indicators: lead.budget_indicators ? String(lead.budget_indicators).substring(0, 1000) : undefined,
            competitive_landscape: lead.competitive_landscape ? String(lead.competitive_landscape).substring(0, 1000) : undefined,
            // NEW: Map AI fields to database columns
            score: lead.lead_score ? parseInt(String(lead.lead_score)) : undefined,
            estimated_value: lead.estimated_value ? parseFloat(String(lead.estimated_value)) : undefined,
            ai_confidence_score: lead.confidence_score ? parseFloat(String(lead.confidence_score)) : undefined,
            ai_generated_notes: lead.ai_generated_notes ? String(lead.ai_generated_notes).substring(0, 2000) : undefined,
            // Additional fields from AI response
            city: lead.city ? String(lead.city).substring(0, 100) : undefined,
            state: lead.state ? String(lead.state).substring(0, 50) : undefined,
            zip_code: lead.zip_code ? String(lead.zip_code).substring(0, 20) : undefined,
            company_size: lead.company_size ? String(lead.company_size).substring(0, 50) : undefined,
            notes: lead.notes ? String(lead.notes).substring(0, 2000) : undefined,
            business_verification: lead.business_verification ? String(lead.business_verification).substring(0, 1000) : undefined,
            selection_reasoning: lead.selection_reasoning ? String(lead.selection_reasoning).substring(0, 1000) : undefined,
          });
        }
      }
      
      parsedResponse = leadDataArray;

    } catch (parseError) {
      console.error('Failed to parse Flowise lead generation response:', parseError);
      throw new Error('Failed to process lead data');
    }

    return {
      success: true,
      message: 'Successfully generated leads',
      data: parsedResponse
    };

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Flowise lead generation API timeout');
      return {
        success: false,
        message: 'Lead generation timed out. Please try again.'
      };
    }
    
    console.error('Flowise lead generation API call failed:', error);
    return {
      success: false,
      message: 'Lead generation service temporarily unavailable'
    };
  }
}