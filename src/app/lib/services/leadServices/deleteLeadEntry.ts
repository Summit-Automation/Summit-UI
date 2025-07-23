'use server';

import { createClient } from '@/utils/supabase/server';

export async function deleteLeadEntry(leadId: string): Promise<boolean> {
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
      .delete()
      .eq('id', leadId)
      .eq('organization_id', organizationId); // Ensure user can only delete their org's leads

    if (error) {
      console.error('Error deleting lead:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteLeadEntry:', error);
    return false;
  }
}