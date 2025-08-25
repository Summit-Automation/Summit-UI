'use client';

import React, { useState } from 'react';
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
  TrendingDown,
  DollarSign,
  MapPin,
  Barcode,
  ShoppingCart,
  Building2
} from 'lucide-react';
import EditItemModal from './EditItemModal';
import { UpdateInventoryItemRequest, InventoryItem } from '@/types/inventory';
import { editInventoryItem, deleteInventoryItemAction } from '@/app/inventory/actions';
import { exportInventoryToCSV, exportInventoryToJSON } from '@/app/lib/services/inventoryServices/exportInventory';

import { EnhancedTable, EnhancedColumn } from '@/components/ui/enhanced-table';

interface InventoryTableEnhancedProps {
  items: InventoryItem[];
  onItemsChange?: () => void;
  loading?: boolean;
  title?: string;
  description?: string;
}

const InventoryTableEnhanced = React.memo(function InventoryTableEnhanced({ 
  items, 
  onItemsChange,
  loading = false,
  title = "Inventory",
  description = "Manage and track your inventory items"
}: InventoryTableEnhancedProps) {
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  // Export handling
  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    try {
      if (format === 'csv') {
        exportInventoryToCSV(items);
      } else {
        exportInventoryToJSON(items);
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Column definitions for the enhanced table
  const columns: EnhancedColumn<InventoryItem>[] = [
    {
      id: 'name',
      key: 'name',
      label: 'Item Name',
      primary: true,
      sortable: true,
      searchable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{value as string}</span>
        </div>
      )
    },
    {
      id: 'sku',
      key: 'sku',
      label: 'SKU',
      searchable: true,
      hideOnMobile: true,
      width: '120px',
      render: (value) => (
        value ? (
          <div className="flex items-center gap-2">
            <Barcode className="h-3 w-3 text-muted-foreground" />
            <span className="bg-muted px-2 py-1 rounded text-xs border font-mono">
              {value as string}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground italic text-xs">No SKU</span>
        )
      )
    },
    {
      id: 'category',
      key: 'category',
      label: 'Category',
      primary: true,
      sortable: true,
      filterable: true,
      searchable: true,
      render: (value) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {value as string}
        </Badge>
      )
    },
    {
      id: 'current_quantity',
      key: 'current_quantity',
      label: 'Stock',
      primary: true,
      sortable: true,
      align: 'right',
      width: '100px',
      render: (value, item) => (
        <div className="flex items-center justify-end gap-2">
          <span className={`font-semibold ${
            item.current_quantity === 0 ? 'text-red-600 dark:text-red-400' :
            item.current_quantity <= item.minimum_threshold ? 'text-orange-600 dark:text-orange-400' :
            'text-green-600 dark:text-green-400'
          }`}>
            {value as number}
          </span>
          <Badge variant="secondary" className="text-xs">
            {item.unit_of_measurement}
          </Badge>
        </div>
      )
    },
    {
      id: 'status',
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      hideOnMobile: true,
      render: (_, item) => {
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
      id: 'unit_cost',
      key: 'unit_cost',
      label: 'Unit Cost',
      sortable: true,
      align: 'right',
      hideOnMobile: true,
      width: '100px',
      render: (value) => (
        <div className="flex items-center justify-end gap-1">
          <DollarSign className="h-3 w-3 text-muted-foreground" />
          <span className="text-foreground font-medium">${(value as number).toFixed(2)}</span>
        </div>
      )
    },
    {
      id: 'unit_price',
      key: 'unit_price',
      label: 'Unit Price',
      sortable: true,
      align: 'right',
      hideOnMobile: true,
      width: '100px',
      render: (value) => (
        <div className="flex items-center justify-end gap-1">
          <ShoppingCart className="h-3 w-3 text-muted-foreground" />
          <span className="text-foreground font-medium">${(value as number).toFixed(2)}</span>
        </div>
      )
    },
    {
      id: 'location',
      key: 'location',
      label: 'Location',
      searchable: true,
      filterable: true,
      hideOnMobile: true,
      render: (value) => (
        value ? (
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="text-foreground">{value as string}</span>
          </div>
        ) : (
          <span className="text-muted-foreground italic text-sm">No location</span>
        )
      )
    },
    {
      id: 'actions',
      key: 'id',
      label: 'Actions',
      align: 'center',
      sticky: true,
      width: '120px',
      render: (_, item) => (
        <div className="flex items-center justify-center gap-1">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEdit(item)}
            className="h-8 w-8 p-0"
            title="Edit Item"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleQRCode(item)}
            className="h-8 w-8 p-0"
            title="View QR Code"
          >
            <QrCode className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                title="Delete Item"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Confirm deletion</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
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

  // Expanded row content for mobile and additional details
  const renderExpanded = (item: InventoryItem) => (
    <div className="space-y-4 pt-2">
      {/* Basic Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* SKU & Barcode */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase font-medium">SKU & Barcode</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Barcode className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm text-foreground">
                {item.sku ? (
                  <span className="bg-muted px-2 py-1 rounded text-xs border font-mono">
                    {item.sku}
                  </span>
                ) : (
                  <span className="text-muted-foreground italic">No SKU</span>
                )}
              </span>
            </div>
            {item.barcode && (
              <div className="text-xs text-muted-foreground">
                Barcode: {item.barcode}
              </div>
            )}
          </div>
        </div>

        {/* Stock Details */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase font-medium">Stock Details</div>
          <div className="space-y-1">
            <div className="text-sm">
              <span className="text-muted-foreground">Current: </span>
              <span className={`font-semibold ${
                item.current_quantity === 0 ? 'text-red-600 dark:text-red-400' :
                item.current_quantity <= item.minimum_threshold ? 'text-orange-600 dark:text-orange-400' :
                'text-green-600 dark:text-green-400'
              }`}>
                {item.current_quantity} {item.unit_of_measurement}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Min: {item.minimum_threshold} {item.unit_of_measurement}
            </div>
            {item.maximum_capacity && (
              <div className="text-sm text-muted-foreground">
                Max: {item.maximum_capacity} {item.unit_of_measurement}
              </div>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase font-medium">Pricing</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Cost:</span>
              <span className="text-foreground font-medium">${item.unit_cost.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ShoppingCart className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Price:</span>
              <span className="text-foreground font-medium">${item.unit_price.toFixed(2)}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Value: ${(item.current_quantity * item.unit_cost).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Description & Location */}
      {(item.description || item.location || item.supplier) && (
        <div className="border-t border-border pt-4 space-y-3">
          {item.description && (
            <div>
              <div className="text-xs text-muted-foreground uppercase font-medium mb-1">Description</div>
              <div className="text-sm text-foreground p-3 bg-muted/30 rounded-lg">
                {item.description}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {item.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Location</div>
                  <div className="text-sm text-foreground">{item.location}</div>
                </div>
              </div>
            )}
            
            {item.supplier && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase">Supplier</div>
                  <div className="text-sm text-foreground">{item.supplier}</div>
                  {item.supplier_contact && (
                    <div className="text-xs text-muted-foreground">{item.supplier_contact}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile action buttons */}
      <div className="md:hidden flex flex-col gap-2 pt-3 border-t border-border">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEdit(item)}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Item
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleQRCode(item)}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <QrCode className="h-4 w-4" />
            QR Code
          </Button>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="sm"
              className="w-full flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Item
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Confirm deletion</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
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
    </div>
  );

  return (
    <>
      <EnhancedTable
        data={items}
        columns={columns}
        keyExtractor={(item) => item.id}
        title={title}
        description={description}
        loading={loading}
        searchable={true}
        filterable={true}
        sortable={true}
        exportable={true}
        exportService={{
          onExport: handleExport,
          isExporting
        }}
        renderExpanded={renderExpanded}
        emptyState={{
          title: "No inventory items found",
          description: "Start by adding your first inventory item to track your stock.",
          icon: <Package className="h-8 w-8 text-muted-foreground" />,
        }}
        className="w-full"
        striped={true}
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

export default InventoryTableEnhanced;