'use client';

import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';
import {Customer} from '@/types/customer';




const COLORS = ['#0ea5e9','#facc15', '#a855f7', '#f97316', '#6366f1', '#22c55e', '#94a3b8'];

export default function CustomerStatusPie({customers}: { customers: Customer[] }) {
    // Count customers by status
    const data = Object.entries(customers.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>)).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1), value: count,
    }));

    return (<div className="bg-slate-800 p-4 rounded-xl shadow border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-2">Customer Funnel Distribution</h3>
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
                    {data.map((_, i) => (<Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]}/>))}
                </Pie>
                <Tooltip/>
                <Legend/>
            </PieChart>
        </ResponsiveContainer>
    </div>);
}
