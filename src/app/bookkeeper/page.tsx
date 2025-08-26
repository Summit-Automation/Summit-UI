export const dynamic = 'force-dynamic';

import {getTransactions} from '@/app/lib/services/bookkeeperServices/getTransactions';
import {getRecurringPayments} from '@/app/lib/services/bookkeeperServices/getRecurringPayments';
import {getCustomers} from '@/app/lib/services/crmServices/customer/getCustomers';
import {getInteractions} from '@/app/lib/services/crmServices/interaction/getInteractions';
import BookkeeperPageContent from '@/components/bookkeeperComponents/BookkeeperPageContent';

export default async function BookkeeperPage() {
    const [transactions, recurringPayments, customers, interactions] = await Promise.all([
        getTransactions(),
        getRecurringPayments(),
        getCustomers(),
        getInteractions()
    ]);

    return (
        <BookkeeperPageContent 
            transactions={transactions}
            recurringPayments={recurringPayments}
            customers={customers}
            interactions={interactions}
        />
    );
}