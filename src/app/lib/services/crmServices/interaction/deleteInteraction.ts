'use server';

import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { Result, success, error } from '@/types/result';

export async function deleteInteraction(id: string): Promise<Result<void, string>> {
    try {
        const { supabase } = await getAuthenticatedUser();

        const { error: deleteError } = await supabase.rpc('delete_interaction', {
            p_id: id
        });

        if (deleteError) {
            console.error('Error deleting interaction:', deleteError);
            return error('Failed to delete interaction');
        }
        
        // Revalidate the CRM page to reflect the deleted interaction
        revalidatePath('/crm');
        
        return success(undefined);
    } catch (err) {
        console.error('Exception in deleteInteraction:', err);
        return error(err instanceof Error ? err.message : 'Unknown error occurred');
    }
}
