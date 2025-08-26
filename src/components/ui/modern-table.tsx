'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useDebounce } from 'use-debounce';
import { useHotkeys } from 'react-hotkeys-hook';

import { cn } from '@/lib/utils';
import { 
  Search,
  ChevronUp,
  ChevronDown,
  Filter,
  Download,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Types
export interface ModernColumn<T> {
  id: string;
  key: keyof T | string;
  label: string;
  render?: (value: unknown, item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
  headerClassName?: string;
  hideOnMobile?: boolean;
  primary?: boolean;
  sticky?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface ModernTableProps<T> {
  data: T[];
  columns: ModernColumn<T>[];
  keyExtractor: (item: T, index: number) => string;
  
  // Display options
  title?: string;
  description?: string;
  className?: string;
  loading?: boolean;
  
  // Features
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  selectable?: boolean;
  exportable?: boolean;
  
  // Empty state
  emptyState?: {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
  };
  
  // Callbacks
  onRowClick?: (item: T, index: number) => void;
  onRowDoubleClick?: (item: T, index: number) => void;
  onSelectionChange?: (selectedItems: T[]) => void;
  onSort?: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
  expandedRowRenderer?: (item: T) => React.ReactNode;
  
  // Export
  exportService?: {
    onExport: (format: 'csv' | 'json') => Promise<void>;
    isExporting?: boolean;
  };
}

// Modern Table Header
interface ModernTableHeaderProps {
  title?: string;
  description?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  searchable: boolean;
  filterable: boolean;
  exportable: boolean;
  exportService?: {
    onExport: (format: 'csv' | 'json') => Promise<void>;
    isExporting?: boolean;
  };
  selectedCount: number;
  totalCount: number;
}

function ModernTableHeader({
  title,
  description,
  searchQuery,
  onSearchChange,
  searchInputRef,
  searchable,
  filterable,
  exportable,
  exportService,
  selectedCount,
  totalCount,
}: ModernTableHeaderProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Title and Description */}
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Modern Search */}
          {searchable && (
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={searchInputRef}
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 border-0 bg-gray-50 dark:bg-gray-800/50 rounded-lg focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          )}

          {/* Filters */}
          {filterable && (
            <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Selection count */}
          {selectedCount > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCount} of {totalCount} selected
            </div>
          )}

          {/* Export */}
          {exportable && exportService && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={exportService.isExporting}>
                  {exportService.isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg">
                <DropdownMenuItem onClick={() => exportService.onExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportService.onExport('json')}>
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

// Mobile Card Component
interface MobileCardProps<T> {
  item: T;
  index: number;
  columns: ModernColumn<T>[];
  getValue: (item: T, column: ModernColumn<T>) => unknown;
  selectable: boolean;
  isSelected: boolean;
  onSelectionChange: (selected: boolean) => void;
  onRowClick?: (item: T, index: number) => void;
  onRowDoubleClick?: (item: T, index: number) => void;
}

function MobileCard<T>({
  item,
  index,
  columns,
  getValue,
  selectable,
  isSelected,
  onSelectionChange,
  onRowClick,
  onRowDoubleClick,
}: MobileCardProps<T>) {
  const primaryColumns = columns.filter(col => col.primary && !col.hideOnMobile);
  const secondaryColumns = columns.filter(col => !col.primary && !col.hideOnMobile);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className={cn(
        "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3 transition-all duration-200",
        "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700",
        isSelected && "ring-2 ring-blue-500/20 border-blue-300 dark:border-blue-700",
        onRowClick && "cursor-pointer"
      )}
      onClick={() => onRowClick?.(item, index)}
      onDoubleClick={() => onRowDoubleClick?.(item, index)}
    >
      {/* Header with Selection */}
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {primaryColumns.slice(0, 1).map((column, colIndex) => {
            const value = getValue(item, column);
            const displayValue = column.render ? column.render(value, item, index) : String(value || '');
            return (
              <div key={colIndex} className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                {displayValue}
              </div>
            );
          })}
        </div>
        
        {selectable && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelectionChange}
            onClick={(e) => e.stopPropagation()}
            className="ml-3"
          />
        )}
      </div>
      
      {/* Primary Content */}
      <div className="space-y-2">
        {primaryColumns.slice(1).map((column, colIndex) => {
          const value = getValue(item, column);
          const displayValue = column.render ? column.render(value, item, index) : String(value || '');
          return (
            <div key={colIndex + 1} className="text-sm text-gray-600 dark:text-gray-400 break-words">
              {displayValue}
            </div>
          );
        })}
      </div>
      
      {/* Secondary Content */}
      {secondaryColumns.length > 0 && (
        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          {secondaryColumns.map((column, colIndex) => {
            const value = getValue(item, column);
            const displayValue = column.render ? column.render(value, item, index) : String(value || '');
            return (
              <div key={colIndex} className="flex justify-between items-start gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex-shrink-0">
                  {column.label}:
                </span>
                <div className="text-xs text-gray-900 dark:text-gray-100 text-right break-words min-w-0">
                  {displayValue}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// Desktop Table Row
interface DesktopRowProps<T> {
  item: T;
  index: number;
  columns: ModernColumn<T>[];
  getValue: (item: T, column: ModernColumn<T>) => unknown;
  selectable: boolean;
  isSelected: boolean;
  onSelectionChange: (selected: boolean) => void;
  onRowClick?: (item: T, index: number) => void;
  onRowDoubleClick?: (item: T, index: number) => void;
}

function DesktopRow<T>({
  item,
  index,
  columns,
  getValue,
  selectable,
  isSelected,
  onSelectionChange,
  onRowClick,
  onRowDoubleClick,
}: DesktopRowProps<T>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className={cn(
        "group relative grid items-center gap-2 lg:gap-4 px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-100 dark:border-gray-800 transition-all duration-200",
        "hover:bg-gray-50 dark:hover:bg-gray-800/30",
        isSelected && "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
        onRowClick && "cursor-pointer"
      )}
      style={{ 
        gridTemplateColumns: `${selectable ? 'auto ' : ''}${columns.map(col => col.width || 'minmax(100px, 1fr)').join(' ')}`
      }}
      onClick={() => onRowClick?.(item, index)}
      onDoubleClick={() => onRowDoubleClick?.(item, index)}
    >
      {/* Selection */}
      {selectable && (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelectionChange}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Column Data */}
      {columns.map((column, colIndex) => {
        const value = getValue(item, column);
        const displayValue = column.render ? column.render(value, item, index) : String(value || '');
        
        return (
          <div
            key={colIndex}
            className={cn(
              "min-w-0 text-sm truncate",
              colIndex === 0 ? "font-medium text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400",
              column.align === 'center' && "text-center",
              column.align === 'right' && "text-right"
            )}
          >
            <div className="break-words">{displayValue}</div>
          </div>
        );
      })}

    </motion.div>
  );
}

// Main Modern Table Component
export function ModernTable<T>({
  data,
  columns,
  keyExtractor,
  title,
  description,
  className,
  loading = false,
  searchable = true,
  sortable = true,
  selectable = false,
  exportable = false,
  emptyState,
  onRowClick,
  onRowDoubleClick,
  onSelectionChange,
  onSort,
  exportService,
  expandedRowRenderer,
}: ModernTableProps<T>) {
  // Suppress unused variable warnings
  void sortable;
  
  // State
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [sortBy, setSortBy] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());

  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  // Keyboard shortcuts
  useHotkeys('cmd+k, ctrl+k', (e) => {
    e.preventDefault();
    searchInputRef.current?.focus();
  });

  // Data processing
  const getValue = React.useCallback((item: T, column: ModernColumn<T>): unknown => {
    if (typeof column.key === 'string' && column.key.includes('.')) {
      return column.key.split('.').reduce((obj: Record<string, unknown>, key: string) => {
        return obj?.[key] as Record<string, unknown>;
      }, item as Record<string, unknown>);
    }
    return item[column.key as keyof T];
  }, []);

  const filteredData = React.useMemo(() => {
    if (!debouncedSearchQuery || !searchable) return data;

    const searchableColumns = columns.filter(col => col.searchable !== false);
    return data.filter(item =>
      searchableColumns.some(column => {
        const value = getValue(item, column);
        return String(value || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      })
    );
  }, [data, debouncedSearchQuery, searchable, columns, getValue]);

  const handleRowSelection = React.useCallback((key: string, selected: boolean) => {
    setSelectedRows((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(key);
      } else {
        newSet.delete(key);
      }
      
      if (onSelectionChange) {
        const selectedItems = filteredData.filter(item => newSet.has(keyExtractor(item, 0)));
        onSelectionChange(selectedItems);
      }
      
      return newSet;
    });
  }, [filteredData, keyExtractor, onSelectionChange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (filteredData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          {emptyState?.icon || <Search className="h-8 w-8 text-gray-400" />}
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {emptyState?.title || (debouncedSearchQuery ? 'No results found' : 'No data')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {emptyState?.description || (debouncedSearchQuery 
            ? `No results match "${debouncedSearchQuery}"` 
            : 'Get started by adding your first item.'
          )}
        </p>
        {emptyState?.action}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4 md:space-y-6", className)}>
      {/* Header */}
      <ModernTableHeader
        title={title}
        description={description}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={searchInputRef}
        searchable={searchable}
        filterable={false}
        exportable={exportable}
        exportService={exportService}
        selectedCount={selectedRows.size}
        totalCount={filteredData.length}
      />

      {/* Mobile View */}
      <div className="block lg:hidden space-y-3">
        {filteredData.map((item, index) => (
          <div key={keyExtractor(item, index)} className="space-y-0">
            <MobileCard
              item={item}
              index={index}
              columns={columns}
              getValue={getValue}
              selectable={selectable}
              isSelected={selectedRows.has(keyExtractor(item, index))}
              onSelectionChange={(selected) => handleRowSelection(keyExtractor(item, index), selected)}
              onRowClick={onRowClick}
              onRowDoubleClick={onRowDoubleClick}
            />
            {expandedRowRenderer && expandedRowRenderer(item)}
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header Row */}
        <div className={cn(
          "grid items-center gap-2 lg:gap-4 px-4 lg:px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
        )}
        style={{ gridTemplateColumns: `${selectable ? 'auto ' : ''}${columns.map(col => col.width || 'minmax(100px, 1fr)').join(' ')}` }}
        >
          {selectable && <div></div>}
          {columns.map((column) => (
            <div
              key={column.id}
              className={cn(
                "flex items-center gap-2 min-w-0 truncate",
                column.align === 'center' && "justify-center",
                column.align === 'right' && "justify-end",
                column.sortable && "cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
              )}
              onClick={() => {
                if (column.sortable && onSort) {
                  const newDirection = sortBy === column.id && sortDirection === 'asc' ? 'desc' : 'asc';
                  setSortBy(column.id);
                  setSortDirection(newDirection);
                  onSort(column.id, newDirection);
                }
              }}
            >
              <span className="truncate">{column.label}</span>
              {column.sortable && sortBy === column.id && (
                sortDirection === 'asc' ? 
                  <ChevronUp className="h-3 w-3 flex-shrink-0" /> : 
                  <ChevronDown className="h-3 w-3 flex-shrink-0" />
              )}
            </div>
          ))}
          <div></div>
        </div>

        {/* Rows */}
        <div>
          {filteredData.map((item, index) => (
            <div key={keyExtractor(item, index)}>
              <DesktopRow
                item={item}
                index={index}
                columns={columns}
                getValue={getValue}
                selectable={selectable}
                isSelected={selectedRows.has(keyExtractor(item, index))}
                onSelectionChange={(selected) => handleRowSelection(keyExtractor(item, index), selected)}
                onRowClick={onRowClick}
                onRowDoubleClick={onRowDoubleClick}
              />
              {expandedRowRenderer && expandedRowRenderer(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}