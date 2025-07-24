'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Filter, X } from 'lucide-react';
import { InventoryFilters } from '@/types/inventory';

interface AdvancedFiltersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyFilters: (filters: InventoryFilters) => void;
    currentFilters: InventoryFilters;
}

export default function AdvancedFiltersModal({ 
    isOpen, 
    onClose, 
    onApplyFilters, 
    currentFilters 
}: AdvancedFiltersModalProps) {
    const [filters, setFilters] = useState<InventoryFilters>(currentFilters);

    const handleFilterChange = (field: keyof InventoryFilters, value: string | boolean) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleApply = () => {
        onApplyFilters(filters);
        onClose();
    };

    const handleClear = () => {
        const clearedFilters: InventoryFilters = {
            search: '',
            category: '',
            status: undefined,
            location: '',
            low_stock_only: false,
            out_of_stock_only: false,
        };
        setFilters(clearedFilters);
        onApplyFilters(clearedFilters);
        onClose();
    };

    const hasActiveFilters = Object.values(filters).some(value => 
        value !== '' && value !== undefined && value !== false
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-slate-900 border-slate-700">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-gradient">
                        <Filter className="h-5 w-5 text-blue-400" />
                        Advanced Filters
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Apply advanced filters to find specific inventory items
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Search */}
                    <div>
                        <Label htmlFor="search" className="text-slate-300">Search</Label>
                        <Input
                            id="search"
                            value={filters.search || ''}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="bg-slate-800 border-slate-700 text-slate-200"
                            placeholder="Search name, SKU, or description"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <Label htmlFor="category" className="text-slate-300">Category</Label>
                        <Select 
                            value={filters.category || 'all'} 
                            onValueChange={(value) => handleFilterChange('category', value === 'all' ? '' : value)}
                        >
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="office-supplies">Office Supplies</SelectItem>
                                <SelectItem value="equipment">Equipment</SelectItem>
                                <SelectItem value="raw-materials">Raw Materials</SelectItem>
                                <SelectItem value="finished-goods">Finished Goods</SelectItem>
                                <SelectItem value="tools">Tools</SelectItem>
                                <SelectItem value="electronics">Electronics</SelectItem>
                                <SelectItem value="furniture">Furniture</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status */}
                    <div>
                        <Label htmlFor="status" className="text-slate-300">Status</Label>
                        <Select 
                            value={filters.status || 'all'} 
                            onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
                        >
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="discontinued">Discontinued</SelectItem>
                                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Location */}
                    <div>
                        <Label htmlFor="location" className="text-slate-300">Location</Label>
                        <Input
                            id="location"
                            value={filters.location || ''}
                            onChange={(e) => handleFilterChange('location', e.target.value)}
                            className="bg-slate-800 border-slate-700 text-slate-200"
                            placeholder="Storage location"
                        />
                    </div>

                    <Separator className="bg-slate-700" />

                    {/* Special Filters */}
                    <div className="space-y-4">
                        <Label className="text-slate-300">Special Filters</Label>
                        
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="low_stock_only"
                                checked={filters.low_stock_only || false}
                                onCheckedChange={(checked) => handleFilterChange('low_stock_only', checked)}
                            />
                            <Label htmlFor="low_stock_only" className="text-slate-300">
                                Low stock items only
                            </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="out_of_stock_only"
                                checked={filters.out_of_stock_only || false}
                                onCheckedChange={(checked) => handleFilterChange('out_of_stock_only', checked)}
                            />
                            <Label htmlFor="out_of_stock_only" className="text-slate-300">
                                Out of stock items only
                            </Label>
                        </div>
                    </div>

                    {/* Filter Summary */}
                    {hasActiveFilters && (
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                            <div className="text-sm text-slate-300 mb-2">Active Filters:</div>
                            <div className="flex flex-wrap gap-2">
                                {filters.search && (
                                    <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs">
                                        Search: {filters.search}
                                    </span>
                                )}
                                {filters.category && (
                                    <span className="bg-green-600/20 text-green-300 px-2 py-1 rounded text-xs">
                                        Category: {filters.category}
                                    </span>
                                )}
                                {filters.status && (
                                    <span className="bg-orange-600/20 text-orange-300 px-2 py-1 rounded text-xs">
                                        Status: {filters.status}
                                    </span>
                                )}
                                {filters.location && (
                                    <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-xs">
                                        Location: {filters.location}
                                    </span>
                                )}
                                {filters.low_stock_only && (
                                    <span className="bg-red-600/20 text-red-300 px-2 py-1 rounded text-xs">
                                        Low Stock Only
                                    </span>
                                )}
                                {filters.out_of_stock_only && (
                                    <span className="bg-red-600/20 text-red-300 px-2 py-1 rounded text-xs">
                                        Out of Stock Only
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClear}
                            className="border-red-600/50 text-red-400 hover:bg-red-500/10"
                            disabled={!hasActiveFilters}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear All
                        </Button>
                        
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleApply}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}