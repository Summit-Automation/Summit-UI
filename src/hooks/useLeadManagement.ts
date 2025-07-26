import { useState, useCallback, useEffect } from 'react';
import { Lead, LeadStats } from '@/types/leadgen';
import { leadDataService } from '@/services/leadDataService';
import { deleteLeadEntry } from '@/app/lib/services/leadServices/deleteLeadEntry';
import { convertLeadToCustomer } from '@/app/lib/services/leadServices/convertLeadToCustomer';
import { exportLeads } from '@/app/lib/services/leadServices/exportLeads';

interface UseLeadManagementReturn {
  leads: Lead[];
  stats: LeadStats;
  allLeads: Lead[];
  isLoading: boolean;
  refreshData: (forceRefresh?: boolean) => Promise<void>;
  deleteLead: (leadId: string) => Promise<void>;
  convertToCustomer: (leadId: string) => Promise<void>;
  exportLeadsData: () => Promise<void>;
  setLeads: (leads: Lead[]) => void;
  setIsLoading: (loading: boolean) => void;
}

const initialStats: LeadStats = {
  total_leads: 0,
  qualified_leads: 0,
  manual_leads: 0,
  ai_generated_leads: 0,
  average_score: 0,
  conversion_rate: 0
};

export function useLeadManagement(): UseLeadManagementReturn {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>(initialStats);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async (forceRefresh = false) => {
    try {
      const [leadsData, statsData] = await leadDataService.getLeadsAndStats(forceRefresh);
      
      setAllLeads(leadsData);
      setStats(statsData);
      setLeads(leadsData);
    } catch (error) {
      console.error('Error refreshing lead data:', error);
      throw error;
    }
  }, []);

  const deleteLead = useCallback(async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      return;
    }

    try {
      const success = await deleteLeadEntry(leadId);
      if (success) {
        leadDataService.invalidateCache();
        await refreshData(true);
        window.dispatchEvent(new CustomEvent('leadDataRefresh'));
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Failed to delete lead. Please try again.');
      throw error;
    }
  }, [refreshData]);

  const convertToCustomer = useCallback(async (leadId: string) => {
    if (!confirm('Are you sure you want to convert this lead to a customer? This will create a new customer record.')) {
      return;
    }

    try {
      const result = await convertLeadToCustomer(leadId);
      if (result.success) {
        alert(`Lead successfully converted to customer! Customer ID: ${result.customerId}`);
        leadDataService.invalidateCache();
        await refreshData(true);
        window.dispatchEvent(new CustomEvent('leadDataRefresh'));
      } else {
        alert(`Failed to convert lead: ${result.error}`);
      }
    } catch (error) {
      console.error('Error converting lead to customer:', error);
      alert('Failed to convert lead to customer. Please try again.');
      throw error;
    }
  }, [refreshData]);

  const exportLeadsData = useCallback(async () => {
    try {
      const result = await exportLeads('csv');
      if (result.success && result.data && result.filename) {
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', result.filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      } else {
        alert(`Export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error exporting leads:', error);
      alert('Failed to export leads. Please try again.');
      throw error;
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await refreshData();
      } catch (error) {
        console.error('Error loading lead data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [refreshData]);

  return {
    leads,
    stats,
    allLeads,
    isLoading,
    refreshData,
    deleteLead,
    convertToCustomer,
    exportLeadsData,
    setLeads,
    setIsLoading
  };
}