'use server';

import { createClient } from '@/utils/supabase/server';
import { Customer } from '@/types/customer';

type NewCustomerInput = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;

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
