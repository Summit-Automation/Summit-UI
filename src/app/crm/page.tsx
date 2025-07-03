import {getCustomers} from '@/app/lib/services/crmServices/getCustomers';
import {getInteractions} from '@/app/lib/services/crmServices/getInteractions';
import CRMCustomerView from '@/components/crmComponents/view/CRMCustomerView';
import CRMStatusPie from "@/components/crmComponents/CRMStatusPie";
import CRMSummary from "@/components/crmComponents/CRMSummary";
import CRMActions from "@/components/crmComponents/CRMActions";

export default async function CRMPage() {
    const [customers, interactions] = await Promise.all([getCustomers(), getInteractions(),]);

    return (<div className="p-6 space-y-6">
            {/* Header */}
            <h2 className="text-3xl font-bold mb-4">📇 Customer Relationship Manager</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CRMSummary customers={customers} interactions={interactions}/>
                <CRMStatusPie customers={customers}/>
            </div>

            {/* Actions */}
            <CRMActions customers={customers}/>

            {/* Table or Cards*/}
            <CRMCustomerView customers={customers} interactions={interactions}/>
        </div>);
}
