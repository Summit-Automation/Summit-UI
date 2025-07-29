// components/dashboardComponents/CustomerGrowthLine.tsx
'use client';

import { memo, useMemo } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { BaseChart, ChartTooltip } from '@/components/ui/base-chart';
import { formatDate } from '@/utils/shared';
import type { Customer } from '@/types/customer';

// Bucket type: daily and cumulative counts
type Bucket = { date: string; newCustomers: number; totalCustomers: number };

// Group by day, then compute cumulative total
function buildCustomerSeries(customers: Customer[]): Bucket[] {
    // Count new customers by creation date
    const dailyMap = new Map<string, number>();
    for (const c of customers) {
        const dateKey = format(parseISO(c.created_at), 'yyyy-MM-dd');
        dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + 1);
    }

    // Sort dates and accumulate totals
    const sortedDates = [...dailyMap.keys()].sort();
    let runningTotal = 0;

    return sortedDates.map(date => {
        const newCount = dailyMap.get(date)!;
        runningTotal += newCount;
        return { date, newCustomers: newCount, totalCustomers: runningTotal };
    });
}

const CustomerGrowthLine = memo(function CustomerGrowthLine({ customers }: { customers: Customer[] }) {
    const data = useMemo(() => buildCustomerSeries(customers), [customers]);

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-400">
                No customer growth data available
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#475569" strokeDasharray="3 3" horizontal vertical={false} />

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
                    axisLine={false}
                    tickLine={false}
                    width={40}
                />

                {/* Combined tooltip for both series */}
                <RechartsTooltip
                    content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                            const bucket = payload[0].payload as Bucket;
                            return (
                                <div className="bg-gray-800/90 rounded-lg p-3 text-white">
                                    <div className="font-medium mb-1">{format(parseISO(label as string), 'MMMM d, yyyy')}</div>
                                    <div className="text-sm">New: {bucket.newCustomers}</div>
                                    <div className="text-sm">Total: {bucket.totalCustomers}</div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />

                {/* Cumulative total line */}
                <Line
                    type="monotone"
                    dataKey="totalCustomers"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                />

                {/* Optional: daily new customers can be shown as bars or second line */}
                <Line
                    type="monotone"
                    dataKey="newCustomers"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    dot={{ r: 3, fill: '#10b981' }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
});

export default CustomerGrowthLine;