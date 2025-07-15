'use client';

import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { Customer } from '@/types/customer';

const COLORS = [
    '#0ea5e9',
    '#facc15',
    '#a855f7',
    '#f97316',
    '#6366f1',
    '#22c55e',
    '#94a3b8',
];

type StatusCount = { name: string; value: number };

interface CustomerStatusPieProps {
    customers: Customer[];
    /**
     * 'sm' = smaller chart, 'md' = default middle size, 'lg' = largest
     * (maps to Tailwind height + outerRadius)
     */
    size?: 'md' | 'lg';
}

export default function CustomerStatusPie({
                                              customers,
                                              size = 'md',
                                          }: CustomerStatusPieProps) {
    // build your status counts
    const data: StatusCount[] = Object.entries(
        customers.reduce((acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
    }));

    // pick container height + pie radius by size
    const sizeMap = {
        md: { heightClass: 'h-64', radius: 80 },
        lg: { heightClass: 'h-80', radius: 120 },
    } as const;

    const { heightClass, radius } = sizeMap[size];

    return (
        <div className={`bg-transparent p-4 rounded-lg shadow-md ${heightClass}`}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={radius}
                        label={{ fill: 'var(--foreground)', fontSize: 14 }}
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
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
