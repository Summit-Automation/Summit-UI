'use server';

import { Interaction } from "@/types/interaction";
import { getAuthenticatedUser } from '../../shared/authUtils';

export async function getInteractions(): Promise<Interaction[]> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        const { data, error } = await supabase
            .from('interactions')
            .select('*')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching interactions:', error);
            throw new Error('Failed to fetch interactions');
        }

        return data || [];
    } catch (error) {
        console.error('Error in getInteractions:', error);
        throw error;
    }
}