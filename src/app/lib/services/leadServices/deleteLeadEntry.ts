'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { Result, success, error } from '@/types/result';

export async function deleteLeadEntry(leadId: string): Promise<Result<void, string>> {
  try {
    const { organizationId, supabase } = await getAuthenticatedUser();

    const { error: deleteError } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId)
      .eq('organization_id', organizationId); // Ensure user can only delete their org's leads

    if (deleteError) {
      console.error('Error deleting lead:', deleteError);
      return error('Failed to delete lead');
    }

    return success(undefined);
  } catch (err) {
    console.error('Error in deleteLeadEntry:', err);
    return error(err instanceof Error ? err.message : 'Unknown error occurred');
  }
}