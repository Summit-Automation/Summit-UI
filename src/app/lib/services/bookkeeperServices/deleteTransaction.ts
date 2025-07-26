'use server';

import { getAuthenticatedUser } from '../shared/authUtils';
import { Result, success, error } from '@/types/result';

export async function deleteTransaction(id: string): Promise<Result<void, string>> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        const { data: existingTransaction } = await supabase
            .from('transactions')
            .select('organization_id')
            .eq('id', id)
            .single();

        if (!existingTransaction || existingTransaction.organization_id !== organizationId) {
            console.error('Transaction not found or access denied');
            return error('Transaction not found or access denied');
        }

        const { error: deleteError } = await supabase.rpc('delete_transaction', { p_id: id });
        if (deleteError) {
            console.error('Error deleting transaction:', deleteError);
            return error(deleteError.message);
        }
        return success(undefined);
    } catch (err) {
        console.error('Exception in deleteTransaction:', err);
        return error(err instanceof Error ? err.message : 'Unknown error occurred');
    }
}
