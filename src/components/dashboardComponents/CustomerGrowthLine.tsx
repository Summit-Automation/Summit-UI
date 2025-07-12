'use client';

import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {Customer} from '@/types/customer';
import {format, parseISO} from 'date-fns';

type Bucket = { date: string; count: number };

function groupByDay(customers: Customer[]): Bucket[] {
    const map = new Map<string, number>();

    for (const c of customers) {
        const date = format(parseISO(c.created_at), 'yyyy-MM-dd');
        map.set(date, (map.get(date) || 0) + 1);
    }

    // Sort by date ascending
    return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({date, count}));
}

export default function CustomerGrowthLine({customers}: { customers: Customer[] }) {
    const data = groupByDay(customers);

    return (<div className="bg-slate-800 p-4 rounded-xl shadow border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-2">New Customers Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                <XAxis dataKey="date" stroke="#cbd5e1"/>
                <YAxis stroke="#cbd5e1"/>
                <Tooltip/>
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{r: 4}}/>
            </LineChart>
        </ResponsiveContainer>
    </div>);
}
