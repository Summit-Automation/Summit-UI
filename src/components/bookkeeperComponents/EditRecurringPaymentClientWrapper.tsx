'use client';

import { useState, useCallback } from 'react';
import EditRecurringPaymentModal from './EditRecurringPaymentModal';
import { getCustomers } from '@/app/lib/services/crmServices/customer/getCustomers';
import { getInteractions } from '@/app/lib/services/crmServices/interaction/getInteractions';
import { Customer } from '@/types/customer';
import { Interaction } from '@/types/interaction';
import { RecurringPayment } from '@/types/recurringPayment';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

export default function EditRecurringPaymentClientWrapper({
    payment,
    onSuccess,
}: {
    payment: RecurringPayment;
    onSuccess?: () => void;
}) {
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
            variant="ghost" 
            size="sm"
            onClick={handleButtonClick}
            disabled={isLoading}
            className={isLoading ? "text-slate-400 px-3 py-1" : "text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 px-3 py-1"}
        >
            <Edit className="h-4 w-4 mr-1" />
            {isLoading ? '' : 'Edit'}
        </Button>
    );

    if (!dataLoaded) {
        return triggerButton;
    }

    return (
        <EditRecurringPaymentModal
            payment={payment}
            customers={customers}
            interactions={interactions}
            open={modalOpen}
            onOpenChange={setModalOpen}
            onSuccess={() => {
                setModalOpen(false);
                onSuccess?.();
            }}
        >
            {triggerButton}
        </EditRecurringPaymentModal>
    );
}