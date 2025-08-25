'use client';

import * as React from 'react';
import {RecurringPayment} from '@/types/recurringPayment';
import {getRecurringPayments} from '@/app/lib/services/bookkeeperServices/getRecurringPaymentsClient';
import RecurringPaymentsTableEnhanced from './RecurringPaymentsTableEnhanced';

export default function RecurringPaymentsClientWrapper({
    initialData
}: {
    initialData: RecurringPayment[];
}) {
    const [recurringPayments, setRecurringPayments] = React.useState<RecurringPayment[]>(initialData);

    // Listen for recurring payments updates
    React.useEffect(() => {
        const handleUpdate = () => {
            handleUpdateData();
        };

        window.addEventListener('recurringPaymentsUpdate', handleUpdate);
        return () => window.removeEventListener('recurringPaymentsUpdate', handleUpdate);
    }, []);

    const handleUpdateData = async () => {
        try {
            const updatedPayments = await getRecurringPayments();
            setRecurringPayments(updatedPayments);
        } catch (error) {
            console.error('Error refreshing recurring payments:', error);
        }
    };

    return (
        <RecurringPaymentsTableEnhanced 
            recurringPayments={recurringPayments} 
            onUpdate={handleUpdateData}
        />
    );
}