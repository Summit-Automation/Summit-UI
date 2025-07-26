'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';

/**
 * Deletes a customer by its ID.
 * This function calls a Supabase RPC function to perform the deletion.
 * @param id the ID of the customer to delete.
 * @return {Promise<boolean>} returns true if the deletion was successful, false otherwise.
 */
export async function deleteCustomer(id: string): Promise<boolean> {
    try {
        const { supabase } = await getAuthenticatedUser();

        const { error } = await supabase.rpc('delete_customer', {p_id: id}
        )

        if (error) {
            console.error('Error deleting customer:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Exception in deleteCustomer:', err);
        return false;
    }
}