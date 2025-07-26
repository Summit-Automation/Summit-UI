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

        // If start date is today or in the past, create the first transaction immediately
        const startDate = new Date(data.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        
        const shouldCreateImmediateTransaction = startDate <= today;

        // Calculate next payment date based on frequency and start date
        const nextPaymentDate = calculateNextPaymentDate(
            data.start_date,
            data.frequency,
            data.day_of_month,
            data.day_of_week
        );

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
                p_next_payment_date: nextPaymentDate,
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

function calculateNextPaymentDate(
    startDate: string,
    frequency: string,
    dayOfMonth?: number | null,
    dayOfWeek?: number | null
): string {
    const start = new Date(startDate);
    const now = new Date();
    
    // If start date is in the future, use it as next payment date
    if (start > now) {
        return start.toISOString();
    }

    let nextDate = new Date(start);

    switch (frequency) {
        case 'daily':
            // Find next day from now
            nextDate = new Date(now);
            nextDate.setDate(nextDate.getDate() + 1);
            break;

        case 'weekly':
            // Find next occurrence of the specified day of week
            if (dayOfWeek !== null && dayOfWeek !== undefined) {
                nextDate = new Date(now);
                const daysUntilNext = (dayOfWeek - nextDate.getDay() + 7) % 7;
                if (daysUntilNext === 0) {
                    nextDate.setDate(nextDate.getDate() + 7); // Next week if today is the day
                } else {
                    nextDate.setDate(nextDate.getDate() + daysUntilNext);
                }
            }
            break;

        case 'monthly':
            // Find next occurrence of the specified day of month
            if (dayOfMonth !== null && dayOfMonth !== undefined) {
                nextDate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
                if (nextDate <= now) {
                    nextDate.setMonth(nextDate.getMonth() + 1);
                }
                // Handle case where day doesn't exist in month (e.g., 31st in February)
                if (nextDate.getDate() !== dayOfMonth) {
                    nextDate.setDate(0); // Go to last day of previous month
                }
            } else {
                nextDate = new Date(now.getFullYear(), now.getMonth() + 1, start.getDate());
            }
            break;

        case 'quarterly':
            // Find next quarter occurrence
            if (dayOfMonth !== null && dayOfMonth !== undefined) {
                nextDate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
                while (nextDate <= now) {
                    nextDate.setMonth(nextDate.getMonth() + 3);
                }
            } else {
                nextDate = new Date(start);
                while (nextDate <= now) {
                    nextDate.setMonth(nextDate.getMonth() + 3);
                }
            }
            break;

        case 'yearly':
            // Find next year occurrence
            if (dayOfMonth !== null && dayOfMonth !== undefined) {
                nextDate = new Date(now.getFullYear(), start.getMonth(), dayOfMonth);
                if (nextDate <= now) {
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                }
            } else {
                nextDate = new Date(start);
                nextDate.setFullYear(now.getFullYear());
                if (nextDate <= now) {
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                }
            }
            break;
    }

    return nextDate.toISOString();
}