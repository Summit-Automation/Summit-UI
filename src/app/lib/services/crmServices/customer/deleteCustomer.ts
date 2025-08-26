'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { Result, success, error } from '@/types/result';

/**
 * Deletes a customer by its ID.
 * This function calls a Supabase RPC function to perform the deletion.
 * @param id the ID of the customer to delete.
 * @return {Promise<Result<void, string>>} returns success if the deletion was successful, error otherwise.
 */
export async function deleteCustomer(id: string): Promise<Result<void, string>> {
    try {
        const { supabase } = await getAuthenticatedUser();

        const { error: deleteError } = await supabase.rpc('delete_customer', {p_id: id}
        )

        if (deleteError) {
            console.error('Error deleting customer:', deleteError);
            return error('Failed to delete customer');
        }
        return success(undefined);
    } catch (err) {
        console.error('Exception in deleteCustomer:', err);
        return error(err instanceof Error ? err.message : 'Unknown error occurred');
    }
}