export const dynamic = 'force-dynamic';

import {getTransactions} from '@/app/lib/services/bookkeeperServices/getTransactions';
import {getRecurringPayments} from '@/app/lib/services/bookkeeperServices/getRecurringPayments';
import BookkeeperSummary from '@/components/bookkeeperComponents/BookkeeperSummary';
import BookkeeperActions from '@/components/bookkeeperComponents/BookkeeperActions';
import TransactionTable from '@/components/bookkeeperComponents/TransactionTable';
import RecurringPaymentsClientWrapper from '@/components/bookkeeperComponents/RecurringPaymentsClientWrapper';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Activity, BarChart3, DollarSign, RefreshCw} from 'lucide-react';
import CashFlowArea from "@/components/dashboardComponents/CashFlowArea";

export default async function BookkeeperPage() {
    const transactions = await getTransactions();
    const recurringPayments = await getRecurringPayments();

    return (
        <div className="p-6 space-y-6">
            {/* Enhanced Header */}
            <div className="data-appear">
                <h2 className="text-3xl font-bold text-gradient">Accounting Dashboard</h2>
                <p className="text-slate-400 mt-2">Manage your business finances with precision and insight</p>
            </div>

            {/* Summary - Always Visible */}
            <div className="w-full">
                <BookkeeperSummary transactions={transactions}/>
            </div>

            {/* Desktop: Full Layout | Mobile: Tabbed Layout */}
            <div className="hidden lg:block space-y-6">
                {/* Chart - Desktop Only */}
                <Card className="chart-container-enhanced card-enhanced">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-gradient">
                            <div className="p-2 bg-slate-800/50 rounded-lg transition-all duration-300 hover:scale-110">
                                <Activity className="h-5 w-5 text-green-400 icon-interactive"/>
                            </div>
                            Cash Flow Analysis
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Detailed income vs expenses analysis with trend indicators
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="custom-scrollbar">
                        <CashFlowArea transactions={transactions}/>
                    </CardContent>
                </Card>

                {/* Actions - Desktop */}
                <BookkeeperActions/>

                {/* Recurring Payments - Desktop */}
                <Card className="card-enhanced">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gradient">
                            <div className="p-2 bg-slate-800/50 rounded-lg transition-all duration-300 hover:scale-110">
                                <RefreshCw className="h-5 w-5 text-blue-400 icon-interactive"/>
                            </div>
                            Recurring Payments
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Manage your scheduled recurring income and expenses
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RecurringPaymentsClientWrapper initialData={recurringPayments}/>
                    </CardContent>
                </Card>

                {/* Table - Desktop */}
                <Card className="card-enhanced">
                    <CardHeader>
                        <CardTitle className="text-gradient">All Transactions</CardTitle>
                        <CardDescription className="text-slate-400">
                            Complete record of all financial transactions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TransactionTable transactions={transactions}/>
                    </CardContent>
                </Card>
            </div>

            {/* Mobile: Tabbed Layout */}
            <div className="lg:hidden">
                <Tabs defaultValue="transactions" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="transactions" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span className="hidden sm:inline">Transactions</span>
                        </TabsTrigger>
                        <TabsTrigger value="recurring" className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            <span className="hidden sm:inline">Recurring</span>
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Charts</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="transactions" className="mt-4 space-y-4">
                        <BookkeeperActions/>
                        
                        <Card className="card-enhanced">
                            <CardHeader>
                                <CardTitle className="text-gradient">All Transactions</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Complete record of all financial transactions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TransactionTable transactions={transactions}/>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="recurring" className="mt-4 space-y-4">
                        <Card className="card-enhanced">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-gradient">
                                    <RefreshCw className="h-5 w-5 text-blue-400 icon-interactive"/>
                                    Recurring Payments
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Manage your scheduled recurring income and expenses
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RecurringPaymentsClientWrapper initialData={recurringPayments}/>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-4">
                        <Card className="chart-container-enhanced card-enhanced">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-gradient">
                                    <Activity className="h-5 w-5 text-green-400 icon-interactive"/>
                                    Cash Flow Analysis
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Detailed income vs expenses analysis with trend indicators
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="custom-scrollbar">
                                <CashFlowArea transactions={transactions}/>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}