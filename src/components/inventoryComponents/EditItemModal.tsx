'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Package, DollarSign, AlertTriangle } from 'lucide-react';
import { InventoryItem, UpdateInventoryItemRequest } from '@/types/inventory';

interface EditItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (itemData: UpdateInventoryItemRequest) => Promise<void>;
    item: InventoryItem | null;
}

export default function EditItemModal({ isOpen, onClose, onSubmit, item }: EditItemModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<UpdateInventoryItemRequest>({
        id: '',
        name: '',
        description: '',
        sku: '',
        category: '',
        subcategory: '',
        location: '',
        current_quantity: 0,
        minimum_threshold: 0,
        maximum_capacity: undefined,
        unit_of_measurement: 'units',
        unit_cost: 0,
        unit_price: 0,
        supplier: '',
        supplier_contact: '',
        notes: '',
        auto_reorder_enabled: false,
    });

    // Populate form when item changes
    useEffect(() => {
        if (item) {
            setFormData({
                id: item.id,
                name: item.name,
                description: item.description || '',
                sku: item.sku || '',
                category: item.category,
                subcategory: item.subcategory || '',
                location: item.location || '',
                current_quantity: item.current_quantity,
                minimum_threshold: item.minimum_threshold,
                maximum_capacity: item.maximum_capacity,
                unit_of_measurement: item.unit_of_measurement,
                unit_cost: item.unit_cost,
                unit_price: item.unit_price,
                supplier: item.supplier || '',
                supplier_contact: item.supplier_contact || '',
                notes: item.notes || '',
                auto_reorder_enabled: item.auto_reorder_enabled,
            });
        }
    }, [item]);

    const handleInputChange = (field: keyof UpdateInventoryItemRequest, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Clean up the data before submitting
            const cleanedData = {
                ...formData,
                sku: formData.sku?.trim() || undefined,
                subcategory: formData.subcategory?.trim() || undefined,
                location: formData.location?.trim() || undefined,
                supplier: formData.supplier?.trim() || undefined,
                supplier_contact: formData.supplier_contact?.trim() || undefined,
                notes: formData.notes?.trim() || undefined,
                maximum_capacity: formData.maximum_capacity || undefined,
            };

            await onSubmit(cleanedData);
            handleClose();
        } catch (error) {
            console.error('Error submitting item:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    if (!item) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-gradient">
                        <Package className="h-5 w-5 text-blue-400" />
                        Edit Inventory Item
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Update the details for &quot;{item.name}&quot;
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <Package className="h-4 w-4 text-blue-400" />
                            Basic Information
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label htmlFor="name" className="text-slate-300">Item Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-slate-200"
                                    placeholder="Enter item name"
                                    required
                                />
                            </div>
                            
                            <div className="col-span-2">
                                <Label htmlFor="description" className="text-slate-300">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-slate-200"
                                    placeholder="Describe the item"
                                    rows={2}
                                />
                            </div>
                            
                            <div className="col-span-2">
                                <Label htmlFor="sku" className="text-slate-300">SKU</Label>
                                <Input
                                    id="sku"
                                    value={formData.sku}
                                    onChange={(e) => handleInputChange('sku', e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-slate-200"
                                    placeholder="Stock Keeping Unit"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-slate-700" />

                    {/* Categorization */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <Package className="h-4 w-4 text-green-400" />
                            Categorization
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category" className="text-slate-300">Category *</Label>
                                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
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
                            
                            <div>
                                <Label htmlFor="subcategory" className="text-slate-300">Subcategory</Label>
                                <Input
                                    id="subcategory"
                                    value={formData.subcategory}
                                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-slate-200"
                                    placeholder="Subcategory"
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="location" className="text-slate-300">Location</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-slate-200"
                                    placeholder="Storage location"
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="unit_of_measurement" className="text-slate-300">Unit</Label>
                                <Select value={formData.unit_of_measurement} onValueChange={(value) => handleInputChange('unit_of_measurement', value)}>
                                    <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="units">Units</SelectItem>
                                        <SelectItem value="pieces">Pieces</SelectItem>
                                        <SelectItem value="boxes">Boxes</SelectItem>
                                        <SelectItem value="lbs">Pounds</SelectItem>
                                        <SelectItem value="kg">Kilograms</SelectItem>
                                        <SelectItem value="liters">Liters</SelectItem>
                                        <SelectItem value="gallons">Gallons</SelectItem>
                                        <SelectItem value="meters">Meters</SelectItem>
                                        <SelectItem value="feet">Feet</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-slate-700" />

                    {/* Inventory Tracking */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <AlertTriangle className="h-4 w-4 text-orange-400" />
                            Inventory Tracking
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="current_quantity" className="text-slate-300">Current Stock *</Label>
                                <Input
                                    id="current_quantity"
                                    type="number"
                                    min="0"
                                    value={formData.current_quantity}
                                    onChange={(e) => handleInputChange('current_quantity', parseInt(e.target.value) || 0)}
                                    className="bg-slate-800 border-slate-700 text-slate-200"
                                    required
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="minimum_threshold" className="text-slate-300">Min Threshold *</Label>
                                <Input
                                    id="minimum_threshold"
                                    type="number"
                                    min="0"
                                    value={formData.minimum_threshold}
                                    onChange={(e) => handleInputChange('minimum_threshold', parseInt(e.target.value) || 0)}
                                    className="bg-slate-800 border-slate-700 text-slate-200"
                                    required
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="maximum_capacity" className="text-slate-300">Max Capacity</Label>
                                <Input
                                    id="maximum_capacity"
                                    type="number"
                                    min="0"
                                    value={formData.maximum_capacity || ''}
                                    onChange={(e) => handleInputChange('maximum_capacity', e.target.value ? parseInt(e.target.value) : undefined)}
                                    className="bg-slate-800 border-slate-700 text-slate-200"
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-slate-700" />

                    {/* Financial Information */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                            <DollarSign className="h-4 w-4 text-green-400" />
                            Financial Information
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="unit_cost" className="text-slate-300">Unit Cost</Label>
                                <Input
                                    id="unit_cost"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.unit_cost}
                                    onChange={(e) => handleInputChange('unit_cost', parseFloat(e.target.value) || 0)}
                                    className="bg-slate-800 border-slate-700 text-slate-200"
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="unit_price" className="text-slate-300">Unit Price</Label>
                                <Input
                                    id="unit_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.unit_price}
                                    onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
                                    className="bg-slate-800 border-slate-700 text-slate-200"
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="supplier" className="text-slate-300">Supplier</Label>
                                <Input
                                    id="supplier"
                                    value={formData.supplier}
                                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-slate-200"
                                    placeholder="Supplier name"
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="supplier_contact" className="text-slate-300">Supplier Contact</Label>
                                <Input
                                    id="supplier_contact"
                                    value={formData.supplier_contact}
                                    onChange={(e) => handleInputChange('supplier_contact', e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-slate-200"
                                    placeholder="Phone/email"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label htmlFor="notes" className="text-slate-300">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            className="bg-slate-800 border-slate-700 text-slate-200"
                            placeholder="Additional notes about this item"
                            rows={3}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !formData.name || !formData.category}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isSubmitting ? 'Updating...' : 'Update Item'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}