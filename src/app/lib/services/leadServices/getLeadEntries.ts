'use server';

import { createClient } from '@/utils/supabase/server';
import { Lead } from '@/types/leadgen';

export async function getLeadEntries(): Promise<Lead[]> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return [];
    }

    // Get organization ID from user metadata
    const organizationId = user.user_metadata?.organization_id;
    if (!organizationId) {
      return [];
    }

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