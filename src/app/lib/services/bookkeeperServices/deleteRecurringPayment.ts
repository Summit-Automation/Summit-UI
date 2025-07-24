'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteRecurringPayment(
    id: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const { error } = await supabase
            .rpc('delete_recurring_payment', { p_payment_id: id });

        if (error) {
            console.error('Error deleting recurring payment:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/bookkeeper');
        return { success: true };
    } catch (error) {
        console.error('Error deleting recurring payment:', error);
        return { success: false, error: 'Failed to delete recurring payment' };
    }
}