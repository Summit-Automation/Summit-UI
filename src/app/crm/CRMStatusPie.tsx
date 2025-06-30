'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Customer } from '@/types/customer';

type Props = {
    customers: Customer[];
};

const STATUS_COLORS: Record<string, string> = {
    qualified: '#0ea5e9', // sky-500
    proposal: '#6366f1',  // indigo-500
    closed: '#22c55e',    // green-500
    churned: '#ef4444',   // red-500
    default: '#94a3b8',   // slate-400
};

export default function CRMStatusPie({ customers }: Props) {
    // Count customers per status
    const statusCounts: Record<string, number> = {};
    customers.forEach((c) => {
        statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });

    // Prepare data for pie chart
    const data = Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        value: count,
    }));

    return (
        <div className="bg-slate-800 text-white p-4 rounded-lg shadow border border-slate-700">
            <h3 className="text-lg font-semibold mb-2">Customer Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={STATUS_COLORS[entry.name] || STATUS_COLORS.default}
                            />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

