'use client';

import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,} from 'recharts';
import {Transaction} from '@/types/transaction';
import {format, parseISO} from 'date-fns';

type Bucket = {
    date: string; income: number; expense: number;
};

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

    return (<div className="bg-slate-800 p-4 rounded-xl shadow border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-2">Cash Flow Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                <XAxis dataKey="date" stroke="#cbd5e1"/>
                <YAxis stroke="#cbd5e1"/>
                <Tooltip/>
                <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981"/>
                <Area type="monotone" dataKey="expense" stackId="1" stroke="#ef4444" fill="#ef4444"/>
            </AreaChart>
        </ResponsiveContainer>
    </div>);
}
