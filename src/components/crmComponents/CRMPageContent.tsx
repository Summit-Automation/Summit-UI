'use client';

import { useRouter } from 'next/navigation';
import {Header} from '@/components/globalComponents/Header';
import CRMCustomerView from '@/components/crmComponents/view/CRMCustomerView';
import CRMSummary from "@/components/crmComponents/CRMSummary";
import CRMActions from "@/components/crmComponents/CRMActions";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {PieChart, BarChart3, Users} from "lucide-react";
import CustomerStatusPie from "@/components/dashboardComponents/CustomerStatusPie";
import FollowUpPie from "@/components/dashboardComponents/FollowUpPie";

import type { Customer } from '@/types/customer';
import type { Interaction } from '@/types/interaction';

interface CRMPageContentProps {
    customers: Customer[];
    interactions: Interaction[];
}

export default function CRMPageContent({ customers, interactions }: CRMPageContentProps) {
    const router = useRouter();

    const handleNotifications = () => {
        // Navigate to dashboard notifications
        router.push('/?tab=notifications');
    };

    const handleSettings = () => router.push('/settings');
    const handleHelp = () => {
        // Navigate to dashboard help
        router.push('/?tab=help');
    };

    return (
        <div className="space-y-6">
            {/* Modern Mercury-style Header */}
            <Header 
                title="Customer Relationship Manager"
                subtitle="Build stronger relationships and track customer interactions"
                onNotifications={handleNotifications}
                onSettings={handleSettings}
                onHelp={handleHelp}
            />

            <div className="px-4 lg:px-6 space-y-6">

            {/* Summary - Always Visible */}
            <div className="w-full">
                <CRMSummary customers={customers} interactions={interactions}/>
            </div>

            {/* Desktop: Full Layout | Mobile: Tabbed Layout */}
            <div className="hidden lg:block space-y-6">
                {/* Charts Grid - Desktop Only */}
                <div className="grid grid-cols-2 gap-6">
                    <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm p-6">
                        <CardHeader className="pb-6">
                            <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                                <div className="p-2.5 bg-blue-500/20 rounded-xl">
                                    <PieChart className="h-5 w-5 text-blue-400"/>
                                </div>
                                Customer Status Distribution
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-sm mt-2">
                                Current status distribution of customers in your pipeline
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="h-64 lg:h-80 rounded-xl overflow-hidden">
                                <CustomerStatusPie customers={customers} size="md"/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 backdrop-blur-sm p-6">
                        <CardHeader className="pb-6">
                            <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                                <div className="p-2.5 bg-amber-500/20 rounded-xl">
                                    <PieChart className="h-5 w-5 text-amber-400"/>
                                </div>
                                Follow-Up Requirements
                            </CardTitle>
                            <CardDescription className="text-slate-400 text-sm mt-2">
                                Track interactions that need follow-up attention
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="h-64 lg:h-80 rounded-xl overflow-hidden">
                                <FollowUpPie interactions={interactions}/>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions - Desktop */}
                <CRMActions customers={customers}/>

                {/* Table - Desktop */}
                <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6">
                    <CardHeader className="pb-6">
                        <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                            <div className="p-2.5 bg-purple-500/20 rounded-xl">
                                <Users className="h-5 w-5 text-purple-400"/>
                            </div>
                            Customer Overview
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-sm mt-2">
                            Manage customers and track interaction history
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <CRMCustomerView customers={customers} interactions={interactions}/>
                    </CardContent>
                </Card>
            </div>

            {/* Mobile: Tabbed Layout */}
            <div className="lg:hidden">
                <Tabs defaultValue="customers" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-11 bg-slate-900/60 rounded-2xl border border-slate-800/40 p-1">
                        <TabsTrigger 
                            value="customers" 
                            className="flex items-center gap-2 text-sm px-4 lg:px-6 rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 hover:text-slate-300 transition-all duration-200 font-medium"
                        >
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline">Data</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="charts" 
                            className="flex items-center gap-2 text-sm px-4 lg:px-6 rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 hover:text-slate-300 transition-all duration-200 font-medium"
                        >
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Charts</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="customers" className="mt-4 space-y-4">
                        <CRMActions customers={customers}/>
                        
                        <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                                    <div className="p-2.5 bg-purple-500/20 rounded-xl">
                                        <Users className="h-5 w-5 text-purple-400"/>
                                    </div>
                                    Customer Overview
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-sm mt-2">
                                    Manage customers and track interaction history
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <CRMCustomerView customers={customers} interactions={interactions}/>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="charts" className="mt-4 space-y-4">
                        <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                                    <div className="p-2.5 bg-blue-500/20 rounded-xl">
                                        <PieChart className="h-5 w-5 text-blue-400"/>
                                    </div>
                                    Customer Status Distribution
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-sm mt-2">
                                    Current status distribution of customers in your pipeline
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-64 rounded-xl overflow-hidden">
                                    <CustomerStatusPie customers={customers} size="md"/>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-all duration-300 backdrop-blur-sm p-6">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                                    <div className="p-2.5 bg-amber-500/20 rounded-xl">
                                        <PieChart className="h-5 w-5 text-amber-400"/>
                                    </div>
                                    Follow-Up Requirements
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-sm mt-2">
                                    Track interactions that need follow-up attention
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-64 rounded-xl overflow-hidden">
                                    <FollowUpPie interactions={interactions}/>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            </div>
        </div>
    );
}