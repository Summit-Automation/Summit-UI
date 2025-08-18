'use client';

import React, { useState } from 'react';
import { SimpleTable } from '@/components/ui/simple-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
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

const InventoryTable = React.memo(function InventoryTable({ items, onItemsChange }: InventoryTableProps) {
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

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

    const columns = [
        {
            key: 'name',
            label: 'Item Name',
            sortable: true,
            render: (value: unknown) => (
                <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{value as string}</span>
                </div>
            )
        },
        {
            key: 'sku',
            label: 'SKU',
            render: (value: unknown) => (
                value ? (
                    <span className="bg-muted px-2 py-1 rounded text-xs border font-mono">
                        {value as string}
                    </span>
                ) : (
                    <span className="text-muted-foreground italic">No SKU</span>
                )
            )
        },
        {
            key: 'category',
            label: 'Category',
            sortable: true,
            render: (value: unknown) => (
                <Badge variant="outline">
                    {value as string}
                </Badge>
            )
        },
        {
            key: 'current_quantity',
            label: 'Stock',
            sortable: true,
            className: "text-right",
            render: (value: unknown, item: InventoryItem) => (
                <span className={`font-semibold ${
                    item.current_quantity === 0 ? 'text-red-600' :
                    item.current_quantity <= item.minimum_threshold ? 'text-orange-600' :
                    'text-green-600'
                }`}>
                    {value as number}
                </span>
            )
        },
        {
            key: 'unit_of_measurement',
            label: 'Units',
            render: (value: unknown) => (
                <Badge variant="secondary">
                    {value as string}
                </Badge>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (_: unknown, item: InventoryItem) => {
                const stockStatus = getStockStatus(item.current_quantity, item.minimum_threshold);
                const StatusIcon = stockStatus.icon;
                return (
                    <Badge variant={stockStatus.color} className="flex items-center gap-1 w-fit">
                        <StatusIcon className="h-3 w-3" />
                        {stockStatus.label}
                    </Badge>
                );
            }
        },
        {
            key: 'unit_cost',
            label: 'Unit Cost',
            sortable: true,
            className: "text-right",
            render: (value: unknown) => (
                <span>${(value as number).toFixed(2)}</span>
            )
        },
        {
            key: 'unit_price',
            label: 'Unit Price',
            sortable: true,
            className: "text-right",
            render: (value: unknown) => (
                <span>${(value as number).toFixed(2)}</span>
            )
        },
        {
            key: 'location',
            label: 'Location',
            render: (value: unknown) => (
                <span>{(value as string) || '-'}</span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_: unknown, item: InventoryItem) => (
                <div className="flex items-center gap-1">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(item)}
                        className="h-8 w-8 p-0"
                        title="Edit Item"
                    >
                        <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleQRCode(item)}
                        className="h-8 w-8 p-0"
                        title="View QR Code"
                    >
                        <QrCode className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Delete"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to permanently delete &quot;{item.name}&quot;? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex justify-end space-x-2 pt-4">
                                <AlertDialogCancel asChild>
                                    <Button variant="outline">Cancel</Button>
                                </AlertDialogCancel>
                                <AlertDialogAction asChild>
                                    <Button variant="destructive" onClick={() => handleDelete(item)}>
                                        Yes, delete
                                    </Button>
                                </AlertDialogAction>
                            </div>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )
        }
    ];

    return (
        <>
            <SimpleTable
                data={items}
                columns={columns}
                keyExtractor={(item) => item.id}
                emptyMessage="No inventory items found"
                striped
            />

            <EditItemModal
                isOpen={showEditModal}
                onClose={handleEditClose}
                onSubmit={handleEditSubmit}
                item={editingItem}
            />
        </>
    );
});

export default InventoryTable;