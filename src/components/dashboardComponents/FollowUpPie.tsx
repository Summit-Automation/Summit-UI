'use client';

import { useState, useEffect } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { Interaction } from '@/types/interaction';
import { Chart } from '@/components/ui/chart';

const COLORS = ['#dc2626', '#059669']; // Professional red for required, emerald for no follow-up

export default function FollowUpPie({ interactions }: { interactions: Interaction[] }) {
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
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
        <Chart height={220}>
            <PieChart margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="40%"
                    outerRadius={isMobile ? 50 : 80}
                    label={({ name, percent }) => 
                        !isMobile && percent
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

            </PieChart>
        </Chart>
    );
}