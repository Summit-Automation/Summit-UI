'use client';

import React, { useState } from "react";
import LeadSummary from "@/components/leadgenComponents/LeadSummary";
import LeadActions from "@/components/leadgenComponents/LeadActions";
import LeadTable from "@/components/leadgenComponents/LeadTable";
import NewLeadModal from "@/components/leadgenComponents/NewLeadModal";
import AILeadGenerationModal from "@/components/leadgenComponents/AILeadGenerationModal";
import EditLeadModal from "@/components/leadgenComponents/EditLeadModal";
import { getLeadEntries } from "@/app/lib/services/leadServices/getLeadEntries";
import { getLeadStats } from "@/app/lib/services/leadServices/getLeadStats";
import { deleteLeadEntry } from "@/app/lib/services/leadServices/deleteLeadEntry";
import { convertLeadToCustomer } from "@/app/lib/services/leadServices/convertLeadToCustomer";
import { exportLeads } from "@/app/lib/services/leadServices/exportLeads";
import { filterLeads } from "@/app/lib/services/leadServices/filterLeads";
import FilterLeadsModal, { LeadFilters } from "@/components/leadgenComponents/FilterLeadsModal";
import { Lead, LeadStats } from "@/types/leadgen";

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

  // Define refreshData first
  const refreshData = React.useCallback(async () => {
    try {
      const [leadsData, statsData] = await Promise.all([
        getLeadEntries(),
        getLeadStats()
      ]);
      
      setAllLeads(leadsData);
      setStats(statsData);
      
      // Reapply filters if currently filtered
      if (isFiltered && Object.keys(currentFilters).length > 0) {
        const filteredLeads = await filterLeads(currentFilters);
        setLeads(filteredLeads);
      } else {
        setLeads(leadsData);
      }
    } catch (error) {
      console.error('Error refreshing lead data:', error);
    }
  }, [isFiltered, currentFilters]);

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
          // Refresh data immediately
          refreshData();
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
          // Refresh data immediately
          refreshData();
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
    refreshData();
  };

  const handleAIModalClose = () => {
    setIsAIModalOpen(false);
    // Add a small delay to ensure any background operations complete
    setTimeout(() => {
      refreshData();
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

      <NewLeadModal
        isOpen={isNewLeadModalOpen}
        onClose={handleModalClose}
      />

      <AILeadGenerationModal
        isOpen={isAIModalOpen}
        onClose={handleAIModalClose}
      />

      <EditLeadModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        lead={editingLead}
      />

      <FilterLeadsModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={currentFilters}
      />
    </>
  );
}