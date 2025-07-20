'use client';

import React from 'react';
import { Transaction } from '@/types/transaction';
import { MobileTable } from '@/components/ui/mobile-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, User, Clipboard, CheckCircle } from 'lucide-react';
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

export default function TransactionTable({ transactions }: { transactions: Transaction[] }) {
    const router = useRouter();
    
    const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const deleteTransactionHandler = async (id: string) => {
        try {
            await deleteTransaction(id);
            router.refresh();
        } catch (error) {
            console.error('Failed to delete transaction:', error);
        }
    };

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(parseFloat(amount));
    };

    const columns = [
        {
            key: 'timestamp',
            label: 'Date',
            primary: true,
            render: (value: unknown) => new Date(value as string).toLocaleDateString()
        },
        {
            key: 'description',
            label: 'Description',
            primary: true,
            render: (value: unknown) => (
                <span className="font-medium truncate block max-w-[200px] md:max-w-none">
                    {value as string}
                </span>
            )
        },
        {
            key: 'amount',
            label: 'Amount',
            primary: true,
            render: (value: unknown, transaction: Transaction) => (
                <span className={cn(
                    "font-semibold",
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                )}>
                    {formatCurrency(value as string)}
                </span>
            )
        },
        {
            key: 'category',
            label: 'Category',
            render: (value: unknown) => value as string
        },
        {
            key: 'type',
            label: 'Type',
            render: (value: unknown) => (
                <Badge className={cn(
                    'capitalize text-xs',
                    (value as string) === 'income' 
                        ? 'bg-green-600 text-green-100' 
                        : 'bg-red-600 text-red-100'
                )}>
                    {value as string}
                </Badge>
            )
        },
        {
            key: 'source',
            label: 'Source',
            hideOnMobile: true,
            render: (value: unknown) => (
                <span className="capitalize text-xs">{value as string}</span>
            )
        }
    ];

    const renderExpanded = (transaction: Transaction) => (
        <div className="space-y-4">
            {/* Additional details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Customer */}
                <div className="flex items-start space-x-2">
                    <User className="h-4 w-4 text-slate-400 mt-0.5" />
                    <div>
                        <div className="text-xs text-slate-400 uppercase">Customer</div>
                        <div className="text-sm text-white">
                            {transaction.customer_name || 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Interaction */}
                <div className="flex items-start space-x-2">
                    <Clipboard className="h-4 w-4 text-slate-400 mt-0.5" />
                    <div>
                        <div className="text-xs text-slate-400 uppercase">Interaction</div>
                        <div className="text-sm text-white">
                            {transaction.interaction_title || 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Outcome */}
                <div className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-slate-400 mt-0.5" />
                    <div>
                        <div className="text-xs text-slate-400 uppercase">Outcome</div>
                        <div className="text-sm text-white">
                            {transaction.interaction_outcome || 'None recorded'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-700">
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

    if (sortedTransactions.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400">
                No transactions recorded yet.
            </div>
        );
    }

    return (
        <MobileTable
            data={sortedTransactions}
            columns={columns}
            renderExpanded={renderExpanded}
            keyExtractor={(transaction) => transaction.id}
            className="w-full"
            emptyMessage="No transactions found"
        />
    );
}