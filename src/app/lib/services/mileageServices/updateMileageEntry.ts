'use server';

import { createClient } from '@/utils/supabase/server';
import { MileageEntry } from "@/types/mileage";

type UpdateMileageEntryInput = Omit<MileageEntry, 'created_at' | 'updated_at' | 'user_id'>;

export async function updateMileageEntry(input: UpdateMileageEntryInput): Promise<boolean> {
    try {
        const supabase = await createClient();

        // Call the correct RPC function in mileage schema
        const { error } = await supabase.rpc('update_entry', {
            p_id: input.id,
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
            console.error('Error updating mileage entry:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Exception in updateMileageEntry:', err);
        return false;
    }
}