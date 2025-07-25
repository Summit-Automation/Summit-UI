'use server';

import { createClient } from '@/utils/supabase/server';

export async function processRecurringPayments(): Promise<{
    success: boolean;
    processed: number;
    error?: string;
}> {
    try {
        const supabase = await createClient();
        const today = new Date().toISOString().split('T')[0];
        
        // Get all active recurring payments that are due
        const { data: duePayments, error: fetchError } = await supabase
            .from('recurring_payments')
            .select('*')
            .eq('is_active', true)
            .lte('next_payment_date', today);

        if (fetchError) {
            console.error('Error fetching due recurring payments:', fetchError);
            return { success: false, processed: 0, error: fetchError.message };
        }

        if (!duePayments || duePayments.length === 0) {
            return { success: true, processed: 0 };
        }

        let processedCount = 0;

        for (const payment of duePayments) {
            try {
                // Create a transaction for this payment
                const { error: insertError } = await supabase
                    .from('transactions')
                    .insert({
                        type: payment.type,
                        category: payment.category,
                        description: payment.description,
                        amount: payment.amount,
                        date: payment.next_payment_date,
                        created_by: payment.created_by,
                        customer_id: payment.customer_id,
                        interaction_id: payment.interaction_id,
                        source: 'recurring_payment'
                    });

                if (insertError) {
                    console.error(`Failed to create transaction for recurring payment ${payment.id}:`, insertError);
                    continue;
                }

                // Calculate next payment date
                const nextDate = calculateNextPaymentDate(payment);
                const newPaymentsProcessed = payment.payments_processed + 1;
                
                // Check if payment limit reached
                const shouldDeactivate = payment.payment_limit && newPaymentsProcessed >= payment.payment_limit;

                // Update the recurring payment
                const { error: updateError } = await supabase
                    .from('recurring_payments')
                    .update({
                        next_payment_date: nextDate,
                        payments_processed: newPaymentsProcessed,
                        is_active: !shouldDeactivate,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', payment.id);

                if (updateError) {
                    console.error(`Failed to update recurring payment ${payment.id}:`, updateError);
                    continue;
                }

                processedCount++;
            } catch (error) {
                console.error(`Error processing recurring payment ${payment.id}:`, error);
                continue;
            }
        }

        return { 
            success: true, 
            processed: processedCount 
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

function calculateNextPaymentDate(payment: {
    next_payment_date: string;
    frequency: string;
    day_of_month?: number | null;
}): string {
    const currentDate = new Date(payment.next_payment_date);
    
    switch (payment.frequency) {
        case 'daily':
            currentDate.setDate(currentDate.getDate() + 1);
            break;
        case 'weekly':
            currentDate.setDate(currentDate.getDate() + 7);
            break;
        case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + 1);
            if (payment.day_of_month) {
                currentDate.setDate(payment.day_of_month);
            }
            break;
        case 'quarterly':
            currentDate.setMonth(currentDate.getMonth() + 3);
            if (payment.day_of_month) {
                currentDate.setDate(payment.day_of_month);
            }
            break;
        case 'yearly':
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            if (payment.day_of_month) {
                currentDate.setDate(payment.day_of_month);
            }
            break;
        default:
            currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return currentDate.toISOString().split('T')[0];
}