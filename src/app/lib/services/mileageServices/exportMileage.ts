'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { MileageEntry } from '@/types/mileage';

export async function exportMileage(format: 'csv' | 'json' = 'csv'): Promise<{ success: boolean; data?: string; filename?: string; error?: string }> {
  try {
    const { organizationId, supabase } = await getAuthenticatedUser();

    // Fetch all mileage entries for the organization
    const { data: mileageEntries, error: mileageError } = await supabase
      .from('mileage_entries')
      .select('*')
      .eq('organization_id', organizationId)
      .order('date', { ascending: false });

    if (mileageError) {
      throw new Error('Failed to fetch mileage entries');
    }

    if (!mileageEntries || mileageEntries.length === 0) {
      return {
        success: false,
        error: 'No mileage entries found to export'
      };
    }

    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    if (format === 'json') {
      return {
        success: true,
        data: JSON.stringify(mileageEntries, null, 2),
        filename: `mileage-export-${timestamp}.json`
      };
    }

    // CSV Export
    const csvHeaders = [
      'ID',
      'Date',
      'Purpose',
      'Miles',
      'Type',
      'Start Location',
      'End Location',
      'Customer Name',
      'Notes',
      'Tax Deduction ($0.67/mile)',
      'Created At'
    ];

    const standardMileageRate = 0.67;

    const csvRows = mileageEntries.map((entry: MileageEntry) => [
      entry.id,
      entry.date,
      entry.purpose,
      entry.miles.toString(),
      entry.is_business ? 'Business' : 'Personal',
      entry.start_location || '',
      entry.end_location || '',
      entry.customer_name || '',
      entry.notes || '',
      entry.is_business ? (entry.miles * standardMileageRate).toFixed(2) : '0.00',
      entry.created_at
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
      filename: `mileage-export-${timestamp}.csv`
    };

  } catch (error) {
    console.error('Error in exportMileage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}