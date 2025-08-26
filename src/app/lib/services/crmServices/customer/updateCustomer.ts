'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { Result, success, error } from '@/types/result';
import { updateCustomerSchema } from '@/lib/validation/schemas';
import { validateInput, formatValidationErrors } from '@/lib/validation/validator';

/**
 * Updates an existing customer in the CRM system.
 * This function uses Supabase to update the customer data.
 * @param input the details of the customer to be updated, including the ID.
 * @return {Promise<Result<void, string>>} returns success if the customer was successfully updated, error otherwise.
 */
export async function updateCustomer(input: unknown): Promise<Result<void, string>> {
    // Validate input
    const validationResult = validateInput(updateCustomerSchema, input);
    if (!validationResult.success) {
        return error(formatValidationErrors(validationResult.error));
    }

    const validatedInput = validationResult.data;

    try {
        const { supabase } = await getAuthenticatedUser();

        const { error: updateError } = await supabase.rpc('update_customer', {
            p_id:       validatedInput.id,
            p_full_name: validatedInput.full_name,
            p_email:    validatedInput.email,
            p_phone:    validatedInput.phone,
            p_business: validatedInput.business,
            p_status:   validatedInput.status,
        }
        );

        if (updateError) {
            console.error('Error updating customer:', updateError);
            return error('Failed to update customer');
        }
        return success(undefined);
    } catch (err) {
        console.error('Exception in updateCustomer:', err);
        return error(err instanceof Error ? err.message : 'Unknown error occurred');
    }
}