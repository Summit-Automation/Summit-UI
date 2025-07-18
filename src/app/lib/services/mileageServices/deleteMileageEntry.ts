'use server';

import { createClient } from '@/utils/supabase/server';

export async function deleteMileageEntry(id: string): Promise<boolean> {
    try {
        const supabase = await createClient();

        // Call the correct RPC function in mileage schema
        const { error } = await supabase.rpc('delete_entry', { p_id: id });
        if (error) {
            console.error('Error deleting mileage entry:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Exception in deleteMileageEntry:', err);
        return false;
    }
}