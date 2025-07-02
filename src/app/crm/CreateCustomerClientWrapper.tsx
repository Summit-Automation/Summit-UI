'use client';

import NewCustomerModal from './NewCustomerModal';
import { useRouter } from 'next/navigation';

export default function CreateCustomerClientWrapper() {
    const router = useRouter();

    return (
        <NewCustomerModal onSuccess={() => router.refresh()} />
    );
}

