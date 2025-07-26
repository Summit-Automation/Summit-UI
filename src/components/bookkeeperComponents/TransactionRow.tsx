'use client';

import React, {useState} from 'react';
import {Transaction} from '@/types/transaction';
import {TableCell, TableRow} from '@/components/ui/table';
import {CheckCircle, ChevronDown, ChevronUp, Clipboard, Trash2, User} from 'lucide-react';
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
import {Button} from '@/components/ui/button';
import UpdateTransactionModal from '@/components/bookkeeperComponents/UpdateTransactionModal';
import {deleteTransaction} from '@/app/lib/services/bookkeeperServices/deleteTransaction';
import {cn} from '@/lib/utils';
import {useRouter} from 'next/navigation';
import {isSuccess} from '@/types/result';

export default function TransactionRow({
                                           transaction,
                                       }: {
    transaction: Transaction;
}) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const isIncome = transaction.type === 'income';

    const hoverBg = isIncome ? 'hover:bg-green-100 dark:hover:bg-green-800' : 'hover:bg-red-100   dark:hover:bg-red-800';

    const colorType = isIncome ? 'text-green-400' : 'text-red-400';

    const deleteTransactionHandler = async () => {
        try {
            const result = await deleteTransaction(transaction.id);
            if (isSuccess(result)) {
                router.refresh(); // Refresh the page to reflect changes
            } else {
                console.error('Failed to delete transaction:', result.error);
            }
        } catch (error) {
            console.error('Failed to delete transaction:', error);
        }
    };

    return (<>
        <TableRow
            onClick={() => setOpen(!open)}
            className={cn('cursor-pointer transition-colors duration-150', hoverBg)}
        >
            <TableCell>
                {new Date(transaction.timestamp).toLocaleDateString()}
            </TableCell>
            <TableCell>{transaction.category}</TableCell>
            <TableCell>{transaction.description}</TableCell>
            <TableCell className="text-right">${transaction.amount}</TableCell>
            <TableCell className={cn('text-center capitalize', colorType)}>
                {transaction.type}
            </TableCell>
            <TableCell className="text-center capitalize">
                {transaction.source}
            </TableCell>
            <TableCell className="text-center">
                {open ? <ChevronUp/> : <ChevronDown/>}
            </TableCell>
        </TableRow>

        {open && (<TableRow>
            <TableCell colSpan={7} className="p-0 bg-transparent">
                <div className="m-4 bg-slate-700 bg-opacity-50 dark:bg-opacity-30 rounded-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Customer */}
                        <div className="flex items-start space-x-2">
                            <User className="h-5 w-5 text-slate-400"/>
                            <div>
                                <div className="text-xs text-slate-400 uppercase">Customer</div>
                                <div className="text-sm text-white">
                                    {transaction.customer_name || 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Interaction */}
                        <div className="flex items-start space-x-2">
                            <Clipboard className="h-5 w-5 text-slate-400"/>
                            <div>
                                <div className="text-xs text-slate-400 uppercase">Interaction</div>
                                <div className="text-sm text-white">
                                    {transaction.interaction_title || 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Outcome */}
                        <div className="flex items-start space-x-2">
                            <CheckCircle className="h-5 w-5 text-slate-400"/>
                            <div>
                                <div className="text-xs text-slate-400 uppercase">Outcome</div>
                                <div className="text-sm text-white">
                                    {transaction.interaction_outcome || 'None recorded'}
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-left space-x-2">
                            {/* 1) Update modal trigger */}
                            <UpdateTransactionModal
                                transaction={transaction}
                                onSuccess={() => {
                                    router.refresh();
                                }}/>

                            {/* 2) Delete confirm */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="flex items-center space-x-1">
                                        <Trash2 className="h-4 w-4"/> <span>Delete</span>
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
                                    <div className="flex justify-end space-x-2 pt-4">
                                        <AlertDialogCancel asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </AlertDialogCancel>
                                        <AlertDialogAction asChild>
                                            <Button variant="destructive" onClick={deleteTransactionHandler}>
                                                Yes, delete
                                            </Button>
                                        </AlertDialogAction>
                                    </div>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </div>
            </TableCell>
        </TableRow>)}
    </>);
}
