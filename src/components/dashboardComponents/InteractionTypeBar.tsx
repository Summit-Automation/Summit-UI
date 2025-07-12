'use client';

import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,} from 'recharts';
import {Interaction} from '@/types/interaction';
import {format, parseISO} from 'date-fns';

// Choose consistent colors for known types
const TYPE_COLORS: Record<string, string> = {
    call: '#3b82f6', email: '#10b981', meeting: '#f59e0b', text: '#a855f7', other: '#64748b',
};

interface InteractionBucket {
    date: string;
    [type: string]: string | number;
}


function groupInteractions(interactions: Interaction[]): InteractionBucket[] {
    const buckets = new Map<string, InteractionBucket>();

    for (const interaction of interactions) {
        const date = format(parseISO(interaction.created_at), 'yyyy-MM-dd');
        const type = interaction.type?.toLowerCase() || 'other';

        if (!buckets.has(date)) {
            // Initialize with a cast that satisfies the interface
            buckets.set(date, {date} as InteractionBucket);
        }

        const entry = buckets.get(date)!;
        entry[type] = ((entry[type] as number) || 0) + 1;
    }

    const knownTypes = Object.keys(TYPE_COLORS);

    return [...buckets.values()]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(entry => {
            for (const type of knownTypes) {
                if (!(type in entry)) entry[type] = 0;
            }
            return entry;
        });
}


export default function InteractionTypeBar({interactions}: { interactions: Interaction[] }) {
    const data = groupInteractions(interactions);
    const typesToShow = Object.keys(TYPE_COLORS);

    return (<div className="bg-slate-800 p-4 rounded-xl shadow border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-2">Interactions by Type</h3>
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} stackOffset="sign">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                <XAxis dataKey="date" stroke="#cbd5e1"/>
                <YAxis stroke="#cbd5e1"/>
                <Tooltip/>
                <Legend/>
                {typesToShow.map(type => (<Bar
                    key={type}
                    dataKey={type}
                    stackId="a"
                    fill={TYPE_COLORS[type]}
                    name={type.charAt(0).toUpperCase() + type.slice(1)}
                />))}
            </BarChart>
        </ResponsiveContainer>
    </div>);
}
