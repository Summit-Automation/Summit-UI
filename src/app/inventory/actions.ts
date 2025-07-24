'use server';

import { revalidatePath } from 'next/cache';
import { CreateInventoryItemRequest, UpdateInventoryItemRequest } from '@/types/inventory';
import { getInventoryItems } from '@/app/lib/services/inventoryServices/getInventoryItems';
import { getInventoryAlerts } from '@/app/lib/services/inventoryServices/getInventoryAlerts';
import { createInventoryItem } from '@/app/lib/services/inventoryServices/createInventoryItem';
import { updateInventoryItem } from '@/app/lib/services/inventoryServices/updateInventoryItem';
import { deleteInventoryItem } from '@/app/lib/services/inventoryServices/deleteInventoryItem';

export async function fetchInventoryData() {
    try {
        const [items, alerts] = await Promise.all([
            getInventoryItems(),
            getInventoryAlerts()
        ]);

        return { 
            items: JSON.parse(JSON.stringify(items)), 
            alerts: JSON.parse(JSON.stringify(alerts)) 
        };
    } catch (error) {
        console.error('Error fetching inventory data:', error);
        return { items: [], alerts: [] };
    }
}

export async function addInventoryItem(itemData: CreateInventoryItemRequest) {
    try {
        const result = await createInventoryItem(itemData);
        
        if (result) {
            revalidatePath('/inventory');
            return { success: true, item: JSON.parse(JSON.stringify(result)) };
        } else {
            return { success: false, error: 'Failed to create item' };
        }
    } catch (error) {
        console.error('Error creating inventory item:', error);
        return { success: false, error: 'Failed to create item' };
    }
}

export async function bulkImportInventoryItems(items: CreateInventoryItemRequest[]) {
    try {
        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (const item of items) {
            try {
                await createInventoryItem(item);
                successCount++;
            } catch (error) {
                console.error('Error importing item:', error);
                errorCount++;
                errors.push(`Failed to import "${item.name}"`);
            }
        }

        revalidatePath('/inventory');
        
        return { 
            success: true, 
            successCount, 
            errorCount, 
            errors 
        };
    } catch (error) {
        console.error('Error during bulk import:', error);
        return { 
            success: false, 
            successCount: 0, 
            errorCount: items.length, 
            errors: ['Bulk import failed'] 
        };
    }
}

export async function editInventoryItem(itemData: UpdateInventoryItemRequest) {
    try {
        const result = await updateInventoryItem(itemData);
        
        if (result) {
            revalidatePath('/inventory');
            return { success: true, item: JSON.parse(JSON.stringify(result)) };
        } else {
            return { success: false, error: 'Failed to update item' };
        }
    } catch (error) {
        console.error('Error updating inventory item:', error);
        return { success: false, error: 'Failed to update item' };
    }
}

export async function deleteInventoryItemAction(itemId: string) {
    try {
        const result = await deleteInventoryItem(itemId);
        
        if (result.success) {
            revalidatePath('/inventory');
            return { success: true };
        } else {
            return { success: false, error: result.error || 'Failed to delete item' };
        }
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        return { success: false, error: 'Failed to delete item' };
    }
}