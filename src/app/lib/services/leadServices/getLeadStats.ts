'use server';

import { createClient } from '@/utils/supabase/server';
import { LeadStats } from '@/types/leadgen';

export async function getLeadStats(): Promise<LeadStats> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return {
        total_leads: 0,
        qualified_leads: 0,
        manual_leads: 0,
        ai_generated_leads: 0,
        average_score: 0,
        conversion_rate: 0
      };
    }

    // Get organization ID from user metadata
    const organizationId = user.user_metadata?.organization_id;
    if (!organizationId) {
      return {
        total_leads: 0,
        qualified_leads: 0,
        manual_leads: 0,
        ai_generated_leads: 0,
        average_score: 0,
        conversion_rate: 0
      };
    }

    // Get total leads count
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    // Get qualified leads count
    const { count: qualifiedLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_qualified', true);

    // Get manual leads count
    const { count: manualLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('source', 'manual');

    // Get AI generated leads count
    const { count: aiLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('source', 'ai_agent');

    // Get average score
    const { data: scoreData } = await supabase
      .from('leads')
      .select('score')
      .eq('organization_id', organizationId);

    const averageScore = scoreData && scoreData.length > 0
      ? scoreData.reduce((sum, lead) => sum + (lead.score || 0), 0) / scoreData.length
      : 0;

    // Get conversion rate (closed won leads / total leads)
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
    console.error('Error in getLeadStats:', error);
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