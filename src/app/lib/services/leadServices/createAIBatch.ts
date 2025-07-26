'use server';

import { getAuthenticatedUser } from '@/app/lib/services/shared/authUtils';
import { NewLead } from '@/types/leadgen';

interface AIGeneratedLead {
  lead_score: number;
  confidence_score: number;
  company: string;
  industry: string;
  first_name: string;
  last_name: string;
  job_title: string;
  email?: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  company_size: string;
  estimated_value?: number;
  notes: string;
  ai_generated_notes: string;
  pain_points?: string[];
  opportunity_details?: string;
}

interface AIBatchData {
  batch_metadata: {
    search_criteria: {
      profession: string;
      location: string;
      radius: string;
      industry_focus?: string;
    };
    total_searches: number;
  };
  leads: AIGeneratedLead[];
}

export async function createAIBatch(
  batchData: AIBatchData,
  aiModelVersion: string = 'flowise-v1'
): Promise<{ success: boolean; batchId?: string; leadIds?: string[] }> {
  try {
    const { user, organizationId, supabase } = await getAuthenticatedUser();

    // Create AI batch record
    const { data: aiBatch, error: batchError } = await supabase
      .from('ai_batches')
      .insert({
        organization_id: organizationId,
        user_id: user.id,
        batch_name: `AI Generation - ${new Date().toLocaleDateString()}`,
        search_criteria: batchData.batch_metadata.search_criteria,
        total_leads_generated: batchData.leads.length,
        leads_qualified: batchData.leads.filter(lead => lead.lead_score >= 70).length,
        ai_model_version: aiModelVersion,
        processing_duration_seconds: 0, // Will be updated if needed
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (batchError) {
      console.error('Error creating AI batch:', batchError);
      return { success: false };
    }

    // Create leads from AI batch
    const leadPromises = batchData.leads.map(async (aiLead) => {
      const leadData: NewLead = {
        first_name: aiLead.first_name,
        last_name: aiLead.last_name,
        email: aiLead.email,
        phone: aiLead.phone,
        company: aiLead.company,
        job_title: aiLead.job_title,
        source: 'ai_agent',
        status: 'new',
        priority: aiLead.lead_score >= 90 ? 'high' : aiLead.lead_score >= 70 ? 'medium' : 'low',
        ai_agent_batch_id: aiBatch.id,
        ai_confidence_score: aiLead.confidence_score,
        ai_generated_notes: aiLead.ai_generated_notes,
        score: aiLead.lead_score,
        is_qualified: aiLead.lead_score >= 70,
        qualified_at: aiLead.lead_score >= 70 ? new Date().toISOString() : undefined,
        address: aiLead.address,
        city: aiLead.city,
        state: aiLead.state,
        zip_code: aiLead.zip_code,
        country: 'US',
        estimated_value: aiLead.estimated_value,
        industry: aiLead.industry,
        company_size: aiLead.company_size,
        notes: aiLead.notes,
        tags: aiLead.pain_points || undefined
      };

      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert({
          ...leadData,
          user_id: user.id,
          organization_id: organizationId
        })
        .select()
        .single();

      if (leadError) {
        console.error('Error creating lead:', leadError);
        return null;
      }

      return lead.id;
    });

    const leadIds = await Promise.all(leadPromises);
    const successfulLeadIds = leadIds.filter(id => id !== null) as string[];

    return {
      success: true,
      batchId: aiBatch.id,
      leadIds: successfulLeadIds
    };
  } catch (error) {
    console.error('Error in createAIBatch:', error);
    return { success: false };
  }
}