'use server';

import { createClient } from '@/utils/supabase/server';
import { RecurringPayment } from '@/types/recurringPayment';

export async function getRecurringPayments(): Promise<RecurringPayment[]> {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .from('recurring_payments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching recurring payments:', error);
            throw new Error('Failed to fetch recurring payments');
        }

        return data || [];
    } catch (error) {
        console.error('Error in getRecurringPayments:', error);
        return [];
    }
}