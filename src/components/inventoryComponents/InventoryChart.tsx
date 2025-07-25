'use client';

import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

interface InventoryItem {
    id: string;
    name: string;
    category: string;
    current_quantity: number;
    minimum_threshold: number;
    unit_cost: number;
    status: string;
}

interface InventoryChartProps {
    items: InventoryItem[];
}

const COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
];

export default function InventoryChart({ items }: InventoryChartProps) {
    const chartData = useMemo(() => {
        // Category distribution for pie chart
        const categoryData = items.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const categoryChartData = Object.entries(categoryData).map(([category, count]) => ({
            name: category,
            value: count,
        }));

        // Stock levels for bar chart
        const stockLevelsData = items.map(item => ({
            name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
            current: item.current_quantity,
            minimum: item.minimum_threshold,
            status: item.current_quantity <= item.minimum_threshold ? 'low' : 'normal',
        })).slice(0, 10); // Show top 10 items

        // Value by category
        const valueByCategory = items.reduce((acc, item) => {
            const value = item.current_quantity * item.unit_cost;
            acc[item.category] = (acc[item.category] || 0) + value;
            return acc;
        }, {} as Record<string, number>);

        const valueChartData = Object.entries(valueByCategory)
            .map(([category, value]) => ({
                name: category,
                value: value,
            }))
            .sort((a, b) => b.value - a.value); // Sort by value descending

        const maxValue = Math.max(...valueChartData.map(item => item.value));


        return {
            categoryDistribution: categoryChartData,
            stockLevels: stockLevelsData,
            valueByCategory: valueChartData,
            maxValue,
        };
    }, [items]);

    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string; dataKey?: string }>; label?: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
                    <p className="text-slate-200 font-medium">{label}</p>
                    {payload.map((entry, index: number) => (
                        <p key={index} className="text-slate-300">
                            <span style={{ color: entry.color }}>{entry.name}: </span>
                            {entry.dataKey === 'value' ? `$${entry.value.toFixed(2)}` : entry.value}
                            {entry.dataKey !== 'value' && (entry.name === 'Current Stock' || entry.name === 'Minimum Threshold') ? ' units' : ''}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const CustomPieTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string; payload: { fill: string } }> }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
                    <p className="text-slate-200 font-medium">{data.name}</p>
                    <p className="text-slate-300">
                        <span style={{ color: data.payload.fill }}>Items: </span>
                        {data.value}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (items.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400">
                <div className="text-center">
                    <p className="text-lg font-medium">No data available</p>
                    <p className="text-sm">Add inventory items to see analytics</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Stock Levels Bar Chart */}
            <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Stock Levels vs Minimum Threshold</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.stockLevels} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                            dataKey="name" 
                            stroke="#9CA3AF"
                            fontSize={12}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                            dataKey="current" 
                            name="Current Stock"
                            fill="#3B82F6"
                            radius={[2, 2, 0, 0]}
                        />
                        <Bar 
                            dataKey="minimum" 
                            name="Minimum Threshold"
                            fill="#EF4444"
                            radius={[2, 2, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Value by Category Chart */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-slate-200 mb-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        Inventory Value by Category
                    </div>
                </h3>
                <div className="flex justify-center">
                    <div className="w-full max-w-4xl">
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart 
                                data={chartData.valueByCategory} 
                                margin={{ left: 20, right: 20, top: 20, bottom: 60 }}
                                barCategoryGap="20%"
                            >
                                <defs>
                                    <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.9}/>
                                        <stop offset="100%" stopColor="#059669" stopOpacity={0.7}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="2 2" stroke="#374151" opacity={0.3} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#D1D5DB"
                                    fontSize={12}
                                    fontWeight={500}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    axisLine={{ stroke: '#4B5563' }}
                                    tickLine={{ stroke: '#4B5563' }}
                                />
                                <YAxis 
                                    stroke="#D1D5DB"
                                    fontSize={12}
                                    fontWeight={500}
                                    domain={[0, 'dataMax']}
                                    tickFormatter={(value) => {
                                        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                                        if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
                                        return `$${value.toFixed(2)}`;
                                    }}
                                    axisLine={{ stroke: '#4B5563' }}
                                    tickLine={{ stroke: '#4B5563' }}
                                />
                                <Tooltip 
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0];
                                            return (
                                                <div style={{
                                                    backgroundColor: '#111827',
                                                    border: '1px solid #374151',
                                                    borderRadius: '12px',
                                                    color: '#F9FAFB',
                                                    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.5)',
                                                    fontSize: '13px',
                                                    padding: '12px'
                                                }}>
                                                    <p style={{ 
                                                        color: '#F9FAFB', 
                                                        fontWeight: 600,
                                                        fontSize: '14px',
                                                        margin: '0 0 4px 0'
                                                    }}>
                                                        {label}
                                                    </p>
                                                    <p style={{ margin: 0 }}>
                                                        <span style={{ color: '#10B981' }}>Total Value: </span>
                                                        ${data.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                    cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                                />
                                <Bar 
                                    dataKey="value" 
                                    fill="url(#valueGradient)"
                                    stroke="#059669"
                                    strokeWidth={1}
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}