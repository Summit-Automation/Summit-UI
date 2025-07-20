'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Mobile-optimized table that switches to cards on small screens
interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: unknown, item: T) => React.ReactNode;
  hideOnMobile?: boolean;
  primary?: boolean; // Show prominently on mobile
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

  const toggleExpanded = (key: string) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setExpandedItems(newSet);
  };

  const getValue = (item: T, column: Column<T>): unknown => {
    if (typeof column.key === 'string' && column.key.includes('.')) {
      return column.key.split('.').reduce((obj, key) => obj?.[key], item as unknown);
    }
    return item[column.key as keyof T];
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                {columns.map((column, index) => (
                  <th 
                    key={index}
                    className="text-left py-3 px-4 font-medium text-slate-300 text-sm"
                  >
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
                      className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors"
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      )}
                    </tr>
                    {isExpanded && renderExpanded && (
                      <tr>
                        <td colSpan={columns.length + 1} className="p-0">
                          <div className="bg-slate-900/30 p-4 border-b border-slate-800">
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
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {data.map((item) => {
          const key = keyExtractor(item);
          const isExpanded = expandedItems.has(key);
          const primaryColumns = columns.filter(col => col.primary && !col.hideOnMobile);
          const secondaryColumns = columns.filter(col => !col.primary && !col.hideOnMobile);

          return (
            <Card key={key} className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                {/* Primary info - always visible */}
                <div className="space-y-2">
                  {primaryColumns.map((column, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <span className="text-sm font-medium text-slate-300">
                        {column.label}:
                      </span>
                      <span className="text-sm text-slate-100 text-right ml-2 flex-1">
                        {column.render 
                          ? column.render(getValue(item, column), item)
                          : String(getValue(item, column) || '')
                        }
                      </span>
                    </div>
                  ))}
                </div>

                {/* Secondary info - collapsible */}
                {(secondaryColumns.length > 0 || renderExpanded) && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(key)}
                      className="w-full mt-3 text-xs text-slate-400"
                    >
                      {isExpanded ? 'Show Less' : 'Show More'}
                      {isExpanded ? (
                        <ChevronUp className="h-3 w-3 ml-1" />
                      ) : (
                        <ChevronDown className="h-3 w-3 ml-1" />
                      )}
                    </Button>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                        {secondaryColumns.map((column, index) => (
                          <div key={index} className="flex justify-between items-start">
                            <span className="text-xs font-medium text-slate-400">
                              {column.label}:
                            </span>
                            <span className="text-xs text-slate-200 text-right ml-2 flex-1">
                              {column.render 
                                ? column.render(getValue(item, column), item)
                                : String(getValue(item, column) || '')
                              }
                            </span>
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