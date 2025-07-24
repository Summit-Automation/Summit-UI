'use server';

import { createClient } from '@/utils/supabase/server';

export async function deleteInventoryItem(itemId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('Failed to get user:', userError);
            return { success: false, error: 'Authentication failed' };
        }

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