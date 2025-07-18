'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MileageEntry } from '@/types/mileage';
import { format, parseISO } from 'date-fns';

type ChartData = { date: string; businessMiles: number; personalMiles: number };

function groupMileageByMonth(entries: MileageEntry[]): ChartData[] {
    const map = new Map<string, { businessMiles: number; personalMiles: number }>();
    
    for (const entry of entries) {
        const monthKey = format(parseISO(entry.date), 'yyyy-MM');
        if (!map.has(monthKey)) {
            map.set(monthKey, { businessMiles: 0, personalMiles: 0 });
        }
        
        const data = map.get(monthKey)!;
        if (entry.is_business) {
            data.businessMiles += entry.miles;
        } else {
            data.personalMiles += entry.miles;
        }
    }
    
    return [...map.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({ date, ...data }));
}

export default function MileageChart({ mileageEntries }: { mileageEntries: MileageEntry[] }) {
    const data = groupMileageByMonth(mileageEntries);

    return (
        <div className="bg-transparent p-4 rounded-lg shadow-md">
            <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="businessGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.2} />
                        </linearGradient>
                        <linearGradient id="personalGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#64748b" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#64748b" stopOpacity={0.2} />
                        </linearGradient>
                    </defs>

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

                    <Area
                        type="monotone"
                        dataKey="businessMiles"
                        stackId="1"
                        stroke="var(--accent)"
                        fill="url(#businessGradient)"
                        strokeWidth={2}
                    />
                    <Area
                        type="monotone"
                        dataKey="personalMiles"
                        stackId="1"
                        stroke="#64748b"
                        fill="url(#personalGradient)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}