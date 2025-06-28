// app/crm/getInteractions.ts
'use server'

import { Interaction } from "@/types/interaction";

import { createClient } from "@/utils/supabase/server";

export async function getInteractions() : Promise<Interaction[]> {
    try {
        const supabase = await createClient();

        const {data, error} = await supabase
            .from('interactions')
            .select('*');


        if (error) {
            console.warn(
                'Supabase error fetching from \'interactions\' table', error);
            return [];
        }

        if (!data || data.length === 0) {
            console.warn('No valid data returned from \'interactions\' table. Got:', data);
            return [];
        }

        return data || [];
    }
    catch (error) {
        console.error('Error in getInteractions:', error);
        return [];
    }
}