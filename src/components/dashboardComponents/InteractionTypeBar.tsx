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

    return (
        <div className="bg-transparent p-4 rounded-lg shadow-md">
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data}>
                    {/* grid & axes in muted slate */}
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        stroke="var(--muted)"
                        tick={{ fill: 'var(--muted)', fontSize: 12 }}
                    />
                    <YAxis
                        stroke="var(--muted)"
                        tick={{ fill: 'var(--muted)', fontSize: 12 }}
                    />

                    {/* custom tooltip with popover/card colors */}
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

                    {/* legend in muted text */}
                    <Legend
                        wrapperStyle={{ color: 'var(--muted)', fontSize: 12 }}
                        iconType="square"
                    />

                    {/* one <Bar> per interaction type */}
                    {Object.entries(TYPE_COLORS).map(([key, color]) => (
                        <Bar key={key} dataKey={key} stackId="a" fill={color} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}