'use server';

import { getAuthenticatedUser } from '../shared/authUtils';

export async function deleteTransaction(id: string): Promise<boolean> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        const { data: existingTransaction } = await supabase
            .from('transactions')
            .select('organization_id')
            .eq('id', id)
            .single();

        if (!existingTransaction || existingTransaction.organization_id !== organizationId) {
            console.error('Transaction not found or access denied');
            return false;
        }

        const { error } = await supabase.rpc('delete_transaction', { p_id: id });
        if (error) {
            console.error('Error deleting transaction:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Exception in deleteTransaction:', err);
        return false;
    }
}
