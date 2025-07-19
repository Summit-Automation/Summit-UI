'use server';

import { createClient } from '@/utils/supabase/server';

export async function getMileageGrowth(): Promise<number> {
    try {
        const supabase = await createClient();

        // Call the proxy function
        const { data, error } = await supabase.rpc('get_mileage_growth');

        if (error) {
            console.warn('Supabase error getting mileage growth:', error);
            return 0;
        }

        return data || 0;
    } catch (error) {
        console.error('Error in getMileageGrowth:', error);
        return 0;
    }
}