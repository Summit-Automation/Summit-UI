'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
    key: keyof T | string;
    label: string;
    render?: (value: unknown, item: T) => React.ReactNode;
    sortable?: boolean;
    className?: string;
    headerClassName?: string;
}

interface SimpleTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string;
    className?: string;
    emptyMessage?: string;
    striped?: boolean;
    compact?: boolean;
    hoverable?: boolean;
}

export function SimpleTable<T>({
    data,
    columns,
    keyExtractor,
    className,
    emptyMessage = "No data available",
    striped = false,
    compact = false,
    hoverable = true
}: SimpleTableProps<T>) {
    const [sortField, setSortField] = React.useState<string | null>(null);
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

    const handleSort = React.useCallback((column: Column<T>) => {
        if (!column.sortable) return;
        
        const fieldKey = String(column.key);
        if (sortField === fieldKey) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(fieldKey);
            setSortDirection('asc');
        }
    }, [sortField]);

    const getValue = React.useCallback((item: T, column: Column<T>): unknown => {
        if (typeof column.key === 'string' && column.key.includes('.')) {
            return column.key.split('.').reduce((obj: Record<string, unknown>, key: string) => {
                return obj?.[key] as Record<string, unknown>;
            }, item as Record<string, unknown>);
        }
        return item[column.key as keyof T];
    }, []);

    const sortedData = React.useMemo(() => {
        if (!sortField) return data;
        
        const column = columns.find(col => String(col.key) === sortField);
        if (!column) return data;

        return [...data].sort((a, b) => {
            const aValue = getValue(a, column);
            const bValue = getValue(b, column);
            
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const comparison = aValue.localeCompare(bValue);
                return sortDirection === 'asc' ? comparison : -comparison;
            }
            
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }
            
            return 0;
        });
    }, [data, sortField, sortDirection, columns, getValue]);

    if (data.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-muted-foreground text-lg font-medium mb-2">{emptyMessage}</div>
                <div className="text-muted-foreground/70 text-sm">Start by adding some data to see it here.</div>
            </div>
        );
    }

    return (
        <div className={cn("w-full overflow-hidden border border-border rounded-lg bg-card", className)}>
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full table-enhanced">
                    <thead className="bg-muted/50">
                        <tr className="border-b border-border">
                            {columns.map((column, index) => (
                                <th 
                                    key={index} 
                                    className={cn(
                                        "text-left font-medium text-muted-foreground text-sm",
                                        compact ? "px-3 py-2" : "px-4 py-3",
                                        column.sortable && "cursor-pointer hover:text-foreground transition-colors select-none",
                                        column.headerClassName
                                    )}
                                    onClick={() => handleSort(column)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{column.label}</span>
                                        {column.sortable && sortField === String(column.key) && (
                                            <div className="text-primary icon-interactive">
                                                {sortDirection === 'asc' ? (
                                                    <ChevronUp className="h-3 w-3" />
                                                ) : (
                                                    <ChevronDown className="h-3 w-3" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((item, itemIndex) => {
                            const key = keyExtractor(item);
                            
                            return (
                                <tr 
                                    key={key}
                                    className={cn(
                                        "border-b border-border transition-colors duration-150",
                                        hoverable && "hover:bg-muted/50 table-row-interactive",
                                        striped && itemIndex % 2 === 0 && "bg-muted/20",
                                        "data-appear"
                                    )}
                                >
                                    {columns.map((column, colIndex) => (
                                        <td 
                                            key={colIndex} 
                                            className={cn(
                                                "text-foreground",
                                                compact ? "px-3 py-2" : "px-4 py-3",
                                                column.className
                                            )}
                                        >
                                            {column.render 
                                                ? column.render(getValue(item, column), item)
                                                : String(getValue(item, column) || '')
                                            }
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}