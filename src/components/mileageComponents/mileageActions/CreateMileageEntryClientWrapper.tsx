'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NewMileageEntryModal from '@/components/mileageComponents/NewMileageEntryModal';
import { getCustomers } from '@/app/lib/services/crmServices/customer/getCustomers';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/button';

export default function CreateMileageEntryClientWrapper() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCustomers()
            .then(setCustomers)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Button variant="outline" disabled>
                Loading…
            </Button>
        );
    }

    return (
        <NewMileageEntryModal
            customers={customers}
            onSuccess={() => router.refresh()}
        />
    );
}