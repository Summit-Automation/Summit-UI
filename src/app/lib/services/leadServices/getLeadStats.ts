'use server';

import { LeadStats } from '@/types/leadgen';
import { getAuthenticatedUser } from '../shared/authUtils';

export async function getLeadStats(): Promise<LeadStats> {
  try {
    const { supabase, organizationId } = await getAuthenticatedUser();

    const { data: statsData, error: statsError } = await supabase
      .rpc('get_lead_stats_optimized', { org_id: organizationId });

    if (statsError) {
      console.error('RPC get_lead_stats_optimized failed:', statsError);
      throw new Error(`Failed to fetch lead stats: ${statsError.message}`);
    }

    if (!statsData || statsData.length === 0) {
      console.warn('No stats data returned from RPC function');
      return getDefaultStats();
    }

    const stats = statsData[0];
    const conversionRate = stats.total_leads > 0 
      ? (stats.closed_won_leads || 0) / stats.total_leads 
      : 0;

    return {
      total_leads: stats.total_leads || 0,
      qualified_leads: stats.qualified_leads || 0,
      manual_leads: stats.manual_leads || 0,
      ai_generated_leads: stats.ai_generated_leads || 0,
      average_score: stats.average_score || 0,
      conversion_rate: conversionRate
    };
  } catch (error) {
    console.error('Error in getLeadStats:', error);
    return getDefaultStats();
  }
}

function getDefaultStats(): LeadStats {
  return {
    total_leads: 0,
    qualified_leads: 0,
    manual_leads: 0,
    ai_generated_leads: 0,
    average_score: 0,
    conversion_rate: 0
  };
}

