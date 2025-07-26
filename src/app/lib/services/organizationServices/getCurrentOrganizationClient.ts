'use client';

import { createClient } from '@/utils/supabase/client';

export type Organization = {
    id: string;
    name: string;
    slug: string;
    created_at: string;
    updated_at: string;
};

export async function getCurrentUserOrganizationClient(): Promise<Organization | null> {
    try {
        const supabase = createClient();
        
        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
            console.error('Failed to get user:', userError);
            return null;
        }

        // Get organization ID from user metadata
        const organizationId = user.user_metadata?.organization_id;
        if (!organizationId) {
            console.error('User organization not found in metadata');
            return null;
        }

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
        console.error('Exception in getCurrentUserOrganizationClient:', error);
        return null;
    }
}