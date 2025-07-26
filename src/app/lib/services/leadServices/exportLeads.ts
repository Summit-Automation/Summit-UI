'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { Lead } from '@/types/leadgen';

export async function exportLeads(format: 'csv' | 'json' = 'csv'): Promise<{ success: boolean; data?: string; filename?: string; error?: string }> {
  try {
    const { organizationId, supabase } = await getAuthenticatedUser();

    // Fetch all leads for the organization
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (leadsError) {
      throw new Error('Failed to fetch leads');
    }

    if (!leads || leads.length === 0) {
      return {
        success: false,
        error: 'No leads found to export'
      };
    }

    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    if (format === 'json') {
      return {
        success: true,
        data: JSON.stringify(leads, null, 2),
        filename: `leads-export-${timestamp}.json`
      };
    }

    // CSV Export
    const csvHeaders = [
      'ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Company',
      'Job Title',
      'Status',
      'Priority',
      'Score',
      'Qualified',
      'Source',
      'Estimated Value',
      'Expected Close Date',
      'Industry',
      'Company Size',
      'Address',
      'City',
      'State',
      'ZIP Code',
      'Country',
      'Notes',
      'Tags',
      'Created At',
      'Updated At',
      'Last Contacted At'
    ];

    const csvRows = leads.map((lead: Lead) => [
      lead.id,
      lead.first_name,
      lead.last_name,
      lead.email || '',
      lead.phone || '',
      lead.company || '',
      lead.job_title || '',
      lead.status,
      lead.priority,
      lead.score,
      lead.is_qualified ? 'Yes' : 'No',
      lead.source === 'manual' ? 'Manual Entry' : 'AI Generated',
      lead.estimated_value || '',
      lead.expected_close_date || '',
      lead.industry || '',
      lead.company_size || '',
      lead.address || '',
      lead.city || '',
      lead.state || '',
      lead.zip_code || '',
      lead.country,
      lead.notes || '',
      Array.isArray(lead.tags) ? lead.tags.join('; ') : '',
      lead.created_at,
      lead.updated_at,
      lead.last_contacted_at || ''
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
      filename: `leads-export-${timestamp}.csv`
    };

  } catch (error) {
    console.error('Error in exportLeads:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}