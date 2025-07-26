import { useState, useCallback, useMemo } from 'react';
import { Lead } from '@/types/leadgen';
import { filterLeads } from '@/app/lib/services/leadServices/filterLeads';
import { LeadFilters } from '@/components/leadgenComponents/FilterLeadsModal';

interface UseLeadFiltersReturn {
  currentFilters: LeadFilters;
  isFiltered: boolean;
  hasActiveFilters: boolean;
  applyFilters: (filters: LeadFilters, allLeads: Lead[]) => Promise<Lead[]>;
  clearFilters: () => void;
  setCurrentFilters: (filters: LeadFilters) => void;
  reapplyFilters: (allLeads: Lead[]) => Promise<Lead[]>;
}

export function useLeadFilters(): UseLeadFiltersReturn {
  const [currentFilters, setCurrentFilters] = useState<LeadFilters>({});
  const [isFiltered, setIsFiltered] = useState(false);

  const hasActiveFilters = useMemo(() => 
    isFiltered && Object.keys(currentFilters).length > 0, 
    [isFiltered, currentFilters]
  );

  const applyFilters = useCallback(async (filters: LeadFilters, allLeads: Lead[]): Promise<Lead[]> => {
    try {
      const hasFilters = Object.keys(filters).length > 0;
      
      let filteredLeads: Lead[];
      
      if (hasFilters) {
        filteredLeads = await filterLeads(filters);
        setIsFiltered(true);
      } else {
        filteredLeads = allLeads;
        setIsFiltered(false);
      }
      
      setCurrentFilters(filters);
      return filteredLeads;
    } catch (error) {
      console.error('Error applying filters:', error);
      alert('Failed to apply filters. Please try again.');
      throw error;
    }
  }, []);

  const clearFilters = useCallback(() => {
    setCurrentFilters({});
    setIsFiltered(false);
  }, []);

  const reapplyFilters = useCallback(async (allLeads: Lead[]): Promise<Lead[]> => {
    if (hasActiveFilters) {
      return await filterLeads(currentFilters);
    }
    return allLeads;
  }, [hasActiveFilters, currentFilters]);

  return {
    currentFilters,
    isFiltered,
    hasActiveFilters,
    applyFilters,
    clearFilters,
    setCurrentFilters,
    reapplyFilters
  };
}