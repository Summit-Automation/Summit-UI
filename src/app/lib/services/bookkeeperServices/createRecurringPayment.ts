'use server';

import { createClient } from '@/utils/supabase/server';
import { RecurringPaymentCreateRequest, RecurringPayment } from '@/types/recurringPayment';
import { revalidatePath } from 'next/cache';
import { Result, success, error as createError } from '@/types/result';

export async function createRecurringPayment(
    data: RecurringPaymentCreateRequest
): Promise<Result<RecurringPayment, string>> {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return createError('User not authenticated');
        }

        // Determine if we should create an immediate transaction
        const startDate = new Date(data.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        
        const shouldCreateImmediateTransaction = startDate <= today;

        // Let the database calculate the next payment date
        // The stored procedure will handle all date calculations

        const { data: result, error } = await supabase
            .rpc('create_recurring_payment', {
                p_type: data.type,
                p_category: data.category,
                p_description: data.description,
                p_amount: data.amount, // Send as string, let SQL handle conversion
                p_frequency: data.frequency,
                p_start_date: data.start_date,
                p_end_date: data.end_date || null,
                p_day_of_month: data.day_of_month || null,
                p_day_of_week: data.day_of_week || null,
                p_created_by: user.id,
                p_customer_id: data.customer_id || null,
                p_interaction_id: data.interaction_id || null,
                p_next_payment_date: data.start_date, // Database will calculate actual next date
                p_payment_limit: data.payment_limit || null,
                p_payments_processed: shouldCreateImmediateTransaction ? 1 : 0, // Set initial count
            });

        if (error) {
            console.error('Error creating recurring payment:', error);
            return createError(error.message);
        }

        // If we should create an immediate transaction (start date is today or past)
        if (shouldCreateImmediateTransaction) {
            try {
                // Import the createTransaction function
                const { createTransaction } = await import('./createTransaction');
                
                // Create the first transaction immediately
                const transactionResult = await createTransaction({
                    type: data.type,
                    category: data.category,
                    description: data.description + ' (Recurring)',
                    amount: data.amount,
                    customer_id: data.customer_id || null,
                    interaction_id: data.interaction_id || null,
                    customer_name: null, // Will be populated by createTransaction
                    interaction_title: null, // Will be populated by createTransaction
                    interaction_outcome: null, // Will be populated by createTransaction
                });

                if (transactionResult) {
                    console.log('Created immediate transaction for recurring payment with processed count:', result.payments_processed);
                }
            } catch (transactionError) {
                console.error('Error creating immediate transaction:', transactionError);
                // Don't fail the whole operation, just log the error
            }
        }

        revalidatePath('/bookkeeper');
        return success(result);
    } catch (catchError) {
        console.error('Error creating recurring payment:', catchError);
        return createError('Failed to create recurring payment');
    }
}

// Date calculations are now handled by the database stored procedure
// This eliminates the complex 80+ line date calculation logic
// and ensures consistency across the application