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
  Target,
  AlertCircle,
  CheckCircle,
  Trash2
} from 'lucide-react';

import { ModernTable, ModernColumn } from '@/components/ui/modern-table';

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
  const columns: ModernColumn<RecurringPayment>[] = [
    {
      id: 'description',
      key: 'description',
      label: 'Description',
      primary: true,
      sortable: true,
      searchable: true,
      width: '250px',
      render: (value, payment) => (
        <div className="space-y-1">
          <div className="font-medium text-foreground truncate max-w-[230px]" title={value as string}>
            {value as string}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getTypeBadgeProps(payment.type).className}>
              {payment.type === 'income' ? (
                <><TrendingUp className="h-3 w-3 mr-1" />Income</>
              ) : (
                <><TrendingDown className="h-3 w-3 mr-1" />Expense</>
              )}
            </Badge>
            <span className="text-xs text-muted-foreground truncate max-w-[120px]" title={payment.category}>
              {payment.category}
            </span>
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
      width: '160px',
      render: (value) => (
        value ? (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-foreground truncate max-w-[120px]" title={value as string}>
              {value as string}
            </span>
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


  return (
    <ModernTable
      data={recurringPayments}
      columns={columns}
      keyExtractor={(payment) => payment.id}
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
        title: "No recurring payments found",
        description: "Create your first recurring payment to automate your income and expense tracking.",
        icon: <Repeat className="h-8 w-8 text-muted-foreground" />,
      }}
      className="w-full"
    />
  );
}