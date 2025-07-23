'use server';

import { createClient } from '@/utils/supabase/server';
import { NewLead } from '@/types/leadgen';

export async function updateLeadEntry(leadId: string, leadData: Partial<NewLead>): Promise<boolean> {
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
      .update({
        ...leadData,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)
      .eq('organization_id', organizationId); // Ensure user can only update their org's leads

    if (error) {
      console.error('Error updating lead:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateLeadEntry:', error);
    return false;
  }
}