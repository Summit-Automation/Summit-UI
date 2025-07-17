import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PiggyBank, DollarSign, CreditCard } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { summarizeTransactions } from '@/utils/finance/summarizeTransactions';

const cardStyles = `bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300 backdrop-blur-sm`;
const cardHeaders = `flex items-center justify-between pb-2`;
const cardTitleStyles = `text-sm font-medium text-slate-300`;
const iconStyles = `h-5 w-5 text-icon`;
const iconContainerStyles = `p-2 bg-slate-800/50 rounded-lg`;
const cardContentStyles = `text-3xl font-bold text-white`;

interface MetricCardProps {
    title: string;
    value: number | string;
    Icon: React.ComponentType<{ className?: string }>;
    iconColorClass: string;
}

function MetricCard({ title, value, Icon, iconColorClass }: MetricCardProps) {
    return (
        <Card className={cardStyles}>
            <CardHeader className={cardHeaders}>
                <CardTitle className={cardTitleStyles}>{title}</CardTitle>
                <div className={iconContainerStyles}>
                    <Icon className={iconStyles.replace('text-icon', iconColorClass)} />
                </div>
            </CardHeader>
            <CardContent>
                <div className={cardContentStyles}>{value}</div>
            </CardContent>
        </Card>
    );
}

export default function BookkeeperSummary({ transactions }: { transactions: Transaction[] }) {
    if (!transactions || transactions.length === 0) {
        return <p className="text-gray-500 italic mt-4">No transactions recorded yet.</p>;
    }

    const { totalIncome, totalExpenses, netBalance } = summarizeTransactions(transactions);
    const formattedIncome = `$${totalIncome.toFixed(2)}`;
    const formattedExpenses = `$${totalExpenses.toFixed(2)}`;
    const formattedNet = `$${netBalance.toFixed(2)}`;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard
                title="Net Balance"
                value={formattedNet}
                Icon={PiggyBank}
                iconColorClass={netBalance >= 0 ? 'text-green-400' : 'text-red-400'}
            />
            <MetricCard
                title="Total Income"
                value={formattedIncome}
                Icon={DollarSign}
                iconColorClass="text-green-400"
            />
            <MetricCard
                title="Total Expenses"
                value={formattedExpenses}
                Icon={CreditCard}
                iconColorClass="text-red-400"
            />
        </div>
    );
}
