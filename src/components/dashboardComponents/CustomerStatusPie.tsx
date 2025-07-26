'use client';

import React, { useMemo } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { Customer } from '@/types/customer';
import { BaseChart, ChartTooltip, ChartLegend } from '@/components/ui/base-chart';

const COLORS = [
    '#0ea5e9', '#facc15', '#a855f7', '#f97316', 
    '#6366f1', '#22c55e', '#94a3b8'
];

type StatusCount = { name: string; value: number };

interface CustomerStatusPieProps {
    customers: Customer[];
    size?: 'md' | 'lg';
}

export default function CustomerStatusPie({
    customers,
    size = 'md',
}: CustomerStatusPieProps) {
    const data: StatusCount[] = useMemo(() => 
        Object.entries(
            customers.reduce((acc, curr) => {
                acc[curr.status] = (acc[curr.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        ).map(([status, count]) => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: count,
        })),
        [customers]
    );

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-400">
                No customer status data available
            </div>
        );
    }

    const radius = size === 'lg' ? 80 : 60;
    const mobileRadius = 50;

    return (
        <BaseChart
            mobileHeight={200}
            height={size === 'lg' ? 320 : 280}
        >
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={typeof window !== 'undefined' && window.innerWidth < 768 ? mobileRadius : radius}
                    label={({ name, percent }) => 
                        typeof window !== 'undefined' && window.innerWidth >= 768 && percent 
                            ? `${name} ${(percent * 100).toFixed(0)}%` 
                            : ''
                    }
                    labelLine={false}
                    fontSize={12}
                >
                    {data.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                </Pie>

                <ChartTooltip />
                <ChartLegend />
            </PieChart>
        </BaseChart>
    );
}