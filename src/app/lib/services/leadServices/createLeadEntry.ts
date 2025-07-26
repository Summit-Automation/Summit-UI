'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { NewLead } from '@/types/leadgen';

export async function createLeadEntry(leadData: NewLead): Promise<boolean> {
  try {
    const { user, organizationId, supabase } = await getAuthenticatedUser();

    const { error } = await supabase
      .from('leads')
      .insert({
        ...leadData,
        user_id: user.id,
        organization_id: organizationId,
        score: leadData.score || 0,
        is_qualified: leadData.is_qualified || false,
        status: leadData.status || 'new',
        priority: leadData.priority || 'medium',
        country: leadData.country || 'US'
      });

    if (error) {
      console.error('Error creating lead:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createLeadEntry:', error);
    return false;
  }
}