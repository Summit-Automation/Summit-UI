'use server';

import { createClient } from '@/utils/supabase/server';
import { NewLead } from '@/types/leadgen';

export async function createLeadEntry(leadData: NewLead): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Get organization ID from user metadata
    const organizationId = user.user_metadata?.organization_id;
    if (!organizationId) {
      throw new Error('User organization not found in metadata');
    }

    const { error } = await supabase
      .from('leads')
      .insert({
        ...leadData,
        user_id: user.id,
        organization_id: organizationId,
        score: leadData.score || 0,
        is_qualified: leadData.is_qualified || false,
        status: leadData.status || 'new',
        priority: leadData.priority || 'medium',
        country: leadData.country || 'US'
      });

    if (error) {
      console.error('Error creating lead:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createLeadEntry:', error);
    return false;
  }
}