'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { hasGISPermission } from './checkGISPermissions';
import { NewScrapedProperty, ScrapedProperty } from '@/types/gis-properties';

/**
 * Creates scraped property records from GIS scraping results.
 * Filters out duplicates and saves properties to the database for temporary storage.
 * @param properties Array of scraped property data
 * @param searchSessionId Optional session ID to group related properties
 * @returns Promise with success status and created properties
 */
export async function createScrapedProperties(
  properties: NewScrapedProperty[], 
  searchSessionId?: string
): Promise<{ success: boolean; properties?: ScrapedProperty[]; error?: string }> {
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

    // Generate a session ID if not provided
    const sessionId = searchSessionId || crypto.randomUUID();

    // Check for existing properties to prevent duplicates
    const existingPropertiesQuery = await supabase
      .from('scraped_properties')
      .select('address, city, owner_name')
      .eq('organization_id', organizationId)
      .eq('is_saved', false) // Only check unsaved scraped properties
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Within last 7 days

    const existingProperties = existingPropertiesQuery.data || [];
    const existingAddresses = new Set(
      existingProperties.map(p => `${p.address}-${p.city}-${p.owner_name}`.toLowerCase())
    );

    // Filter out duplicates
    const newProperties = properties.filter(property => {
      const key = `${property.address}-${property.city}-${property.owner_name}`.toLowerCase();
      return !existingAddresses.has(key);
    });

    console.log(`Filtered ${properties.length} properties to ${newProperties.length} new properties (removed ${properties.length - newProperties.length} duplicates)`);

    if (newProperties.length === 0) {
      return {
        success: true,
        properties: []
      };
    }

    const propertiesToInsert = newProperties.map(property => ({
      ...property,
      user_id: user.id,
      organization_id: organizationId,
      search_session_id: sessionId,
      is_saved: false
    }));

    const { data, error } = await supabase
      .from('scraped_properties')
      .insert(propertiesToInsert)
      .select();

    if (error) {
      console.error('Error creating scraped properties:', error);
      return {
        success: false,
        error: 'Failed to save properties to database'
      };
    }

    return {
      success: true,
      properties: data as ScrapedProperty[]
    };
  } catch (error) {
    console.error('Error in createScrapedProperties:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}