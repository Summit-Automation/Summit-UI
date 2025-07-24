'use client';

import {useEffect, useState} from 'react';
import EditRecurringPaymentModal from './EditRecurringPaymentModal';
import {getCustomers} from '@/app/lib/services/crmServices/customer/getCustomers';
import {getInteractions} from '@/app/lib/services/crmServices/interaction/getInteractions';
import {Customer} from '@/types/customer';
import {Interaction} from '@/types/interaction';
import {RecurringPayment} from '@/types/recurringPayment';
import {Button} from '@/components/ui/button';
import {Edit} from 'lucide-react';

export default function EditRecurringPaymentClientWrapper({
    payment,
    onSuccess,
}: {
    payment: RecurringPayment;
    onSuccess?: () => void;
}) {
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
        return (
            <Button 
                variant="ghost" 
                size="sm" 
                disabled
                className="text-slate-400 px-3 py-1"
            >
                <Edit className="h-4 w-4" />
            </Button>
        );
    }

    return (
        <EditRecurringPaymentModal
            payment={payment}
            customers={customers}
            interactions={interactions}
            onSuccess={onSuccess}
        >
            <Button 
                variant="ghost" 
                size="sm"
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 px-3 py-1"
            >
                <Edit className="h-4 w-4 mr-1" />
                Edit
            </Button>
        </EditRecurringPaymentModal>
    );
}