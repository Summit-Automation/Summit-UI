'use server';

import { MileageEntry } from '@/types/mileage';
import { createClient } from '@/utils/supabase/server';

export async function getMileageEntries(): Promise<MileageEntry[]> {
    try {
        const supabase = await createClient();

        // Use the proxy view that references mileage.entries
        const { data, error } = await supabase
            .from('mileage_entries')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.warn('Supabase error fetching from mileage_entries table', error);
            return [];
        }

        if (!data || data.length === 0) {
            console.warn('No valid data returned from mileage_entries table. Got:', data);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getMileageEntries:', error);
        return [];
    }
}