'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { Customer } from '@/types/customer';
import { Chart } from '@/components/ui/chart';

const COLORS = [
    '#2563eb', '#059669', '#d97706', '#dc2626', 
    '#7c3aed', '#0891b2', '#4f46e5', '#65a30d'
];

type StatusCount = { name: string; value: number };

interface CustomerStatusPieProps {
    customers: Customer[];
    size?: 'md' | 'lg';
}

export default function CustomerStatusPie({
    customers,
    size = 'md',
}: CustomerStatusPieProps) {
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    const data: StatusCount[] = useMemo(() => 
        Object.entries(
            customers.reduce((acc, curr) => {
                acc[curr.status] = (acc[curr.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        ).map(([status, count]) => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: count,
        })),
        [customers]
    );

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-400">
                No customer status data available
            </div>
        );
    }

    const radius = size === 'lg' ? 80 : 60;
    const mobileRadius = 50;

    return (
        <Chart height={size === 'lg' ? 260 : 220}>
            <PieChart margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="40%"
                    outerRadius={isMobile ? mobileRadius : radius}
                    innerRadius={isMobile ? mobileRadius * 0.6 : radius * 0.6}
                    label={({ name, percent }) => 
                        !isMobile && (percent ?? 0) > 0.05
                            ? `${name} ${((percent ?? 0) * 100).toFixed(0)}%` 
                            : ''
                    }
                    labelLine={false}
                    fontSize={13}
                    paddingAngle={2}
                >
                    {data.map((_, i) => (
                        <Cell 
                            key={i} 
                            fill={COLORS[i % COLORS.length]} 
                            stroke="rgba(255, 255, 255, 0.2)"
                            strokeWidth={1.5}
                        />
                    ))}
                </Pie>

            </PieChart>
        </Chart>
    );
}