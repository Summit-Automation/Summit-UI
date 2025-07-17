// app/lib/services/bookkeeperServices/deleteTransaction.ts
'use server';

import {createClient} from '@/utils/supabase/server';

/**
 * Deletes a transaction by its ID.
 * This function calls a Supabase RPC function to perform the deletion.
 * @param id the ID of the transaction to delete.
 * @return {Promise<boolean>} returns true if the deletion was successful, false otherwise.
 */
export async function deleteTransaction(id: string): Promise<boolean> {
    try {
        const supabase = await createClient();

        const {error} = await supabase.rpc('delete_transaction', {p_id: id});
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
