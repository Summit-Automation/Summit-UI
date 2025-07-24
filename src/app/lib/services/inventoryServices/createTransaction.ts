'use server';

import { CreateTransactionRequest, InventoryTransaction } from '@/types/inventory';
import { getAuthenticatedUser } from '../shared/authUtils';

export async function createTransaction(transactionData: CreateTransactionRequest): Promise<InventoryTransaction | null> {
    try {
        // Use shared authentication utility for organization-level filtering
        const { supabase, user, organizationId } = await getAuthenticatedUser();

        // Get current item data to calculate before/after quantities
        const { data: item, error: itemError } = await supabase
            .from('inventory_items')
            .select('current_quantity')
            .eq('id', transactionData.item_id)
            .eq('organization_id', organizationId)
            .single();

        if (itemError || !item) {
            console.error('Error fetching item for transaction:', itemError);
            return null;
        }

        const quantityBefore = item.current_quantity;
        const quantityAfter = quantityBefore + transactionData.quantity_change;

        // Validate that quantity won't go negative
        if (quantityAfter < 0) {
            console.error('Transaction would result in negative quantity');
            return null;
        }

        const newTransaction = {
            ...transactionData,
            user_id: user.id,
            organization_id: organizationId,
            quantity_before: quantityBefore,
            quantity_after: quantityAfter,
            automation_source: transactionData.automation_source || 'manual',
            processed_by: user.id,
        };

        const { data, error } = await supabase
            .from('inventory_transactions')
            .insert([newTransaction])
            .select()
            .single();

        if (error) {
            console.error('Error creating transaction:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Unexpected error in createTransaction:', error);
        return null;
    }
}