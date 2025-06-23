// app/crm/getInteractions.ts
'use server'

import { Interaction} from "@/types/interaction";

import { createClient } from "@/utils/supabase/server";

export async function getInteractions() : Promise<Interaction[]> {
    const supabase = await createClient();

    const {data, error} = await supabase
        .from('interactions').select('*');

    if (error) {
        console.error('Error fetching customer interactions:', error.message);
        return [];
    }

    return data;
}
