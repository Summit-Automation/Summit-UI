'use server';

import { getAuthenticatedUser } from '../shared/authUtils';
import { RecurringPayment } from '@/types/recurringPayment';

export async function getRecurringPayments(): Promise<RecurringPayment[]> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        const { data, error } = await supabase
            .from('recurring_payments')
            .select('*')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });

        if (error) {
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
        throw error;
    }
}