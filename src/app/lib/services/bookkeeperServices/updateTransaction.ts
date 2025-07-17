// app/lib/services/bookkeeperServices/updateTransaction.ts
'use server';

import {createClient} from '@/utils/supabase/server';
import {Transaction} from "@/types/transaction";

type UpdateTransactionInput = Omit<Transaction, 'source' | 'timestamp' | 'uploaded_by'>;


/**
 * Updates an existing transaction in the database.
 * This function calls a Supabase RPC function to perform the update.
 * @param input the transaction data to update, excluding fields that are not modifiable.
 * @return {Promise<boolean>} returns true if the update was successful, false otherwise.
 */
export async function updateTransaction(input: UpdateTransactionInput): Promise<boolean> {
    try {
        const supabase = await createClient();

        const {error} = await supabase.rpc('update_transaction', {
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
