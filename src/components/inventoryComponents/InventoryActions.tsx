'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, QrCode, Download, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AddItemModal from './AddItemModal';
import ImportModal from './ImportModal';
import AdvancedFiltersModal from './AdvancedFiltersModal';
import { CreateInventoryItemRequest, InventoryItem, InventoryFilters } from '@/types/inventory';
import { addInventoryItem, bulkImportInventoryItems } from '@/app/inventory/actions';
import { exportInventoryToCSV, exportInventoryToJSON, generateInventoryReport } from '@/app/lib/services/inventoryServices/exportInventory';

interface InventoryActionsProps {
    items?: InventoryItem[];
    onItemsChange?: () => void;
    onFiltersChange?: (filters: InventoryFilters) => void;
    currentFilters?: InventoryFilters;
}

export default function InventoryActions({ 
    items = [], 
    onItemsChange, 
    onFiltersChange,
    currentFilters = {}
}: InventoryActionsProps) {
    const [searchTerm, setSearchTerm] = useState(currentFilters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(currentFilters.category || '');
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);

    const handleAddItem = () => {
        setShowAddModal(true);
    };

    const handleQRScan = () => {
        alert('QR Code scanning will be available in a future update for automated inventory management!');
    };

    const handleExport = () => {
        if (items.length === 0) {
            alert('No inventory items to export');
            return;
        }


        const choice = window.prompt(
            'Choose export format:\n1. CSV\n2. JSON\n3. Report\n\nEnter 1, 2, or 3:'
        );

        switch (choice) {
            case '1':
                exportInventoryToCSV(items);
                break;
            case '2':
                exportInventoryToJSON(items);
                break;
            case '3':
                const report = generateInventoryReport(items);
                const blob = new Blob([report], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `inventory_report_${new Date().toISOString().split('T')[0]}.txt`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                break;
            default:
                return;
        }
    };

    const handleImport = () => {
        setShowImportModal(true);
    };

    const handleAdvancedFilters = () => {
        setShowFiltersModal(true);
    };

    const handleSubmitNewItem = async (itemData: CreateInventoryItemRequest) => {
        try {
            const result = await addInventoryItem(itemData);
            if (result.success) {
                alert('Item added successfully!');
                onItemsChange?.();
            } else {
                alert(result.error || 'Failed to add item. Please try again.');
            }
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Error adding item. Please try again.');
        }
    };

    const handleImportItems = async (items: CreateInventoryItemRequest[]) => {
        try {
            const result = await bulkImportInventoryItems(items);
            
            if (result.success) {
                if (result.errorCount === 0) {
                    alert(`Successfully imported ${result.successCount} items!`);
                } else {
                    alert(`Imported ${result.successCount} items with ${result.errorCount} errors. Check console for details.`);
                }
                onItemsChange?.();
            } else {
                alert('Import failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during import:', error);
            alert('Import failed. Please try again.');
        }
    };

    const handleApplyFilters = (filters: InventoryFilters) => {
        setSearchTerm(filters.search || '');
        setCategoryFilter(filters.category || '');
        onFiltersChange?.(filters);
    };

    // Apply simple filters when search/category changes
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        onFiltersChange?.({ ...currentFilters, search: value });
    };

    const handleCategoryChange = (value: string) => {
        setCategoryFilter(value);
        onFiltersChange?.({ ...currentFilters, category: value === 'all' ? '' : value });
    };

    return (
        <Card className="card-enhanced">
            <CardHeader>
                <CardTitle className="text-gradient">Inventory Actions</CardTitle>
                <CardDescription className="text-slate-400">
                    Manage your inventory items and perform bulk operations
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Primary Actions */}
                <div className="flex flex-wrap gap-3">
                    <Button 
                        onClick={handleAddItem}
                        className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                    </Button>
                    
                    <Button 
                        onClick={handleQRScan}
                        variant="outline"
                        className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 transition-all duration-300 hover:scale-105"
                    >
                        <QrCode className="h-4 w-4 mr-2" />
                        QR Scan (Future)
                    </Button>

                    <Button 
                        onClick={handleExport}
                        variant="outline"
                        className="border-green-500/50 text-green-400 hover:bg-green-500/10 transition-all duration-300 hover:scale-105"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>

                    <Button 
                        onClick={handleImport}
                        variant="outline"
                        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 transition-all duration-300 hover:scale-105"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                    </Button>
                </div>

                {/* Search and Filter */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10 bg-slate-800/50 border-slate-700 text-slate-200 placeholder-slate-400 focus:border-blue-500 transition-all duration-300"
                        />
                    </div>

                    <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-200 focus:border-blue-500 transition-all duration-300">
                            <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="office-supplies">Office Supplies</SelectItem>
                            <SelectItem value="equipment">Equipment</SelectItem>
                            <SelectItem value="raw-materials">Raw Materials</SelectItem>
                            <SelectItem value="finished-goods">Finished Goods</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button 
                        onClick={handleAdvancedFilters}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 transition-all duration-300"
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Advanced Filters
                    </Button>
                </div>

                {/* Quick Stats */}
                <div className="text-sm text-slate-400 pt-2 border-t border-slate-700">
                    <span className="inline-flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        Use QR scanning for quick item lookup and automated stock updates
                    </span>
                </div>
            </CardContent>

            {/* Modals */}
            <AddItemModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleSubmitNewItem}
            />

            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImportItems}
            />

            <AdvancedFiltersModal
                isOpen={showFiltersModal}
                onClose={() => setShowFiltersModal(false)}
                onApplyFilters={handleApplyFilters}
                currentFilters={currentFilters}
            />
        </Card>
    );
}