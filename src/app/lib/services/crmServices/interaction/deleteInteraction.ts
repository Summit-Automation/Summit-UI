'use server';

import { revalidatePath } from 'next/cache';
import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';

export async function deleteInteraction(id: string): Promise<boolean> {
    try {
        const { supabase } = await getAuthenticatedUser();

        const { error } = await supabase.rpc('delete_interaction', {
            p_id: id
        });

        if (error) {
            console.error('Error deleting interaction:', error);
            return false;
        }
        
        // Revalidate the CRM page to reflect the deleted interaction
        revalidatePath('/crm');
        
        return true;
    } catch (err) {
        console.error('Exception in deleteInteraction:', err);
        return false;
    }
}
