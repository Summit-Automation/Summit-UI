'use client';

import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';
import {Interaction} from '@/types/interaction';

const COLORS = ['#3b82f6', '#94a3b8']; // Blue for Yes, Gray for No

export default function FollowUpPie({interactions}: { interactions: Interaction[] }) {
    const followUpCount = interactions.reduce((acc, curr) => {
        if (curr.follow_up_required) acc[0].value++; else acc[1].value++;
        return acc;
    }, [{name: 'Requires Follow-Up', value: 0}, {name: 'No Follow-Up', value: 0},]);

    return (<div className="bg-transparent p-4 rounded-lg shadow-md">
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Pie
                    data={followUpCount}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={{ fill: 'var(--foreground)', fontSize: 14 }}
                >
                    {followUpCount.map((_, i) => (<Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]}/>))}
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
    </div>);
}
