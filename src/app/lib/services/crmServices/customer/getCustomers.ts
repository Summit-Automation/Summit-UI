'use server';

import { Customer } from '@/types/customer';
import { getAuthenticatedUser } from '../../shared/authUtils';

export async function getCustomers(): Promise<Customer[]> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching customers:', error);
            throw new Error('Failed to fetch customers');
        }

        return data || [];
    } catch (error) {
        console.error('Error in getCustomers:', error);
        throw error;
    }
}