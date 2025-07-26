'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingDown, AlertTriangle, DollarSign, Warehouse } from 'lucide-react';

interface InventoryItem {
    id: string;
    name: string;
    current_quantity: number;
    minimum_threshold: number;
    unit_cost: number;
    unit_price: number;
    status: string;
    category: string;
}

interface InventoryAlert {
    id: string;
    alert_type: string;
    priority: string;
}

interface InventorySummaryProps {
    items: InventoryItem[];
    alerts: InventoryAlert[];
}

export default function InventorySummary({ items, alerts }: InventorySummaryProps) {
    // Memoize expensive calculations
    const calculations = useMemo(() => {
        const totalItems = items.length;
        const totalValue = items.reduce((sum, item) => sum + (item.current_quantity * item.unit_cost), 0);
        const lowStockItems = items.filter(item => item.current_quantity <= item.minimum_threshold).length;
        const outOfStockItems = items.filter(item => item.current_quantity === 0).length;
        const categories = new Set(items.map(item => item.category)).size;
        
        return { totalItems, totalValue, lowStockItems, outOfStockItems, categories };
    }, [items]);

    const criticalAlerts = useMemo(() => 
        alerts.filter(alert => alert.priority === 'high' || alert.priority === 'critical').length,
        [alerts]
    );

    const summaryCards = [
        {
            title: 'Total Items',
            value: calculations.totalItems.toLocaleString(),
            description: 'Active inventory items',
            icon: Package,
            color: 'text-blue-400',
            bgColor: 'bg-blue-400/10',
        },
        {
            title: 'Total Value',
            value: `$${calculations.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            description: 'Current inventory value',
            icon: DollarSign,
            color: 'text-green-400',
            bgColor: 'bg-green-400/10',
        },
        {
            title: 'Low Stock',
            value: calculations.lowStockItems.toString(),
            description: 'Items below threshold',
            icon: TrendingDown,
            color: 'text-orange-400',
            bgColor: 'bg-orange-400/10',
        },
        {
            title: 'Out of Stock',
            value: calculations.outOfStockItems.toString(),
            description: 'Items need restocking',
            icon: AlertTriangle,
            color: 'text-red-400',
            bgColor: 'bg-red-400/10',
        },
        {
            title: 'Critical Alerts',
            value: criticalAlerts.toString(),
            description: 'High priority notifications',
            icon: AlertTriangle,
            color: 'text-red-400',
            bgColor: 'bg-red-400/10',
        },
        {
            title: 'Categories',
            value: calculations.categories.toString(),
            description: 'Unique item categories',
            icon: Warehouse,
            color: 'text-purple-400',
            bgColor: 'bg-purple-400/10',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {summaryCards.map((card, index) => {
                const IconComponent = card.icon;
                return (
                    <Card key={card.title} className={`card-enhanced data-appear transition-transform duration-200 ease-out hover:scale-[1.02]`} style={{ animationDelay: `${index * 100}ms` }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">
                                {card.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${card.bgColor} transition-transform duration-200 ease-out hover:scale-105`}>
                                <IconComponent className={`h-4 w-4 ${card.color} icon-interactive`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${card.color} transition-all duration-300`}>
                                {card.value}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}