'use client';

import React from "react";
import LeadSummary from "@/components/leadgenComponents/LeadSummary";
import LeadActions from "@/components/leadgenComponents/LeadActions";
import LeadTableEnhanced from "@/components/leadgenComponents/LeadTableEnhanced";
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
    isEmailGenerationModalOpen,
    isEditModalOpen,
    isFilterModalOpen,
    editingLead,
    openNewLeadModal,
    openAIModal,
    openEmailGenerationModal,
    openEditModal,
    openFilterModal,
    closeNewLeadModal,
    closeAIModal,
    closeEmailGenerationModal,
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

  const handleEmailGenerationModalClose = () => {
    closeEmailGenerationModal();
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
        onEmailGenerate={openEmailGenerationModal}
        onRefresh={refreshData}
        onExport={exportLeadsData}
        onFilter={openFilterModal}
      />
      
      <LeadTableEnhanced
        leads={leads}
        onEdit={openEditModal}
        onDelete={deleteLead}
        onConvertToCustomer={convertToCustomer}
      />

      <LeadModals
        isNewLeadModalOpen={isNewLeadModalOpen}
        isAIModalOpen={isAIModalOpen}
        isEmailGenerationModalOpen={isEmailGenerationModalOpen}
        isEditModalOpen={isEditModalOpen}
        isFilterModalOpen={isFilterModalOpen}
        editingLead={editingLead}
        currentFilters={currentFilters}
        leads={leads}
        onCloseNewLead={handleModalClose}
        onCloseAI={handleAIModalClose}
        onCloseEmailGeneration={handleEmailGenerationModalClose}
        onCloseEdit={handleEditModalClose}
        onCloseFilter={closeFilterModal}
        onApplyFilters={handleApplyFilters}
      />
    </>
  );
}