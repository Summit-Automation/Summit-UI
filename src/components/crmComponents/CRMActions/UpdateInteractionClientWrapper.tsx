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
        return (<Button variant="ghost" disabled size="sm" className="h-7 w-7 p-0 text-slate-500">
            <Pencil className="w-3.5 h-3.5"/>
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