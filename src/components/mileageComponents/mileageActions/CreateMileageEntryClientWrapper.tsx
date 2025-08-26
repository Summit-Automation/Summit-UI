'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NewMileageEntryModal from '@/components/mileageComponents/NewMileageEntryModal';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/button';

export default function CreateMileageEntryClientWrapper({ customers }: { customers: Customer[] }) {
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
                className="w-full sm:w-auto"
            >
                Add Mileage
            </Button>
            <NewMileageEntryModal
                customers={customers}
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSuccess={() => {
                    setModalOpen(false);
                    router.refresh();
                }}
            />
        </>
    );
}