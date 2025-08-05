'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { NewLead } from '@/types/leadgen';
import { createLeadSchema } from '@/lib/validation/schemas';
import { validateInput, formatValidationErrors } from '@/lib/validation/validator';
import { Result, success, error as createError } from '@/types/result';

export async function createLeadEntry(leadData: unknown): Promise<Result<boolean, string>> {
  // Validate input
  const validationResult = validateInput(createLeadSchema, leadData);
  if (!validationResult.success) {
    return createError(formatValidationErrors(validationResult.error));
  }

  const validatedData = validationResult.data;

  try {
    const { user, organizationId, supabase } = await getAuthenticatedUser();

    const { error } = await supabase
      .from('leads')
      .insert({
        ...validatedData,
        user_id: user.id,
        organization_id: organizationId,
        score: validatedData.score || 0,
        is_qualified: validatedData.is_qualified || false,
        status: validatedData.status || 'new',
        priority: validatedData.priority || 'medium',
        country: validatedData.country || 'US'
      });

    if (error) {
      console.error('Error creating lead:', error);
      return createError(error.message);
    }

    return success(true);
  } catch (error) {
    console.error('Error in createLeadEntry:', error);
    return createError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}