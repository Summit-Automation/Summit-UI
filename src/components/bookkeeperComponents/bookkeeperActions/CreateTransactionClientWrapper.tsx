'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import NewTransactionModal from '@/components/bookkeeperComponents/NewTransactionModal';
import {getCustomers} from '@/app/lib/services/crmServices/customer/getCustomers';
import {getInteractions} from '@/app/lib/services/crmServices/interaction/getInteractions';
import {Customer} from '@/types/customer';
import {Interaction} from '@/types/interaction';
import {Button} from '@/components/ui/button';

export default function CreateTransactionClientWrapper() {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // fetch customers + interactions once on mount
        Promise.all([getCustomers(), getInteractions()])
            .then(([custs, ints]) => {
                setCustomers(custs);
                setInteractions(ints);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (<Button variant="outline" disabled>
            Loading…
        </Button>);
    }

    return (<NewTransactionModal
        customers={customers}
        interactions={interactions}
        onSuccess={() => {
            router.refresh();
            setOpen(false);
        }}
    />);
}
