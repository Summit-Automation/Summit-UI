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
  Car,
  Trash2,
  Route
} from 'lucide-react';

import { ModernTable, ModernColumn } from '@/components/ui/modern-table';

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
    
    const result = await deleteMileageEntry(id);
    if (result.success) {
      onUpdate?.();
    } else {
      console.error('Error deleting mileage entry:', result.error);
    }
    
    setLoadingStates(prev => ({ ...prev, [id]: false }));
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
  const columns: ModernColumn<MileageEntry>[] = [
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
      width: '280px',
      render: (value, entry) => (
        <div className="space-y-1">
          <div className="font-medium text-foreground max-w-[260px] truncate" title={value as string}>
            {value as string}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getTypeBadgeProps(entry.is_business).className}>
              {entry.is_business ? 'Business' : 'Personal'}
            </Badge>
            {entry.customer_name && (
              <span className="text-xs text-muted-foreground truncate max-w-[140px]" title={entry.customer_name}>
                {entry.customer_name}
              </span>
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
      width: '200px',
      render: (_, entry) => (
        <div className="flex items-center gap-2">
          <Route className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm text-foreground truncate max-w-[170px]" title={entry.start_location || 'Not specified'}>
              From: {entry.start_location || <span className="text-muted-foreground italic">Not specified</span>}
            </div>
            <div className="text-xs text-muted-foreground truncate max-w-[170px]" title={entry.end_location || 'Not specified'}>
              To: {entry.end_location || <span className="italic">Not specified</span>}
            </div>
          </div>
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


  return (
    <ModernTable
      data={mileageEntries}
      columns={columns}
      keyExtractor={(entry) => entry.id}
      title={title}
      description={description}
      loading={loading}
      searchable={true}
      sortable={true}
      exportable={true}
      exportService={{
        onExport: handleExport,
        isExporting
      }}
      emptyState={{
        title: "No mileage entries found",
        description: "Start tracking your business mileage for tax deductions and expense management.",
        icon: <Car className="h-8 w-8 text-muted-foreground" />,
      }}
      className="w-full"
    />
  );
}