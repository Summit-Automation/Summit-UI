export const dynamic = 'force-dynamic';

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

    return (
        <div className="p-6 space-y-6">
            {/* Enhanced Header */}
            <div className="data-appear">
                <h2 className="text-3xl font-bold mb-4 text-gradient">Customer Relationship Manager</h2>
                <p className="text-slate-400">Build stronger relationships and track customer interactions</p>
            </div>

            {/* Summary - Full Width */}
            <div className="w-full">
                <CRMSummary customers={customers} interactions={interactions}/>
            </div>

            {/* Chart - Responsive Width */}
            <Card className="chart-container-enhanced card-enhanced w-full md:max-w-2xl md:mx-auto">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-gradient">
                        <div className="p-2 bg-slate-800/50 rounded-lg transition-all duration-300 hover:scale-110">
                            <PieChart className="h-5 w-5 text-blue-400 icon-interactive"/>
                        </div>
                        Customer Status Distribution
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Current status distribution of customers in your pipeline
                    </CardDescription>
                </CardHeader>
                <CardContent className="custom-scrollbar">
                    <CustomerStatusPie customers={customers} size="md"/>
                </CardContent>
            </Card>

            {/* Actions */}
            <CRMActions customers={customers}/>

            {/* Table or Cards*/}
            <Card className="card-enhanced">
                <CardHeader>
                    <CardTitle className="text-gradient">Customer Overview</CardTitle>
                    <CardDescription className="text-slate-400">
                        Manage customers and track interaction history
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CRMCustomerView customers={customers} interactions={interactions}/>
                </CardContent>
            </Card>
        </div>
    );
}