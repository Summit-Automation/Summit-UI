import {getTransactions} from '@/app/lib/services/bookkeeperServices/getTransactions';
import BookkeeperSummary from '@/components/bookkeeperComponents/BookkeeperSummary';
import BookkeeperActions from '@/components/bookkeeperComponents/BookkeeperActions';
import TransactionTable from '@/components/bookkeeperComponents/TransactionTable';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Activity} from 'lucide-react';
import CashFlowArea from "@/components/dashboardComponents/CashFlowArea";

export default async function BookkeeperPage() {
    const transactions = await getTransactions();

    return (<div className="p-6 space-y-6">
        <h2 className="text-3xl font-bold">📒 Bookkeeper Dashboard</h2>

        {/* Summary - Full Width */}
        <div className="w-full">
            <BookkeeperSummary transactions={transactions}/>
        </div>

        {/* Chart - Full Width */}
        <Card
            className="bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300 backdrop-blur-sm">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                    <div className="p-2 bg-slate-800/50 rounded-lg">
                        <Activity className="h-5 w-5 text-icon"/>
                    </div>
                    Cash Flow Analysis
                </CardTitle>
                <CardDescription className="text-slate-400">
                    Detailed income vs expenses analysis
                </CardDescription>
            </CardHeader>
            <CardContent>
                <CashFlowArea transactions={transactions}/>
            </CardContent>
        </Card>

        {/* Actions */}
        <BookkeeperActions/>

        {/* Transactions Table */}
        <Card className="overflow-x-auto bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <TransactionTable transactions={transactions}/>
            </CardContent>
        </Card>
    </div>);
}