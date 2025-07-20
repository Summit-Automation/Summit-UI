'use client';

import { Cell, Pie, PieChart } from 'recharts';
import { Interaction } from '@/types/interaction';
import { MobileChart, MobileTooltip, MobileLegend } from '@/components/ui/mobile-chart';

const COLORS = ['#ef4444', '#10b981']; // Red for required, Green for no follow-up

export default function FollowUpPie({ interactions }: { interactions: Interaction[] }) {
    const followUpRequired = interactions.filter(i => i.follow_up_required).length;
    const noFollowUp = interactions.length - followUpRequired;

    const data = [
        { name: 'Requires Follow-Up', value: followUpRequired },
        { name: 'No Follow-Up', value: noFollowUp }
    ].filter(item => item.value > 0); // Only show segments with data

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-400">
                No interaction data available
            </div>
        );
    }

    return (
        <MobileChart
            mobileHeight={200}
            defaultHeight={280}
            standalone={false}
        >
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={typeof window !== 'undefined' && window.innerWidth < 768 ? 50 : 80}
                    label={({ name, percent }) => 
                        typeof window !== 'undefined' && window.innerWidth >= 768 && percent
                            ? `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%` 
                            : ''
                    }
                    labelLine={false}
                    fontSize={12}
                >
                    {data.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                </Pie>

                <MobileTooltip />
                <MobileLegend />
            </PieChart>
        </MobileChart>
    );
}