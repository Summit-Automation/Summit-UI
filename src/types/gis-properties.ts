/**
 * Scraped Property - temporary storage for GIS scraped data
 * These properties are automatically cleaned up weekly unless saved
 */
export interface ScrapedProperty {
  id: string;
  user_id: string;
  organization_id: string;
  search_session_id: string;
  owner_name: string;
  address: string;
  city: string;
  zip_code?: string;
  acreage: number;
  assessed_value?: number;
  property_type?: string;
  parcel_id?: string;
  search_criteria?: {
    township?: string;
    min_acreage: number;
    max_acreage: number;
  };
  scraped_at: string;
  is_saved: boolean;
  saved_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * New Scraped Property - input data for creating scraped properties
 * Omits system-generated fields like id, timestamps, etc.
 */
export interface NewScrapedProperty {
  owner_name: string;
  address: string;
  city: string;
  zip_code?: string;
  acreage: number;
  assessed_value?: number;
  property_type?: string;
  parcel_id?: string;
  search_criteria?: {
    township?: string;
    min_acreage: number;
    max_acreage: number;
  };
  search_session_id?: string;
}

/**
 * Saved Property - permanent storage until exported to leads
 * Properties saved from scraped data that persist until manually deleted
 */
export interface SavedProperty {
  id: string;
  user_id: string;
  organization_id: string;
  scraped_property_id?: string;
  owner_name: string;
  address: string;
  city: string;
  acreage: number;
  assessed_value?: number;
  property_type?: string;
  parcel_id?: string;
  search_criteria?: {
    township?: string;
    min_acreage: number;
    max_acreage: number;
  };
  original_scraped_at: string;
  exported_to_leads: boolean;
  exported_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * New Saved Property - input data for creating saved properties
 * Used when manually saving properties from external sources
 */
export interface NewSavedProperty {
  scraped_property_id?: string;
  owner_name: string;
  address: string;
  city: string;
  acreage: number;
  assessed_value?: number;
  property_type?: string;
  parcel_id?: string;
  search_criteria?: {
    township?: string;
    min_acreage: number;
    max_acreage: number;
  };
  original_scraped_at: string;
}

/**
 * GIS Search Criteria - parameters for GIS property searches
 */
export interface GISSearchCriteria {
  township?: string;
  min_acreage: number;
  max_acreage: number;
}

// Union type for both scraped and saved properties
export type GISProperty = ScrapedProperty | SavedProperty;

export interface GISSearchSession {
  id: string;
  criteria: GISSearchCriteria;
  properties: GISProperty[];
  total_count: number;
  scraped_at: string;
}

export interface GISPropertiesStats {
  organization_id: string;
  zip_code: string;
  total_properties: number;
  exported_count: number;
  avg_acreage: number;
  avg_assessed_value?: number;
  first_scraped: string;
  last_scraped: string;
}

export interface CleanupResult {
  success: boolean;
  deleted_count: number;
  cleaned_at: string;
}