'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';

export async function deleteLeadEntry(leadId: string): Promise<boolean> {
  try {
    const { organizationId, supabase } = await getAuthenticatedUser();

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