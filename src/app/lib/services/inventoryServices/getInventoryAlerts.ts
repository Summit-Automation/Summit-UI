'use server';

import { InventoryAlert } from '@/types/inventory';
import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';

export async function getInventoryAlerts(): Promise<InventoryAlert[]> {
    try {
        const { organizationId, supabase } = await getAuthenticatedUser();

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