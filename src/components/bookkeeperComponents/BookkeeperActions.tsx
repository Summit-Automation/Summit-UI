'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CreateTransactionClientWrapper from '@/components/bookkeeperComponents/bookkeeperActions/CreateTransactionClientWrapper';
import AIReceiptUploadModal from '@/components/bookkeeperComponents/AIReceiptUploadModal';
import { getCustomers } from '@/app/lib/services/crmServices/customer/getCustomers';
import { getTransactions } from '@/app/lib/services/bookkeeperServices/getTransactions';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Download, Upload, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// Simple CSV parser function
function parseCSV(text: string): Array<Record<string, string>> {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1);
    
    return rows.map(row => {
        const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
        const obj: Record<string, string> = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });
        return obj;
    });
}

// Simple CSV generator function
function generateCSV(data: Array<Record<string, string | number>>): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header] || '';
            // Escape commas and quotes
            const escaped = String(value).replace(/"/g, '""');
            return escaped.includes(',') ? `"${escaped}"` : escaped;
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}

export default function BookkeeperActions() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        getCustomers()
            .then(setCustomers)
            .finally(() => setLoading(false));
    }, []);

    const handleExportTransactions = async () => {
        try {
            const transactions = await getTransactions();
            
            if (transactions.length === 0) {
                toast.error('No transactions to export');
                return;
            }

            // Prepare data for CSV export
            const csvData = transactions.map(transaction => ({
                Date: new Date(transaction.timestamp).toLocaleDateString(),
                Type: transaction.type,
                Category: transaction.category,
                Description: transaction.description,
                Amount: parseFloat(transaction.amount).toFixed(2),
                Customer: transaction.customer_name || '',
                Interaction: transaction.interaction_title || '',
                Source: transaction.source,
                'Upload Date': new Date(transaction.timestamp).toISOString()
            }));

            // Convert to CSV
            const csv = generateCSV(csvData);
            
            // Create and download file
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast.success(`Exported ${transactions.length} transactions successfully`);
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export transactions');
        }
    };

    const handleImportCSV = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            toast.error('Please select a CSV file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const data = parseCSV(text);
                
                if (data.length === 0) {
                    toast.error('CSV file is empty or invalid format');
                    return;
                }

                // Validate required columns (case-insensitive)
                const requiredColumns = ['type', 'category', 'description', 'amount'];
                const firstRow = data[0];
                const headers = Object.keys(firstRow).map(h => h.toLowerCase().trim());
                
                const missingColumns = requiredColumns.filter(col => 
                    !headers.some(header => 
                        header === col || 
                        header === col.replace('_', ' ') ||
                        header.replace(/\s+/g, '') === col
                    )
                );

                if (missingColumns.length > 0) {
                    toast.error(`Missing required columns: ${missingColumns.join(', ')}`);
                    return;
                }

                // Validate and process the data
                const validTransactions = data.filter(row => {
                    // Find type and amount fields (case-insensitive)
                    const typeField = Object.keys(row).find(key => 
                        key.toLowerCase().trim() === 'type'
                    );
                    const amountField = Object.keys(row).find(key => 
                        key.toLowerCase().trim() === 'amount'
                    );
                    
                    if (!typeField || !amountField) return false;
                    
                    const type = row[typeField]?.toLowerCase().trim();
                    const amount = row[amountField];
                    
                    return (type === 'income' || type === 'expense') && 
                           !isNaN(parseFloat(amount)) && 
                           parseFloat(amount) > 0;
                });

                if (validTransactions.length === 0) {
                    toast.error('No valid transactions found in CSV. Check that type is "income" or "expense" and amounts are valid numbers.');
                    return;
                }

                const invalidCount = data.length - validTransactions.length;
                
                if (invalidCount > 0) {
                    toast.warning(`Found ${validTransactions.length} valid transactions, ${invalidCount} invalid rows skipped.`);
                } else {
                    toast.success(`Found ${validTransactions.length} valid transactions ready for import.`);
                }
                
                // Here you would implement the actual import logic
                // For each validTransaction, call createTransaction()
                console.log('Valid transactions for import:', validTransactions);
                
            } catch (error) {
                console.error('CSV parsing error:', error);
                toast.error('Failed to parse CSV file. Please check the format.');
            }
        };

        reader.onerror = () => {
            toast.error('Failed to read CSV file');
        };

        reader.readAsText(file);

        // Reset file input
        event.target.value = '';
    };


    return (
        <div className="space-y-4 bookkeeper-actions">
            <h3 className="text-base sm:text-lg font-semibold text-slate-200">Quick Actions</h3>
            
            {/* Primary Actions - Mobile: 1 column, Desktop: 4 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Add Transaction */}
                <CreateTransactionClientWrapper />

                {/* AI Receipt Upload */}
                {loading ? (
                    <div className="h-10 bg-slate-800 border border-slate-600 rounded-lg animate-pulse" />
                ) : (
                    <AIReceiptUploadModal
                        customers={customers}
                        onSuccess={() => router.refresh()}
                    />
                )}

                {/* Import CSV */}
                <Button
                    variant="outline"
                    onClick={handleImportCSV}
                    className="w-full bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-all duration-200 h-10"
                >
                    <Upload className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Import CSV</span>
                </Button>

                {/* Export */}
                <Button
                    variant="outline"
                    onClick={handleExportTransactions}
                    className="w-full bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-all duration-200 h-10"
                >
                    <Download className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Export CSV</span>
                </Button>
            </div>

            {/* Hidden file input for CSV import */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
            />

            {/* AI Feature Note */}
            <div className="flex items-start gap-2 text-xs text-slate-500 mt-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
                <Sparkles className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>AI-powered receipt scanning with automatic transaction creation. CSV import/export for bulk data management.</span>
            </div>
        </div>
    );
}