'use server';

import { createClient } from '@/utils/supabase/server';

export interface MileageStats {
    month: string;
    business_miles: number;
    personal_miles: number;
    total_miles: number;
    total_entries: number;
    business_entries: number;
    entries_with_locations: number;
    potential_deduction: number;
    avg_business_trip_miles: number;
    max_business_trip_miles: number;
}

export async function getMileageStats(): Promise<MileageStats[]> {
    try {
        const supabase = await createClient();

        // Use the proxy view
        const { data, error } = await supabase
            .from('mileage_stats')
            .select('*')
            .order('month', { ascending: false });

        if (error) {
            console.warn('Supabase error fetching from mileage_stats view', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getMileageStats:', error);
        return [];
    }
}
