'use server';

import { Transaction } from '@/types/transaction';
import { getAuthenticatedUser } from '../shared/authUtils';

export async function getTransactions(): Promise<Transaction[]> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('organization_id', organizationId);

        if (error) {
            console.error('Error fetching transactions:', error);
            throw new Error('Failed to fetch transactions');
        }

        return data || [];
    } catch (error) {
        console.error('Error in getTransactions:', error);
        throw error;
    }
}