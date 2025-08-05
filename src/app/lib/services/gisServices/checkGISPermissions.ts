'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';

/**
 * Checks if the current organization has permission to use GIS features.
 * Uses a database RPC function to verify permissions.
 * @param feature The GIS feature to check permission for (defaults to 'gis_scraper')
 * @returns Promise with access status and organization info
 */
export async function hasGISPermission(feature: string = 'gis_scraper'): Promise<{ 
  hasAccess: boolean; 
  organizationId?: string; 
  error?: string 
}> {
  try {
    const { organizationId, supabase } = await getAuthenticatedUser();

    if (!organizationId) {
      return {
        hasAccess: false,
        error: 'No organization found for user'
      };
    }

    // Call the database function to check permissions
    const { data, error } = await supabase
      .rpc('has_gis_permission', { feature });

    if (error) {
      console.error('Error checking GIS permissions:', error);
      return {
        hasAccess: false,
        organizationId,
        error: 'Unable to verify GIS permissions'
      };
    }

    return {
      hasAccess: data === true,
      organizationId,
      error: data === true ? undefined : 'Access denied: GIS scraper not available for your organization'
    };
  } catch (error) {
    console.error('Error in hasGISPermission:', error);
    
    return {
      hasAccess: false,
      error: 'Internal error verifying GIS permissions'
    };
  }
}

interface GISPermission {
  id: string;
  organization_id: string;
  feature_name: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  notes?: string;
}

/**
 * Retrieves all GIS permissions for the current organization.
 * Used for administrative purposes to view permission settings.
 * @returns Promise with success status and permissions data
 */
export async function getGISPermissions(): Promise<{
  success: boolean;
  permissions?: GISPermission[];
  error?: string;
}> {
  try {
    const { supabase } = await getAuthenticatedUser();

    const { data, error } = await supabase
      .from('gis_permissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching GIS permissions:', error);
      return {
        success: false,
        error: 'Failed to fetch permissions'
      };
    }

    return {
      success: true,
      permissions: data
    };
  } catch (error) {
    console.error('Error in getGISPermissions:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}