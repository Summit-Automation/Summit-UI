'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import { Transaction } from '@/types/transaction';
import { MobileChart, MobileTooltip } from '@/components/ui/mobile-chart';

type CategoryBucket = { category: string; amount: number; color: string };

// Modern color palette for expense categories
const CATEGORY_COLORS = [
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#f59e0b', // amber-500
    '#eab308', // yellow-500
    '#84cc16', // lime-500
    '#22c55e', // green-500
    '#10b981', // emerald-500
    '#14b8a6', // teal-500
    '#06b6d4', // cyan-500
    '#0ea5e9', // sky-500
    '#3b82f6', // blue-500
    '#6366f1', // indigo-500
    '#8b5cf6', // violet-500
    '#a855f7', // purple-500
    '#d946ef', // fuchsia-500
];

export default function ExpenseCategoryBar({ transactions }: { transactions: Transaction[] }) {
    const categoryTotals = transactions
        .filter((tx) => tx.type === 'expense')
        .reduce((acc, tx) => {
            const category = tx.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + parseFloat(tx.amount as unknown as string);
            return acc;
        }, {} as Record<string, number>);

    const data: CategoryBucket[] = Object.entries(categoryTotals)
        .map(([category, amount], index) => ({ 
            category: category.length > 15 ? category.substring(0, 15) + '...' : category, 
            amount,
            color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 8); // Limit to top 8 categories for better mobile display

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-400">
                No expense data available
            </div>
        );
    }

    const formatCurrency = (value: number) => 
        new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(value);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg max-w-xs">
                    <p className="text-slate-300 text-sm font-medium mb-1">{label}</p>
                    <div className="flex items-center gap-2">
                        <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: payload[0].payload.color }}
                        />
                        <span className="text-slate-100 text-sm font-medium">
                            {formatCurrency(payload[0].value)}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <MobileChart
            mobileHeight={200}
            defaultHeight={Math.max(300, data.length * 40)}
            standalone={false}
        >
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 10, right: 20, bottom: 10, left: 10 }}
                barCategoryGap="10%"
            >
                <CartesianGrid 
                    stroke="#475569" 
                    strokeDasharray="3 3" 
                    horizontal={false}
                    vertical={true}
                />
                
                <XAxis
                    type="number"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={formatCurrency}
                    axisLine={false}
                    tickLine={false}
                />
                
                <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                />

                <CustomTooltip />

                <Bar
                    dataKey="amount"
                    radius={[0, 4, 4, 0]}
                    stroke="#1e293b"
                    strokeWidth={1}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </MobileChart>
    );
}