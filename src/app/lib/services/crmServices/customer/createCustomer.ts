'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { Customer } from '@/types/customer';
import { Result, success, error } from '@/types/result';
import { createCustomerSchema } from '@/lib/validation/schemas';
import { validateInput, formatValidationErrors } from '@/lib/validation/validator';

type NewCustomerInput = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;

/**
 * Creates a new customer in the CRM system.
 * This function uses a Supabase RPC function to insert the customer data.
 * @param input the details of the new customer to be created.
 * @return {Promise<Result<void, string>>} returns success with void data if customer was created, error otherwise.
 */
export async function createCustomer(input: unknown): Promise<Result<void, string>> {
    // Validate input
    const validationResult = validateInput(createCustomerSchema, input);
    if (!validationResult.success) {
        return error(formatValidationErrors(validationResult.error));
    }

    const validatedInput = validationResult.data;

    try {
        const { supabase } = await getAuthenticatedUser();

        const { error: rpcError } = await supabase.rpc('add_customer', {
            full_name: validatedInput.full_name,
            email: validatedInput.email,
            phone: validatedInput.phone,
            business: validatedInput.business,
            status: validatedInput.status,
        });

        if (rpcError) {
            console.error('Error inserting new customer:', rpcError);
            return error(rpcError.message);
        }

        return success(undefined);
    } catch (err) {
        console.error('Exception in createCustomer:', err);
        return error(err instanceof Error ? err.message : 'Unknown error occurred');
    }
}
