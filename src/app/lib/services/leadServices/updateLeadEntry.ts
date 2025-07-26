'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { NewLead } from '@/types/leadgen';

export async function updateLeadEntry(leadId: string, leadData: Partial<NewLead>): Promise<boolean> {
  try {
    const { organizationId, supabase } = await getAuthenticatedUser();

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