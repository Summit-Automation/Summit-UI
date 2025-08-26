'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { Result, success, error } from '@/types/result';
import { createMileageEntrySchema } from '@/lib/validation/schemas';
import { validateInput, formatValidationErrors } from '@/lib/validation/validator';

export async function createMileageEntry(input: unknown): Promise<Result<void, string>> {
    // Validate input
    const validationResult = validateInput(createMileageEntrySchema, input);
    if (!validationResult.success) {
        return error(formatValidationErrors(validationResult.error));
    }

    const validatedInput = validationResult.data;

    try {
        const { supabase } = await getAuthenticatedUser();

        // Call the proxy function in public schema
        const { data, error: insertError } = await supabase.rpc('add_mileage_entry', {
            p_date: validatedInput.date,
            p_purpose: validatedInput.purpose,
            p_miles: validatedInput.miles,
            p_is_business: validatedInput.is_business,
            p_start_location: validatedInput.start_location,
            p_end_location: validatedInput.end_location,
            p_customer_id: validatedInput.customer_id,
            p_notes: validatedInput.notes,
        });

        if (insertError) {
            console.error('Error inserting new mileage entry:', insertError);
            return error('Failed to create mileage entry');
        }

        console.log('Successfully created mileage entry with ID:', data);
        return success(undefined);
    } catch (err) {
        console.error('Exception in createMileageEntry:', err);
        return error(err instanceof Error ? err.message : 'Unknown error occurred');
    }
}