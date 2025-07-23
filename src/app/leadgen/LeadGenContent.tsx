'use client';

import React, { useState, useMemo, lazy, Suspense } from "react";
import LeadSummary from "@/components/leadgenComponents/LeadSummary";
import LeadActions from "@/components/leadgenComponents/LeadActions";
import LeadTable from "@/components/leadgenComponents/LeadTable";
import { getLeadEntries } from "@/app/lib/services/leadServices/getLeadEntries";
import { getLeadStats } from "@/app/lib/services/leadServices/getLeadStats";
import { deleteLeadEntry } from "@/app/lib/services/leadServices/deleteLeadEntry";
import { convertLeadToCustomer } from "@/app/lib/services/leadServices/convertLeadToCustomer";
import { exportLeads } from "@/app/lib/services/leadServices/exportLeads";
import { filterLeads } from "@/app/lib/services/leadServices/filterLeads";
import { LeadFilters } from "@/components/leadgenComponents/FilterLeadsModal";
import { Lead, LeadStats } from "@/types/leadgen";

// Lazy load modals to reduce initial bundle size
const NewLeadModal = lazy(() => import("@/components/leadgenComponents/NewLeadModal"));
const AILeadGenerationModal = lazy(() => import("@/components/leadgenComponents/AILeadGenerationModal"));
const EditLeadModal = lazy(() => import("@/components/leadgenComponents/EditLeadModal"));
const FilterLeadsModal = lazy(() => import("@/components/leadgenComponents/FilterLeadsModal"));

// Simple cache to reduce redundant API calls
const dataCache = {
  leads: null as Lead[] | null,
  stats: null as LeadStats | null,
  lastFetch: 0,
  cacheTime: 30000 // 30 seconds cache
};

export default function LeadGenContent() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>({
    total_leads: 0,
    qualified_leads: 0,
    manual_leads: 0,
    ai_generated_leads: 0,
    average_score: 0,
    conversion_rate: 0
  });
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<LeadFilters>({});
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);

  // Memoize filter status to prevent unnecessary callback recreations
  const hasActiveFilters = useMemo(() => 
    isFiltered && Object.keys(currentFilters).length > 0, 
    [isFiltered, currentFilters]
  );

  // Define refreshData with caching optimization
  const refreshData = React.useCallback(async (forceRefresh = false) => {
    try {
      const now = Date.now();
      const shouldUseCache = !forceRefresh && 
        dataCache.leads && 
        dataCache.stats && 
        (now - dataCache.lastFetch) < dataCache.cacheTime;

      let leadsData: Lead[], statsData: LeadStats;

      if (shouldUseCache) {
        // Use cached data
        leadsData = dataCache.leads!;
        statsData = dataCache.stats!;
      } else {
        // Fetch fresh data
        [leadsData, statsData] = await Promise.all([
          getLeadEntries(),
          getLeadStats()
        ]);
        
        // Update cache
        dataCache.leads = leadsData;
        dataCache.stats = statsData;
        dataCache.lastFetch = now;
      }
      
      setAllLeads(leadsData);
      setStats(statsData);
      
      // Reapply filters if currently filtered
      if (hasActiveFilters) {
        const filteredLeads = await filterLeads(currentFilters);
        setLeads(filteredLeads);
      } else {
        setLeads(leadsData);
      }
    } catch (error) {
      console.error('Error refreshing lead data:', error);
    }
  }, [hasActiveFilters, currentFilters]);

  // Load data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [leadsData, statsData] = await Promise.all([
          getLeadEntries(),
          getLeadStats()
        ]);
        
        setLeads(leadsData);
        setAllLeads(leadsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading lead data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Listen for custom refresh events
    const handleRefresh = () => {
      refreshData();
    };

    window.addEventListener('leadDataRefresh', handleRefresh);
    
    return () => {
      window.removeEventListener('leadDataRefresh', handleRefresh);
    };
  }, [refreshData]);

  const handleNewLead = () => {
    setIsNewLeadModalOpen(true);
  };

  const handleAIGenerate = () => {
    setIsAIModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsEditModalOpen(true);
  };

  const handleDeleteLead = async (leadId: string) => {
    if (confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      try {
        const success = await deleteLeadEntry(leadId);
        if (success) {
          // Force refresh after data modification
          refreshData(true);
          // Also trigger the custom event
          window.dispatchEvent(new CustomEvent('leadDataRefresh'));
        }
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Failed to delete lead. Please try again.');
      }
    }
  };

  const handleConvertToCustomer = async (leadId: string) => {
    if (confirm('Are you sure you want to convert this lead to a customer? This will create a new customer record.')) {
      try {
        const result = await convertLeadToCustomer(leadId);
        if (result.success) {
          alert(`Lead successfully converted to customer! Customer ID: ${result.customerId}`);
          // Force refresh after data modification
          refreshData(true);
          // Also trigger the custom event
          window.dispatchEvent(new CustomEvent('leadDataRefresh'));
        } else {
          alert(`Failed to convert lead: ${result.error}`);
        }
      } catch (error) {
        console.error('Error converting lead to customer:', error);
        alert('Failed to convert lead to customer. Please try again.');
      }
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportLeads('csv');
      if (result.success && result.data && result.filename) {
        // Create a blob and download the file
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
    }
  };

  const handleFilter = () => {
    setIsFilterModalOpen(true);
  };

  const handleApplyFilters = async (filters: LeadFilters) => {
    try {
      setIsLoading(true);
      const hasFilters = Object.keys(filters).length > 0;
      
      if (hasFilters) {
        const filteredLeads = await filterLeads(filters);
        setLeads(filteredLeads);
        setIsFiltered(true);
      } else {
        setLeads(allLeads);
        setIsFiltered(false);
      }
      
      setCurrentFilters(filters);
    } catch (error) {
      console.error('Error applying filters:', error);
      alert('Failed to apply filters. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsNewLeadModalOpen(false);
    refreshData(true); // Force refresh after new lead creation
  };

  const handleAIModalClose = () => {
    setIsAIModalOpen(false);
    // Add a small delay to ensure any background operations complete
    setTimeout(() => {
      refreshData(true); // Force refresh after AI generation
    }, 500);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingLead(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <LeadSummary stats={stats} />
      
      <LeadActions
        onNewLead={handleNewLead}
        onAIGenerate={handleAIGenerate}
        onRefresh={refreshData}
        onExport={handleExport}
        onFilter={handleFilter}
      />
      
      <LeadTable
        leads={leads}
        onEdit={handleEditLead}
        onDelete={handleDeleteLead}
        onConvertToCustomer={handleConvertToCustomer}
      />

      {/* Only render modals when they're open to improve performance */}
      {isNewLeadModalOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <NewLeadModal
            isOpen={isNewLeadModalOpen}
            onClose={handleModalClose}
          />
        </Suspense>
      )}

      {isAIModalOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <AILeadGenerationModal
            isOpen={isAIModalOpen}
            onClose={handleAIModalClose}
          />
        </Suspense>
      )}

      {isEditModalOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <EditLeadModal
            isOpen={isEditModalOpen}
            onClose={handleEditModalClose}
            lead={editingLead}
          />
        </Suspense>
      )}

      {isFilterModalOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <FilterLeadsModal
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            onApplyFilters={handleApplyFilters}
            currentFilters={currentFilters}
          />
        </Suspense>
      )}
    </>
  );
}