'use client';

import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,} from 'recharts';
import {Transaction} from '@/types/transaction';

export default function ExpenseCategoryBar({transactions}: { transactions: Transaction[] }) {
    const categoryTotals = transactions
        .filter(txn => txn.type === 'expense')
        .reduce((acc, txn) => {
            const category = txn.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + parseFloat(txn.amount as unknown as string);
            return acc;
        }, {} as Record<string, number>);

    const data = Object.entries(categoryTotals)
        .map(([category, value]) => ({
            category, amount: value,
        }))
        .sort((a, b) => b.amount - a.amount); // highest at top

    return (<div className="bg-slate-800 p-4 rounded-xl shadow border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">Expense Breakdown by Category</h3>
            <ResponsiveContainer width="100%" height={Math.max(250, data.length * 40)}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{top: 10, right: 20, bottom: 10, left: 100}}
                >
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3"/>
                    <XAxis type="number" stroke="#cbd5e1"/>
                    <YAxis type="category" dataKey="category" stroke="#cbd5e1" width={150}/>
                    <Tooltip/>
                    <Bar dataKey="amount" fill="#f43f5e"/>
                </BarChart>
            </ResponsiveContainer>
        </div>);
}
