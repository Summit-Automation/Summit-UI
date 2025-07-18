'use server';

import { MileageEntry } from '@/types/mileage';
import { createClient } from '@/utils/supabase/server';

export async function getMileageEntries(): Promise<MileageEntry[]> {
    try {
        const supabase = await createClient();

        // Query the correct table in mileage schema
        const { data, error } = await supabase
            .from('entries')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.warn('Supabase error fetching from mileage.entries table', error);
            return [];
        }

        if (!data || data.length === 0) {
            console.warn('No valid data returned from mileage.entries table. Got:', data);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getMileageEntries:', error);
        return [];
    }
}