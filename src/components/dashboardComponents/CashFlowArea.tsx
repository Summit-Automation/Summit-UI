'use client';

import { useMemo, memo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Transaction } from '@/types/transaction';
import { format, parseISO } from 'date-fns';
import { Chart } from '@/components/ui/chart';
import { formatDate } from '@/utils/shared';
import { useCurrency } from '@/contexts/CurrencyContext';

type Bucket = { date: string; income: number; expense: number };

function groupCashFlow(transactions: Transaction[]): Bucket[] {
    const map = new Map<string, { income: number; expense: number }>();
    for (const tx of transactions) {
        const date = format(parseISO(tx.timestamp), 'yyyy-MM-dd');
        const amount = parseFloat(tx.amount as unknown as string);
        if (!map.has(date)) map.set(date, { income: 0, expense: 0 });
        const entry = map.get(date)!;
        if (tx.type === 'income') entry.income += amount;
        if (tx.type === 'expense') entry.expense += amount;
    }
    return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, { income, expense }]) => ({ date, income, expense }));
}



const CashFlowArea = memo(function CashFlowArea({ transactions }: { transactions: Transaction[] }) {
    const { getCurrencySymbol } = useCurrency();
    const data = useMemo(() => groupCashFlow(transactions), [transactions]);

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-400">
                No cash flow data available
            </div>
        );
    }
    return (
        <Chart height={280}>
            <AreaChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#059669" stopOpacity={0.3} />
                        <stop offset="50%" stopColor="#059669" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#dc2626" stopOpacity={0.3} />
                        <stop offset="50%" stopColor="#dc2626" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#dc2626" stopOpacity={0.05} />
                    </linearGradient>
                </defs>

                <CartesianGrid 
                    stroke="#334155" 
                    strokeDasharray="1 3" 
                    horizontal={true}
                    vertical={false}
                    opacity={0.2}
                />
                
                <XAxis
                    dataKey="date"
                    tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
                    tickFormatter={formatDate}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                    height={40}
                />
                
                <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
                    tickFormatter={(value) => `${getCurrencySymbol()}${(value / 1000).toFixed(0)}k`}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                />


                <Area
                    type="monotone"
                    dataKey="income"
                    stackId="1"
                    stroke="#059669"
                    fill="url(#incomeGradient)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, stroke: '#059669', strokeWidth: 2, fill: '#ffffff' }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <Area
                    type="monotone"
                    dataKey="expense"
                    stackId="1"
                    stroke="#dc2626"
                    fill="url(#expenseGradient)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, stroke: '#dc2626', strokeWidth: 2, fill: '#ffffff' }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </AreaChart>
        </Chart>
    );
});

export default CashFlowArea;