'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { hasGISPermission } from './checkGISPermissions';
import { SavedProperty } from '@/types/gis-properties';

/**
 * Exports a saved property to the CRM system as a customer lead.
 * Creates a customer record with property owner information.
 * @param savedPropertyId ID of the saved property to export
 * @returns Promise with success status and created lead ID
 */
export async function exportSavedPropertyToLead(savedPropertyId: string): Promise<{ 
  success: boolean; 
  leadId?: string; 
  error?: string 
}> {
  try {
    const { organizationId, supabase } = await getAuthenticatedUser();

    // Check GIS permissions via database
    const permissionCheck = await hasGISPermission();
    if (!permissionCheck.hasAccess) {
      return {
        success: false,
        error: 'Access denied: GIS scraper not available for your organization'
      };
    }

    // Get the saved property data
    const { data: property, error: fetchError } = await supabase
      .from('saved_properties')
      .select('*')
      .eq('id', savedPropertyId)
      .single();

    if (fetchError || !property) {
      console.error('Error fetching saved property:', fetchError);
      return {
        success: false,
        error: 'Saved property not found'
      };
    }

    const savedProperty = property as SavedProperty;

    // Check if already exported
    if (savedProperty.exported_to_leads) {
      return {
        success: false,
        error: 'Property has already been exported to leads'
      };
    }

    // Create customer data for CRM
    const customerData = {
      full_name: savedProperty.owner_name,
      email: '', // GIS data doesn't include email, but field is required
      phone: '', // GIS data doesn't include phone, use empty string instead of null
      business: `${savedProperty.address}, ${savedProperty.city}`,
      status: 'prospect',
      organization_id: organizationId
    };

    // Insert customer into CRM database
    const { data: leadResult, error: leadError } = await supabase
      .from('customers')
      .insert([customerData])
      .select()
      .single();

    if (leadError) {
      console.error('Error creating customer:', leadError);
      return {
        success: false,
        error: 'Failed to create customer'
      };
    }

    // Mark saved property as exported
    const { error: updateError } = await supabase
      .from('saved_properties')
      .update({
        exported_to_leads: true,
        exported_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', savedPropertyId);

    if (updateError) {
      console.error('Error marking property as exported:', updateError);
      // Don't fail the operation since the lead was created successfully
    }

    return {
      success: true,
      leadId: leadResult.id
    };
  } catch (error) {
    console.error('Error in exportSavedPropertyToLead:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}

