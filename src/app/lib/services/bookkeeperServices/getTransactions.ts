// app/crm/getCustomers.ts

'use server'

import {Transaction} from '@/types/transaction';

import {createClient} from '@/utils/supabase/server';

export async function getTransactions(): Promise<Transaction[]> {
    try {
        const supabase = await createClient();

        const {data, error} = await supabase
            .from('transactions')
            .select('*');

        if (error) {
            console.warn(
                'Supabase error fetching from \'transactions\' table', error);
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