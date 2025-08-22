'use server';

import { createClient } from '@/utils/supabase/server';
import { validateOrThrow } from '@/lib/validation/validator';
import { emailGenerationFormSchema, type EmailGenerationFormInput } from '@/lib/validation/schemas';
import type { 
  EmailGenerationRequest, 
  EmailGenerationResponse
} from '@/types/emailGeneration';

export async function generateEmails(
  rawFormData: unknown
): Promise<{ success: boolean; message: string; emailDraftId?: string }> {
  try {
    const supabase = await createClient();

    // SECURITY: Get authenticated user from server-side session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        message: 'Authentication required'
      };
    }

    const organizationId = user.user_metadata?.organization_id;
    if (!organizationId) {
      return {
        success: false,
        message: 'Organization information not found'
      };
    }

    // SECURITY: Rate limiting - check recent email generation attempts
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentGenerations } = await supabase
      .from('email_drafts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneHourAgo);

    if (recentGenerations && recentGenerations >= 10) {
      console.warn('Rate limit exceeded for user:', user.id, 'count:', recentGenerations);
      return {
        success: false,
        message: 'Rate limit exceeded. Please wait before generating more emails.'
      };
    }

    // SECURITY: Validate and sanitize input using Zod schema
    let validatedData: EmailGenerationFormInput;
    try {
      validatedData = validateOrThrow(emailGenerationFormSchema, rawFormData);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Invalid input data'
      };
    }

    // 1. SECURITY: Get lead data with organization validation
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', validatedData.lead_id)
      .eq('organization_id', organizationId)
      .single();

    if (leadError || !lead) {
      return {
        success: false,
        message: 'Lead not found or access denied'
      };
    }

    // 2. Get organization settings (company information)
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (orgError || !organization) {
      return {
        success: false,
        message: 'Organization not found or access denied'
      };
    }

    // 3. Prepare the request data for Flowise API
    const emailRequest: EmailGenerationRequest = {
      lead_data: {
        first_name: lead.first_name,
        last_name: lead.last_name,
        company: lead.company,
        job_title: lead.job_title,
        industry: lead.industry,
        email: lead.email,
        phone: lead.phone,
        website_url: lead.website_url,
        linkedin_url: lead.linkedin_url,
        business_summary: lead.business_summary,
        technology_stack: lead.technology_stack,
        growth_indicators: lead.growth_indicators,
        automation_opportunities: lead.automation_opportunities,
        budget_indicators: lead.budget_indicators,
        competitive_landscape: lead.competitive_landscape,
      },
      company_context: {
        company_name: organization.name,
        company_description: organization.company_description,
        company_services: organization.company_services,
        company_industry: organization.company_industry,
        value_proposition: organization.value_proposition,
        target_market: organization.target_market,
        unique_selling_points: organization.unique_selling_points,
        case_studies: organization.case_studies,
        pricing_model: organization.pricing_model,
      },
      user_requirements: {
        comments: validatedData.user_comments,
        specific_requirements: validatedData.specific_requirements || '',
      }
    };

    // Add additional context based on form options
    const additionalContext = {
      tone: validatedData.tone_preference,
      call_to_action: validatedData.call_to_action || '',
      include_case_study: validatedData.include_case_study,
      include_pricing: validatedData.include_pricing,
      follow_up_sequence: validatedData.follow_up_sequence,
    };

    // 4. Call Flowise API
    const flowiseResponse = await callFlowiseAPI({
      ...emailRequest,
      additional_context: additionalContext
    });

    if (!flowiseResponse.success) {
      return {
        success: false,
        message: 'Email generation service temporarily unavailable'
      };
    }

    const emailData = flowiseResponse.data;

    if (!emailData) {
      return {
        success: false,
        message: 'Failed to generate email content'
      };
    }

    // Use the lead's organization_id since we already validated the lead belongs to this user
    const safeOrganizationId = lead.organization_id;

    // 5. SECURITY: Save email drafts using secure database function (bypasses RLS issues)
    
    const { data: emailDraftId, error: saveError } = await supabase
      .rpc('insert_email_draft', {
        p_user_id: user.id,
        p_organization_id: safeOrganizationId,
        p_lead_id: validatedData.lead_id,
        p_subject_line_1: emailData.emails[0]?.subject || '',
        p_email_body_1: emailData.emails[0]?.body || '',
        p_subject_line_2: emailData.emails[1]?.subject || '',
        p_email_body_2: emailData.emails[1]?.body || '',
        p_subject_line_3: emailData.emails[2]?.subject || '',
        p_email_body_3: emailData.emails[2]?.body || '',
        p_user_comments: validatedData.user_comments,
        p_specific_requirements: validatedData.specific_requirements || '',
        p_ai_agent_response: emailData
      });


    if (saveError) {
      // Email draft save failed
      return {
        success: false,
        message: 'Failed to save email drafts'
      };
    }


    return {
      success: true,
      message: 'Email drafts generated and saved successfully',
      emailDraftId: emailDraftId
    };

  } catch {
    // Log error for debugging
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
}

async function callFlowiseAPI(requestData: EmailGenerationRequest & { additional_context: Record<string, unknown> }): Promise<{ success: boolean; message: string; data?: EmailGenerationResponse }> {
  try {
    // SECURITY: Use server-only environment variables (not NEXT_PUBLIC_*)
    const apiHost = process.env.FLOWISE_API_URL;
    const chatflowId = process.env.FLOWISE_EMAIL_ID;

    if (!apiHost || !chatflowId) {
      console.error('FLOWISE_API_URL and FLOWISE_EMAIL_ID environment variables must be set');
      throw new Error('Email generation service configuration missing');
    }

    // SECURITY: Validate HTTPS URL
    if (!apiHost.startsWith('https://')) {
      console.error('Flowise API URL must use HTTPS:', apiHost);
      throw new Error('Email generation service configuration error');
    }

    // Construct the Flowise chat API URL
    const flowiseUrl = `${apiHost}/api/v1/prediction/${chatflowId}`;

    // SECURITY: Limit request size
    const requestBodyString = JSON.stringify({
      question: JSON.stringify(requestData),
      overrideConfig: {},
      chatId: `email-gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
    
    if (requestBodyString.length > 50000) { // 50KB limit
      throw new Error('Request data too large');
    }

    // SECURITY: Add timeout and proper headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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
      console.error(`Flowise API error: ${response.status} ${response.statusText}`);
      throw new Error('External service error');
    }

    // SECURITY: Limit response size
    const responseText = await response.text();
    if (responseText.length > 100000) { // 100KB limit
      console.error('Flowise API response too large:', responseText.length);
      throw new Error('Response data too large');
    }
    
    // Parse the response using the EXACT same logic as the original client-side code (matching lead generation)
    let parsedResponse: EmailGenerationResponse;
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


      // EXACT MATCH: Try to extract JSON from the response text (same regex as original)
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      let emailResponse = null;
      
      if (jsonMatch) {
        try {
          emailResponse = JSON.parse(jsonMatch[0]);
        } catch (jsonError) {
          console.error('Email generation JSON parse error:', jsonError);
          throw new Error('Failed to parse email data from AI response');
        }
      } else {
        throw new Error('No email data found in AI response');
      }

      // Validate and normalize the data - use only real AI data, no fallbacks
      if (!emailResponse || !emailResponse.emails || !Array.isArray(emailResponse.emails)) {
        throw new Error('Invalid email data structure from AI agent');
      }

      // Ensure we have valid email data
      const validEmails = emailResponse.emails.filter((email: unknown) => 
        email && typeof email === 'object' && email !== null &&
        'subject' in email && 'body' in email &&
        typeof (email as Record<string, unknown>).subject === 'string' && 
        typeof (email as Record<string, unknown>).body === 'string'
      ).slice(0, 3); // Limit to 3 emails max

      if (validEmails.length === 0) {
        throw new Error('No valid email content found in AI response');
      }

      parsedResponse = {
        emails: validEmails.map((email: unknown) => {
          const emailObj = email as Record<string, unknown>;
          return {
            subject: String(emailObj.subject).substring(0, 200),
            body: String(emailObj.body).substring(0, 10000),
            tone: String(emailObj.tone || 'professional').substring(0, 50),
            approach: String(emailObj.approach || 'direct').substring(0, 50)
          };
        }),
        reasoning: String(emailResponse.reasoning || '').substring(0, 1000),
        personalization_notes: String(emailResponse.personalization_notes || '').substring(0, 1000)
      } as EmailGenerationResponse;

    } catch (parseError) {
      console.error('Failed to parse email generation response:', parseError);
      throw new Error('Failed to process email data');
    }

    return {
      success: true,
      message: 'Successfully generated emails',
      data: parsedResponse
    };

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Flowise API timeout');
      return {
        success: false,
        message: 'Email generation timed out. Please try again.'
      };
    }
    
    console.error('Flowise API call failed:', error);
    return {
      success: false,
      message: 'Email generation service temporarily unavailable'
    };
  }
}