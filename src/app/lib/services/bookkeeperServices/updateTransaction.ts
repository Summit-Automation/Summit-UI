'use server';

import { getAuthenticatedUser } from '../shared/authUtils';
import { Transaction } from "@/types/transaction";

type UpdateTransactionInput = Omit<Transaction, 'source' | 'timestamp' | 'uploaded_by'>;

export async function updateTransaction(input: UpdateTransactionInput): Promise<boolean> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        const { data: existingTransaction } = await supabase
            .from('transactions')
            .select('organization_id')
            .eq('id', input.id)
            .single();

        if (!existingTransaction || existingTransaction.organization_id !== organizationId) {
            console.error('Transaction not found or access denied');
            return false;
        }

        const { error } = await supabase.rpc('update_transaction', {
            p_id: input.id,
            p_type: input.type,
            p_category: input.category,
            p_description: input.description,
            p_amount: input.amount,
            p_customer_id: input.customer_id,
            p_interaction_id: input.interaction_id,
        });

        if (error) {
            console.error('Error updating transaction:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Exception in updateTransaction:', err);
        return false;
    }
}
