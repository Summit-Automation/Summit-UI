'use server';

import { createClient } from '@/utils/supabase/server';
import { Customer } from '@/types/customer';

type UpdateCustomerInput = Omit<Customer, 'created_at' | 'updated_at'>;

/**
 * Updates an existing customer in the CRM system.
 * This function uses Supabase to update the customer data.
 * @param input the details of the customer to be updated, including the ID.
 * @return {Promise<boolean>} returns true if the customer was successfully updated, false otherwise.
 */
export async function updateCustomer(input: UpdateCustomerInput): Promise<boolean> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('Failed to get user:', userError);
            return false;
        }

        const { error } = await supabase.rpc('update_customer', {
            p_id:       input.id,
            p_full_name: input.full_name,
            p_email:    input.email,
            p_phone:    input.phone,
            p_business: input.business,
            p_status:   input.status,
        }
        );

        if (error) {
            console.error('Error updating customer:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Exception in updateCustomer:', err);
        return false;
    }
}