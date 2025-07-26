'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';

export async function deleteInventoryItem(itemId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { supabase } = await getAuthenticatedUser();

        const { error } = await supabase.rpc('delete_inventory_item', {
            p_id: itemId
        });

        if (error) {
            console.error('Error deleting inventory item:', error);
            return { success: false, error: error.message || 'Failed to delete item' };
        }

        return { success: true };
    } catch (error) {
        console.error('Unexpected error in deleteInventoryItem:', error);
        return { success: false, error: 'Failed to delete item' };
    }
}