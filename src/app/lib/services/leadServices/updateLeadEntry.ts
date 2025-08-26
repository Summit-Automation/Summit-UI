'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { Result, success, error } from '@/types/result';
import { updateLeadSchema } from '@/lib/validation/schemas';
import { validateInput, formatValidationErrors } from '@/lib/validation/validator';

export async function updateLeadEntry(leadId: string, leadData: unknown): Promise<Result<void, string>> {
  // Validate input
  const validationResult = validateInput(updateLeadSchema, leadData);
  if (!validationResult.success) {
    return error(formatValidationErrors(validationResult.error));
  }

  const validatedData = validationResult.data;

  try {
    const { organizationId, supabase } = await getAuthenticatedUser();

    const { error: updateError } = await supabase
      .from('leads')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)
      .eq('organization_id', organizationId); // Ensure user can only update their org's leads

    if (updateError) {
      console.error('Error updating lead:', updateError);
      return error('Failed to update lead');
    }

    return success(undefined);
  } catch (err) {
    console.error('Error in updateLeadEntry:', err);
    return error(err instanceof Error ? err.message : 'Unknown error occurred');
  }
}