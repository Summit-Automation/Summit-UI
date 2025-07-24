'use server';

import { createClient } from '@/utils/supabase/server';
import { RecurringPaymentCreateRequest, RecurringPayment } from '@/types/recurringPayment';
import { revalidatePath } from 'next/cache';

export async function createRecurringPayment(
    data: RecurringPaymentCreateRequest
): Promise<{ success: boolean; data?: RecurringPayment; error?: string }> {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Calculate next payment date based on frequency and start date
        const nextPaymentDate = calculateNextPaymentDate(
            data.start_date,
            data.frequency,
            data.day_of_month,
            data.day_of_week
        );

        const recurringPaymentData = {
            type: data.type,
            category: data.category,
            description: data.description,
            amount: data.amount,
            frequency: data.frequency,
            start_date: data.start_date,
            end_date: data.end_date || null,
            day_of_month: data.day_of_month || null,
            day_of_week: data.day_of_week || null,
            is_active: true,
            created_by: user.id,
            customer_id: data.customer_id || null,
            interaction_id: data.interaction_id || null,
            next_payment_date: nextPaymentDate,
            payments_processed: 0,
            payment_limit: data.payment_limit || null,
        };

        const { data: result, error } = await supabase
            .rpc('create_recurring_payment', recurringPaymentData);

        if (error) {
            console.error('Error creating recurring payment:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/bookkeeper');
        return { success: true, data: result };
    } catch (error) {
        console.error('Error creating recurring payment:', error);
        return { success: false, error: 'Failed to create recurring payment' };
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