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
}

interface MobileTableProps<T> {
    data: T[];
    columns: Column<T>[];
    renderExpanded?: (item: T) => React.ReactNode;
    keyExtractor: (item: T) => string;
    className?: string;
    emptyMessage?: string;
}

export function MobileTable<T>({
    data,
    columns,
    renderExpanded,
    keyExtractor,
    className,
    emptyMessage = "No data available"
}: MobileTableProps<T>) {
    const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

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

    const getValue = React.useCallback((item: T, column: Column<T>): unknown => {
        if (typeof column.key === 'string' && column.key.includes('.')) {
            return column.key.split('.').reduce((obj: Record<string, unknown>, key: string) => {
                return obj?.[key] as Record<string, unknown>;
            }, item as Record<string, unknown>);
        }
        return item[column.key as keyof T];
    }, []);

    if (data.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400 card-enhanced p-8 rounded-lg">
                <div className="text-lg font-medium mb-2">{emptyMessage}</div>
                <div className="text-sm text-slate-500">Start by adding some data to see it here.</div>
            </div>
        );
    }

    return (
        <div className={cn("w-full", className)}>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
                <table className="table-enhanced w-full">
                    <thead>
                        <tr className="border-b border-slate-700">
                            {columns.map((column, index) => (
                                <th key={index} className="text-left py-3 px-4 font-medium text-slate-300 text-sm">
                                    {column.label}
                                </th>
                            ))}
                            {renderExpanded && <th className="w-12"></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => {
                            const key = keyExtractor(item);
                            const isExpanded = expandedItems.has(key);
                            
                            return (
                                <React.Fragment key={key}>
                                    <tr 
                                        className="table-row-interactive border-b border-slate-800 hover:bg-slate-900/50 transition-colors cursor-pointer data-appear"
                                        onClick={renderExpanded ? () => toggleExpanded(key) : undefined}
                                    >
                                        {columns.map((column, colIndex) => (
                                            <td key={colIndex} className="py-3 px-4 text-slate-200">
                                                {column.render 
                                                    ? column.render(getValue(item, column), item)
                                                    : String(getValue(item, column) || '')
                                                }
                                            </td>
                                        ))}
                                        {renderExpanded && (
                                            <td className="py-3 px-4">
                                                <div className="icon-interactive">
                                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                    {isExpanded && renderExpanded && (
                                        <tr>
                                            <td colSpan={columns.length + 1} className="p-0">
                                                <div className="bg-slate-900/30 p-4 border-b border-slate-800 data-appear">
                                                    {renderExpanded(item)}
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

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {data.map((item) => {
                    const key = keyExtractor(item);
                    const isExpanded = expandedItems.has(key);
                    const primaryColumns = columns.filter(col => col.primary && !col.hideOnMobile);
                    const secondaryColumns = columns.filter(col => !col.primary && !col.hideOnMobile);

                    return (
                        <Card key={key} className="card-enhanced data-appear">
                            <CardContent className="p-4">
                                {/* Primary info */}
                                <div className="space-y-2">
                                    {primaryColumns.map((column, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                                            <span className="text-sm font-medium text-slate-300 flex-shrink-0">
                                                {column.label}:
                                            </span>
                                            <div className="text-sm text-slate-100 min-w-0 flex-1 break-words">
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
                                            className="w-full mt-3 text-xs text-slate-400 btn-feedback hover:bg-slate-800"
                                        >
                                            {isExpanded ? 'Show Less' : 'Show More'}
                                            <div className="icon-interactive ml-1">
                                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                            </div>
                                        </Button>

                                        {isExpanded && (
                                            <div className="mt-3 pt-3 border-t border-slate-700 space-y-2 data-appear">
                                                {secondaryColumns.map((column, index) => (
                                                    <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                                                        <span className="text-xs font-medium text-slate-400 flex-shrink-0">
                                                            {column.label}:
                                                        </span>
                                                        <div className="text-xs text-slate-200 min-w-0 flex-1 break-words">
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
                                                    <div className="mt-3 pt-3 border-t border-slate-700">
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