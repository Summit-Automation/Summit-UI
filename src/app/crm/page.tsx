import {getCustomers} from '@/app/lib/services/crmServices/customer/getCustomers';
import {getInteractions} from '@/app/lib/services/crmServices/interaction/getInteractions';
import CRMCustomerView from '@/components/crmComponents/view/CRMCustomerView';
import CRMSummary from "@/components/crmComponents/CRMSummary";
import CRMActions from "@/components/crmComponents/CRMActions";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {PieChart} from "lucide-react";
import CustomerStatusPie from "@/components/dashboardComponents/CustomerStatusPie";

export default async function CRMPage() {
    const [customers, interactions] = await Promise.all([getCustomers(), getInteractions(),]);

    return (<div className="p-6 space-y-6">
            {/* Header */}
            <h2 className="text-3xl font-bold mb-4">📇 Customer Relationship Manager</h2>

            {/* Summary - Full Width */}
            <div className="w-full">
                <CRMSummary customers={customers} interactions={interactions}/>
            </div>

            {/* Chart - Full Width */}
            <Card
                className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-white">
                        <div className="p-2 bg-slate-800/50 rounded-lg">
                            <PieChart className="h-5 w-5 text-icon"/>
                        </div>
                        Customer Status
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Current status distribution of customers
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CustomerStatusPie customers={customers} size="md"/>
                </CardContent>
            </Card>

            {/* Actions */}
            <CRMActions customers={customers}/>

            {/* Table or Cards*/}
            <CRMCustomerView customers={customers} interactions={interactions}/>
        </div>);
}