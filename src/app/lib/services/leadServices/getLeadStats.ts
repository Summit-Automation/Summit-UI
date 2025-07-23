'use server';

import { LeadStats } from '@/types/leadgen';
import { getAuthenticatedUser } from '../shared/authUtils';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function getLeadStats(): Promise<LeadStats> {
  try {
    // Use shared authentication utility to reduce redundant calls
    const { supabase, organizationId } = await getAuthenticatedUser();

    // Get all stats in a single optimized query using RPC (stored procedure)
    // This replaces 6 separate queries with 1 efficient database call
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_lead_stats_optimized', { org_id: organizationId });

    if (statsError) {
      console.error('Error fetching optimized lead stats:', statsError);
      // Fallback to original method if RPC fails
      return await getLeadStatsLegacy(supabase, organizationId);
    }

    const stats = statsData?.[0] || {
      total_leads: 0,
      qualified_leads: 0,
      manual_leads: 0,
      ai_generated_leads: 0,
      average_score: 0,
      closed_won_leads: 0
    };

    const conversionRate = stats.total_leads > 0 
      ? stats.closed_won_leads / stats.total_leads 
      : 0;

    return {
      total_leads: stats.total_leads,
      qualified_leads: stats.qualified_leads,
      manual_leads: stats.manual_leads,
      ai_generated_leads: stats.ai_generated_leads,
      average_score: stats.average_score || 0,
      conversion_rate: conversionRate
    };
  } catch (error) {
    console.error('Error in getLeadStats:', error);
    // Return default stats if authentication fails or other errors occur
    return {
      total_leads: 0,
      qualified_leads: 0,
      manual_leads: 0,
      ai_generated_leads: 0,
      average_score: 0,
      conversion_rate: 0
    };
  }
}

async function getLeadStatsLegacy(supabase: SupabaseClient, organizationId: string): Promise<LeadStats> {
  try {
    // Legacy implementation as fallback - uses original 6-query approach
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    const { count: qualifiedLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_qualified', true);

    const { count: manualLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('source', 'manual');

    const { count: aiLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('source', 'ai_agent');

    const { data: scoreData } = await supabase
      .from('leads')
      .select('score')
      .eq('organization_id', organizationId);

    const averageScore = scoreData && scoreData.length > 0
      ? scoreData.reduce((sum: number, lead: { score?: number }) => sum + (lead.score || 0), 0) / scoreData.length
      : 0;

    const { count: closedWonLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'closed_won');

    const conversionRate = totalLeads && totalLeads > 0 
      ? (closedWonLeads || 0) / totalLeads 
      : 0;

    return {
      total_leads: totalLeads || 0,
      qualified_leads: qualifiedLeads || 0,
      manual_leads: manualLeads || 0,
      ai_generated_leads: aiLeads || 0,
      average_score: averageScore,
      conversion_rate: conversionRate
    };
  } catch (error) {
    console.error('Error in getLeadStatsLegacy:', error);
    return {
      total_leads: 0,
      qualified_leads: 0,
      manual_leads: 0,
      ai_generated_leads: 0,
      average_score: 0,
      conversion_rate: 0
    };
  }
}