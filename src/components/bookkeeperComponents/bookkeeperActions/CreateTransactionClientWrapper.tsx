'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NewTransactionModal from '@/components/bookkeeperComponents/NewTransactionModal';
import { Customer } from '@/types/customer';
import { Interaction } from '@/types/interaction';
import { Button } from '@/components/ui/button';

export default function CreateTransactionClientWrapper({ customers, interactions }: { customers: Customer[], interactions: Interaction[] }) {
    const router = useRouter();
    const [modalOpen, setModalOpen] = useState(false);

    const handleButtonClick = useCallback(() => {
        setModalOpen(true);
    }, []);

    return (
        <>
            <Button 
                variant="outline" 
                onClick={handleButtonClick}
                className="w-full sm:w-auto bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700 transition-all duration-200"
            >
                + Add Transaction
            </Button>
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