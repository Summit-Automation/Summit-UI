'use server';

import { createClient } from '@/utils/supabase/server';
import { RecurringPaymentUpdateRequest, RecurringPayment } from '@/types/recurringPayment';
import { revalidatePath } from 'next/cache';

export async function updateRecurringPayment(
    data: RecurringPaymentUpdateRequest
): Promise<{ success: boolean; data?: RecurringPayment; error?: string }> {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const { id, ...updateData } = data;

        const { data: result, error } = await supabase
            .rpc('update_recurring_payment', {
                payment_id: id,
                update_data: updateData
            });

        if (error) {
            console.error('Error updating recurring payment:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/bookkeeper');
        return { success: true, data: result };
    } catch (error) {
        console.error('Error updating recurring payment:', error);
        return { success: false, error: 'Failed to update recurring payment' };
    }
}