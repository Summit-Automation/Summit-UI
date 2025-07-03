'use server';

import {createClient} from '@/utils/supabase/server';

import {Transaction} from "@/types/transaction";

type NewTransactionInput = Omit<Transaction, 'id' | 'source' | 'timestamp' | 'uploaded_by'>;

export async function createTransaction(input: NewTransactionInput): Promise<boolean> {
    try {
        const supabase = await createClient();

        const {data: {user}, error: userError} = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('Failed to get user:', userError);
            return false;
        }

        const {error} = await supabase.rpc('add_transaction', {
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