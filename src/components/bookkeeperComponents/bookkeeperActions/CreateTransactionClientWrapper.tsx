'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NewTransactionModal from '@/components/bookkeeperComponents/NewTransactionModal';
import { getCustomers } from '@/app/lib/services/crmServices/customer/getCustomers';
import { getInteractions } from '@/app/lib/services/crmServices/interaction/getInteractions';
import { Customer } from '@/types/customer';
import { Interaction } from '@/types/interaction';
import { Button } from '@/components/ui/button';

export default function CreateTransactionClientWrapper() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const loadData = useCallback(async () => {
        if (dataLoaded || isLoading) return;
        
        setIsLoading(true);
        try {
            const [custs, ints] = await Promise.all([getCustomers(), getInteractions()]);
            setCustomers(custs);
            setInteractions(ints);
            setDataLoaded(true);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [dataLoaded, isLoading]);

    const handleButtonClick = useCallback(async () => {
        if (!dataLoaded) {
            await loadData();
            // After data loads, automatically open the modal
            setModalOpen(true);
        } else {
            setModalOpen(true);
        }
    }, [dataLoaded, loadData]);

    const triggerButton = (
        <Button 
            variant="outline" 
            onClick={handleButtonClick}
            disabled={isLoading}
            className="w-full sm:w-auto bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700 transition-all duration-200"
        >
            {isLoading ? 'Loading...' : '+ Add Transaction'}
        </Button>
    );

    if (!dataLoaded) {
        return triggerButton;
    }

    return (
        <>
            {triggerButton}
            <NewTransactionModal
                customers={customers}
                interactions={interactions}
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSuccess={() => {
                    setModalOpen(false);
                    router.refresh();
                    window.dispatchEvent(new CustomEvent('recurringPaymentsUpdate'));
                }}
            />
        </>
    );
}