'use server';

import { createClient } from '@/utils/supabase/server';
import { Result, success, error } from '@/types/result';
import { createInteractionSchema } from '@/lib/validation/schemas';
import { validateInput, formatValidationErrors } from '@/lib/validation/validator';

/**
 * Creates a new interaction in the CRM system.
 * This function uses a Supabase RPC function to insert the interaction data.
 * @param input the details of the new interaction to be created.
 * @return {Promise<Result<void, string>>} returns success if the interaction was successfully created, error otherwise.
 */
export async function createInteraction(input: unknown): Promise<Result<void, string>> {
    // Validate input
    const validationResult = validateInput(createInteractionSchema, input);
    if (!validationResult.success) {
        return error(formatValidationErrors(validationResult.error));
    }

    const validatedInput = validationResult.data;

    try {
        const supabase = await createClient();

        const {data: {user}, error: userError} = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('Failed to get user:', userError);
            return error('User not authenticated');
        }

        const {error: insertError} = await supabase.rpc('add_interaction', {
            customer_id: validatedInput.customer_id,
            follow_up_required: validatedInput.follow_up_required,
            notes: validatedInput.notes ?? '',
            outcome: validatedInput.outcome ?? '',
            title: validatedInput.title,
            type: validatedInput.type,
        });

        if (insertError) {
            console.error('Error inserting new interaction:', insertError);
            return error('Failed to create interaction');
        }

        return success(undefined);
    } catch (err) {
        console.error('Exception in createInteraction:', err);
        return error(err instanceof Error ? err.message : 'Unknown error occurred');
    }
}
