'use server';

import { createClient } from '@/utils/supabase/server';

export async function deleteInteraction(id: string): Promise<boolean> {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('Failed to get user:', userError);
            return false;
        }

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
