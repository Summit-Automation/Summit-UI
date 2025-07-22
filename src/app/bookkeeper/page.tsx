export const dynamic = 'force-dynamic';

import {getTransactions} from '@/app/lib/services/bookkeeperServices/getTransactions';
import BookkeeperSummary from '@/components/bookkeeperComponents/BookkeeperSummary';
import BookkeeperActions from '@/components/bookkeeperComponents/BookkeeperActions';
import TransactionTable from '@/components/bookkeeperComponents/TransactionTable';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Activity} from 'lucide-react';
import CashFlowArea from "@/components/dashboardComponents/CashFlowArea";

export default async function BookkeeperPage() {
    const transactions = await getTransactions();

    return (
        <div className="p-6 space-y-6">
            {/* Enhanced Header */}
            <div className="data-appear">
                <h2 className="text-3xl font-bold text-gradient">Accounting Dashboard</h2>
                <p className="text-slate-400 mt-2">Manage your business finances with precision and insight</p>
            </div>

            {/* Summary - Full Width */}
            <div className="w-full">
                <BookkeeperSummary transactions={transactions}/>
            </div>

            {/* Chart - Full Width */}
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

            {/* Actions */}
            <BookkeeperActions/>

            {/* Transactions Table */}
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
    );
}