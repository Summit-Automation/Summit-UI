'use client';

import React, { useMemo, useState } from 'react';
import { Transaction } from '@/types/transaction';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trash2, 
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
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
import UpdateTransactionModal from '@/components/bookkeeperComponents/UpdateTransactionModal';
import { deleteTransaction } from '@/app/lib/services/bookkeeperServices/deleteTransaction';
import { exportTransactions } from '@/app/lib/services/bookkeeperServices/exportTransactions';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

import { ModernTable, ModernColumn } from '@/components/ui/modern-table';

interface TransactionTableEnhancedProps {
  transactions: Transaction[];
  loading?: boolean;
  title?: string;
  description?: string;
}

const TransactionTableEnhanced = React.memo(function TransactionTableEnhanced({ 
  transactions, 
  loading = false,
  title = "Transactions",
  description = "Track and manage your financial transactions"
}: TransactionTableEnhancedProps) {
  const router = useRouter();
  const { formatAmount } = useCurrency();
  const [isExporting, setIsExporting] = useState(false);
  
  const sortedTransactions = useMemo(() => 
    [...transactions].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ), 
    [transactions]
  );

  const deleteTransactionHandler = async (id: string) => {
    try {
      await deleteTransaction(id);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  // Export handling
  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true);
    try {
      const result = await exportTransactions(format);
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

  // Type and category badge helpers
  const getTypeBadgeProps = (type: string) => {
    return type === 'income' 
      ? { variant: 'default' as const, className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" }
      : { variant: 'destructive' as const, className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" };
  };


  // Column definitions for the enhanced table
  const columns: ModernColumn<Transaction>[] = [
    {
      id: 'date',
      key: 'timestamp',
      label: 'Date',
      primary: true,
      sortable: true,
      searchable: true,
      width: '110px',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground font-medium">
            {new Date(value as string).toLocaleDateString()}
          </span>
        </div>
      )
    },
    {
      id: 'description',
      key: 'description',
      label: 'Description',
      primary: true,
      sortable: true,
      searchable: true,
      width: 'minmax(200px, 2fr)',
      render: (value) => (
        <div className="min-w-0" title={value as string}>
          <span className="text-foreground font-medium truncate block">
            {value as string}
          </span>
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
      width: '130px',
      render: (value, transaction) => (
        <div className="flex items-center justify-end gap-2">
          {transaction.type === 'income' ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={cn(
            "font-semibold whitespace-nowrap",
            transaction.type === 'income' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          )}>
            {formatAmount(parseFloat(value as string))}
          </span>
        </div>
      )
    },
    {
      id: 'type',
      key: 'type',
      label: 'Type',
      sortable: true,
      filterable: true,
      hideOnMobile: true,
      width: '100px',
      render: (value) => {
        const type = value as string;
        const badgeProps = getTypeBadgeProps(type);
        return (
          <Badge {...badgeProps} className={cn("capitalize", badgeProps.className)}>
            {type}
          </Badge>
        );
      }
    },
    {
      id: 'category',
      key: 'category',
      label: 'Category',
      sortable: true,
      filterable: true,
      searchable: true,
      hideOnMobile: true,
      width: 'minmax(120px, 1fr)',
      render: (value) => (
        <div className="min-w-0" title={value as string}>
          <span className="truncate block text-foreground">{value as string}</span>
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
      render: (_, transaction) => (
        <div className="flex gap-1 justify-center">
          <UpdateTransactionModal
            transaction={transaction}
            onSuccess={() => router.refresh()}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                title="Delete Transaction"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Confirm deletion</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Are you sure you want to permanently delete this transaction? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex justify-end space-x-2 pt-4">
                <AlertDialogCancel asChild>
                  <Button variant="outline">Cancel</Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button variant="destructive" onClick={() => deleteTransactionHandler(transaction.id)}>
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
      data={sortedTransactions}
      columns={columns}
      keyExtractor={(transaction) => transaction.id}
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
        title: "No transactions found",
        description: "Start by adding your first transaction to track your finances.",
        icon: <DollarSign className="h-8 w-8 text-muted-foreground" />,
      }}
      className="w-full"
    />
  );
});

export default TransactionTableEnhanced;