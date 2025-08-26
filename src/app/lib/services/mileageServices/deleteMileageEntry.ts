'use server';

import { createClient } from '@/utils/supabase/server';
import { Result, success, error } from '@/types/result';

export async function deleteMileageEntry(id: string): Promise<Result<void, string>> {
    try {
        const supabase = await createClient();

        // Call the proxy function in public schema
        const { error: deleteError } = await supabase.rpc('delete_mileage_entry', { p_id: id });
        if (deleteError) {
            console.error('Error deleting mileage entry:', deleteError);
            return error('Failed to delete mileage entry');
        }
        return success(undefined);
    } catch (err) {
        console.error('Exception in deleteMileageEntry:', err);
        return error(err instanceof Error ? err.message : 'Unknown error occurred');
    }
}