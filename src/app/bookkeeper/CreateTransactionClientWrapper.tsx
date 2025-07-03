'use client';

import NewTransactionModal from '@/components/bookkeeperComponents/NewTransactionModal';
import {useRouter} from 'next/navigation';
import {Customer} from '@/types/customer';
import {Interaction} from '@/types/interaction';

export default function CreateTransactionClientWrapper({customers, interactions}: {
    customers: Customer[],
    interactions: Interaction[]
}) {

    const router = useRouter();
    return <NewTransactionModal
        customers={customers}
        interactions={interactions}
        onSuccess={() => router.refresh()}
    />;
}
