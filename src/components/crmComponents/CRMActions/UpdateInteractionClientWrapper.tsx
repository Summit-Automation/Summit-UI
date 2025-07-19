'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import UpdateInteractionModal from '@/components/crmComponents/UpdateInteractionModal';
import {getCustomers} from '@/app/lib/services/crmServices/customer/getCustomers';
import type {Customer} from '@/types/customer';
import type {Interaction} from '@/types/interaction';
import {Button} from '@/components/ui/button';
import {Pencil} from 'lucide-react';

export default function UpdateInteractionClientWrapper({
                                                           interaction, onSuccess,
                                                       }: {
    interaction: Interaction; onSuccess?: () => void;
}) {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    // fetch customers once, when mounted
    useEffect(() => {
        getCustomers()
            .then((custs) => {
                setCustomers(custs);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (<Button variant="outline" disabled size="sm">
            <Pencil className="w-4 h-4"/> Loading…
        </Button>);
    }

    return (<>
        <UpdateInteractionModal
            interaction={interaction}
            customers={customers}
            onSuccess={() => {
                router.refresh();
                onSuccess?.();
            }}
        />
    </>);
}