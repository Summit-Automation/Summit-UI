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

    const triggerButton = (
        <Button 
            variant="outline" 
            onClick={loadData}
            disabled={isLoading}
            className="w-full sm:w-auto"
        >
            {isLoading ? 'Loading...' : 'Add Transaction'}
        </Button>
    );

    if (!dataLoaded) {
        return triggerButton;
    }

    return (
        <NewTransactionModal
            customers={customers}
            interactions={interactions}
            triggerContent={triggerButton}
            onSuccess={() => {
                router.refresh();
                window.dispatchEvent(new CustomEvent('recurringPaymentsUpdate'));
            }}
        />
    );
}