'use client';

import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';
import {Customer} from '@/types/customer';




const COLORS = ['#0ea5e9','#facc15', '#a855f7', '#f97316', '#6366f1', '#22c55e', '#94a3b8'];

type StatusCount = { name: string; value: number };

export default function CustomerStatusPie({
                                              customers,
                                          }: {
    customers: Customer[];
}) {
    const data: StatusCount[] = Object.entries(
        customers.reduce((acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
    }));

    return (
        <div className="bg-transparent p-4 rounded-lg shadow-md">
            <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={{ fill: 'var(--foreground)', fontSize: 14 }}
                    >
                        {data.map((_, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>

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

                    <Legend
                        wrapperStyle={{ color: 'var(--muted)', fontSize: 12 }}
                        iconType="square"
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

