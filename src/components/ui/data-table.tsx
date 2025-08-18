'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Column<T> {
    key: keyof T | string;
    label: string;
    render?: (value: unknown, item: T) => React.ReactNode;
    hideOnMobile?: boolean;
    primary?: boolean;
    sortable?: boolean;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    renderExpanded?: (item: T) => React.ReactNode;
    keyExtractor: (item: T) => string;
    className?: string;
    emptyMessage?: string;
    striped?: boolean;
    compact?: boolean;
}

export function DataTable<T>({
    data,
    columns,
    renderExpanded,
    keyExtractor,
    className,
    emptyMessage = "No data available",
    striped = false,
    compact = false
}: DataTableProps<T>) {
    const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());
    const [sortField, setSortField] = React.useState<string | null>(null);
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

    const toggleExpanded = React.useCallback((key: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    }, []);

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
        <div className={cn("w-full", className)}>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-hidden border border-border rounded-lg bg-card">
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
                                            column.className
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
                                {renderExpanded && <th className="w-12"></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((item, itemIndex) => {
                                const key = keyExtractor(item);
                                const isExpanded = expandedItems.has(key);
                                
                                return (
                                    <React.Fragment key={key}>
                                        <tr 
                                            className={cn(
                                                "border-b border-border transition-colors duration-150",
                                                "hover:bg-muted/50 table-row-interactive",
                                                striped && itemIndex % 2 === 0 && "bg-muted/20",
                                                renderExpanded && "cursor-pointer",
                                                "data-appear"
                                            )}
                                            onClick={renderExpanded ? () => toggleExpanded(key) : undefined}
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
                                            {renderExpanded && (
                                                <td className={compact ? "px-3 py-2" : "px-4 py-3"}>
                                                    <div className="flex justify-center text-muted-foreground icon-interactive">
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                        {isExpanded && renderExpanded && (
                                            <tr>
                                                <td colSpan={columns.length + 1} className="p-0">
                                                    <div className="bg-muted/30 border-t border-border data-appear">
                                                        <div className={compact ? "p-3" : "p-4"}>
                                                            {renderExpanded(item)}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {sortedData.map((item) => {
                    const key = keyExtractor(item);
                    const isExpanded = expandedItems.has(key);
                    const primaryColumns = columns.filter(col => col.primary && !col.hideOnMobile);
                    const secondaryColumns = columns.filter(col => !col.primary && !col.hideOnMobile);

                    return (
                        <Card key={key} className="overflow-hidden card-enhanced data-appear">
                            <CardContent className={compact ? "p-3" : "p-4"}>
                                {/* Primary info */}
                                <div className="space-y-2">
                                    {primaryColumns.map((column, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                                            <span className="text-sm font-medium text-muted-foreground flex-shrink-0">
                                                {column.label}:
                                            </span>
                                            <div className="text-sm text-foreground min-w-0 flex-1 break-words">
                                                {column.render 
                                                    ? column.render(getValue(item, column), item)
                                                    : (
                                                        <span className="break-words">
                                                            {String(getValue(item, column) || '')}
                                                        </span>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Expandable section */}
                                {(secondaryColumns.length > 0 || renderExpanded) && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleExpanded(key)}
                                            className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground btn-feedback"
                                        >
                                            {isExpanded ? 'Show Less' : 'Show More'}
                                            <div className="ml-1 icon-interactive">
                                                {isExpanded ? (
                                                    <ChevronUp className="h-3 w-3" />
                                                ) : (
                                                    <ChevronDown className="h-3 w-3" />
                                                )}
                                            </div>
                                        </Button>

                                        {isExpanded && (
                                            <div className="mt-3 pt-3 border-t border-border space-y-2 data-appear">
                                                {secondaryColumns.map((column, index) => (
                                                    <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                                                        <span className="text-xs font-medium text-muted-foreground flex-shrink-0">
                                                            {column.label}:
                                                        </span>
                                                        <div className="text-xs text-foreground min-w-0 flex-1 break-words">
                                                            {column.render 
                                                                ? column.render(getValue(item, column), item)
                                                                : (
                                                                    <span className="break-words">
                                                                        {String(getValue(item, column) || '')}
                                                                    </span>
                                                                )
                                                            }
                                                        </div>
                                                    </div>
                                                ))}
                                                {renderExpanded && (
                                                    <div className="mt-3 pt-3 border-t border-border">
                                                        {renderExpanded(item)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}