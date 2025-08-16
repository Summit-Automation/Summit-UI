export const dynamic = 'force-dynamic';

import {getTransactions} from '@/app/lib/services/bookkeeperServices/getTransactions';
import {getRecurringPayments} from '@/app/lib/services/bookkeeperServices/getRecurringPayments';
import BookkeeperPageContent from '@/components/bookkeeperComponents/BookkeeperPageContent';

export default async function BookkeeperPage() {
    const transactions = await getTransactions();
    const recurringPayments = await getRecurringPayments();

    return (
        <BookkeeperPageContent 
            transactions={transactions}
            recurringPayments={recurringPayments}
        />
    );
}