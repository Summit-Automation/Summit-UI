'use server';

import { InventoryAlert } from '@/types/inventory';
import { createClient } from '@/utils/supabase/server';

export async function getInventoryAlerts(): Promise<InventoryAlert[]> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('Failed to get user:', userError);
            return [];
        }

        // Get organization_id from user metadata for manual filtering
        const organizationId = user.user_metadata?.organization_id;
        if (!organizationId) {
            console.error('User does not have organization_id in metadata');
            return [];
        }

        const { data, error } = await supabase
            .from('inventory_alerts')
            .select('*')
            .eq('organization_id', organizationId)  // Manual organization filtering
            .eq('status', 'active')
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching inventory alerts:', error);
            return [];
        }

        // The view already includes item_name, so no transformation needed
        const alerts = data || [];

        return alerts;
    } catch (error) {
        console.error('Unexpected error in getInventoryAlerts:', error);
        return [];
    }
}