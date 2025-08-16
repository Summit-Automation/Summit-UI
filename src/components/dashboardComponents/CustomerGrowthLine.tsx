'use client';

import { useMemo, memo } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { Customer } from '@/types/customer';
import { format, parseISO } from 'date-fns';
import { Chart } from '@/components/ui/chart';
import { formatDate } from '@/utils/shared';

type Bucket = { date: string; count: number };

function groupByDay(customers: Customer[]): Bucket[] {
    const map = new Map<string, number>();

    for (const c of customers) {
        const date = format(parseISO(c.created_at), 'yyyy-MM-dd');
        map.set(date, (map.get(date) || 0) + 1);
    }

    return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count }));
}

const CustomerGrowthLine = memo(function CustomerGrowthLine({ customers }: { customers: Customer[] }) {
    const data = useMemo(() => groupByDay(customers), [customers]);

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-400">
                No customer growth data available
            </div>
        );
    }

    return (
        <Chart height={280}>
            <LineChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid 
                    stroke="#334155" 
                    strokeDasharray="1 3" 
                    horizontal={true}
                    vertical={false}
                    opacity={0.2}
                />
                
                <XAxis
                    dataKey="date"
                    tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
                    tickFormatter={formatDate}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                />
                
                <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                />


                <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#ffffff', stroke: '#2563eb', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                    connectNulls={false}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </LineChart>
        </Chart>
    );
});

export default CustomerGrowthLine;