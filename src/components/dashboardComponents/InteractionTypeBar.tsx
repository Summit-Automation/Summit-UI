'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import { Interaction } from '@/types/interaction';
import { Chart } from '@/components/ui/chart';

// Professional color palette for interaction types
const TYPE_COLORS: Record<string, string> = {
    call: '#2563eb',     // blue-600
    email: '#059669',    // emerald-600  
    meeting: '#d97706',  // amber-600
    'site visit': '#7c3aed', // violet-600
    other: '#475569',    // slate-600
};

interface InteractionBucket {
    type: string;
    count: number;
    color: string;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        payload: { color: string };
    }>;
    label?: string;
}

function groupInteractionsByType(interactions: Interaction[]): InteractionBucket[] {
    const typeCounts = new Map<string, number>();

    for (const interaction of interactions) {
        const type = interaction.type?.toLowerCase() || 'other';
        typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    }

    return [...typeCounts.entries()]
        .map(([type, count]) => ({
            type: type.charAt(0).toUpperCase() + type.slice(1),
            count,
            color: TYPE_COLORS[type.toLowerCase()] || TYPE_COLORS.other
        }))
        .sort((a, b) => b.count - a.count); // Sort by count descending
}

export default function InteractionTypeBar({ interactions }: { interactions: Interaction[] }) {
    const data = useMemo(() => groupInteractionsByType(interactions), [interactions]);

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-400">
                No interaction data available
            </div>
        );
    }
    const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
                    <p className="text-slate-300 text-sm font-medium mb-1">{label}</p>
                    <div className="flex items-center gap-2">
                        <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: payload[0].payload.color }}
                        />
                        <span className="text-slate-100 text-sm font-medium">
                            {payload[0].value} interaction{payload[0].value !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Chart height={280}>
            <BarChart 
                data={data} 
                margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                barCategoryGap="25%"
            >
                <CartesianGrid 
                    stroke="#334155" 
                    strokeDasharray="1 3" 
                    horizontal={true}
                    vertical={false}
                    opacity={0.2}
                />
                
                <XAxis
                    dataKey="type"
                    tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                />
                
                <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                />

                <CustomTooltip />

                <Bar 
                    dataKey="count" 
                    radius={[4, 4, 0, 0]}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={1}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </Chart>
    );
}