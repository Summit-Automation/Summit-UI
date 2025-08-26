export const dynamic = 'force-dynamic';

import { getMileageEntries } from '@/app/lib/services/mileageServices/getMileageEntries';
import { getCustomers } from '@/app/lib/services/crmServices/customer/getCustomers';
import MileagePageContent from '@/components/mileageComponents/MileagePageContent';

export default async function MileagePage() {
    const [mileageEntries, customers] = await Promise.all([
        getMileageEntries(),
        getCustomers()
    ]);

    return (
        <MileagePageContent mileageEntries={mileageEntries} customers={customers} />
    );
}