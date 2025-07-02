'use client';

import NewInteractionModal from '@/components/crmComponents/NewInteractionModal';
import {useRouter} from 'next/navigation';
import {Customer} from '@/types/customer';


export default function CreateInteractionClientWrapper({customers}: { customers: Customer[] }) {
    const router = useRouter();

    return (<NewInteractionModal customers={customers}
                                 onSuccess={() => router.refresh()}
    />);
}