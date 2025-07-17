'use server';

import {createClient} from '@/utils/supabase/server';
import {Interaction} from '@/types/interaction';

type NewInteractionInput = Omit<Interaction, 'id' | 'customer_name' | 'created_at' | 'updated_at' | 'interaction_index'>;

/**
 * Creates a new interaction in the CRM system.
 * This function uses a Supabase RPC function to insert the interaction data.
 * @param input the details of the new interaction to be created.
 * @return {Promise<boolean>} returns true if the interaction was successfully created, false otherwise.
 */
export async function createInteraction(input: NewInteractionInput): Promise<boolean> {
    try {
        const supabase = await createClient();

        const {data: {user}, error: userError} = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('Failed to get user:', userError);
            return false;
        }

        const {error} = await supabase.rpc('add_interaction', {
            customer_id: input.customer_id,
            follow_up_required: input.follow_up_required,
            notes: input.notes ?? '',
            outcome: input.outcome ?? '',
            title: input.title,
            type: input.type,
        });

        if (error) {
            console.error('Error inserting new interaction:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Exception in createInteraction:', err);
        return false;
    }
}
