'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import { Transaction } from '@/types/transaction';
import { Chart } from '@/components/ui/chart';

type CategoryBucket = { category: string; amount: number; color: string };

// Professional color palette for expense categories
const CATEGORY_COLORS = [
    '#dc2626', // red-600
    '#ea580c', // orange-600  
    '#d97706', // amber-600
    '#ca8a04', // yellow-600
    '#65a30d', // lime-600
    '#16a34a', // green-600
    '#059669', // emerald-600
    '#0d9488', // teal-600
    '#0891b2', // cyan-600
    '#0284c7', // sky-600
    '#2563eb', // blue-600
    '#4f46e5', // indigo-600
    '#7c3aed', // violet-600
    '#9333ea', // purple-600
    '#c026d3', // fuchsia-600
];

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        payload: { color: string };
    }>;
    label?: string;
}

export default function ExpenseCategoryBar({ transactions }: { transactions: Transaction[] }) {
    const data: CategoryBucket[] = useMemo(() => {
        const categoryTotals = transactions
            .filter((tx) => tx.type === 'expense')
            .reduce((acc, tx) => {
                const category = tx.category || 'Uncategorized';
                acc[category] = (acc[category] || 0) + parseFloat(tx.amount as unknown as string);
                return acc;
            }, {} as Record<string, number>);

        return Object.entries(categoryTotals)
            .map(([category, amount], index) => ({ 
                category: category.length > 15 ? category.substring(0, 15) + '...' : category, 
                amount,
                color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 8); // Limit to top 8 categories for better mobile display
    }, [transactions]);

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

    const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
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
        <Chart height={Math.max(260, data.length * 40)}>
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
        </Chart>
    );
}