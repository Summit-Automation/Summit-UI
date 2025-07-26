'use server';

import { MileageEntry } from '@/types/mileage';
import { getAuthenticatedUser } from '../shared/authUtils';

export async function getMileageEntries(): Promise<MileageEntry[]> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        const { data, error } = await supabase
            .from('mileage_entries')
            .select('*')
            .eq('organization_id', organizationId)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching mileage entries:', error);
            throw new Error('Failed to fetch mileage entries');
        }

        return data || [];
    } catch (error) {
        console.error('Error in getMileageEntries:', error);
        throw error;
    }
}