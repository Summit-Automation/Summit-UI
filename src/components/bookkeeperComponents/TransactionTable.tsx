'use client';

import React, { useMemo } from 'react';
import { Transaction } from '@/types/transaction';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, User, Clipboard, CheckCircle } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const TransactionTable = React.memo(function TransactionTable({ transactions }: { transactions: Transaction[] }) {
    const router = useRouter();
    const { formatAmount } = useCurrency();
    
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

    const columns = [
        {
            key: 'timestamp',
            label: 'Date',
            primary: true,
            sortable: true,
            render: (value: unknown) => new Date(value as string).toLocaleDateString()
        },
        {
            key: 'description',
            label: 'Description',
            primary: true,
            sortable: true,
            render: (value: unknown) => (
                <div className="font-medium max-w-[200px] md:max-w-[300px]" title={value as string}>
                    <span className="break-words whitespace-normal leading-tight">{value as string}</span>
                </div>
            )
        },
        {
            key: 'amount',
            label: 'Amount',
            primary: true,
            sortable: true,
            className: "text-right",
            render: (value: unknown, transaction: Transaction) => (
                <span className={cn(
                    "font-semibold whitespace-nowrap",
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                )}>
                    {formatAmount(parseFloat(value as string))}
                </span>
            )
        },
        {
            key: 'category',
            label: 'Category',
            sortable: true,
            render: (value: unknown) => (
                <div className="max-w-[150px]" title={value as string}>
                    <span className="truncate block">{value as string}</span>
                </div>
            )
        },
        {
            key: 'type',
            label: 'Type',
            sortable: true,
            render: (value: unknown) => (
                <Badge variant={(value as string) === 'income' ? 'default' : 'destructive'} className="capitalize">
                    {value as string}
                </Badge>
            )
        },
        {
            key: 'source',
            label: 'Source',
            hideOnMobile: true,
            sortable: true,
            render: (value: unknown) => (
                <span className="capitalize text-sm">{value as string}</span>
            )
        }
    ];

    const renderExpanded = (transaction: Transaction) => (
        <div className="space-y-4">
            {/* Additional details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Customer */}
                <div className="flex items-start space-x-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                        <div className="text-xs text-muted-foreground uppercase">Customer</div>
                        <div className="text-sm text-foreground break-words">
                            {transaction.customer_name || 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Interaction */}
                <div className="flex items-start space-x-2">
                    <Clipboard className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                        <div className="text-xs text-muted-foreground uppercase">Interaction</div>
                        <div className="text-sm text-foreground break-words">
                            {transaction.interaction_title || 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Outcome */}
                <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                        <div className="text-xs text-muted-foreground uppercase">Outcome</div>
                        <div className="text-sm text-foreground break-words">
                            {transaction.interaction_outcome || 'None recorded'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Description */}
            <div className="border-t border-border pt-4">
                <div className="text-xs text-muted-foreground uppercase mb-2">Full Description</div>
                <div className="text-sm text-foreground p-3 bg-muted rounded-lg break-words whitespace-pre-wrap">
                    {transaction.description}
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-border">
                <UpdateTransactionModal
                    transaction={transaction}
                    onSuccess={() => router.refresh()}
                />

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            className="w-full sm:w-auto flex items-center justify-center space-x-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to permanently delete this transaction? This action
                                cannot be undone.
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
        <DataTable
            data={sortedTransactions}
            columns={columns}
            renderExpanded={renderExpanded}
            keyExtractor={(transaction) => transaction.id}
            className="w-full"
            emptyMessage="No transactions found"
        />
    );
});

export default TransactionTable;