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

// Shared Tooltip Component with Mercury-style design
export function ChartTooltip({ 
    active, 
    payload, 
    label,
    formatter,
    labelFormatter 
}: TooltipProps) {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-2xl shadow-black/20 max-w-xs">
            {label && (
                <p className="text-slate-50 text-sm font-semibold mb-3 pb-2 border-b border-slate-700/50">
                    {labelFormatter ? labelFormatter(label) : label}
                </p>
            )}
            <div className="space-y-2">
                {payload.map((entry: TooltipPayloadItem, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-3 h-3 rounded-full shadow-sm"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-slate-400 text-sm capitalize">{entry.dataKey}:</span>
                        </div>
                        <span className="text-slate-100 text-sm font-semibold">
                            {formatter ? formatter(entry.value) : String(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Shared Legend Component with Mercury-style design
export function ChartLegend({ payload }: LegendProps) {
    if (!payload || !payload.length) return null;

    return (
        <div className="flex flex-wrap justify-center gap-4 mt-6 px-2">
            {payload.map((entry: LegendPayloadItem, index: number) => (
                <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/30 rounded-full border border-slate-700/30 hover:bg-slate-800/50 transition-colors duration-200">
                    <div 
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-300 text-sm font-medium">{entry.value}</span>
                </div>
            ))}
        </div>
    );
}