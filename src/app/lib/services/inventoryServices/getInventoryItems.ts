'use server';

import { InventoryItem, InventoryFilters } from '@/types/inventory';
import { createClient } from '@/utils/supabase/server';

export async function getInventoryItems(filters?: InventoryFilters): Promise<InventoryItem[]> {
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

        let query = supabase
            .from('inventory_items')
            .select('*')
            .eq('organization_id', organizationId)  // Manual organization filtering
            .order('created_at', { ascending: false });

        // Apply filters
        if (filters) {
            if (filters.search) {
                query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
            }
            
            if (filters.category && filters.category !== 'all') {
                query = query.eq('category', filters.category);
            }
            
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            
            if (filters.location) {
                query = query.eq('location', filters.location);
            }
            
            if (filters.low_stock_only) {
                query = query.lte('current_quantity', 'minimum_threshold');
            }
            
            if (filters.out_of_stock_only) {
                query = query.eq('current_quantity', 0);
            }
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching inventory items:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error in getInventoryItems:', error);
        return [];
    }
}