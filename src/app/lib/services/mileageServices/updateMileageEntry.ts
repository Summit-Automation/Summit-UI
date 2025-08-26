'use server';

import { createClient } from '@/utils/supabase/server';
import { Result, success, error } from '@/types/result';
import { updateMileageEntrySchema } from '@/lib/validation/schemas';
import { validateInput, formatValidationErrors } from '@/lib/validation/validator';

export async function updateMileageEntry(input: unknown): Promise<Result<void, string>> {
    // Validate input
    const validationResult = validateInput(updateMileageEntrySchema, input);
    if (!validationResult.success) {
        return error(formatValidationErrors(validationResult.error));
    }

    const validatedInput = validationResult.data;

    try {
        const supabase = await createClient();

        // Call the proxy function in public schema
        const { error: updateError } = await supabase.rpc('update_mileage_entry', {
            p_id: validatedInput.id,
            p_date: validatedInput.date,
            p_purpose: validatedInput.purpose,
            p_miles: validatedInput.miles,
            p_is_business: validatedInput.is_business,
            p_start_location: validatedInput.start_location,
            p_end_location: validatedInput.end_location,
            p_customer_id: validatedInput.customer_id,
            p_notes: validatedInput.notes,
        });

        if (updateError) {
            console.error('Error updating mileage entry:', updateError);
            return error('Failed to update mileage entry');
        }
        return success(undefined);
    } catch (err) {
        console.error('Exception in updateMileageEntry:', err);
        return error(err instanceof Error ? err.message : 'Unknown error occurred');
    }
}