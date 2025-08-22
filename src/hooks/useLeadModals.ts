import { useState, useCallback } from 'react';
import { Lead } from '@/types/leadgen';

interface UseLeadModalsReturn {
  isNewLeadModalOpen: boolean;
  isAIModalOpen: boolean;
  isEmailGenerationModalOpen: boolean;
  isEditModalOpen: boolean;
  isFilterModalOpen: boolean;
  editingLead: Lead | null;
  openNewLeadModal: () => void;
  openAIModal: () => void;
  openEmailGenerationModal: () => void;
  openEditModal: (lead: Lead) => void;
  openFilterModal: () => void;
  closeNewLeadModal: () => void;
  closeAIModal: () => void;
  closeEmailGenerationModal: () => void;
  closeEditModal: () => void;
  closeFilterModal: () => void;
}

export function useLeadModals(): UseLeadModalsReturn {
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isEmailGenerationModalOpen, setIsEmailGenerationModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const openNewLeadModal = useCallback(() => {
    setIsNewLeadModalOpen(true);
  }, []);

  const openAIModal = useCallback(() => {
    setIsAIModalOpen(true);
  }, []);

  const openEmailGenerationModal = useCallback(() => {
    setIsEmailGenerationModalOpen(true);
  }, []);

  const openEditModal = useCallback((lead: Lead) => {
    setEditingLead(lead);
    setIsEditModalOpen(true);
  }, []);

  const openFilterModal = useCallback(() => {
    setIsFilterModalOpen(true);
  }, []);

  const closeNewLeadModal = useCallback(() => {
    setIsNewLeadModalOpen(false);
  }, []);

  const closeAIModal = useCallback(() => {
    setIsAIModalOpen(false);
  }, []);

  const closeEmailGenerationModal = useCallback(() => {
    setIsEmailGenerationModalOpen(false);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingLead(null);
  }, []);

  const closeFilterModal = useCallback(() => {
    setIsFilterModalOpen(false);
  }, []);

  return {
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
  };
}