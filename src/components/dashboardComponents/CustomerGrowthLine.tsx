'use client';

import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,} from 'recharts';
import {Customer} from '@/types/customer';
import {format, parseISO} from 'date-fns';

type Bucket = { date: string; count: number };

function groupByDay(customers: Customer[]): Bucket[] {
    const map = new Map<string, number>();

    for (const c of customers) {
        const date = format(parseISO(c.created_at), 'yyyy-MM-dd');
        map.set(date, (map.get(date) || 0) + 1);
    }

    return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({date, count}));
}

export default function CustomerGrowthLine({
                                               customers,
                                           }: {
    customers: Customer[];
}) {
    const data = groupByDay(customers);

    return (<div className="bg-transparent p-4 rounded-lg shadow-md">
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data}>
                    {/* grid & axes in muted slate */}
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3"/>
                    <XAxis
                        dataKey="date"
                        stroke="var(--muted)"
                        tick={{fill: 'var(--muted)', fontSize: 12}}
                    />
                    <YAxis
                        stroke="var(--muted)"
                        tick={{fill: 'var(--muted)', fontSize: 12}}
                    />

                    {/* custom tooltip with popover/card colors */}
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--popover)',
                            borderColor: 'var(--border)',
                            borderRadius: 'var(--radius)',
                        }}
                        itemStyle={{color: 'var(--foreground)'}}
                        labelStyle={{color: 'var(--muted)'}}
                        cursor={{fill: 'rgba(255,255,255,0.1)'}}
                    />

                    {/* the line with accent stroke and matching dot */}
                    <Line
                        type="monotone"
                        dataKey="count"
                        stroke="var(--icon)"
                        strokeWidth={2}
                        dot={{r: 4, fill: 'var(--icon) ', stroke: 'var(--primary-foreground)', strokeWidth: 2}}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>);
}
