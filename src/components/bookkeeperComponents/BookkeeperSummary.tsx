import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PiggyBank, DollarSign, CreditCard } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { summarizeTransactions } from '@/utils/finance/summarizeTransactions';
import { cn } from '@/lib/utils';
import { GrowthIndicator } from '@/components/ui/growth-indicator';
import { useCurrency } from '@/contexts/CurrencyContext';

const cardStyles = `metric-enhanced card-enhanced data-appear`;
const cardHeaders = `flex items-center justify-between pb-2`;
const cardTitleStyles = `text-sm font-medium text-slate-300 uppercase tracking-wide`;
const iconStyles = `h-4 w-4`;
const iconContainerStyles = `p-2.5 rounded-xl transition-transform duration-200 ease-out group-hover:scale-110`;
const cardContentStyles = `pt-0`;

interface MetricCardProps {
    title: string;
    value: number | string;
    Icon: React.ComponentType<{ className?: string }>;
    iconColorClass: string;
    trend?: number;
    subtitle?: string;
}

function MetricCard({ title, value, Icon, iconColorClass, trend, subtitle }: MetricCardProps) {
    
    // Determine background color based on icon color
    const bgColorClass = iconColorClass.includes('green') ? 'bg-emerald-500/20 group-hover:bg-emerald-500/30' :
                        iconColorClass.includes('red') ? 'bg-red-500/20 group-hover:bg-red-500/30' :
                        'bg-blue-500/20 group-hover:bg-blue-500/30';
    
    return (
        <Card className={`${cardStyles} group`}>
            <CardHeader className={cardHeaders}>
                <CardTitle className={cardTitleStyles}>{title}</CardTitle>
                <div className={`${iconContainerStyles} ${bgColorClass}`}>
                    <Icon className={cn(iconStyles, iconColorClass, "icon-interactive")} />
                </div>
            </CardHeader>
            <CardContent className={cardContentStyles}>
                <div className="flex items-end gap-2">
                    <div className="text-xl font-bold text-gradient truncate" title={value.toString()}>
                        {value}
                    </div>
                    {trend !== undefined && (
                        <GrowthIndicator value={trend} className="mb-0.5" />
                    )}
                </div>
                {subtitle && (
                    <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
                )}
            </CardContent>
        </Card>
    );
}

const BookkeeperSummary = React.memo(function BookkeeperSummary({ transactions }: { transactions: Transaction[] }) {
    const { formatAmount } = useCurrency();
    
    // Calculate metrics with proper fallbacks for empty data and memoize
    const { totalIncome, totalExpenses, netBalance } = useMemo(() => 
        !transactions || transactions.length === 0 
            ? { totalIncome: 0, totalExpenses: 0, netBalance: 0 }
            : summarizeTransactions(transactions),
        [transactions]
    );

    const formattedIncome = formatAmount(totalIncome);
    const formattedExpenses = formatAmount(totalExpenses);
    const formattedNet = formatAmount(netBalance);

    // Calculate trend (placeholder - you could add actual trend calculation)
    const profitMargin = totalIncome > 0 ? ((netBalance / totalIncome) * 100) : 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard
                title="Net Balance"
                value={formattedNet}
                Icon={PiggyBank}
                iconColorClass={netBalance >= 0 ? 'text-green-400' : 'text-red-400'}
                subtitle={`${profitMargin.toFixed(1)}% profit margin`}
            />
            <MetricCard
                title="Total Income"
                value={formattedIncome}
                Icon={DollarSign}
                iconColorClass="text-green-400"
                subtitle="Revenue generated"
            />
            <MetricCard
                title="Total Expenses"
                value={formattedExpenses}
                Icon={CreditCard}
                iconColorClass="text-red-400"
                subtitle="Operating costs"
            />
        </div>
    );
});

export default BookkeeperSummary;