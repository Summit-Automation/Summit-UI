'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Edit, 
    Trash2, 
    Package, 
    AlertTriangle,
    QrCode,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import EditItemModal from './EditItemModal';
import { UpdateInventoryItemRequest, InventoryItem } from '@/types/inventory';
import { editInventoryItem, deleteInventoryItemAction } from '@/app/inventory/actions';

interface InventoryTableProps {
    items: InventoryItem[];
    onItemsChange?: () => void;
}

export default function InventoryTable({ items, onItemsChange }: InventoryTableProps) {
    const [sortField, setSortField] = useState<keyof InventoryItem>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleSort = (field: keyof InventoryItem) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedItems = [...items].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc' 
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
    });

    const getStockStatus = (current: number, minimum: number) => {
        if (current === 0) {
            return { label: 'Out of Stock', color: 'destructive' as const, icon: AlertTriangle };
        } else if (current <= minimum) {
            return { label: 'Low Stock', color: 'secondary' as const, icon: TrendingDown };
        } else {
            return { label: 'In Stock', color: 'default' as const, icon: TrendingUp };
        }
    };

    const handleEdit = (item: InventoryItem) => {
        setEditingItem(item);
        setShowEditModal(true);
    };

    const handleDelete = async (item: InventoryItem) => {
        if (!confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const result = await deleteInventoryItemAction(item.id);
            if (result.success) {
                onItemsChange?.();
            } else {
                console.error('Delete failed:', result.error);
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };


    const handleQRCode = (item: InventoryItem) => {
        // QR code generation functionality would go here
        console.log(`QR code requested for: ${item.name}`);
    };

    const handleEditSubmit = async (itemData: UpdateInventoryItemRequest) => {
        try {
            const result = await editInventoryItem(itemData);
            if (result.success) {
                onItemsChange?.();
                setShowEditModal(false);
                setEditingItem(null);
            } else {
                console.error('Update failed:', result.error);
            }
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    const handleEditClose = () => {
        setShowEditModal(false);
        setEditingItem(null);
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-12">
                <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">No inventory items</h3>
                <p className="text-slate-400">Use the &quot;Add Item&quot; button above to get started</p>
            </div>
        );
    }

    return (
        <div className="border border-slate-700 rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-800/50">
                        <TableHead 
                            className="text-slate-300 cursor-pointer hover:text-blue-400 transition-colors"
                            onClick={() => handleSort('name')}
                        >
                            Item Name
                            {sortField === 'name' && (
                                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                            )}
                        </TableHead>
                        <TableHead className="text-slate-300">SKU</TableHead>
                        <TableHead 
                            className="text-slate-300 cursor-pointer hover:text-blue-400 transition-colors"
                            onClick={() => handleSort('category')}
                        >
                            Category
                        </TableHead>
                        <TableHead 
                            className="text-slate-300 cursor-pointer hover:text-blue-400 transition-colors text-right"
                            onClick={() => handleSort('current_quantity')}
                        >
                            Stock
                        </TableHead>
                        <TableHead className="text-slate-300">Units</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead 
                            className="text-slate-300 cursor-pointer hover:text-blue-400 transition-colors text-right"
                            onClick={() => handleSort('unit_cost')}
                        >
                            Unit Cost
                        </TableHead>
                        <TableHead 
                            className="text-slate-300 cursor-pointer hover:text-blue-400 transition-colors text-right"
                            onClick={() => handleSort('unit_price')}
                        >
                            Unit Price
                        </TableHead>
                        <TableHead className="text-slate-300">Location</TableHead>
                        <TableHead className="text-slate-300 w-12"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedItems.map((item) => {
                        const stockStatus = getStockStatus(item.current_quantity, item.minimum_threshold);
                        const StatusIcon = stockStatus.icon;
                        
                        return (
                            <TableRow 
                                key={item.id} 
                                className="border-slate-700 hover:bg-slate-800/30 transition-colors"
                            >
                                <TableCell className="font-medium text-slate-200">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-slate-400" />
                                        {item.name}
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-400 font-mono text-sm">
                                    {item.sku ? (
                                        <span className="bg-slate-800/50 px-2 py-1 rounded text-xs border border-slate-700">
                                            {item.sku}
                                        </span>
                                    ) : (
                                        <span className="text-slate-500 italic">No SKU</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-slate-300">
                                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                                        {item.category}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className={`font-semibold ${
                                        item.current_quantity === 0 ? 'text-red-400' :
                                        item.current_quantity <= item.minimum_threshold ? 'text-orange-400' :
                                        'text-green-400'
                                    }`}>
                                        {item.current_quantity}
                                    </span>
                                </TableCell>
                                <TableCell className="text-slate-300">
                                    <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 border-slate-600">
                                        {item.unit_of_measurement}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={stockStatus.color} className="flex items-center gap-1 w-fit">
                                        <StatusIcon className="h-3 w-3" />
                                        {stockStatus.label}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-slate-300">
                                    ${item.unit_cost.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right text-slate-300">
                                    ${item.unit_price.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-slate-400">
                                    {item.location || '-'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => handleEdit(item)}
                                            className="h-8 w-8 p-0 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                                            title="Edit Item"
                                        >
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => handleQRCode(item)}
                                            className="h-8 w-8 p-0 text-slate-400 hover:text-orange-400 hover:bg-orange-500/10"
                                            title="View QR Code"
                                        >
                                            <QrCode className="h-3 w-3" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => handleDelete(item)}
                                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            {/* Edit Modal */}
            <EditItemModal
                isOpen={showEditModal}
                onClose={handleEditClose}
                onSubmit={handleEditSubmit}
                item={editingItem}
            />
        </div>
    );
}