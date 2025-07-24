import { InventoryItem } from '@/types/inventory';

export interface ExportOptions {
    format: 'csv' | 'json';
    includeFields: string[];
    filename?: string;
}

export function exportInventoryToCSV(items: InventoryItem[], options?: Partial<ExportOptions>): void {
    const defaultFields = [
        'name',
        'sku',
        'category',
        'current_quantity',
        'minimum_threshold',
        'unit_cost',
        'unit_price',
        'supplier',
        'location',
        'status'
    ];

    const fields = options?.includeFields || defaultFields;
    const filename = options?.filename || `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;

    // Create CSV headers
    const headers = fields.map(field => {
        const fieldMap: Record<string, string> = {
            name: 'Item Name',
            sku: 'SKU',
            category: 'Category',
            subcategory: 'Subcategory',
            current_quantity: 'Current Stock',
            minimum_threshold: 'Min Threshold',
            maximum_capacity: 'Max Capacity',
            unit_of_measurement: 'Unit',
            unit_cost: 'Unit Cost',
            unit_price: 'Unit Price',
            supplier: 'Supplier',
            supplier_contact: 'Supplier Contact',
            location: 'Location',
            status: 'Status',
            description: 'Description',
            notes: 'Notes',
            created_at: 'Created Date'
        };
        return fieldMap[field] || field;
    });

    // Create CSV rows
    const rows = items.map(item => {
        return fields.map(field => {
            let value = (item as unknown as Record<string, unknown>)[field];
            
            // Handle special formatting
            if (field === 'created_at' && value) {
                value = new Date(value as string).toLocaleDateString();
            }
            
            // Escape CSV values
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                value = `"${value.replace(/"/g, '""')}"`;
            }
            
            return value || '';
        });
    });

    // Combine headers and rows
    const csvContent = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');

    // Download the file
    downloadFile(csvContent, filename, 'text/csv');
}

export function exportInventoryToJSON(items: InventoryItem[], options?: Partial<ExportOptions>): void {
    const filename = options?.filename || `inventory_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const exportData = {
        exportDate: new Date().toISOString(),
        totalItems: items.length,
        items: items
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile(jsonContent, filename, 'application/json');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function generateInventoryReport(items: InventoryItem[]): string {
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.current_quantity * (item.unit_cost || 0)), 0);
    const lowStockItems = items.filter(item => item.current_quantity <= item.minimum_threshold);
    const outOfStockItems = items.filter(item => item.current_quantity === 0);
    
    const categoryBreakdown = items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const report = `
INVENTORY REPORT
Generated: ${new Date().toLocaleString()}

SUMMARY
-------
Total Items: ${totalItems}
Total Value: $${totalValue.toFixed(2)}
Low Stock Items: ${lowStockItems.length}
Out of Stock Items: ${outOfStockItems.length}

CATEGORY BREAKDOWN
------------------
${Object.entries(categoryBreakdown)
    .map(([category, count]) => `${category}: ${count} items`)
    .join('\n')}

${lowStockItems.length > 0 ? `
LOW STOCK ALERTS
----------------
${lowStockItems.map(item => 
    `${item.name} - Current: ${item.current_quantity}, Min: ${item.minimum_threshold}`
).join('\n')}
` : ''}

${outOfStockItems.length > 0 ? `
OUT OF STOCK ITEMS
------------------
${outOfStockItems.map(item => item.name).join('\n')}
` : ''}
    `.trim();

    return report;
}