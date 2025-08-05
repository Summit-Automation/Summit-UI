'use server';

import { getAuthenticatedUser } from '../shared/authUtils';
import { createTransactionSchema } from '@/lib/validation/schemas';
import { validateInput, formatValidationErrors } from '@/lib/validation/validator';
import { Result, success, error as createError } from '@/types/result';

export async function createTransaction(input: unknown): Promise<Result<boolean, string>> {
    // Validate input
    const validationResult = validateInput(createTransactionSchema, input);
    if (!validationResult.success) {
        return createError(formatValidationErrors(validationResult.error));
    }

    const validatedInput = validationResult.data;

    try {
        const { supabase } = await getAuthenticatedUser();

        const { error } = await supabase.rpc('add_transaction', {
            type: validatedInput.type,
            category: validatedInput.category,
            description: validatedInput.description,
            amount: validatedInput.amount,
            customer_id: validatedInput.customer_id ?? null,
            interaction_id: validatedInput.interaction_id ?? null,
        });

        if (error) {
            console.error('Error inserting new transaction:', error);
            return createError(error.message);
        }

        return success(true);
    } catch (err) {
        console.error('Exception in createTransaction:', err);
        return createError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
}