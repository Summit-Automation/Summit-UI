'use client';

import * as React from 'react';
import { RecurringPayment } from '@/types/recurringPayment';
import { Button } from '@/components/ui/button';
import { deleteRecurringPayment } from '@/app/lib/services/bookkeeperServices/deleteRecurringPayment';
import { exportRecurringPayments } from '@/app/lib/services/bookkeeperServices/exportRecurringPayments';
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
import EditRecurringPaymentClientWrapper from './EditRecurringPaymentClientWrapper';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  Calendar,
  Repeat,
  User,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  Trash2
} from 'lucide-react';

import { EnhancedTable, EnhancedColumn } from '@/components/ui/enhanced-table';

interface RecurringPaymentsTableEnhancedProps {
  recurringPayments: RecurringPayment[];
  onUpdate?: () => void;
  loading?: boolean;
  title?: string;
  description?: string;
}

export default function RecurringPaymentsTableEnhanced({
  recurringPayments,
  onUpdate,
  loading = false,
  title = "Recurring Payments",
  description = "Manage your scheduled recurring income and expenses"
}: RecurringPaymentsTableEnhancedProps) {
  const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({});
  const [isExporting, setIsExporting] = React.useState(false);
  const { formatAmount } = useCurrency();

  const handleDelete = async (id: string) => {
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    
    try {
      const result = await deleteRecurringPayment(id);
      
      if (result.success) {
        onUpdate?.();
      } else {
        console.error('Delete failed:', result.error);
      }
    } catch (error) {
      console.error('Error deleting recurring payment:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  // Export handling
  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    try {
      const result = await exportRecurringPayments(format);
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
    return new Date(dateString).toLocaleDateString();
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  const getStatusInfo = (payment: RecurringPayment) => {
    const nextPayment = new Date(payment.next_payment_date);
    const now = new Date();
    
    if (!payment.is_active) {
      return { 
        label: 'Inactive', 
        variant: 'secondary' as const, 
        className: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300",
        icon: AlertCircle 
      };
    }
    
    if (nextPayment <= now) {
      return { 
        label: 'Due', 
        variant: 'destructive' as const, 
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        icon: AlertCircle 
      };
    }
    
    return { 
      label: 'Active', 
      variant: 'default' as const, 
      className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      icon: CheckCircle 
    };
  };

  const getTypeBadgeProps = (type: string) => {
    return type === 'income' 
      ? { className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" }
      : { className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" };
  };

  // Column definitions for the enhanced table
  const columns: EnhancedColumn<RecurringPayment>[] = [
    {
      id: 'description',
      key: 'description',
      label: 'Description',
      primary: true,
      sortable: true,
      searchable: true,
      render: (value, payment) => (
        <div className="space-y-1">
          <div className="font-medium text-foreground">{value as string}</div>
          <div className="flex items-center gap-2">
            <Badge className={getTypeBadgeProps(payment.type).className}>
              {payment.type === 'income' ? (
                <><TrendingUp className="h-3 w-3 mr-1" />Income</>
              ) : (
                <><TrendingDown className="h-3 w-3 mr-1" />Expense</>
              )}
            </Badge>
            <span className="text-xs text-muted-foreground">{payment.category}</span>
          </div>
        </div>
      )
    },
    {
      id: 'amount',
      key: 'amount',
      label: 'Amount',
      primary: true,
      sortable: true,
      align: 'right',
      width: '120px',
      render: (value, payment) => (
        <div className="text-right">
          <div className={`text-lg font-bold ${
            payment.type === 'income' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {payment.type === 'income' ? '+' : '-'}{formatAmount(parseFloat(value as string))}
          </div>
        </div>
      )
    },
    {
      id: 'frequency',
      key: 'frequency',
      label: 'Frequency',
      sortable: true,
      filterable: true,
      hideOnMobile: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">{getFrequencyLabel(value as string)}</span>
        </div>
      )
    },
    {
      id: 'next_payment',
      key: 'next_payment_date',
      label: 'Next Payment',
      primary: true,
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">{formatDate(value as string)}</span>
        </div>
      )
    },
    {
      id: 'progress',
      key: 'payments_processed',
      label: 'Progress',
      hideOnMobile: true,
      render: (value, payment) => (
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">
            {value as number}
            {payment.payment_limit && <span className="text-muted-foreground"> / {payment.payment_limit}</span>}
          </span>
        </div>
      )
    },
    {
      id: 'status',
      key: 'is_active',
      label: 'Status',
      sortable: true,
      filterable: true,
      hideOnMobile: true,
      render: (_, payment) => {
        const statusInfo = getStatusInfo(payment);
        const StatusIcon = statusInfo.icon;
        return (
          <Badge className={statusInfo.className}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.label}
          </Badge>
        );
      }
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
            <span className="text-foreground">{value as string}</span>
          </div>
        ) : (
          <span className="text-muted-foreground italic text-sm">No customer</span>
        )
      )
    },
    {
      id: 'actions',
      key: 'id',
      label: 'Actions',
      align: 'center',
      sticky: true,
      width: '120px',
      render: (_, payment) => (
        <div className="flex items-center justify-center gap-1">
          <EditRecurringPaymentClientWrapper
            payment={payment}
            onSuccess={onUpdate}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={loadingStates[payment.id]}
                title="Delete Payment"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Confirm deletion</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Are you sure you want to delete this recurring payment for &quot;{payment.description}&quot;? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex justify-end space-x-2 pt-4">
                <AlertDialogCancel asChild>
                  <Button variant="outline">Cancel</Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDelete(payment.id)}
                    disabled={loadingStates[payment.id]}
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
  const renderExpanded = (payment: RecurringPayment) => (
    <div className="space-y-4 pt-2">
      {/* Payment Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Customer & Interaction */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase font-medium">Customer & Interaction</div>
          <div className="space-y-1">
            {payment.customer_name ? (
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-foreground">{payment.customer_name}</span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">No customer assigned</div>
            )}
            {payment.interaction_title && (
              <div className="text-xs text-muted-foreground">
                Interaction: {payment.interaction_title}
              </div>
            )}
          </div>
        </div>

        {/* Schedule Details */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase font-medium">Schedule</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Started:</span>
              <span className="text-foreground">{formatDate(payment.start_date)}</span>
            </div>
            {payment.end_date && (
              <div className="text-sm text-muted-foreground">
                Ends: {formatDate(payment.end_date)}
              </div>
            )}
            {payment.day_of_month && (
              <div className="text-sm text-muted-foreground">
                Day of month: {payment.day_of_month}
              </div>
            )}
            {payment.day_of_week !== null && (
              <div className="text-sm text-muted-foreground">
                Day of week: {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][payment.day_of_week]}
              </div>
            )}
          </div>
        </div>

        {/* Progress & Status */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase font-medium">Progress & Status</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Processed:</span>
              <span className="text-foreground font-medium">
                {payment.payments_processed}
                {payment.payment_limit && <span className="text-muted-foreground"> / {payment.payment_limit}</span>}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Next:</span>
              <span className="text-foreground">{formatDate(payment.next_payment_date)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile action buttons */}
      <div className="md:hidden flex flex-col gap-2 pt-3 border-t border-border">
        <div className="flex gap-2">
          <EditRecurringPaymentClientWrapper
            payment={payment}
            onSuccess={onUpdate}
          />
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={loadingStates[payment.id]}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Payment
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Confirm deletion</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Are you sure you want to delete this recurring payment for &quot;{payment.description}&quot;? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-2 pt-4">
                <AlertDialogCancel asChild>
                  <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDelete(payment.id)}
                    disabled={loadingStates[payment.id]}
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

  return (
    <EnhancedTable
      data={recurringPayments}
      columns={columns}
      keyExtractor={(payment) => payment.id}
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
        title: "No recurring payments found",
        description: "Create your first recurring payment to automate your income and expense tracking.",
        icon: <Repeat className="h-8 w-8 text-muted-foreground" />,
      }}
      className="w-full"
    />
  );
}