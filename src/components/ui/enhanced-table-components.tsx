'use client';

import * as React from 'react';
import { Virtualizer } from '@tanstack/react-virtual';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Eye,
  ChevronDown,
  ChevronUp,
  Database,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { EnhancedColumn } from './enhanced-table';

// Table Header Component
interface TableHeaderProps<T> {
  title?: string;
  description?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  searchable: boolean;
  filterable: boolean;
  exportable: boolean;
  columns: EnhancedColumn<T>[];
  visibleColumns: Set<string>;
  onVisibleColumnsChange: (columns: Set<string>) => void;
  filters: Record<string, unknown>;
  onFiltersChange: (filters: Record<string, unknown>) => void;
  exportService?: {
    onExport: (format: 'csv' | 'json') => Promise<void>;
    isExporting?: boolean;
  };
  selectedCount: number;
  totalCount: number;
}

export function TableHeader<T>({
  title,
  description,
  searchQuery,
  onSearchChange,
  searchInputRef,
  searchable,
  filterable,
  exportable,
  columns,
  visibleColumns,
  onVisibleColumnsChange,
  filters,
  onFiltersChange,
  exportService,
  selectedCount,
  totalCount,
}: TableHeaderProps<T>) {
  return (
    <div className="space-y-4">
      {/* Title and Description */}
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:w-auto">
          {/* Search */}
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-background border-border focus:border-primary/50 focus:bg-background transition-all duration-200"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/50"
                  onClick={() => onSearchChange('')}
                >
                  ×
                </Button>
              )}
            </div>
          )}

          {/* Filters */}
          {filterable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-background border-border hover:bg-muted/50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {Object.values(filters).filter(Boolean).length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {Object.values(filters).filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {columns.filter(col => col.filterable !== false).map(column => (
                  <div key={column.id} className="p-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      {column.label}
                    </label>
                    <Input
                      placeholder={`Filter ${column.label.toLowerCase()}...`}
                      value={(filters[column.id] as string) || ''}
                      onChange={(e) => 
                        onFiltersChange({ ...filters, [column.id]: e.target.value })
                      }
                      className="h-7 text-xs"
                    />
                  </div>
                ))}
                {Object.values(filters).some(Boolean) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onFiltersChange({})}>
                      Clear all filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex gap-2 items-center">
          {/* Selection info */}
          {selectedCount > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {selectedCount} of {totalCount} selected
            </Badge>
          )}

          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-background border-border hover:bg-muted/50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {columns.map(column => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={visibleColumns.has(column.id)}
                  onCheckedChange={(checked) => {
                    const newSet = new Set(visibleColumns);
                    if (checked) {
                      newSet.add(column.id);
                    } else {
                      newSet.delete(column.id);
                    }
                    onVisibleColumnsChange(newSet);
                  }}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export */}
          {exportable && exportService && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={exportService.isExporting}
                  className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-muted/50"
                >
                  <Download className={cn("h-4 w-4 mr-2", exportService.isExporting && "animate-spin")} />
                  {exportService.isExporting ? 'Exporting...' : 'Export'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => exportService.onExport('csv')}
                  disabled={exportService.isExporting}
                >
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => exportService.onExport('json')}
                  disabled={exportService.isExporting}
                >
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}

// Desktop Table Header Component
interface DesktopTableHeaderProps<T> {
  columns: EnhancedColumn<T>[];
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (column: EnhancedColumn<T>) => void;
  selectable: boolean;
  selectedRows: Set<string>;
  allData: T[];
  keyExtractor: (item: T, index: number) => string;
  onSelectAll: () => void;
  expandable: boolean;
}

export function DesktopTableHeader<T>({
  columns,
  sortBy,
  sortDirection,
  onSort,
  selectable,
  selectedRows,
  allData,
  keyExtractor,
  onSelectAll,
  expandable,
}: DesktopTableHeaderProps<T>) {
  const isAllSelected = allData.length > 0 && allData.every(item => selectedRows.has(keyExtractor(item, 0)));
  const isIndeterminate = selectedRows.size > 0 && !isAllSelected;

  return (
    <thead className="bg-gradient-to-r from-muted/30 to-muted/20 backdrop-blur-sm border-b border-border/50">
      <tr>
        {selectable && (
          <th className="w-12 px-4 py-4">
            <Checkbox
              checked={isAllSelected}
              ref={(el: HTMLButtonElement | null) => {
                if (el && 'indeterminate' in el) {
                  (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = isIndeterminate;
                }
              }}
              onCheckedChange={onSelectAll}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </th>
        )}
        
        {columns.map((column) => (
          <th
            key={column.id}
            className={cn(
              "px-4 py-4 text-left font-semibold text-sm text-muted-foreground transition-colors duration-150",
              column.sortable && "cursor-pointer hover:text-foreground select-none group",
              column.headerClassName,
              column.align === 'center' && "text-center",
              column.align === 'right' && "text-right"
            )}
            style={{
              width: column.width,
              minWidth: column.minWidth,
              maxWidth: column.maxWidth,
            }}
            onClick={() => column.sortable && onSort(column)}
          >
            <div className={cn(
              "flex items-center gap-2",
              column.align === 'center' && "justify-center",
              column.align === 'right' && "justify-end"
            )}>
              <span className="font-medium">{column.label}</span>
              {column.sortable && (
                <div className="flex flex-col">
                  {sortBy === column.id ? (
                    sortDirection === 'asc' ? (
                      <ChevronUp className="h-3 w-3 text-primary" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-primary" />
                    )
                  ) : (
                    <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                  )}
                </div>
              )}
            </div>
          </th>
        ))}

        {expandable && <th className="w-12"></th>}
      </tr>
    </thead>
  );
}

// Regular Table Body Component
interface RegularTableBodyProps<T> {
  data: T[];
  columns: EnhancedColumn<T>[];
  keyExtractor: (item: T, index: number) => string;
  getValue: (item: T, column: EnhancedColumn<T>) => unknown;
  selectable: boolean;
  selectedRows: Set<string>;
  onRowSelection: (key: string, selected: boolean) => void;
  onRowClick?: (item: T, index: number) => void;
  onRowDoubleClick?: (item: T, index: number) => void;
  expandable: boolean;
  expandedRows: Set<string>;
  onRowExpansion: (key: string) => void;
  renderExpanded?: (item: T, index: number) => React.ReactNode;
  striped: boolean;
  compact: boolean;
}

export function RegularTableBody<T>({
  data,
  columns,
  keyExtractor,
  getValue,
  selectable,
  selectedRows,
  onRowSelection,
  onRowClick,
  onRowDoubleClick,
  expandable,
  expandedRows,
  onRowExpansion,
  renderExpanded,
  striped,
  compact,
}: RegularTableBodyProps<T>) {
  return (
    <>
      {data.map((item, index) => {
        const key = keyExtractor(item, index);
        const isSelected = selectedRows.has(key);
        const isExpanded = expandedRows.has(key);

        return (
          <React.Fragment key={key}>
            <tr
              className={cn(
                "border-b border-border/30 transition-colors duration-150 group",
                "hover:bg-muted/30",
                striped && index % 2 === 0 && "bg-muted/10",
                isSelected && "bg-primary/5 border-primary/20",
                onRowClick && "cursor-pointer"
              )}
              onClick={() => onRowClick?.(item, index)}
              onDoubleClick={() => onRowDoubleClick?.(item, index)}
            >
              {selectable && (
                <td className="px-4 py-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onRowSelection(key, checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </td>
              )}
              
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={cn(
                    "px-4 text-sm text-foreground transition-colors",
                    compact ? "py-2" : "py-3",
                    column.className,
                    column.align === 'center' && "text-center",
                    column.align === 'right' && "text-right"
                  )}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                  }}
                >
                  {column.render 
                    ? column.render(getValue(item, column), item, index)
                    : String(getValue(item, column) || '')
                  }
                </td>
              ))}

              {expandable && (
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowExpansion(key);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                </td>
              )}
            </tr>

            {/* Expanded row */}
            {isExpanded && renderExpanded && (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)} className="p-0">
                  <div className="bg-muted/10 border-t border-border/20 p-4">
                    {renderExpanded(item, index)}
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}

// Virtualized Table Body Component
interface VirtualizedTableBodyProps<T> extends RegularTableBodyProps<T> {
  virtualizer: Virtualizer<HTMLDivElement, Element>;
}

export function VirtualizedTableBody<T>({
  virtualizer,
  data,
  columns,
  keyExtractor,
  getValue,
  selectable,
  selectedRows,
  onRowSelection,
  onRowClick,
  onRowDoubleClick,
  expandable,
  expandedRows,
  onRowExpansion,
  renderExpanded,
  striped,
  compact,
}: VirtualizedTableBodyProps<T>) {
  return (
    <>
      {virtualizer.getVirtualItems().map((virtualItem) => {
        const item = data[virtualItem.index];
        const key = keyExtractor(item, virtualItem.index);
        const isSelected = selectedRows.has(key);
        const isExpanded = expandedRows.has(key);

        return (
          <React.Fragment key={key}>
            <tr
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              className={cn(
                "border-b border-border/30 transition-colors duration-150 group",
                "hover:bg-muted/30",
                striped && virtualItem.index % 2 === 0 && "bg-muted/10",
                isSelected && "bg-primary/5 border-primary/20",
                onRowClick && "cursor-pointer"
              )}
              onClick={() => onRowClick?.(item, virtualItem.index)}
              onDoubleClick={() => onRowDoubleClick?.(item, virtualItem.index)}
            >
              {selectable && (
                <td className="px-4 py-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onRowSelection(key, checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              )}
              
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={cn(
                    "px-4 text-sm text-foreground",
                    compact ? "py-2" : "py-3",
                    column.className,
                    column.align === 'center' && "text-center",
                    column.align === 'right' && "text-right"
                  )}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                  }}
                >
                  {column.render 
                    ? column.render(getValue(item, column), item, virtualItem.index)
                    : String(getValue(item, column) || '')
                  }
                </td>
              ))}

              {expandable && (
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowExpansion(key);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                </td>
              )}
            </tr>

            {isExpanded && renderExpanded && (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)} className="p-0">
                  <div className="bg-muted/10 border-t border-border/20 p-4">
                    {renderExpanded(item, virtualItem.index)}
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}

// Mobile Table Card Component
interface MobileTableCardProps<T> {
  item: T;
  index: number;
  columns: EnhancedColumn<T>[];
  getValue: (item: T, column: EnhancedColumn<T>) => unknown;
  isSelected: boolean;
  isExpanded: boolean;
  selectable: boolean;
  onSelectionChange: (selected: boolean) => void;
  onExpansionChange: () => void;
  onClick?: (item: T, index: number) => void;
  onDoubleClick?: (item: T, index: number) => void;
  renderExpanded?: (item: T, index: number) => React.ReactNode;
  compact: boolean;
}

export function MobileTableCard<T>({
  item,
  index,
  columns,
  getValue,
  isSelected,
  isExpanded,
  selectable,
  onSelectionChange,
  onExpansionChange,
  onClick,
  onDoubleClick,
  renderExpanded,
  compact,
}: MobileTableCardProps<T>) {
  const primaryColumns = columns.filter(col => col.primary && !col.hideOnMobile);
  const secondaryColumns = columns.filter(col => !col.primary && !col.hideOnMobile);
  const hasSecondaryData = secondaryColumns.length > 0 || renderExpanded;

  return (
      <Card className={cn(
        "overflow-hidden transition-colors duration-200 hover:shadow-md group",
        "bg-card border-border",
        isSelected && "ring-2 ring-primary/20 border-primary/30 bg-primary/5",
        onClick && "cursor-pointer hover:bg-muted/20"
      )}>
        <CardContent className={compact ? "p-3" : "p-4"}>
          {/* Header with selection */}
          {selectable && (
            <div className="flex items-center justify-between mb-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelectionChange}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            </div>
          )}

          {/* Primary content */}
          <div 
            className="space-y-2"
            onClick={() => onClick?.(item, index)}
            onDoubleClick={() => onDoubleClick?.(item, index)}
          >
            {primaryColumns.map((column, colIndex) => {
              const value = getValue(item, column);
              const displayValue = column.render ? column.render(value, item, index) : String(value || '');
              
              return (
                <div key={colIndex} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <span className="text-xs font-medium text-muted-foreground flex-shrink-0">
                    {column.label}:
                  </span>
                  <div className="text-sm text-foreground min-w-0 flex-1 break-words">
                    {displayValue}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expandable section */}
          {hasSecondaryData && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onExpansionChange}
                className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {isExpanded ? 'Show Less' : 'Show More'}
                {isExpanded ? (
                  <ChevronUp className="ml-1 h-3 w-3" />
                ) : (
                  <ChevronDown className="ml-1 h-3 w-3" />
                )}
              </Button>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-border/30 space-y-2 overflow-hidden">
                    {secondaryColumns.map((column, colIndex) => {
                      const value = getValue(item, column);
                      const displayValue = column.render ? column.render(value, item, index) : String(value || '');
                      
                      return (
                        <div key={colIndex} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                          <span className="text-xs font-medium text-muted-foreground flex-shrink-0">
                            {column.label}:
                          </span>
                          <div className="text-xs text-foreground min-w-0 flex-1 break-words">
                            {displayValue}
                          </div>
                        </div>
                      );
                    })}
                    
                    {renderExpanded && (
                      <div className="mt-3 pt-3 border-t border-border/30">
                        {renderExpanded(item, index)}
                      </div>
                    )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
  );
}

// Table Skeleton Component
interface TableSkeletonProps<T> {
  columns: EnhancedColumn<T>[];
  rows: number;
}

export function TableSkeleton<T>({ columns, rows }: TableSkeletonProps<T>) {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-72 bg-muted/60 animate-pulse rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          <div className="h-8 w-20 bg-muted animate-pulse rounded" />
        </div>
      </div>

      {/* Desktop table skeleton */}
      <div className="hidden md:block">
        <Card className="overflow-hidden">
          <div className="p-0">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  {columns.map((_, index) => (
                    <th key={index} className="px-4 py-3">
                      <div className="h-4 bg-muted animate-pulse rounded w-full" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: rows }, (_, index) => (
                  <tr key={index} className="border-b border-border/30">
                    {columns.map((_, colIndex) => (
                      <td key={colIndex} className="px-4 py-3">
                        <div className="h-4 bg-muted/60 animate-pulse rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile cards skeleton */}
      <div className="md:hidden space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <Card key={index}>
            <CardContent className="p-4 space-y-3">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-3 bg-muted/60 animate-pulse rounded w-1/2" />
              <div className="h-3 bg-muted/60 animate-pulse rounded w-5/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Empty Table State Component
interface EmptyTableStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyTableState({ title, description, icon, action }: EmptyTableStateProps) {
  return (
    <Card className="border-dashed border-2 border-border/50">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 p-4 rounded-full bg-muted/30">
          {icon || <Database className="h-8 w-8 text-muted-foreground" />}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md">{description}</p>
        {action}
      </CardContent>
    </Card>
  );
}

// Table Pagination Component
interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Rows per page:</span>
        <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger className="w-16 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          {startItem}-{endItem} of {total}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        
        {/* Page numbers */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (page <= 3) {
            pageNum = i + 1;
          } else if (page >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = page - 2 + i;
          }
          
          return (
            <Button
              key={pageNum}
              variant={pageNum === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className="h-8 w-8 p-0"
            >
              {pageNum}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}