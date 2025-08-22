import React, { lazy, Suspense } from 'react';
import { Lead } from '@/types/leadgen';
import { LeadFilters } from '@/components/leadgenComponents/FilterLeadsModal';

const NewLeadModal = lazy(() => import("@/components/leadgenComponents/NewLeadModal"));
const AILeadGenerationModal = lazy(() => import("@/components/leadgenComponents/AILeadGenerationModal"));
const EmailGenerationModal = lazy(() => import("@/components/leadgenComponents/EmailGenerationModal"));
const EditLeadModal = lazy(() => import("@/components/leadgenComponents/EditLeadModal"));
const FilterLeadsModal = lazy(() => import("@/components/leadgenComponents/FilterLeadsModal"));

interface LeadModalsProps {
  isNewLeadModalOpen: boolean;
  isAIModalOpen: boolean;
  isEmailGenerationModalOpen: boolean;
  isEditModalOpen: boolean;
  isFilterModalOpen: boolean;
  editingLead: Lead | null;
  currentFilters: LeadFilters;
  leads: Lead[];
  onCloseNewLead: () => void;
  onCloseAI: () => void;
  onCloseEmailGeneration: () => void;
  onCloseEdit: () => void;
  onCloseFilter: () => void;
  onApplyFilters: (filters: LeadFilters) => Promise<void>;
}

export default function LeadModals({
  isNewLeadModalOpen,
  isAIModalOpen,
  isEmailGenerationModalOpen,
  isEditModalOpen,
  isFilterModalOpen,
  editingLead,
  currentFilters,
  leads,
  onCloseNewLead,
  onCloseAI,
  onCloseEmailGeneration,
  onCloseEdit,
  onCloseFilter,
  onApplyFilters
}: LeadModalsProps) {
  return (
    <>
      {isNewLeadModalOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <NewLeadModal
            isOpen={isNewLeadModalOpen}
            onClose={onCloseNewLead}
          />
        </Suspense>
      )}

      {isAIModalOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <AILeadGenerationModal
            isOpen={isAIModalOpen}
            onClose={onCloseAI}
          />
        </Suspense>
      )}

      {isEmailGenerationModalOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <EmailGenerationModal
            isOpen={isEmailGenerationModalOpen}
            onClose={onCloseEmailGeneration}
            leads={leads}
          />
        </Suspense>
      )}

      {isEditModalOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <EditLeadModal
            isOpen={isEditModalOpen}
            onClose={onCloseEdit}
            lead={editingLead}
          />
        </Suspense>
      )}

      {isFilterModalOpen && (
        <Suspense fallback={<div>Loading...</div>}>
          <FilterLeadsModal
            isOpen={isFilterModalOpen}
            onClose={onCloseFilter}
            onApplyFilters={onApplyFilters}
            currentFilters={currentFilters}
          />
        </Suspense>
      )}
    </>
  );
}