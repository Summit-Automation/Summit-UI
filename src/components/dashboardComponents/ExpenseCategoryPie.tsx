'use client';

import {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Transaction } from '@/types/transaction';

type CategoryBucket = { category: string; amount: number };

export default function ExpenseCategoryBar({
                                               transactions,
                                           }: {
    transactions: Transaction[];
}) {
    const categoryTotals = transactions
        .filter((tx) => tx.type === 'expense')
        .reduce((acc, tx) => {
            const category = tx.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + parseFloat(tx.amount as unknown as string);
            return acc;
        }, {} as Record<string, number>);

    const data: CategoryBucket[] = Object.entries(categoryTotals)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount);

    return (
        <div className="bg-transparent p-4 rounded-lg shadow-md">
            <ResponsiveContainer width="100%" height={Math.max(350, data.length * 40)}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                >
                    {/* gradient definition for bars */}
                    <defs>
                        <linearGradient id="expenseGradient" x1="1" y1="0" x2="0" y2=".5">
                            <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0.2} />
                        </linearGradient>
                    </defs>

                    {/* grid & axes in muted slate */}
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                    <XAxis
                        type="number"
                        stroke="var(--muted)"
                        tick={{ fill: 'var(--muted)', fontSize: 12 }}
                    />
                    <YAxis
                        type="category"
                        dataKey="category"
                        stroke="var(--muted)"
                        tick={{ fill: 'var(--muted)', fontSize: 12 }}
                        width={150}
                    />

                    {/* custom tooltip with popover/card colors */}
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--popover)',
                            borderColor: 'var(--border)',
                            borderRadius: 'var(--radius)',
                        }}
                        itemStyle={{ color: 'var(--foreground)' }}
                        labelStyle={{ color: 'var(--muted)' }}
                        cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                    />

                    {/* bars filled with gradient and stroked for definition */}
                    <Bar
                        dataKey="amount"
                        fill="url(#expenseGradient)"
                        stroke="var(--destructive)"
                        strokeWidth={2}
                        barSize={20}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
