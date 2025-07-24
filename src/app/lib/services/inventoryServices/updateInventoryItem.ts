'use server';

import { UpdateInventoryItemRequest, InventoryItem } from '@/types/inventory';
import { createClient } from '@/utils/supabase/server';

export async function updateInventoryItem(itemData: UpdateInventoryItemRequest): Promise<InventoryItem | null> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('Failed to get user:', userError);
            return null;
        }

        const { error } = await supabase.rpc('update_inventory_item', {
            p_id: itemData.id,
            p_name: itemData.name,
            p_category: itemData.category,
            p_current_quantity: itemData.current_quantity,
            p_description: itemData.description || null,
            p_sku: itemData.sku || null,
            p_subcategory: itemData.subcategory || null,
            p_location: itemData.location || null,
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
            console.error('Error updating inventory item:', error);
            return null;
        }

        // Return updated item data
        return {
            id: itemData.id,
            name: itemData.name,
            category: itemData.category,
            current_quantity: itemData.current_quantity
        } as InventoryItem;
    } catch (error) {
        console.error('Unexpected error in updateInventoryItem:', error);
        return null;
    }
}