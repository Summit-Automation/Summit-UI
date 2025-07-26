'use server';

import { getAuthenticatedUser } from '../shared/authUtils';
import { Transaction } from "@/types/transaction";

type NewTransactionInput = Omit<Transaction, 'id' | 'source' | 'timestamp' | 'uploaded_by' | 'organization_id'>;

export async function createTransaction(input: NewTransactionInput): Promise<boolean> {
    try {
        const { supabase } = await getAuthenticatedUser();

        const { error } = await supabase.rpc('add_transaction', {
            type: input.type,
            category: input.category,
            description: input.description,
            amount: input.amount,
            customer_id: input.customer_id ?? null,
            interaction_id: input.interaction_id ?? null,
        });

        if (error) {
            console.error('Error inserting new transaction:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Exception in createTransaction:', err);
        return false;
    }
}