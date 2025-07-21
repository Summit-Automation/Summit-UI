'use client';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { Customer } from '@/types/customer';
import { format, parseISO } from 'date-fns';
import { BaseChart, ChartTooltip } from '@/components/ui/base-chart';
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

export default function CustomerGrowthLine({ customers }: { customers: Customer[] }) {
    const data = groupByDay(customers);

    return (
        <BaseChart mobileHeight={200} height={350}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid 
                    stroke="#475569" 
                    strokeDasharray="3 3" 
                    horizontal={true}
                    vertical={false}
                />
                
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

                <ChartTooltip
                    labelFormatter={formatDate}
                    formatter={(value: unknown) => `${value as number} New Customers`}
                />

                <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#f8fafc', stroke: '#3b82f6', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#ffffff', stroke: '#2563eb', strokeWidth: 3 }}
                />
            </LineChart>
        </BaseChart>
    );
}