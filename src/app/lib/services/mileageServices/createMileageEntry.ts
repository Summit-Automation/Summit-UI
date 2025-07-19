'use server';

import { createClient } from '@/utils/supabase/server';
import { MileageEntry } from "@/types/mileage";

type NewMileageEntryInput = Omit<MileageEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

export async function createMileageEntry(input: NewMileageEntryInput): Promise<boolean> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('Failed to get user:', userError);
            return false;
        }

        // Call the proxy function in public schema
        const { data, error } = await supabase.rpc('add_mileage_entry', {
            p_date: input.date,
            p_purpose: input.purpose,
            p_miles: input.miles,
            p_is_business: input.is_business,
            p_start_location: input.start_location,
            p_end_location: input.end_location,
            p_customer_id: input.customer_id,
            p_notes: input.notes,
        });

        if (error) {
            console.error('Error inserting new mileage entry:', error);
            return false;
        }

        console.log('Successfully created mileage entry with ID:', data);
        return true;
    } catch (err) {
        console.error('Exception in createMileageEntry:', err);
        return false;
    }
}