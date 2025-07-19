'use client';

import * as React from 'react';
import NewCustomerModal from '@/components/crmComponents/NewCustomerModal';
import { useRouter } from 'next/navigation';

export default function CreateCustomerClientWrapper() {
    const router = useRouter();

    return (
        <NewCustomerModal onSuccess={() => {
            router.refresh()
        }
        }/>
    );
}