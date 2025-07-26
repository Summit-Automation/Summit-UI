'use server';

import { z } from 'zod';
import { Lead } from '@/types/leadgen';
import { LeadFilters } from '@/components/leadgenComponents/FilterLeadsModal';
import { getAuthenticatedUser } from '../shared/authUtils';

const LeadFiltersSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  source: z.enum(['manual', 'ai_agent']).optional(),
  company_size: z.string().optional(),
  is_qualified: z.boolean().optional(),
  min_score: z.number().min(0).max(100).optional(),
  max_score: z.number().min(0).max(100).optional(),
  min_estimated_value: z.number().min(0).optional(),
  max_estimated_value: z.number().min(0).optional(),
  industry: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  search_term: z.string().max(255).optional()
});

function sanitizeSearchTerm(searchTerm: string): string {
  return searchTerm
    .trim()
    .replace(/[%_\\]/g, '\\$&')
    .replace(/'/g, "''")
    .substring(0, 255);
}

export async function filterLeads(filters: LeadFilters): Promise<Lead[]> {
  try {
    const validatedFilters = LeadFiltersSchema.parse(filters);
    const { supabase, organizationId } = await getAuthenticatedUser();

    let query = supabase
      .from('leads')
      .select('*')
      .eq('organization_id', organizationId);

    if (validatedFilters.status) {
      query = query.eq('status', validatedFilters.status);
    }

    if (validatedFilters.priority) {
      query = query.eq('priority', validatedFilters.priority);
    }

    if (validatedFilters.source) {
      query = query.eq('source', validatedFilters.source);
    }

    if (validatedFilters.company_size) {
      query = query.eq('company_size', validatedFilters.company_size);
    }

    if (validatedFilters.is_qualified !== undefined) {
      query = query.eq('is_qualified', validatedFilters.is_qualified);
    }

    if (validatedFilters.min_score !== undefined) {
      query = query.gte('score', validatedFilters.min_score);
    }

    if (validatedFilters.max_score !== undefined) {
      query = query.lte('score', validatedFilters.max_score);
    }

    if (validatedFilters.min_estimated_value !== undefined) {
      query = query.gte('estimated_value', validatedFilters.min_estimated_value);
    }

    if (validatedFilters.max_estimated_value !== undefined) {
      query = query.lte('estimated_value', validatedFilters.max_estimated_value);
    }

    if (validatedFilters.industry) {
      const sanitizedIndustry = sanitizeSearchTerm(validatedFilters.industry);
      query = query.ilike('industry', `%${sanitizedIndustry}%`);
    }

    if (validatedFilters.city) {
      const sanitizedCity = sanitizeSearchTerm(validatedFilters.city);
      query = query.ilike('city', `%${sanitizedCity}%`);
    }

    if (validatedFilters.state) {
      const sanitizedState = sanitizeSearchTerm(validatedFilters.state);
      query = query.ilike('state', `%${sanitizedState}%`);
    }

    if (validatedFilters.date_from) {
      query = query.gte('created_at', validatedFilters.date_from);
    }

    if (validatedFilters.date_to) {
      const endDate = new Date(validatedFilters.date_to);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString().split('T')[0]);
    }

    if (validatedFilters.search_term) {
      const searchTerm = sanitizeSearchTerm(validatedFilters.search_term);
      if (searchTerm.length > 0) {
        query = query.or([
          `email.ilike.*${searchTerm}*`,
          `first_name.ilike.*${searchTerm}*`,
          `last_name.ilike.*${searchTerm}*`,
          `company.ilike.*${searchTerm}*`,
          `phone.ilike.*${searchTerm}*`
        ].join(','));
      }
    }

    query = query.order('created_at', { ascending: false });

    const { data: leads, error } = await query;

    if (error) {
      console.error('Error filtering leads:', error);
      throw new Error('Failed to filter leads');
    }

    return leads || [];

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Invalid filter parameters:', error.issues);
      throw new Error('Invalid filter parameters provided');
    }
    console.error('Error in filterLeads:', error);
    throw error;
  }
}