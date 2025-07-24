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

        const valueChartData = Object.entries(valueByCategory).map(([category, value]) => ({
            name: category,
            value: Math.round(value * 100) / 100,
        }));

        return {
            categoryDistribution: categoryChartData,
            stockLevels: stockLevelsData,
            valueByCategory: valueChartData,
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
                            {entry.value}
                            {entry.dataKey === 'value' && entry.name !== 'Count' ? ` units` : ''}
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

            {/* Category Distribution Pie Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Items by Category</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={chartData.categoryDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {chartData.categoryDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomPieTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">Value by Category</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData.valueByCategory} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                                type="number" 
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <YAxis 
                                type="category" 
                                dataKey="name" 
                                stroke="#9CA3AF"
                                fontSize={12}
                                width={100}
                            />
                            <Tooltip 
                                content={<CustomTooltip />}
                                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
                            />
                            <Bar 
                                dataKey="value" 
                                fill="#10B981"
                                radius={[0, 2, 2, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}