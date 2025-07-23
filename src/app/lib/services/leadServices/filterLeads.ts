'use server';

import { Lead } from '@/types/leadgen';
import { LeadFilters } from '@/components/leadgenComponents/FilterLeadsModal';
import { getAuthenticatedUser } from '../shared/authUtils';

export async function filterLeads(filters: LeadFilters): Promise<Lead[]> {
  try {
    // Use shared authentication utility to reduce redundant calls
    const { supabase, organizationId } = await getAuthenticatedUser();

    // Start with base query - ensure organization_id index exists for optimal performance
    let query = supabase
      .from('leads')
      .select('*')
      .eq('organization_id', organizationId);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters.source) {
      query = query.eq('source', filters.source);
    }

    if (filters.company_size) {
      query = query.eq('company_size', filters.company_size);
    }

    if (filters.is_qualified !== undefined) {
      query = query.eq('is_qualified', filters.is_qualified);
    }

    if (filters.min_score !== undefined) {
      query = query.gte('score', filters.min_score);
    }

    if (filters.max_score !== undefined) {
      query = query.lte('score', filters.max_score);
    }

    if (filters.min_estimated_value !== undefined) {
      query = query.gte('estimated_value', filters.min_estimated_value);
    }

    if (filters.max_estimated_value !== undefined) {
      query = query.lte('estimated_value', filters.max_estimated_value);
    }

    if (filters.industry) {
      query = query.ilike('industry', `%${filters.industry}%`);
    }

    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }

    if (filters.state) {
      query = query.ilike('state', `%${filters.state}%`);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      // Add one day to include the full end date
      const endDate = new Date(filters.date_to);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString().split('T')[0]);
    }

    // Apply search term to multiple fields with optimized query
    if (filters.search_term) {
      const searchTerm = filters.search_term.trim();
      if (searchTerm.length > 0) {
        const likePattern = `%${searchTerm}%`;
        // Use indexed fields first for better performance
        query = query.or(`email.ilike.${likePattern},first_name.ilike.${likePattern},last_name.ilike.${likePattern},company.ilike.${likePattern},phone.ilike.${likePattern}`);
      }
    }

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false });

    const { data: leads, error } = await query;

    if (error) {
      console.error('Error filtering leads:', error);
      throw new Error('Failed to filter leads');
    }

    return leads || [];

  } catch (error) {
    console.error('Error in filterLeads:', error);
    throw error;
  }
}