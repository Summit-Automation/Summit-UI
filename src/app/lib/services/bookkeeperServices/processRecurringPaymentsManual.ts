'use server';

import { processRecurringPayments } from './processRecurringPayments';

export async function processRecurringPaymentsManual() {
    console.log('Manual recurring payments processing triggered...');
    const result = await processRecurringPayments();
    console.log('Processing result:', result);
    return result;
}