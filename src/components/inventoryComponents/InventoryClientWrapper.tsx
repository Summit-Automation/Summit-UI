'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, BarChart3, Package, AlertTriangle } from 'lucide-react';
import InventorySummary from './InventorySummary';
import InventoryActions from './InventoryActions';
import InventoryTable from './InventoryTable';
import InventoryChart from './InventoryChart';
import InventoryAlerts from './InventoryAlerts';
import { InventoryItem, InventoryAlert, InventoryFilters } from '@/types/inventory';
import { fetchInventoryData } from '@/app/inventory/actions';

interface InventoryClientWrapperProps {
    initialItems: InventoryItem[];
    initialAlerts: InventoryAlert[];
}

export default function InventoryClientWrapper({ initialItems, initialAlerts }: InventoryClientWrapperProps) {
    const [items, setItems] = useState<InventoryItem[]>(initialItems);
    const [alerts, setAlerts] = useState<InventoryAlert[]>(initialAlerts);
    const [filteredItems, setFilteredItems] = useState<InventoryItem[]>(initialItems);
    const [filters, setFilters] = useState<InventoryFilters>({});

    const fetchData = async () => {
        try {
            const data = await fetchInventoryData();
            setItems(data.items);
            setAlerts(data.alerts);
            setFilteredItems(data.items);
        } catch (error) {
            console.error('Error fetching inventory data:', error);
        }
    };

    const applyFilters = useCallback((newFilters: InventoryFilters) => {
        setFilters(newFilters);
        
        let filtered = items;

        // Apply search filter
        if (newFilters.search) {
            const searchLower = newFilters.search.toLowerCase();
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchLower) ||
                (item.sku && item.sku.toLowerCase().includes(searchLower)) ||
                (item.description && item.description.toLowerCase().includes(searchLower))
            );
        }

        // Apply category filter
        if (newFilters.category) {
            filtered = filtered.filter(item => item.category === newFilters.category);
        }

        // Apply status filter
        if (newFilters.status) {
            filtered = filtered.filter(item => item.status === newFilters.status);
        }

        // Apply location filter
        if (newFilters.location) {
            filtered = filtered.filter(item =>
                item.location && item.location.toLowerCase().includes(newFilters.location!.toLowerCase())
            );
        }

        // Apply stock filters
        if (newFilters.low_stock_only) {
            filtered = filtered.filter(item => item.current_quantity <= item.minimum_threshold);
        }

        if (newFilters.out_of_stock_only) {
            filtered = filtered.filter(item => item.current_quantity === 0);
        }

        setFilteredItems(filtered);
    }, [items]);


    useEffect(() => {
        applyFilters(filters);
    }, [items, filters, applyFilters]);

    return (
        <>
            {/* Summary - Always Visible */}
            <div className="w-full">
                <InventorySummary items={filteredItems} alerts={alerts} />
            </div>

            {/* Desktop: Full Layout | Mobile: Tabbed Layout */}
            <div className="hidden lg:block space-y-6">
                {/* Charts and Alerts Grid - Desktop Only */}
                <div className="grid grid-cols-2 gap-6">
                    <Card className="chart-container-enhanced card-enhanced">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-gradient">
                                <div className="p-2 bg-slate-800/50 rounded-lg transition-all duration-300 hover:scale-110">
                                    <Activity className="h-5 w-5 text-blue-400 icon-interactive" />
                                </div>
                                Inventory Trends
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Stock levels and movement over time
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="custom-scrollbar">
                            <InventoryChart items={filteredItems} />
                        </CardContent>
                    </Card>

                    <Card className="chart-container-enhanced card-enhanced">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-gradient">
                                <div className="p-2 bg-slate-800/50 rounded-lg transition-all duration-300 hover:scale-110">
                                    <AlertTriangle className="h-5 w-5 text-orange-400 icon-interactive" />
                                </div>
                                Stock Alerts
                            </CardTitle>
                            <CardDescription className="text-slate-400">
                                Low stock warnings and critical notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="custom-scrollbar">
                            <InventoryAlerts alerts={alerts} />
                        </CardContent>
                    </Card>
                </div>

                {/* Actions - Desktop */}
                <InventoryActions 
                    items={items}
                    onItemsChange={fetchData}
                    onFiltersChange={applyFilters}
                    currentFilters={filters}
                />

                {/* Table - Desktop */}
                <Card className="card-enhanced">
                    <CardHeader>
                        <CardTitle className="text-gradient">Inventory Items</CardTitle>
                        <CardDescription className="text-slate-400">
                            Complete inventory with stock levels, pricing, and supplier information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <InventoryTable items={filteredItems} onItemsChange={fetchData} />
                    </CardContent>
                </Card>
            </div>

            {/* Mobile: Tabbed Layout */}
            <div className="lg:hidden">
                <Tabs defaultValue="items" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="items" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span className="hidden sm:inline">Items</span>
                        </TabsTrigger>
                        <TabsTrigger value="alerts" className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="hidden sm:inline">Alerts</span>
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Charts</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="items" className="mt-4 space-y-4">
                        <InventoryActions 
                            items={items}
                            onItemsChange={fetchData}
                            onFiltersChange={applyFilters}
                            currentFilters={filters}
                        />
                        
                        <Card className="card-enhanced">
                            <CardHeader>
                                <CardTitle className="text-gradient">Inventory Items</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Complete inventory with stock levels and pricing
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <InventoryTable items={filteredItems} onItemsChange={fetchData} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="alerts" className="mt-4">
                        <Card className="chart-container-enhanced card-enhanced">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-gradient">
                                    <AlertTriangle className="h-5 w-5 text-orange-400 icon-interactive" />
                                    Stock Alerts
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Low stock warnings and critical notifications
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="custom-scrollbar">
                                <InventoryAlerts alerts={alerts} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-4">
                        <Card className="chart-container-enhanced card-enhanced">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-gradient">
                                    <Activity className="h-5 w-5 text-blue-400 icon-interactive" />
                                    Inventory Trends
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Stock levels and movement over time
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="custom-scrollbar">
                                <InventoryChart items={filteredItems} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}