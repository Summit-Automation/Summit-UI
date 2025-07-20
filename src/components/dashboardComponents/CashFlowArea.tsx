'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Transaction } from '@/types/transaction';
import { format, parseISO } from 'date-fns';
import { MobileChart, MobileTooltip } from '@/components/ui/mobile-chart';

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

    const formatCurrency = (value: unknown) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value as number);

    const formatDate = (date: string) => 
        new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
        <MobileChart
            mobileHeight={200}
            defaultHeight={350}
            standalone={false}
        >
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

                <MobileTooltip
                    labelFormatter={formatDate}
                    formatter={formatCurrency}
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
        </MobileChart>
    );
}