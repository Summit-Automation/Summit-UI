'use server';

import { createClient } from '@/utils/supabase/server';

export async function processRecurringPayments(): Promise<{
    success: boolean;
    processed: number;
    error?: string;
}> {
    try {
        const supabase = await createClient();

        // This function will be called by a scheduled job (cron/edge function)
        // It processes all due recurring payments and creates actual transactions
        const { data, error } = await supabase
            .rpc('process_due_recurring_payments');

        if (error) {
            console.error('Error processing recurring payments:', error);
            return { success: false, processed: 0, error: error.message };
        }

        return { 
            success: true, 
            processed: data?.processed_count || 0 
        };
    } catch (error) {
        console.error('Error in processRecurringPayments:', error);
        return { 
            success: false, 
            processed: 0, 
            error: 'Failed to process recurring payments' 
        };
    }
}