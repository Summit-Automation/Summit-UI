'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import {
    Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { createTransaction } from '@/app/lib/services/bookkeeperServices/createTransaction';
import { processReceipt as processReceiptSecure } from '@/app/lib/services/receiptServices/processReceipt';
import { Customer } from '@/types/customer';
import { Camera, Upload, Brain, CheckCircle, AlertCircle, FileImage, Loader2 } from 'lucide-react';

type ReceiptData = {
    businessName: string;
    itemNames: string;
    itemQuantity: string;
    itemCosts: string;
    grossTotal: number;
};

type FormValues = {
    category: string;
    description: string;
    customer_id: string;
    notes: string;
};

export default function AIReceiptUploadModal({
    customers, onSuccess,
}: {
    customers: Customer[];
    onSuccess?: () => void;
}) {
    const [open, setOpen] = React.useState(false);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [receiptData, setReceiptData] = React.useState<ReceiptData | null>(null);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const cameraInputRef = React.useRef<HTMLInputElement>(null);

    const form = useForm<FormValues>({
        defaultValues: {
            category: '',
            description: '',
            customer_id: '',
            notes: '',
        },
        mode: 'onBlur',
    });

    const validateFile = (file: File): boolean => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!allowedTypes.includes(file.type)) {
            setError('Please select a valid image file (JPEG, PNG, or WebP)');
            return false;
        }
        
        if (file.size > maxSize) {
            setError('File size must be less than 5MB');
            return false;
        }
        
        return true;
    };

    const handleFileSelect = (file: File) => {
        if (!validateFile(file)) {
            return;
        }
        
        setSelectedFile(file);
        setReceiptData(null);
        setError(null);
        
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const processReceipt = async () => {
        if (!selectedFile) {
            setError('Please select a receipt image first');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // Convert file to base64
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    const base64Data = result.split(',')[1];
                    resolve(base64Data);
                };
                reader.onerror = reject;
                reader.readAsDataURL(selectedFile);
            });

            // SECURITY: Call secure server action instead of client-side Flowise API
            const response = await processReceiptSecure({
                file: {
                    name: selectedFile.name,
                    type: selectedFile.type,
                    size: selectedFile.size,
                    data: base64
                }
            });

            if (!response.success) {
                throw new Error(response.message);
            }

            if (!response.data) {
                throw new Error('No receipt data received');
            }

            // Convert server response to component format
            const parsedData: ReceiptData = {
                businessName: response.data.businessName,
                itemNames: response.data.items.map(item => item.description).join(', ') || 'Various items',
                itemQuantity: response.data.items.map(() => '1').join(', '), // Default quantities
                itemCosts: response.data.items.map(item => item.amount).join(', ') || '',
                grossTotal: parseFloat(response.data.total) || 0
            };

            // Create detailed description with quantities
            const itemsArray = parsedData.itemNames.split(',').map(item => item.trim());
            const quantitiesArray = parsedData.itemQuantity ? parsedData.itemQuantity.split(',').map(qty => qty.trim()) : [];
            const costsArray = parsedData.itemCosts ? parsedData.itemCosts.split(',').map(cost => cost.trim()) : [];
            
            let detailedDescription = `Receipt from ${parsedData.businessName}\n`;
            detailedDescription += `Total: $${parsedData.grossTotal.toFixed(2)}\n\n`;
            detailedDescription += `Items purchased:\n`;
            
            itemsArray.forEach((item, index) => {
                const quantity = quantitiesArray[index] || '1';
                const cost = costsArray[index] || '';
                
                detailedDescription += `• ${item} (Qty: ${quantity})`;
                
                if (cost) {
                    const cleanCost = cost.replace('$', '');
                    detailedDescription += ` - $${cleanCost}`;
                }
                detailedDescription += '\n';
            });

            // Intelligent category suggestion
            let suggestedCategory = 'General Expense';
            const itemsLower = parsedData.itemNames.toLowerCase();
            
            if (itemsLower.includes('cable') || itemsLower.includes('remote') || itemsLower.includes('electronic') || itemsLower.includes('computer') || itemsLower.includes('hdmi')) {
                suggestedCategory = 'Equipment & Electronics';
            } else if (itemsLower.includes('office') || itemsLower.includes('paper') || itemsLower.includes('pen') || itemsLower.includes('supplies')) {
                suggestedCategory = 'Office Supplies';
            } else if (itemsLower.includes('food') || itemsLower.includes('lunch') || itemsLower.includes('coffee') || itemsLower.includes('meal')) {
                suggestedCategory = 'Meals & Entertainment';
            } else if (itemsLower.includes('gas') || itemsLower.includes('fuel') || itemsLower.includes('parking')) {
                suggestedCategory = 'Travel & Transportation';
            } else if (parsedData.businessName.toLowerCase().includes('walmart') || parsedData.businessName.toLowerCase().includes('target') || parsedData.businessName.toLowerCase().includes('costco')) {
                suggestedCategory = 'General Supplies';
            }

            setReceiptData(parsedData);
            form.setValue('category', suggestedCategory);
            form.setValue('description', detailedDescription.trim());
            
        } catch (err) {
            console.error('Error processing receipt:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to process receipt';
            setError(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const onSubmit = async (values: FormValues) => {
        if (!receiptData) {
            form.setError('category', { message: 'Please process the receipt first' });
            return;
        }

        setIsSubmitting(true);
        
        try {
            const success = await createTransaction({
                type: 'expense',
                category: values.category,
                description: values.description,
                amount: receiptData.grossTotal.toString(),
                customer_id: values.customer_id || null,
                customer_name: customers.find((c) => c.id === values.customer_id)?.full_name || null,
                interaction_id: null,
                interaction_title: null,
                interaction_outcome: null,
            });

            if (success) {
                form.reset();
                setSelectedFile(null);
                setPreviewUrl(null);
                setReceiptData(null);
                setError(null);
                setOpen(false);
                onSuccess?.();
            } else {
                form.setError('category', { message: 'Failed to create transaction' });
            }
        } catch (err) {
            console.error('Failed to create transaction:', err);
            form.setError('category', { message: 'Failed to create transaction' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset form when modal closes
    React.useEffect(() => {
        if (!open) {
            form.reset();
            setSelectedFile(null);
            setPreviewUrl(null);
            setReceiptData(null);
            setError(null);
            setIsProcessing(false);
            setIsSubmitting(false);
        }
    }, [open, form]);

    // Cleanup preview URL
    React.useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                >
                    <Brain className="h-4 w-4 mr-2" />
                    AI Receipt Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-400" />
                        AI Receipt Scanner
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Take a photo or upload an image of your receipt. Our AI will extract the transaction details automatically.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* File Upload Section */}
                    {!selectedFile && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-slate-300">
                                <FileImage className="h-4 w-4" />
                                <span className="font-medium">Upload Receipt</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => cameraInputRef.current?.click()}
                                    className="h-24 bg-slate-800/30 border-slate-600 hover:bg-slate-700/50 border-dashed"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Camera className="h-6 w-6 text-blue-400" />
                                        <span className="text-sm text-slate-300">Take Photo</span>
                                    </div>
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-24 bg-slate-800/30 border-slate-600 hover:bg-slate-700/50 border-dashed"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <Upload className="h-6 w-6 text-green-400" />
                                        <span className="text-sm text-slate-300">Upload File</span>
                                    </div>
                                </Button>
                            </div>

                            <input
                                ref={cameraInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleCameraCapture}
                                className="hidden"
                            />
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>
                    )}

                    {/* Preview and Process Section */}
                    {selectedFile && (
                        <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <FileImage className="h-4 w-4" />
                                    <span className="font-medium">Receipt Preview</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreviewUrl(null);
                                        setReceiptData(null);
                                        setError(null);
                                    }}
                                    className="text-slate-400 hover:text-white"
                                >
                                    Clear
                                </Button>
                            </div>
                            
                            {previewUrl && (
                                <div className="flex justify-center">
                                    <Image 
                                        src={previewUrl} 
                                        alt="Receipt preview"
                                        width={400}
                                        height={300}
                                        className="max-w-full max-h-48 object-contain rounded border border-slate-600"
                                    />
                                </div>
                            )}
                            
                            <div className="text-sm text-slate-400">
                                <span className="font-medium">File:</span> {selectedFile.name}
                            </div>

                            <div className="flex justify-center">
                                <Button
                                    type="button"
                                    onClick={processReceipt}
                                    disabled={isProcessing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Processing...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Brain className="h-4 w-4" />
                                            Process Receipt
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="p-4 rounded-lg border bg-red-900/20 border-red-700 text-red-100">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4 text-red-400" />
                                <span className="font-medium">Processing Failed</span>
                            </div>
                            <div className="text-sm text-red-300 whitespace-pre-wrap">{error}</div>
                        </div>
                    )}

                    {/* AI Response Display */}
                    {receiptData && (
                        <div className="p-4 rounded-lg border bg-green-900/20 border-green-700 text-green-100">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="h-4 w-4 text-green-400" />
                                <span className="font-medium">Receipt Processed Successfully</span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Business:</span>
                                    <span className="font-medium text-green-300">{receiptData.businessName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total Amount:</span>
                                    <Badge variant="outline" className="bg-green-800/20 text-green-300 border-green-600">
                                        ${receiptData.grossTotal.toFixed(2)}
                                    </Badge>
                                </div>
                                <div className="mt-2">
                                    <div className="text-xs text-green-400 mb-1">Items & Quantities:</div>
                                    <div className="text-xs text-green-300 bg-green-900/10 p-2 rounded border border-green-800/30">
                                        {receiptData.itemNames}
                                        {receiptData.itemQuantity && (
                                            <div className="mt-1 text-green-400">Qty: {receiptData.itemQuantity}</div>
                                        )}
                                    </div>
                                </div>
                                {receiptData.itemCosts && (
                                    <div className="mt-2">
                                        <div className="text-xs text-green-400 mb-1">Individual Costs:</div>
                                        <div className="text-xs text-green-300 bg-green-900/10 p-2 rounded border border-green-800/30">
                                            ${receiptData.itemCosts}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Transaction Form */}
                    {receiptData && (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border-t border-slate-600 pt-6">
                                <h4 className="text-sm font-medium text-slate-300 mb-4">Transaction Details</h4>
                                
                                <FormField
                                    control={form.control}
                                    name="category"
                                    rules={{ required: "Category is required" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-300">Category *</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field} 
                                                    placeholder="e.g., Office Supplies, Meals, etc." 
                                                    className="bg-slate-800 border-slate-600 text-slate-50"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    rules={{ required: "Description is required" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-300">Description *</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    {...field} 
                                                    placeholder="Transaction description..." 
                                                    className="bg-slate-800 border-slate-600 text-slate-50"
                                                    rows={6}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="customer_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-300">Customer (Optional)</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-50">
                                                        <SelectValue placeholder="Select customer..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-800 border-slate-600">
                                                        {customers.map((c) => (
                                                            <SelectItem 
                                                                key={c.id} 
                                                                value={c.id}
                                                                className="text-slate-50 hover:bg-slate-700 focus:bg-slate-700"
                                                            >
                                                                {c.full_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-300">Additional Notes (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    {...field} 
                                                    placeholder="Any additional notes..." 
                                                    className="bg-slate-800 border-slate-600 text-slate-50"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter className="flex justify-end space-x-2 pt-6">
                                    <DialogClose asChild>
                                        <Button variant="ghost" disabled={isSubmitting}>
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Transaction'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}