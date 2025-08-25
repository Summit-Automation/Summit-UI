'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { Transaction } from '@/types/transaction';

export async function exportTransactions(format: 'csv' | 'json' = 'csv'): Promise<{ success: boolean; data?: string; filename?: string; error?: string }> {
  try {
    const { organizationId, supabase } = await getAuthenticatedUser();

    // Fetch all transactions for the organization
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .order('timestamp', { ascending: false });

    if (transactionsError) {
      throw new Error('Failed to fetch transactions');
    }

    if (!transactions || transactions.length === 0) {
      return {
        success: false,
        error: 'No transactions found to export'
      };
    }

    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    if (format === 'json') {
      return {
        success: true,
        data: JSON.stringify(transactions, null, 2),
        filename: `transactions-export-${timestamp}.json`
      };
    }

    // CSV Export
    const csvHeaders = [
      'ID',
      'Date',
      'Description',
      'Amount',
      'Type',
      'Category',
      'Source',
      'Customer Name',
      'Interaction Title',
      'Interaction Outcome',
      'Created At'
    ];

    const csvRows = transactions.map((transaction: Transaction) => [
      transaction.id,
      new Date(transaction.timestamp).toLocaleDateString(),
      transaction.description,
      transaction.amount,
      transaction.type,
      transaction.category,
      transaction.source === 'manual' ? 'Manual Entry' : transaction.source === 'ai_agent' ? 'AI Agent' : 'Import',
      transaction.customer_name || '',
      transaction.interaction_title || '',
      transaction.interaction_outcome || '',
      transaction.timestamp
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
      filename: `transactions-export-${timestamp}.csv`
    };

  } catch (error) {
    console.error('Error in exportTransactions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}