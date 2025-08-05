'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { hasGISPermission } from './checkGISPermissions';
import { ScrapedProperty, SavedProperty } from '@/types/gis-properties';

/**
 * Retrieves scraped properties from the database.
 * Can optionally filter by search session ID.
 * @param searchSessionId Optional session ID to filter properties by
 * @returns Promise with success status and scraped properties
 */
export async function getScrapedProperties(searchSessionId?: string): Promise<{ 
  success: boolean; 
  properties?: ScrapedProperty[]; 
  error?: string 
}> {
  try {
    const { supabase } = await getAuthenticatedUser();

    // Check GIS permissions via database
    const permissionCheck = await hasGISPermission();
    if (!permissionCheck.hasAccess) {
      return {
        success: false,
        error: 'Access denied: GIS scraper not available for your organization'
      };
    }

    let query = supabase
      .from('scraped_properties')
      .select('*')
      .order('scraped_at', { ascending: false });

    // Filter by search session if provided
    if (searchSessionId) {
      query = query.eq('search_session_id', searchSessionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching scraped properties:', error);
      return {
        success: false,
        error: 'Failed to fetch properties'
      };
    }

    return {
      success: true,
      properties: data as ScrapedProperty[]
    };
  } catch (error) {
    console.error('Error in getScrapedProperties:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}

/**
 * Retrieves all saved properties for the authenticated user's organization.
 * Saved properties persist until manually deleted or exported to leads.
 * @returns Promise with success status and saved properties
 */
export async function getSavedProperties(): Promise<{ 
  success: boolean; 
  properties?: SavedProperty[]; 
  error?: string 
}> {
  try {
    const { supabase } = await getAuthenticatedUser();

    // Check GIS permissions via database
    const permissionCheck = await hasGISPermission();
    if (!permissionCheck.hasAccess) {
      return {
        success: false,
        error: 'Access denied: GIS scraper not available for your organization'
      };
    }

    const { data, error } = await supabase
      .from('saved_properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved properties:', error);
      return {
        success: false,
        error: 'Failed to fetch saved properties'
      };
    }

    return {
      success: true,
      properties: data as SavedProperty[]
    };
  } catch (error) {
    console.error('Error in getSavedProperties:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}

