'use client';

import { createClient } from '@/utils/supabase/client';
import { RecurringPayment } from '@/types/recurringPayment';

// SECURITY WARNING: This client-side function lacks organization_id filtering
// and could potentially expose data across organizations if RLS is not properly configured.
// Consider migrating to server-side implementation or ensure proper RLS policies.

export async function getRecurringPayments(): Promise<RecurringPayment[]> {
    try {
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .from('recurring_payments')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            // If table doesn't exist yet, return empty array instead of throwing
            if (error.code === '42P01') {
                console.warn('Recurring payments table not found - please run database-setup.sql');
                return [];
            }
            console.error('Error fetching recurring payments:', error);
            throw new Error('Failed to fetch recurring payments');
        }

        return data || [];
    } catch (error) {
        console.error('Error in getRecurringPayments:', error);
        return [];
    }
}