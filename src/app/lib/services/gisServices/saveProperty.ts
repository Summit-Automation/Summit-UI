'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { hasGISPermission } from './checkGISPermissions';
import { SavedProperty } from '@/types/gis-properties';

/**
 * Saves a scraped property to permanent storage.
 * Moves property from temporary scraped_properties to saved_properties table.
 * @param scrapedPropertyId ID of the scraped property to save
 * @returns Promise with success status and saved property data
 */
export async function saveProperty(scrapedPropertyId: string): Promise<{ 
  success: boolean; 
  savedProperty?: SavedProperty; 
  error?: string 
}> {
  try {
    const { user, organizationId, supabase } = await getAuthenticatedUser();

    // Check GIS permissions via database
    const permissionCheck = await hasGISPermission();
    if (!permissionCheck.hasAccess) {
      return {
        success: false,
        error: 'Access denied: GIS scraper not available for your organization'
      };
    }

    // Get the scraped property data
    const { data: scrapedProperty, error: fetchError } = await supabase
      .from('scraped_properties')
      .select('*')
      .eq('id', scrapedPropertyId)
      .single();

    if (fetchError || !scrapedProperty) {
      console.error('Error fetching scraped property:', fetchError);
      return {
        success: false,
        error: 'Scraped property not found'
      };
    }

    // Check if already saved
    if (scrapedProperty.is_saved) {
      return {
        success: false,
        error: 'Property has already been saved'
      };
    }

    // Create saved property data
    const savedPropertyData = {
      user_id: user.id,
      organization_id: organizationId,
      scraped_property_id: scrapedProperty.id,
      owner_name: scrapedProperty.owner_name,
      address: scrapedProperty.address,
      city: scrapedProperty.city,
      zip_code: scrapedProperty.zip_code,
      acreage: scrapedProperty.acreage,
      assessed_value: scrapedProperty.assessed_value,
      property_type: scrapedProperty.property_type,
      parcel_id: scrapedProperty.parcel_id,
      search_criteria: scrapedProperty.search_criteria,
      original_scraped_at: scrapedProperty.scraped_at,
      exported_to_leads: false
    };

    // Insert into saved_properties table
    const { data: savedResult, error: saveError } = await supabase
      .from('saved_properties')
      .insert([savedPropertyData])
      .select()
      .single();

    if (saveError) {
      console.error('Error saving property:', saveError);
      return {
        success: false,
        error: 'Failed to save property'
      };
    }

    // Mark scraped property as saved
    const { error: updateError } = await supabase
      .from('scraped_properties')
      .update({
        is_saved: true,
        saved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', scrapedPropertyId);

    if (updateError) {
      console.error('Error marking property as saved:', updateError);
      // Don't fail the operation since the property was saved successfully
    }

    return {
      success: true,
      savedProperty: savedResult as SavedProperty
    };
  } catch (error) {
    console.error('Error in saveProperty:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}