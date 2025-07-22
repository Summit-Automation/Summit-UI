'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import { Interaction } from '@/types/interaction';
import { MobileChart } from '@/components/ui/mobile-chart';

// Modern color palette for interaction types
const TYPE_COLORS: Record<string, string> = {
    call: '#3b82f6',     // blue-500
    email: '#10b981',    // emerald-500  
    meeting: '#f59e0b',  // amber-500
    'site visit': '#a855f7', // purple-500
    other: '#64748b',    // slate-500
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
        <MobileChart
            mobileHeight={200}
            defaultHeight={350}
            standalone={false}
        >
            <BarChart 
                data={data} 
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                barCategoryGap="20%"
            >
                <CartesianGrid 
                    stroke="#475569" 
                    strokeDasharray="3 3" 
                    horizontal={true}
                    vertical={false}
                />
                
                <XAxis
                    dataKey="type"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                />
                
                <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                />

                <CustomTooltip />

                <Bar 
                    dataKey="count" 
                    radius={[4, 4, 0, 0]}
                    stroke="#1e293b"
                    strokeWidth={1}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </MobileChart>
    );
}