'use client';

import * as React from 'react';
import { ResponsiveContainer } from 'recharts';

interface BaseChartProps {
    children: React.ReactElement;
    height?: number;
    mobileHeight?: number;
    className?: string;
}

interface TooltipPayloadItem {
    value: unknown;
    dataKey: string;
    color: string;
}

interface TooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
    formatter?: (value: unknown) => string;
    labelFormatter?: (label: string) => string;
}

interface LegendPayloadItem {
    value: string;
    color: string;
}

interface LegendProps {
    payload?: LegendPayloadItem[];
}

export function BaseChart({
    children,
    height = 350,
    mobileHeight = 250,
    className
}: BaseChartProps) {
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const chartHeight = isMobile ? mobileHeight : height;

    return (
        <div className={className}>
            <ResponsiveContainer width="100%" height={chartHeight}>
                {children}
            </ResponsiveContainer>
        </div>
    );
}

// Shared Tooltip Component
export function ChartTooltip({ 
    active, 
    payload, 
    label,
    formatter,
    labelFormatter 
}: TooltipProps) {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg max-w-xs">
            {label && (
                <p className="text-slate-300 text-sm font-medium mb-2">
                    {labelFormatter ? labelFormatter(label) : label}
                </p>
            )}
            <div className="space-y-1">
                {payload.map((entry: TooltipPayloadItem, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-slate-400 text-xs">{entry.dataKey}:</span>
                        </div>
                        <span className="text-slate-100 text-xs font-medium">
                            {formatter ? formatter(entry.value) : String(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Shared Legend Component
export function ChartLegend({ payload }: LegendProps) {
    if (!payload || !payload.length) return null;

    return (
        <div className="flex flex-wrap justify-center gap-3 mt-4 px-2">
            {payload.map((entry: LegendPayloadItem, index: number) => (
                <div key={index} className="flex items-center gap-2">
                    <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-300 text-xs">{entry.value}</span>
                </div>
            ))}
        </div>
    );
}