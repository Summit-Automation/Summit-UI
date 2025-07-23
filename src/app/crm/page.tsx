export const dynamic = 'force-dynamic';

import {getCustomers} from '@/app/lib/services/crmServices/customer/getCustomers';
import {getInteractions} from '@/app/lib/services/crmServices/interaction/getInteractions';
import CRMCustomerView from '@/components/crmComponents/view/CRMCustomerView';
import CRMSummary from "@/components/crmComponents/CRMSummary";
import CRMActions from "@/components/crmComponents/CRMActions";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {PieChart, BarChart3, Users} from "lucide-react";
import CustomerStatusPie from "@/components/dashboardComponents/CustomerStatusPie";
import FollowUpPie from "@/components/dashboardComponents/FollowUpPie";

export default async function CRMPage() {
    const [customers, interactions] = await Promise.all([getCustomers(), getInteractions(),]);

    return (
        <div className="p-6 space-y-6">
            {/* Enhanced Header */}
            <div className="data-appear">
                <h2 className="text-3xl font-bold mb-4 text-gradient">Customer Relationship Manager</h2>
                <p className="text-slate-400">Build stronger relationships and track customer interactions</p>
            </div>

            {/* Summary - Always Visible */}
            <div className="w-full">
                <CRMSummary customers={customers} interactions={interactions}/>
            </div>

            {/* Desktop: Full Layout | Mobile: Tabbed Layout */}
            <div className="hidden lg:block space-y-6">
                {/* Charts Grid - Desktop Only */}
                <div className="grid grid-cols-2 gap-6">
                    <Card className="chart-container-enhanced card-enhanced">
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

                    <Card className="chart-container-enhanced card-enhanced">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-gradient">
                                <div className="p-2 bg-slate-800/50 rounded-lg transition-all duration-300 hover:scale-110">
                                    <PieChart className="h-5 w-5 text-orange-400 icon-interactive"/>
                                </div>
                                Follow-Up Requirements
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Track interactions that need follow-up attention
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="custom-scrollbar">
                            <FollowUpPie interactions={interactions} size="md"/>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions - Desktop */}
                <CRMActions customers={customers}/>

                {/* Table - Desktop */}
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

            {/* Mobile: Tabbed Layout */}
            <div className="lg:hidden">
                <Tabs defaultValue="customers" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="customers" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline">Data</span>
                        </TabsTrigger>
                        <TabsTrigger value="charts" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Charts</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="customers" className="mt-4 space-y-4">
                        <CRMActions customers={customers}/>
                        
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
                    </TabsContent>

                    <TabsContent value="charts" className="mt-4 space-y-4">
                        <Card className="chart-container-enhanced card-enhanced">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-gradient">
                                    <PieChart className="h-5 w-5 text-blue-400 icon-interactive"/>
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

                        <Card className="chart-container-enhanced card-enhanced">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-gradient">
                                    <PieChart className="h-5 w-5 text-orange-400 icon-interactive"/>
                                    Follow-Up Requirements
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Track interactions that need follow-up attention
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="custom-scrollbar">
                                <FollowUpPie interactions={interactions} size="md"/>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}