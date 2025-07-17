'use client';

import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,} from 'recharts';
import {Transaction} from '@/types/transaction';
import {format, parseISO} from 'date-fns';

type Bucket = { date: string; income: number; expense: number };

function groupCashFlow(transactions: Transaction[]): Bucket[] {
    const map = new Map<string, { income: number; expense: number }>();
    for (const tx of transactions) {
        const date = format(parseISO(tx.timestamp), 'yyyy-MM-dd');
        const amount = parseFloat(tx.amount as unknown as string);
        if (!map.has(date)) map.set(date, {income: 0, expense: 0});
        const entry = map.get(date)!;
        if (tx.type === 'income') entry.income += amount;
        if (tx.type === 'expense') entry.expense += amount;
    }
    return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, {income, expense}]) => ({date, income, expense}));
}

export default function CashFlowArea({transactions}: { transactions: Transaction[] }) {
    const data = groupCashFlow(transactions);

    return (<div className="bg-transparent p-4 rounded-lg shadow-md">
            <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={data}>
                    {/* define nice gradients */}
                    <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.2}/>
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0.2}/>
                        </linearGradient>
                    </defs>

                    {/* grid & axes in muted slate */}
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3"/>
                    <XAxis
                        dataKey="date"
                        stroke="var(--muted)"
                        tick={{fill: 'var(--muted)', fontSize: 12}}
                    />
                    <YAxis
                        stroke="var(--muted)"
                        tick={{fill: 'var(--muted)', fontSize: 12}}
                    />

                    {/* custom tooltip with popover/card colors */}
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--popover)',
                            borderColor: 'var(--border)',
                            borderRadius: 'var(--radius)',
                        }}
                        itemStyle={{color: 'var(--foreground)'}}
                        labelStyle={{color: 'var(--muted)'}}
                        cursor={{fill: 'rgba(255,255,255,0.1)'}}
                    />

                    {/* the filled areas with strokes matching accents */}
                    <Area
                        type="monotone"
                        dataKey="income"
                        stackId="1"
                        stroke="var(--accent)"
                        fill="url(#incomeGradient)"
                        strokeWidth={2}
                    />
                    <Area
                        type="monotone"
                        dataKey="expense"
                        stackId="1"
                        stroke="var(--destructive)"
                        fill="url(#expenseGradient)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>);
}
