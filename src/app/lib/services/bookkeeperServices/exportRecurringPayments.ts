'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { RecurringPayment } from '@/types/recurringPayment';

export async function exportRecurringPayments(format: 'csv' | 'json' = 'csv'): Promise<{ success: boolean; data?: string; filename?: string; error?: string }> {
  try {
    const { organizationId, supabase } = await getAuthenticatedUser();

    // Fetch all recurring payments for the organization
    const { data: recurringPayments, error: paymentsError } = await supabase
      .from('recurring_payments')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (paymentsError) {
      throw new Error('Failed to fetch recurring payments');
    }

    if (!recurringPayments || recurringPayments.length === 0) {
      return {
        success: false,
        error: 'No recurring payments found to export'
      };
    }

    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    if (format === 'json') {
      return {
        success: true,
        data: JSON.stringify(recurringPayments, null, 2),
        filename: `recurring-payments-export-${timestamp}.json`
      };
    }

    // CSV Export
    const csvHeaders = [
      'ID',
      'Description',
      'Type',
      'Category',
      'Amount',
      'Frequency',
      'Next Payment Date',
      'Start Date',
      'End Date',
      'Payments Processed',
      'Payment Limit',
      'Customer Name',
      'Interaction Title',
      'Is Active',
      'Created At'
    ];

    const csvRows = recurringPayments.map((payment: RecurringPayment) => [
      payment.id,
      payment.description,
      payment.type,
      payment.category,
      payment.amount,
      payment.frequency,
      payment.next_payment_date,
      payment.start_date,
      payment.end_date || '',
      payment.payments_processed,
      payment.payment_limit || '',
      payment.customer_name || '',
      payment.interaction_title || '',
      payment.is_active ? 'Active' : 'Inactive',
      payment.created_at
    ]);

    // Escape CSV values and wrap in quotes if needed
    const escapeCsvValue = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // If value contains comma, quote, or newline, wrap in quotes and escape quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvContent = [
      csvHeaders.map(escapeCsvValue).join(','),
      ...csvRows.map(row => row.map(escapeCsvValue).join(','))
    ].join('\n');

    return {
      success: true,
      data: csvContent,
      filename: `recurring-payments-export-${timestamp}.csv`
    };

  } catch (error) {
    console.error('Error in exportRecurringPayments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}