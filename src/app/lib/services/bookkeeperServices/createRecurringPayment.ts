'use server';

import { createClient } from '@/utils/supabase/server';
import { RecurringPaymentCreateRequest, RecurringPayment } from '@/types/recurringPayment';
import { revalidatePath } from 'next/cache';
import { Result, success, error as createError } from '@/types/result';
import { createRecurringPaymentSchema } from '@/lib/validation/schemas';
import { validateInput, formatValidationErrors } from '@/lib/validation/validator';

export async function createRecurringPayment(
    data: unknown
): Promise<Result<RecurringPayment, string>> {
    // Validate input
    const validationResult = validateInput(createRecurringPaymentSchema, data);
    if (!validationResult.success) {
        return createError(formatValidationErrors(validationResult.error));
    }

    const validatedData = validationResult.data;

    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return createError('User not authenticated');
        }

        // Determine if we should create an immediate transaction
        const startDate = new Date(validatedData.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        
        const shouldCreateImmediateTransaction = startDate <= today;

        // Let the database calculate the next payment date
        // The stored procedure will handle all date calculations

        const { data: result, error } = await supabase
            .rpc('create_recurring_payment', {
                p_type: validatedData.type,
                p_category: validatedData.category,
                p_description: validatedData.description,
                p_amount: validatedData.amount, // Send as string, let SQL handle conversion
                p_frequency: validatedData.frequency,
                p_start_date: validatedData.start_date,
                p_end_date: validatedData.end_date || null,
                p_day_of_month: validatedData.day_of_month || null,
                p_day_of_week: validatedData.day_of_week || null,
                p_created_by: user.id,
                p_customer_id: validatedData.customer_id || null,
                p_interaction_id: validatedData.interaction_id || null,
                p_next_payment_date: validatedData.start_date, // Database will calculate actual next date
                p_payment_limit: validatedData.payment_limit || null,
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
                    type: validatedData.type,
                    category: validatedData.category,
                    description: validatedData.description + ' (Recurring)',
                    amount: validatedData.amount,
                    customer_id: validatedData.customer_id || null,
                    interaction_id: validatedData.interaction_id || null,
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