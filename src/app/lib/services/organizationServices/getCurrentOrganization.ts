'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';

export type Organization = {
    id: string;
    name: string;
    slug: string;
    created_at: string;
    updated_at: string;
};

export async function getCurrentUserOrganization(): Promise<Organization | null> {
    try {
        const { organizationId, supabase } = await getAuthenticatedUser();

        // Fetch organization details
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', organizationId)
            .single();

        if (error) {
            console.error('Error fetching organization:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Exception in getCurrentUserOrganization:', error);
        return null;
    }
}