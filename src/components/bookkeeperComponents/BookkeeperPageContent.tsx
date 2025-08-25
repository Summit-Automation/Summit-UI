'use client';

import { useRouter } from 'next/navigation';
import {Header} from '@/components/globalComponents/Header';
import BookkeeperSummary from '@/components/bookkeeperComponents/BookkeeperSummary';
import BookkeeperActions from '@/components/bookkeeperComponents/BookkeeperActions';
import TransactionTableEnhanced from '@/components/bookkeeperComponents/TransactionTableEnhanced';
import RecurringPaymentsClientWrapper from '@/components/bookkeeperComponents/RecurringPaymentsClientWrapper';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Activity, BarChart3, DollarSign, RefreshCw} from 'lucide-react';
import CashFlowArea from "@/components/dashboardComponents/CashFlowArea";

import type { Transaction } from '@/types/transaction';
import type { RecurringPayment } from '@/types/recurringPayment';

interface BookkeeperPageContentProps {
    transactions: Transaction[];
    recurringPayments: RecurringPayment[];
}

export default function BookkeeperPageContent({ transactions, recurringPayments }: BookkeeperPageContentProps) {
    const router = useRouter();

    const handleSettings = () => router.push('/settings');
    const handleHelp = () => router.push('/?tab=help');

    return (
        <div className="space-y-8">
            {/* Enhanced Header */}
            <Header 
                title="Accounting Dashboard"
                subtitle="Manage your business finances with precision and insight"
                onSettings={handleSettings}
                onHelp={handleHelp}
            />

            <div className="px-4 lg:px-6 space-y-6">

            {/* Summary - Always Visible */}
            <div className="w-full">
                <BookkeeperSummary transactions={transactions}/>
            </div>

            {/* Desktop: Full Layout | Mobile: Tabbed Layout */}
            <div className="hidden lg:block space-y-6">
                {/* Chart - Desktop Only */}
                <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-colors duration-200 p-6">
                    <CardHeader className="pb-6">
                        <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                            <div className="p-2.5 bg-emerald-500/20 rounded-xl">
                                <Activity className="h-5 w-5 text-emerald-400"/>
                            </div>
                            Cash Flow Analysis
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-sm mt-2">
                            Detailed income vs expenses analysis with trend indicators
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="rounded-xl">
                            <CashFlowArea transactions={transactions}/>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions - Desktop */}
                <BookkeeperActions/>

                {/* Recurring Payments - Desktop */}
                <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-colors duration-200 p-6">
                    <CardHeader className="pb-6">
                        <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                            <div className="p-2.5 bg-blue-500/20 rounded-xl">
                                <RefreshCw className="h-5 w-5 text-blue-400"/>
                            </div>
                            Recurring Payments
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-sm mt-2">
                            Manage your scheduled recurring income and expenses
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <RecurringPaymentsClientWrapper initialData={recurringPayments}/>
                    </CardContent>
                </Card>

                {/* Table - Desktop */}
                <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-colors duration-200 p-6">
                    <CardHeader className="pb-6">
                        <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                            <div className="p-2.5 bg-purple-500/20 rounded-xl">
                                <DollarSign className="h-5 w-5 text-purple-400"/>
                            </div>
                            All Transactions
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-sm mt-2">
                            Complete record of all financial transactions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <TransactionTableEnhanced transactions={transactions}/>
                    </CardContent>
                </Card>
            </div>

            {/* Mobile: Tabbed Layout */}
            <div className="lg:hidden">
                <Tabs defaultValue="transactions" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-11 bg-slate-900/60 rounded-2xl border border-slate-800/40 p-1">
                        <TabsTrigger 
                            value="transactions" 
                            className="flex items-center gap-2 text-sm px-2 lg:px-4 rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 hover:text-slate-300 transition-colors duration-200 font-medium"
                        >
                            <DollarSign className="h-4 w-4" />
                            <span className="hidden sm:inline">Transactions</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="recurring" 
                            className="flex items-center gap-2 text-sm px-2 lg:px-4 rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 hover:text-slate-300 transition-colors duration-200 font-medium"
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span className="hidden sm:inline">Recurring</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="analytics" 
                            className="flex items-center gap-2 text-sm px-2 lg:px-4 rounded-xl data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-400 hover:text-slate-300 transition-colors duration-200 font-medium"
                        >
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Charts</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="transactions" className="mt-4 space-y-4">
                        <BookkeeperActions/>
                        
                        <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-colors duration-200 p-6">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                                    <div className="p-2.5 bg-purple-500/20 rounded-xl">
                                        <DollarSign className="h-5 w-5 text-purple-400"/>
                                    </div>
                                    All Transactions
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-sm mt-2">
                                    Complete record of all financial transactions
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <TransactionTableEnhanced transactions={transactions}/>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="recurring" className="mt-4 space-y-4">
                        <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-colors duration-200 p-6">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                                    <div className="p-2.5 bg-blue-500/20 rounded-xl">
                                        <RefreshCw className="h-5 w-5 text-blue-400"/>
                                    </div>
                                    Recurring Payments
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-sm mt-2">
                                    Manage your scheduled recurring income and expenses
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <RecurringPaymentsClientWrapper initialData={recurringPayments}/>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-4">
                        <Card className="bg-slate-900/90 border border-slate-800/50 rounded-2xl shadow-sm hover:border-slate-700/60 hover:shadow-xl transition-colors duration-200 p-6">
                            <CardHeader className="pb-6">
                                <CardTitle className="flex items-center gap-3 text-slate-50 font-semibold text-lg">
                                    <div className="p-2.5 bg-emerald-500/20 rounded-xl">
                                        <Activity className="h-5 w-5 text-emerald-400"/>
                                    </div>
                                    Cash Flow Analysis
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-sm mt-2">
                                    Detailed income vs expenses analysis with trend indicators
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="rounded-xl">
                                    <CashFlowArea transactions={transactions}/>
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