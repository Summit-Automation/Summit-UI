'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { Interaction } from '@/types/interaction';

type UpdateInteractionInput = Omit<Interaction, 'customer_name' | 'created_at' | 'updated_at' | 'interaction_index'>

/**
 * Updates an existing interaction in the CRM system.
 * This function uses Supabase to update the interaction data.
 * @param input the details of the interaction to be updated, including the ID.
 * @return {Promise<boolean>} returns true if the interaction was successfully updated, false otherwise.
 */
export async function updateInteraction(input: UpdateInteractionInput): Promise<boolean> {
    try {
        const { supabase } = await getAuthenticatedUser();

        const { error } = await supabase.rpc('update_interaction', {
            p_id: input.id,
            p_customer_id: input.customer_id,
            p_type: input.type,
            p_title: input.title,
            p_notes: input.notes,
            p_outcome: input.outcome,
            p_follow_up_required: input.follow_up_required,
        }
        );

        if (error) {
            console.error('Error updating interaction:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Exception in updateInteraction:', err);
        return false;
    }
}