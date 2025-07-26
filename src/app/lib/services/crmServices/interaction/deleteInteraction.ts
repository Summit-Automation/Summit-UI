'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';

export async function deleteInteraction(id: string): Promise<boolean> {
    try {
        const { supabase } = await getAuthenticatedUser();

        const { error } = await supabase
            .from('interactions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting interaction:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Exception in deleteInteraction:', err);
        return false;
    }
}
