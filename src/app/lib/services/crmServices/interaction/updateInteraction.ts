'use server';

import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { Result, success, error } from '@/types/result';
import { updateInteractionSchema } from '@/lib/validation/schemas';
import { validateInput, formatValidationErrors } from '@/lib/validation/validator';

/**
 * Updates an existing interaction in the CRM system.
 * This function uses Supabase to update the interaction data.
 * @param input the details of the interaction to be updated, including the ID.
 * @return {Promise<Result<void, string>>} returns success if the interaction was successfully updated, error otherwise.
 */
export async function updateInteraction(input: unknown): Promise<Result<void, string>> {
    // Validate input
    const validationResult = validateInput(updateInteractionSchema, input);
    if (!validationResult.success) {
        return error(formatValidationErrors(validationResult.error));
    }

    const validatedInput = validationResult.data;

    try {
        const { supabase } = await getAuthenticatedUser();

        const { error: updateError } = await supabase.rpc('update_interaction', {
            p_id: validatedInput.id,
            p_customer_id: validatedInput.customer_id,
            p_type: validatedInput.type,
            p_title: validatedInput.title,
            p_notes: validatedInput.notes,
            p_outcome: validatedInput.outcome,
            p_follow_up_required: validatedInput.follow_up_required,
        }
        );

        if (updateError) {
            console.error('Error updating interaction:', updateError);
            return error('Failed to update interaction');
        }
        
        // Revalidate the CRM page to reflect the updated interaction
        revalidatePath('/crm');
        
        return success(undefined);
    } catch (err) {
        console.error('Exception in updateInteraction:', err);
        return error(err instanceof Error ? err.message : 'Unknown error occurred');
    }
}