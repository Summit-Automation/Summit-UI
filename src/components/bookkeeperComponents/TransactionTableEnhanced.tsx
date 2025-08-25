'use client';

import React, { useMemo, useState } from 'react';
import { Transaction } from '@/types/transaction';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trash2, 
  User, 
  Clipboard, 
  CheckCircle, 
  DollarSign,
  Calendar,
  FileText,
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

import { EnhancedTable, EnhancedColumn } from '@/components/ui/enhanced-table';

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

  const getSourceBadgeProps = (source: string) => {
    const sourceMap = {
      manual: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
      ai_agent: { className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
      import: { className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
    };
    return sourceMap[source as keyof typeof sourceMap] || sourceMap.manual;
  };

  // Column definitions for the enhanced table
  const columns: EnhancedColumn<Transaction>[] = [
    {
      id: 'date',
      key: 'timestamp',
      label: 'Date',
      primary: true,
      sortable: true,
      searchable: true,
      width: '120px',
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
      render: (value) => (
        <div className="max-w-[200px] md:max-w-[300px]" title={value as string}>
          <span className="break-words whitespace-normal leading-tight text-foreground font-medium">
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
      width: '120px',
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
      render: (value) => (
        <div className="max-w-[150px]" title={value as string}>
          <span className="truncate block text-foreground">{value as string}</span>
        </div>
      )
    },
    {
      id: 'source',
      key: 'source',
      label: 'Source',
      sortable: true,
      filterable: true,
      hideOnMobile: true,
      width: '120px',
      render: (value) => {
        const source = value as string;
        const badgeProps = getSourceBadgeProps(source);
        const sourceLabel = source === 'manual' ? 'Manual' : source === 'ai_agent' ? 'AI Agent' : 'Import';
        return (
          <Badge variant="outline" className={badgeProps.className}>
            {sourceLabel}
          </Badge>
        );
      }
    },
    {
      id: 'actions',
      key: 'id',
      label: 'Actions',
      align: 'center',
      sticky: true,
      width: '100px',
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

  // Expanded row content for mobile and desktop
  const renderExpanded = (transaction: Transaction) => (
    <div className="space-y-4 pt-2">
      {/* Additional details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Customer */}
        <div className="flex items-start space-x-2">
          <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground uppercase font-medium">Customer</div>
            <div className="text-sm text-foreground break-words">
              {transaction.customer_name || 'N/A'}
            </div>
          </div>
        </div>

        {/* Interaction */}
        <div className="flex items-start space-x-2">
          <Clipboard className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground uppercase font-medium">Interaction</div>
            <div className="text-sm text-foreground break-words">
              {transaction.interaction_title || 'N/A'}
            </div>
          </div>
        </div>

        {/* Outcome */}
        <div className="flex items-start space-x-2">
          <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground uppercase font-medium">Outcome</div>
            <div className="text-sm text-foreground break-words">
              {transaction.interaction_outcome || 'None recorded'}
            </div>
          </div>
        </div>
      </div>

      {/* Full Description */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div className="text-xs text-muted-foreground uppercase font-medium">Full Description</div>
        </div>
        <div className="text-sm text-foreground p-3 bg-muted/30 rounded-lg break-words whitespace-pre-wrap">
          {transaction.description}
        </div>
      </div>

      {/* Mobile action buttons */}
      <div className="md:hidden flex flex-col gap-2 pt-3 border-t border-border">
        <UpdateTransactionModal
          transaction={transaction}
          onSuccess={() => router.refresh()}
        />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-full flex items-center justify-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Transaction</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Confirm deletion</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Are you sure you want to permanently delete this transaction? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-2 pt-4">
              <AlertDialogCancel asChild>
                <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button 
                  variant="destructive" 
                  onClick={() => deleteTransactionHandler(transaction.id)}
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
  );

  return (
    <EnhancedTable
      data={sortedTransactions}
      columns={columns}
      keyExtractor={(transaction) => transaction.id}
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
        title: "No transactions found",
        description: "Start by adding your first transaction to track your finances.",
        icon: <DollarSign className="h-8 w-8 text-muted-foreground" />,
      }}
      className="w-full"
    />
  );
});

export default TransactionTableEnhanced;