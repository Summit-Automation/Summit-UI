// app/crm/getCustomers.ts
'use server'

import {Customer} from '@/types/customer';

import {createClient} from '@/utils/supabase/server';

export async function getCustomers(): Promise<Customer[]> {
    try {
        const supabase = await createClient();

        const {data, error} = await supabase
            .from('customers')
            .select('*')
            .order('created_at', {ascending: false});

        if (error) {
            console.warn(
                'Supabase error fetching from \'customers\' table', error);
            return [];
        }

        if (!data || data.length === 0) {
            console.warn('No valid data returned from \'customers\' table. Got:', data);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getCustomers:', error);
        return [];
    }
}