'use client';

import * as React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useDebounce } from 'use-debounce';
import { useHotkeys } from 'react-hotkeys-hook';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { 
  TableHeader,
  DesktopTableHeader,
  RegularTableBody,
  VirtualizedTableBody,
  MobileTableCard,
  TableSkeleton,
  EmptyTableState,
  TablePagination
} from './enhanced-table-components';

// Types
export interface EnhancedColumn<T> {
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

export interface EnhancedTableProps<T> {
  data: T[];
  columns: EnhancedColumn<T>[];
  keyExtractor: (item: T, index: number) => string;
  
  // Display options
  title?: string;
  description?: string;
  className?: string;
  striped?: boolean;
  compact?: boolean;
  loading?: boolean;
  
  // Features
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  selectable?: boolean;
  exportable?: boolean;
  virtualizeRows?: boolean;
  
  // Pagination
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  
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
  onFilter?: (filters: Record<string, unknown>) => void;
  
  // Export - leverage existing services
  exportService?: {
    onExport: (format: 'csv' | 'json') => Promise<void>;
    isExporting?: boolean;
  };
  
  // Expansion
  renderExpanded?: (item: T, index: number) => React.ReactNode;
  expandedRows?: Set<string>;
  onExpandedChange?: (expandedRows: Set<string>) => void;
}

// Enhanced Table Component
export function EnhancedTable<T>({
  data,
  columns,
  keyExtractor,
  title,
  description,
  className,
  striped = false,
  compact = false,
  loading = false,
  searchable = true,
  filterable = true,
  sortable = true,
  selectable = false,
  exportable = false,
  virtualizeRows = false,
  pagination,
  emptyState,
  onRowClick,
  onRowDoubleClick,
  onSelectionChange,
  onSort,
  exportService,
  renderExpanded,
  expandedRows: controlledExpandedRows,
  onExpandedChange,
}: EnhancedTableProps<T>) {
  // State
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [sortBy, setSortBy] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [internalExpandedRows, setInternalExpandedRows] = React.useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(
    new Set(columns.map(col => col.id))
  );
  const [filters, setFilters] = React.useState<Record<string, unknown>>({});

  const expandedRows = controlledExpandedRows ?? internalExpandedRows;
  // const setExpandedRows = onExpandedChange ?? setInternalExpandedRows; // Reserved for future functionality

  // Refs
  const parentRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  // Keyboard shortcuts
  useHotkeys('ctrl+f, cmd+f', (e) => {
    e.preventDefault();
    searchInputRef.current?.focus();
  });

  useHotkeys('escape', () => {
    setSearchQuery('');
    searchInputRef.current?.blur();
  });

  // Data processing
  const getValue = React.useCallback((item: T, column: EnhancedColumn<T>): unknown => {
    if (typeof column.key === 'string' && column.key.includes('.')) {
      return column.key.split('.').reduce((obj: Record<string, unknown>, key: string) => {
        return obj?.[key] as Record<string, unknown>;
      }, item as Record<string, unknown>);
    }
    return item[column.key as keyof T];
  }, []);

  const filteredData = React.useMemo(() => {
    let result = [...data];

    // Apply search
    if (debouncedSearchQuery && searchable) {
      const searchableColumns = columns.filter(col => col.searchable !== false);
      result = result.filter(item =>
        searchableColumns.some(column => {
          const value = getValue(item, column);
          return String(value || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase());
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([columnId, filterValue]) => {
      if (filterValue) {
        const column = columns.find(col => col.id === columnId);
        if (column) {
          result = result.filter(item => {
            const value = getValue(item, column);
            return String(value || '').toLowerCase().includes(String(filterValue).toLowerCase());
          });
        }
      }
    });

    return result;
  }, [data, debouncedSearchQuery, searchable, columns, getValue, filters]);

  const sortedData = React.useMemo(() => {
    if (!sortBy || !sortable) return filteredData;

    const column = columns.find(col => col.id === sortBy);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
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

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }

      return 0;
    });
  }, [filteredData, sortBy, sortDirection, sortable, columns, getValue]);

  // Virtualization
  const rowVirtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => compact ? 48 : 64,
    overscan: 10,
  });

  // Handlers
  const handleSort = React.useCallback((column: EnhancedColumn<T>) => {
    if (!column.sortable) return;

    const newSortBy = column.id;
    const newSortDirection = sortBy === newSortBy && sortDirection === 'asc' ? 'desc' : 'asc';
    
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
    onSort?.(newSortBy, newSortDirection);
  }, [sortBy, sortDirection, onSort]);

  const handleRowSelection = React.useCallback((key: string, selected: boolean) => {
    setSelectedRows((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(key);
      } else {
        newSet.delete(key);
      }
      
      if (onSelectionChange) {
        const selectedItems = sortedData.filter(item => newSet.has(keyExtractor(item, 0)));
        onSelectionChange(selectedItems);
      }
      
      return newSet;
    });
  }, [sortedData, keyExtractor, onSelectionChange]);

  const handleSelectAll = React.useCallback(() => {
    const allKeys = sortedData.map(item => keyExtractor(item, 0));
    const isAllSelected = allKeys.every(key => selectedRows.has(key));
    
    if (isAllSelected) {
      setSelectedRows(new Set<string>());
      onSelectionChange?.([]);
    } else {
      setSelectedRows(new Set<string>(allKeys));
      onSelectionChange?.(sortedData);
    }
  }, [sortedData, selectedRows, keyExtractor, onSelectionChange]);

  const handleRowExpansion = React.useCallback((key: string) => {
    if (onExpandedChange) {
      const newSet = new Set(expandedRows);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      onExpandedChange(newSet);
    } else {
      setInternalExpandedRows((prev: Set<string>) => {
        const newSet = new Set(prev);
        if (newSet.has(key)) {
          newSet.delete(key);
        } else {
          newSet.add(key);
        }
        return newSet;
      });
    }
  }, [expandedRows, onExpandedChange]);

  // Visible columns for display
  const displayColumns = React.useMemo(() => 
    columns.filter(col => visibleColumns.has(col.id)), 
    [columns, visibleColumns]
  );

  // Loading skeleton
  if (loading) {
    return <TableSkeleton columns={displayColumns} rows={pagination?.pageSize || 10} />;
  }

  // Empty state
  if (sortedData.length === 0 && !loading) {
    return (
      <EmptyTableState
        title={emptyState?.title || (debouncedSearchQuery ? 'No results found' : 'No data available')}
        description={emptyState?.description || (debouncedSearchQuery 
          ? `No results match "${debouncedSearchQuery}"` 
          : 'Start by adding some data to see it here.'
        )}
        icon={emptyState?.icon}
        action={emptyState?.action}
      />
    );
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Table Header */}
      <TableHeader
        title={title}
        description={description}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={searchInputRef}
        searchable={searchable}
        filterable={filterable}
        exportable={exportable}
        columns={columns}
        visibleColumns={visibleColumns}
        onVisibleColumnsChange={setVisibleColumns}
        filters={filters}
        onFiltersChange={setFilters}
        exportService={exportService}
        selectedCount={selectedRows.size}
        totalCount={sortedData.length}
      />

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card className="border-0 shadow-lg bg-card overflow-hidden">
          <div 
            ref={parentRef}
            className="overflow-auto"
            style={{ height: virtualizeRows ? '600px' : 'auto' }}
          >
            <table className="w-full border-collapse">
              <DesktopTableHeader
                columns={displayColumns}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
                selectable={selectable}
                selectedRows={selectedRows}
                allData={sortedData}
                keyExtractor={keyExtractor}
                onSelectAll={handleSelectAll}
                expandable={!!renderExpanded}
              />
              <tbody>
                {virtualizeRows ? (
                  <VirtualizedTableBody
                    virtualizer={rowVirtualizer}
                    data={sortedData}
                    columns={displayColumns}
                    keyExtractor={keyExtractor}
                    getValue={getValue}
                    selectable={selectable}
                    selectedRows={selectedRows}
                    onRowSelection={handleRowSelection}
                    onRowClick={onRowClick}
                    onRowDoubleClick={onRowDoubleClick}
                    expandable={!!renderExpanded}
                    expandedRows={expandedRows}
                    onRowExpansion={handleRowExpansion}
                    renderExpanded={renderExpanded}
                    striped={striped}
                    compact={compact}
                  />
                ) : (
                  <RegularTableBody
                    data={sortedData}
                    columns={displayColumns}
                    keyExtractor={keyExtractor}
                    getValue={getValue}
                    selectable={selectable}
                    selectedRows={selectedRows}
                    onRowSelection={handleRowSelection}
                    onRowClick={onRowClick}
                    onRowDoubleClick={onRowDoubleClick}
                    expandable={!!renderExpanded}
                    expandedRows={expandedRows}
                    onRowExpansion={handleRowExpansion}
                    renderExpanded={renderExpanded}
                    striped={striped}
                    compact={compact}
                  />
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {sortedData.map((item, index) => {
          const key = keyExtractor(item, index);
          const isSelected = selectedRows.has(key);
          const isExpanded = expandedRows.has(key);

          return (
            <MobileTableCard
              key={key}
              item={item}
              index={index}
              columns={displayColumns}
              getValue={getValue}
              isSelected={isSelected}
              isExpanded={isExpanded}
              selectable={selectable}
              onSelectionChange={(selected) => handleRowSelection(key, selected)}
              onExpansionChange={() => handleRowExpansion(key)}
              onClick={onRowClick}
              onDoubleClick={onRowDoubleClick}
              renderExpanded={renderExpanded}
              compact={compact}
            />
          );
        })}
      </div>

      {/* Pagination */}
      {pagination && (
        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      )}
    </div>
  );
}

// Import sub-components
export * from './enhanced-table-components';