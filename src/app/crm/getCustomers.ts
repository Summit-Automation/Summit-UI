// app/crm/getCustomers.ts
'use server'

import { Customer } from '@/types/customer';

import { createClient } from '@/utils/supabase/server';

export async function getCustomers() : Promise<Customer[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('customers').select('*');

    if (error) {
        console.error('Error fetching customers:', error.message);
        return [];
    }

    return data;
}