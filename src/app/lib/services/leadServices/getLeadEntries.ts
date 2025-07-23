'use server';

import { Lead } from '@/types/leadgen';
import { getAuthenticatedUser } from '../shared/authUtils';

export async function getLeadEntries(): Promise<Lead[]> {
  try {
    // Use shared authentication utility to reduce redundant calls
    const { supabase, organizationId } = await getAuthenticatedUser();

    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      return [];
    }

    return leads || [];
  } catch (error) {
    console.error('Error in getLeadEntries:', error);
    return [];
  }
}