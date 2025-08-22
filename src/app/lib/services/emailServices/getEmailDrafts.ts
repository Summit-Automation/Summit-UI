'use server';

import { createClient } from '@/utils/supabase/server';

export async function getEmailDrafts(leadId: string) {
  
  try {
    const supabase = await createClient();

    // SECURITY: Get authenticated user from server-side session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        message: 'Authentication required',
        data: []
      };
    }

    const organizationId = user.user_metadata?.organization_id;
    if (!organizationId) {
      return {
        success: false,
        message: 'Organization information not found',
        data: []
      };
    }

    // First validate that the lead belongs to this user/organization
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, organization_id, user_id')
      .eq('id', leadId)
      .eq('organization_id', organizationId)
      .single();

    if (leadError || !lead) {
      return {
        success: false,
        message: 'Lead not found or access denied',
        data: []
      };
    }

    // Fetch email drafts for the lead using secure database function
    // Allow any user in the same organization to view emails for leads in their org
    
    const { data: emailDrafts, error: draftsError } = await supabase
      .rpc('get_email_drafts_for_lead', {
        p_lead_id: leadId,
        p_user_id: user.id,
        p_organization_id: organizationId
      });


    if (draftsError) {
      return {
        success: false,
        message: 'Failed to fetch email drafts',
        data: []
      };
    }

    // Format the data to match what the component expects
    const formattedDrafts = (emailDrafts || []).map((draft: Record<string, unknown>) => ({
      ...draft,
      lead: {
        first_name: draft.lead_first_name,
        last_name: draft.lead_last_name,  
        company: draft.lead_company,
        email: draft.lead_email
      }
    }));

    
    return {
      success: true,
      message: 'Email drafts fetched successfully',
      data: formattedDrafts
    };

  } catch {
    // Log error for debugging but don't expose details to client
    return {
      success: false,
      message: 'An unexpected error occurred',
      data: []
    };
  }
}