'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';

interface ConvertLeadResult {
  success: boolean;
  customerId?: string;
  error?: string;
}

export async function convertLeadToCustomer(leadId: string): Promise<ConvertLeadResult> {
  try {
    const { organizationId, supabase } = await getAuthenticatedUser();

    // First, get the lead data
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('organization_id', organizationId)
      .single();

    if (leadError || !lead) {
      throw new Error('Lead not found or access denied');
    }

    // Map lead data to customer format
    const customerData = {
      full_name: `${lead.first_name} ${lead.last_name}`.trim(),
      business: lead.company || '',
      email: lead.email || '',
      phone: lead.phone || '',
      status: mapLeadStatusToCustomerStatus(lead.status),
      // Note: Customer table doesn't have organization_id, which is a limitation
      // The customer will be created without organization scoping
    };

    // Create the customer using the RPC function (matching existing pattern)
    const { data: customerResult, error: customerError } = await supabase
      .rpc('add_customer', customerData);

    if (customerError) {
      console.error('Error creating customer:', customerError);
      throw new Error('Failed to create customer');
    }

    // Update the lead status to indicate it was converted
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        status: 'converted',
        notes: lead.notes 
          ? `${lead.notes}\n\n[CONVERTED TO CUSTOMER: ${new Date().toLocaleString()}]`
          : `[CONVERTED TO CUSTOMER: ${new Date().toLocaleString()}]`,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)
      .eq('organization_id', organizationId);

    if (updateError) {
      console.error('Error updating lead status:', updateError);
      // Don't fail the conversion if we can't update the lead
    }

    return {
      success: true,
      customerId: customerResult?.id || 'unknown'
    };

  } catch (error) {
    console.error('Error in convertLeadToCustomer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Helper function to map lead status to customer status
function mapLeadStatusToCustomerStatus(leadStatus: string): string {
  const statusMap: Record<string, string> = {
    'new': 'lead',
    'contacted': 'contacted',
    'qualified': 'qualified',
    'proposal': 'proposal',
    'negotiation': 'proposal',
    'closed_won': 'closed',
    'closed_lost': 'lead',
    'converted': 'prospect',
    'follow_up': 'contacted'
  };

  return statusMap[leadStatus] || 'lead';
}