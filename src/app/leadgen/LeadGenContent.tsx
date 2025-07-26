'use client';

import React from "react";
import LeadSummary from "@/components/leadgenComponents/LeadSummary";
import LeadActions from "@/components/leadgenComponents/LeadActions";
import LeadTable from "@/components/leadgenComponents/LeadTable";
import LeadModals from "@/components/leadgenComponents/LeadModals";
import { useLeadManagement } from "@/hooks/useLeadManagement";
import { useLeadFilters } from "@/hooks/useLeadFilters";
import { useLeadModals } from "@/hooks/useLeadModals";
import { useLeadEventListeners } from "@/hooks/useLeadEventListeners";
import { LeadFilters } from "@/components/leadgenComponents/FilterLeadsModal";

export default function LeadGenContent() {
  const {
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
  } = useLeadManagement();

  const {
    currentFilters,
    applyFilters
  } = useLeadFilters();

  const {
    isNewLeadModalOpen,
    isAIModalOpen,
    isEditModalOpen,
    isFilterModalOpen,
    editingLead,
    openNewLeadModal,
    openAIModal,
    openEditModal,
    openFilterModal,
    closeNewLeadModal,
    closeAIModal,
    closeEditModal,
    closeFilterModal
  } = useLeadModals();

  useLeadEventListeners({ onRefresh: refreshData });

  const handleApplyFilters = async (filters: LeadFilters) => {
    try {
      setIsLoading(true);
      const filteredLeads = await applyFilters(filters, allLeads);
      setLeads(filteredLeads);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    closeNewLeadModal();
    refreshData(true);
  };

  const handleAIModalClose = () => {
    closeAIModal();
    setTimeout(() => {
      refreshData(true);
    }, 500);
  };

  const handleEditModalClose = () => {
    closeEditModal();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <LeadSummary stats={stats} />
      
      <LeadActions
        onNewLead={openNewLeadModal}
        onAIGenerate={openAIModal}
        onRefresh={refreshData}
        onExport={exportLeadsData}
        onFilter={openFilterModal}
      />
      
      <LeadTable
        leads={leads}
        onEdit={openEditModal}
        onDelete={deleteLead}
        onConvertToCustomer={convertToCustomer}
      />

      <LeadModals
        isNewLeadModalOpen={isNewLeadModalOpen}
        isAIModalOpen={isAIModalOpen}
        isEditModalOpen={isEditModalOpen}
        isFilterModalOpen={isFilterModalOpen}
        editingLead={editingLead}
        currentFilters={currentFilters}
        onCloseNewLead={handleModalClose}
        onCloseAI={handleAIModalClose}
        onCloseEdit={handleEditModalClose}
        onCloseFilter={closeFilterModal}
        onApplyFilters={handleApplyFilters}
      />
    </>
  );
}