'use client';

import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';
import {Interaction} from '@/types/interaction';

const COLORS = ['#3b82f6', '#94a3b8']; // Blue for Yes, Gray for No

export default function FollowUpPie({interactions}: { interactions: Interaction[] }) {
    const followUpCount = interactions.reduce((acc, curr) => {
        if (curr.follow_up_required) acc[0].value++; else acc[1].value++;
        return acc;
    }, [{name: 'Requires Follow-Up', value: 0}, {name: 'No Follow-Up', value: 0},]);

    return (<div className="bg-slate-800 p-4 rounded-xl shadow border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-2">Follow-Up Required</h3>
        <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <Pie
                    data={followUpCount}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                >
                    {followUpCount.map((_, i) => (<Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]}/>))}
                </Pie>
                <Tooltip/>
                <Legend/>
            </PieChart>
        </ResponsiveContainer>
    </div>);
}
