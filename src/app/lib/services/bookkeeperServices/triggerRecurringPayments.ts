'use server';

import { createClient } from '@/utils/supabase/server';

export async function triggerRecurringPaymentsManually(): Promise<{
    success: boolean;
    processed: number;
    failed?: number;
    error?: string;
    errors?: string[];
}> {
    try {
        const supabase = await createClient();
        
        // Call the manual trigger function for testing
        const { data, error } = await supabase
            .rpc('trigger_recurring_payments_manually');

        if (error) {
            console.error('Error triggering recurring payments manually:', error);
            return { 
                success: false, 
                processed: 0, 
                error: error.message 
            };
        }

        return {
            success: true,
            processed: data.processed_count || 0,
            failed: data.failed_count || 0,
            errors: data.errors || []
        };
    } catch (error) {
        console.error('Error in triggerRecurringPaymentsManually:', error);
        return { 
            success: false, 
            processed: 0, 
            error: 'Failed to trigger recurring payments manually' 
        };
    }
}