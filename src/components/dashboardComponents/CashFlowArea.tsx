'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Transaction } from '@/types/transaction';
import { format, parseISO } from 'date-fns';
import { BaseChart, ChartTooltip } from '@/components/ui/base-chart';
import { formatCurrency, formatDate } from '@/utils/shared';

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

export default function CashFlowArea({ transactions }: { transactions: Transaction[] }) {
    const data = groupCashFlow(transactions);

    return (
        <BaseChart mobileHeight={200} height={350}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2} />
                    </linearGradient>
                </defs>

                <CartesianGrid 
                    stroke="#475569" 
                    strokeDasharray="3 3" 
                    horizontal={true}
                    vertical={false}
                />
                
                <XAxis
                    dataKey="date"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={formatDate}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                />
                
                <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(value) => `${value}`}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                />

                <ChartTooltip
                    labelFormatter={formatDate}
                    formatter={(value: unknown) => formatCurrency(value as number)}
                />

                <Area
                    type="monotone"
                    dataKey="income"
                    stackId="1"
                    stroke="#10b981"
                    fill="url(#incomeGradient)"
                    strokeWidth={2}
                />
                <Area
                    type="monotone"
                    dataKey="expense"
                    stackId="1"
                    stroke="#ef4444"
                    fill="url(#expenseGradient)"
                    strokeWidth={2}
                />
            </AreaChart>
        </BaseChart>
    );
}