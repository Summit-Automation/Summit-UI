'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NewMileageEntryModal from '@/components/mileageComponents/NewMileageEntryModal';
import { getCustomers } from '@/app/lib/services/crmServices/customer/getCustomers';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/button';

export default function CreateMileageEntryClientWrapper() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const loadData = useCallback(async () => {
        if (dataLoaded || isLoading) return;
        
        setIsLoading(true);
        try {
            const custs = await getCustomers();
            setCustomers(custs);
            setDataLoaded(true);
        } catch (error) {
            console.error('Failed to load customers:', error);
        } finally {
            setIsLoading(false);
        }
    }, [dataLoaded, isLoading]);

    const triggerButton = (
        <Button 
            variant="outline" 
            onClick={loadData}
            disabled={isLoading}
            className="w-full sm:w-auto bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-all duration-200"
        >
            {isLoading ? 'Loading...' : 'Add Mileage'}
        </Button>
    );

    if (!dataLoaded) {
        return triggerButton;
    }

    return (
        <NewMileageEntryModal
            customers={customers}
            triggerContent={triggerButton}
            onSuccess={() => router.refresh()}
        />
    );
}