'use server';

import { createClient } from '@/utils/supabase/server';
import { Customer } from '@/types/customer';

type NewCustomerInput = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;


/**
 * Creates a new customer in the CRM system.
 * This function uses a Supabase RPC function to insert the customer data.
 * @param input the details of the new customer to be created.
 * @return {Promise<boolean>} returns true if the customer was successfully created, false otherwise.
 */
export async function createCustomer(input: NewCustomerInput): Promise<boolean> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('Failed to get user:', userError);
            return false;
        }

        const { error } = await supabase.rpc('add_customer', {
            full_name: input.full_name,
            email: input.email,
            phone: input.phone,
            business: input.business,
            status: input.status,
        });


        if (error) {
            console.error('Error inserting new customer:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Exception in createCustomer:', err);
        return false;
    }
}
