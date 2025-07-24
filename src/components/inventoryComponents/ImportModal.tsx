'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { CreateInventoryItemRequest } from '@/types/inventory';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (items: CreateInventoryItemRequest[]) => Promise<void>;
}

interface ImportPreview {
    items: CreateInventoryItemRequest[];
    errors: string[];
    warnings: string[];
}

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [preview, setPreview] = useState<ImportPreview | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            processFile(selectedFile);
        }
    };

    const processFile = async (file: File) => {
        setIsProcessing(true);
        setPreview(null);

        try {
            const content = await readFileContent(file);
            const parsed = parseFileContent(content, file.type);
            setPreview(parsed);
        } catch (error) {
            setPreview({
                items: [],
                errors: [`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`],
                warnings: []
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const readFileContent = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    };

    const parseFileContent = (content: string, fileType: string): ImportPreview => {
        const errors: string[] = [];
        const warnings: string[] = [];
        const items: CreateInventoryItemRequest[] = [];

        try {
            if (fileType === 'application/json' || content.trim().startsWith('{')) {
                // Parse JSON
                const data = JSON.parse(content);
                const itemsArray = Array.isArray(data) ? data : data.items || [];
                
                itemsArray.forEach((item: Record<string, unknown>, index: number) => {
                    const validatedItem = validateAndTransformItem(item, index, errors, warnings);
                    if (validatedItem) {
                        items.push(validatedItem);
                    }
                });
            } else {
                // Parse CSV
                const lines = content.split('\n').filter(line => line.trim());
                if (lines.length < 2) {
                    errors.push('CSV file must have at least a header row and one data row');
                    return { items, errors, warnings };
                }

                const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                const requiredFields = ['name', 'category'];
                
                // Check for required fields
                const missingFields = requiredFields.filter(field => !headers.includes(field));
                if (missingFields.length > 0) {
                    errors.push(`Missing required columns: ${missingFields.join(', ')}`);
                    return { items, errors, warnings };
                }

                for (let i = 1; i < lines.length; i++) {
                    const values = parseCSVLine(lines[i]);
                    if (values.length !== headers.length) {
                        warnings.push(`Row ${i + 1}: Column count mismatch, skipping`);
                        continue;
                    }

                    const rowData: Record<string, string> = {};
                    headers.forEach((header, index) => {
                        rowData[header] = values[index]?.trim() || '';
                    });

                    const validatedItem = validateAndTransformItem(rowData, i, errors, warnings);
                    if (validatedItem) {
                        items.push(validatedItem);
                    }
                }
            }
        } catch (error) {
            errors.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        return { items, errors, warnings };
    };

    const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    };

    const validateAndTransformItem = (
        item: Record<string, unknown>, 
        index: number, 
        errors: string[], 
        warnings: string[]
    ): CreateInventoryItemRequest | null => {
        const rowNum = index + 1;

        // Required fields
        if (!item.name || typeof item.name !== 'string' || !item.name.trim()) {
            errors.push(`Row ${rowNum}: Name is required`);
            return null;
        }

        if (!item.category || typeof item.category !== 'string' || !item.category.trim()) {
            errors.push(`Row ${rowNum}: Category is required`);
            return null;
        }

        // Transform and validate
        const transformedItem: CreateInventoryItemRequest = {
            name: String(item.name || '').trim(),
            category: String(item.category || '').trim(),
            description: String(item.description || ''),
            sku: String(item.sku || ''),
            barcode: String(item.barcode || ''),
            subcategory: String(item.subcategory || ''),
            location: String(item.location || ''),
            current_quantity: parseInt(String(item.current_quantity || '0')) || 0,
            minimum_threshold: parseInt(String(item.minimum_threshold || '0')) || 0,
            maximum_capacity: item.maximum_capacity ? parseInt(String(item.maximum_capacity)) : undefined,
            unit_of_measurement: String(item.unit_of_measurement || 'units'),
            unit_cost: parseFloat(String(item.unit_cost || '0')) || 0,
            unit_price: parseFloat(String(item.unit_price || '0')) || 0,
            supplier: String(item.supplier || ''),
            supplier_contact: String(item.supplier_contact || ''),
            notes: String(item.notes || ''),
            auto_reorder_enabled: Boolean(item.auto_reorder_enabled),
            reorder_point: item.reorder_point ? parseInt(String(item.reorder_point)) : undefined,
            reorder_quantity: item.reorder_quantity ? parseInt(String(item.reorder_quantity)) : undefined,
        };

        // Validate numeric fields
        if (transformedItem.current_quantity < 0) {
            warnings.push(`Row ${rowNum}: Current quantity cannot be negative, setting to 0`);
            transformedItem.current_quantity = 0;
        }

        if (transformedItem.minimum_threshold < 0) {
            warnings.push(`Row ${rowNum}: Minimum threshold cannot be negative, setting to 0`);
            transformedItem.minimum_threshold = 0;
        }

        return transformedItem;
    };

    const handleImport = async () => {
        if (!preview || preview.items.length === 0) return;

        setIsProcessing(true);
        try {
            await onImport(preview.items);
            handleClose();
        } catch (error) {
            console.error('Import failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose();
    };

    const downloadTemplate = () => {
        const csvTemplate = `name,category,description,sku,current_quantity,minimum_threshold,unit_cost,unit_price,supplier,location
"Sample Item 1","office-supplies","Sample description","SKU001",100,10,5.99,9.99,"Sample Supplier","Warehouse A"
"Sample Item 2","equipment","Another sample","SKU002",50,5,150.00,250.00,"Another Supplier","Storage Room B"`;
        
        const blob = new Blob([csvTemplate], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'inventory_import_template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-gradient">
                        <Upload className="h-5 w-5 text-blue-400" />
                        Import Inventory Items
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Upload a CSV or JSON file to import multiple inventory items at once
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* File Upload */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-slate-300">Select File</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={downloadTemplate}
                                className="border-blue-600/50 text-blue-400 hover:bg-blue-500/10"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download Template
                            </Button>
                        </div>
                        
                        <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.json"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <div className="flex flex-col items-center gap-2">
                                    <FileText className="h-8 w-8 text-slate-400" />
                                    <div className="text-slate-300">
                                        {file ? file.name : 'Click to select a CSV or JSON file'}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Supported formats: .csv, .json
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Preview */}
                    {isProcessing && (
                        <div className="text-center py-4">
                            <div className="text-slate-400">Processing file...</div>
                        </div>
                    )}

                    {preview && (
                        <div className="space-y-4">
                            <Separator className="bg-slate-700" />
                            
                            {/* Errors */}
                            {preview.errors.length > 0 && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Errors ({preview.errors.length})
                                    </div>
                                    <ul className="text-sm text-red-300 space-y-1">
                                        {preview.errors.map((error, index) => (
                                            <li key={index}>• {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Warnings */}
                            {preview.warnings.length > 0 && (
                                <div className="bg-orange-500/10 border border-orange-500/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-orange-400 font-medium mb-2">
                                        <AlertCircle className="h-4 w-4" />
                                        Warnings ({preview.warnings.length})
                                    </div>
                                    <ul className="text-sm text-orange-300 space-y-1">
                                        {preview.warnings.map((warning, index) => (
                                            <li key={index}>• {warning}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Success */}
                            {preview.items.length > 0 && (
                                <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-green-400 font-medium mb-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Ready to Import ({preview.items.length} items)
                                    </div>
                                    <div className="text-sm text-green-300">
                                        {preview.items.length} items will be imported successfully
                                    </div>
                                    
                                    {/* Preview first few items */}
                                    <div className="mt-3 text-xs text-slate-400">
                                        Preview:
                                        <ul className="mt-1 space-y-1">
                                            {preview.items.slice(0, 3).map((item, index) => (
                                                <li key={index}>
                                                    • {item.name} ({item.category})
                                                </li>
                                            ))}
                                            {preview.items.length > 3 && (
                                                <li>• ...and {preview.items.length - 3} more items</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

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
                            type="button"
                            onClick={handleImport}
                            disabled={!preview || preview.items.length === 0 || preview.errors.length > 0 || isProcessing}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isProcessing ? 'Importing...' : `Import ${preview?.items.length || 0} Items`}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}