'use server';

import { CreateInventoryItemRequest, InventoryItem } from '@/types/inventory';
import { createClient } from '@/utils/supabase/server';

export async function createInventoryItem(itemData: CreateInventoryItemRequest): Promise<InventoryItem | null> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('Failed to get user:', userError);
            return null;
        }

        const { error } = await supabase.rpc('add_inventory_item', {
            p_name: itemData.name,
            p_category: itemData.category,
            p_description: itemData.description || null,
            p_sku: itemData.sku || null,
            p_subcategory: itemData.subcategory || null,
            p_location: itemData.location || null,
            p_current_quantity: itemData.current_quantity || 0,
            p_minimum_threshold: itemData.minimum_threshold || 0,
            p_maximum_capacity: itemData.maximum_capacity || null,
            p_unit_of_measurement: itemData.unit_of_measurement || 'units',
            p_unit_cost: itemData.unit_cost || 0,
            p_unit_price: itemData.unit_price || 0,
            p_supplier: itemData.supplier || null,
            p_supplier_contact: itemData.supplier_contact || null,
            p_notes: itemData.notes || null,
            p_auto_reorder_enabled: itemData.auto_reorder_enabled || false
        });

        if (error) {
            console.error('Error creating inventory item:', error);
            return null;
        }

        // Return a simple success indicator since RPC returns void
        return { id: 'created', name: itemData.name } as InventoryItem;
    } catch (error) {
        console.error('Unexpected error in createInventoryItem:', error);
        return null;
    }
}