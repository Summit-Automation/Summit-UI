'use client';

import * as React from 'react';
import { MileageEntry } from '@/types/mileage';
import { Button } from '@/components/ui/button';
import { exportMileage } from '@/app/lib/services/mileageServices/exportMileage';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import UpdateMileageEntryModal from './UpdateMileageEntryModal';
import { deleteMileageEntry } from '@/app/lib/services/mileageServices/deleteMileageEntry';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  Calendar,
  MapPin,
  User,
  Car,
  Trash2,
  Route
} from 'lucide-react';

import { EnhancedTable, EnhancedColumn } from '@/components/ui/enhanced-table';

interface MileageTableEnhancedProps {
  mileageEntries: MileageEntry[];
  onUpdate?: () => void;
  loading?: boolean;
  title?: string;
  description?: string;
}

export default function MileageTableEnhanced({
  mileageEntries,
  onUpdate,
  loading = false,
  title = "Mileage Entries",
  description = "Track and manage your business and personal mileage"
}: MileageTableEnhancedProps) {
  const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({});
  const [isExporting, setIsExporting] = React.useState(false);
  const { formatAmount } = useCurrency();

  // IRS standard mileage rate for 2025
  const standardMileageRate = 0.67;

  const handleDelete = async (id: string) => {
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    
    try {
      await deleteMileageEntry(id);
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting mileage entry:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  // Export handling
  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    try {
      const result = await exportMileage(format);
      if (result.success && result.data && result.filename) {
        // Download the file
        const blob = new Blob([result.data], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        console.error('Export failed:', result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format miles - only show decimal if needed (5.0 becomes "5", 5.5 stays "5.5")
  const formatMiles = (miles: number) => {
    return miles % 1 === 0 ? miles.toFixed(0) : miles.toFixed(1);
  };

  const getTypeBadgeProps = (isBusiness: boolean) => {
    return isBusiness 
      ? { className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" }
      : { className: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300" };
  };

  // Column definitions for the enhanced table
  const columns: EnhancedColumn<MileageEntry>[] = [
    {
      id: 'date',
      key: 'date',
      label: 'Date',
      primary: true,
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{formatDate(value as string)}</span>
        </div>
      )
    },
    {
      id: 'purpose',
      key: 'purpose',
      label: 'Purpose',
      primary: true,
      sortable: true,
      searchable: true,
      render: (value, entry) => (
        <div className="space-y-1">
          <div className="font-medium text-foreground max-w-[200px] md:max-w-[300px] truncate" title={value as string}>
            {value as string}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getTypeBadgeProps(entry.is_business).className}>
              {entry.is_business ? 'Business' : 'Personal'}
            </Badge>
            {entry.customer_name && (
              <span className="text-xs text-muted-foreground">{entry.customer_name}</span>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'miles',
      key: 'miles',
      label: 'Miles',
      primary: true,
      sortable: true,
      align: 'right',
      width: '120px',
      render: (value, entry) => (
        <div className="text-right">
          <div className="text-lg font-mono font-bold text-foreground">
            {formatMiles(value as number)} mi
          </div>
          {entry.is_business && (
            <div className="text-xs text-muted-foreground">
              {formatAmount((value as number) * standardMileageRate)} deduction
            </div>
          )}
        </div>
      )
    },
    {
      id: 'route',
      key: 'start_location',
      label: 'Route',
      sortable: true,
      hideOnMobile: true,
      render: (_, entry) => (
        <div className="flex items-center gap-2">
          <Route className="h-4 w-4 text-muted-foreground" />
          <div className="min-w-0">
            <div className="text-sm text-foreground truncate max-w-[150px]" title={entry.start_location || 'Not specified'}>
              From: {entry.start_location || <span className="text-muted-foreground italic">Not specified</span>}
            </div>
            <div className="text-xs text-muted-foreground truncate max-w-[150px]" title={entry.end_location || 'Not specified'}>
              To: {entry.end_location || <span className="italic">Not specified</span>}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'customer',
      key: 'customer_name',
      label: 'Customer',
      searchable: true,
      hideOnMobile: true,
      render: (value) => (
        value ? (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground truncate max-w-[120px]" title={value as string}>{value as string}</span>
          </div>
        ) : (
          <span className="text-muted-foreground italic text-sm">No customer</span>
        )
      )
    },
    {
      id: 'deduction',
      key: 'miles',
      label: 'Tax Deduction',
      align: 'right',
      hideOnMobile: true,
      render: (value, entry) => (
        <div className="text-right">
          {entry.is_business ? (
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatAmount((value as number) * standardMileageRate)}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic">
              Not deductible
            </div>
          )}
        </div>
      )
    },
    {
      id: 'actions',
      key: 'id',
      label: 'Actions',
      align: 'center',
      sticky: true,
      width: '120px',
      render: (_, entry) => (
        <div className="flex items-center justify-center gap-1">
          <UpdateMileageEntryModal
            mileageEntry={entry}
            onSuccess={onUpdate}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={loadingStates[entry.id]}
                title="Delete Entry"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Confirm deletion</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Are you sure you want to permanently delete this mileage entry for {formatMiles(entry.miles)} miles? 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex justify-end space-x-2 pt-4">
                <AlertDialogCancel asChild>
                  <Button variant="outline">Cancel</Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDelete(entry.id)}
                    disabled={loadingStates[entry.id]}
                  >
                    Yes, delete
                  </Button>
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    }
  ];

  // Expanded row content for mobile and additional details
  const renderExpanded = (entry: MileageEntry) => {
    const potentialDeduction = entry.miles * standardMileageRate;
    
    return (
      <div className="space-y-4 pt-2">
        {/* Trip Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Exact Miles Display */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase font-medium">Distance & Type</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-mono font-bold text-foreground">
                  {formatMiles(entry.miles)} miles
                </span>
              </div>
              <Badge className={getTypeBadgeProps(entry.is_business).className}>
                {entry.is_business ? 'Business' : 'Personal'}
              </Badge>
            </div>
          </div>

          {/* Tax Deduction */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase font-medium">
              Tax Deduction (${standardMileageRate}/mile)
            </div>
            <div className="space-y-1">
              <div className="text-lg font-mono font-bold text-foreground">
                {entry.is_business 
                  ? formatAmount(potentialDeduction)
                  : 'Not deductible'
                }
              </div>
              {entry.is_business && (
                <div className="text-xs text-muted-foreground">
                  {formatMiles(entry.miles)} × ${standardMileageRate} = {formatAmount(potentialDeduction)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Purpose - Full Text */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase font-medium">Full Purpose</div>
          <div className="text-sm text-foreground p-3 bg-muted rounded-lg break-words">
            {entry.purpose}
          </div>
        </div>

        {/* Route Details */}
        {(entry.start_location || entry.end_location) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase font-medium">Route Details</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">From</div>
                <div className="text-foreground break-words p-2 bg-muted rounded">
                  {entry.start_location || 'Not specified'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">To</div>
                <div className="text-foreground break-words p-2 bg-muted rounded">
                  {entry.end_location || 'Not specified'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1 font-medium">Customer</div>
            <div className="text-sm text-foreground break-words">
              {entry.customer_name || 'No customer assigned'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase mb-1 font-medium">Notes</div>
            <div className="text-sm text-foreground break-words">
              {entry.notes || 'No additional notes'}
            </div>
          </div>
        </div>

        {/* Mobile action buttons */}
        <div className="md:hidden flex flex-col gap-2 pt-3 border-t border-border">
          <div className="flex gap-2">
            <UpdateMileageEntryModal
              mileageEntry={entry}
              onSuccess={onUpdate}
            />
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={loadingStates[entry.id]}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Entry
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Confirm deletion</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Are you sure you want to permanently delete this mileage entry for {formatMiles(entry.miles)} miles? 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-2 pt-4">
                  <AlertDialogCancel asChild>
                    <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
                  </AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleDelete(entry.id)}
                      disabled={loadingStates[entry.id]}
                      className="w-full sm:w-auto"
                    >
                      Yes, delete
                    </Button>
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    );
  };

  return (
    <EnhancedTable
      data={mileageEntries}
      columns={columns}
      keyExtractor={(entry) => entry.id}
      title={title}
      description={description}
      loading={loading}
      searchable={true}
      filterable={true}
      sortable={true}
      exportable={true}
      exportService={{
        onExport: handleExport,
        isExporting
      }}
      renderExpanded={renderExpanded}
      emptyState={{
        title: "No mileage entries found",
        description: "Start tracking your business mileage for tax deductions and expense management.",
        icon: <Car className="h-8 w-8 text-muted-foreground" />,
      }}
      className="w-full"
    />
  );
}