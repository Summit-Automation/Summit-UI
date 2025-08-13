'use client';

import React, { useMemo } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { Customer } from '@/types/customer';
import { BaseChart, ChartTooltip, ChartLegend } from '@/components/ui/base-chart';

const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#6366f1', '#84cc16'
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
                    innerRadius={typeof window !== 'undefined' && window.innerWidth < 768 ? mobileRadius * 0.6 : radius * 0.6}
                    label={({ name, percent }) => 
                        typeof window !== 'undefined' && window.innerWidth >= 768 && (percent ?? 0) > 0.05
                            ? `${name} ${((percent ?? 0) * 100).toFixed(0)}%` 
                            : ''
                    }
                    labelLine={false}
                    fontSize={12}
                    paddingAngle={2}
                >
                    {data.map((_, i) => (
                        <Cell 
                            key={i} 
                            fill={COLORS[i % COLORS.length]} 
                            stroke="rgba(15, 23, 42, 0.1)"
                            strokeWidth={1}
                        />
                    ))}
                </Pie>

                <ChartTooltip />
                <ChartLegend />
            </PieChart>
        </BaseChart>
    );
}