export const dynamic = 'force-dynamic';

import {getCustomers} from '@/app/lib/services/crmServices/customer/getCustomers';
import {getInteractions} from '@/app/lib/services/crmServices/interaction/getInteractions';
import CRMPageContent from '@/components/crmComponents/CRMPageContent';

export default async function CRMPage() {
    const [customers, interactions] = await Promise.all([getCustomers(), getInteractions()]);

    return (
        <CRMPageContent 
            customers={customers} 
            interactions={interactions}
        />
    );
}