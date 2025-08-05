'use server';

import { getAuthenticatedUser } from '../shared/authUtils';
import { updateTransactionSchema } from '@/lib/validation/schemas';
import { validateInput, formatValidationErrors } from '@/lib/validation/validator';
import { Result, success, error as createError } from '@/types/result';

export async function updateTransaction(input: unknown): Promise<Result<boolean, string>> {
    // Validate input
    const validationResult = validateInput(updateTransactionSchema, input);
    if (!validationResult.success) {
        return createError(formatValidationErrors(validationResult.error));
    }

    const validatedInput = validationResult.data;

    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        const { data: existingTransaction } = await supabase
            .from('transactions')
            .select('organization_id')
            .eq('id', validatedInput.id)
            .single();

        if (!existingTransaction || existingTransaction.organization_id !== organizationId) {
            console.error('Transaction not found or access denied');
            return createError('Transaction not found or access denied');
        }

        const { error } = await supabase.rpc('update_transaction', {
            p_id: validatedInput.id,
            p_type: validatedInput.type,
            p_category: validatedInput.category,
            p_description: validatedInput.description,
            p_amount: validatedInput.amount,
            p_customer_id: validatedInput.customer_id,
            p_interaction_id: validatedInput.interaction_id,
        });

        if (error) {
            console.error('Error updating transaction:', error);
            return createError(error.message);
        }
        return success(true);
    } catch (err) {
        console.error('Exception in updateTransaction:', err);
        return createError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
}
