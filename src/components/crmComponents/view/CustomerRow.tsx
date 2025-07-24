'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import InteractionList from '@/components/crmComponents/view/InteractionList';
import UpdateCustomerModal from '@/components/crmComponents/UpdateCustomerModal';
import { deleteCustomer } from '@/app/lib/services/crmServices/customer/deleteCustomer';
import type { Customer } from '@/types/customer';
import type { Interaction } from '@/types/interaction';
import { statusColor } from '@/lib/crmUtils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export default function CustomerRow({
                                        customer,
                                        interactions,
                                    }: {
    customer: Customer;
    interactions: Interaction[];
}) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        try {
            await deleteCustomer(customer.id);
            router.refresh();
        } catch (error) {
            console.error('Failed to delete customer:', error);
        }
    };

    return (
        <>
            <TableRow
                onClick={() => setOpen((o) => !o)}
                className="bg-slate-900/50 border-b border-slate-800 hover:bg-slate-900/70 transition-all duration-200 cursor-pointer"
            >
                {/* Name */}
                <TableCell className="flex items-center gap-3 p-4">
                    {open ? (
                        <ChevronUp size={20} className="text-slate-400" />
                    ) : (
                        <ChevronDown size={20} className="text-slate-500" />
                    )}
                    <span className="text-white font-semibold">{customer.full_name || 'Not Specified'}</span>
                </TableCell>

                {/* Business */}
                <TableCell className="p-4">
          <span className="text-slate-200">
            {customer.business || (
                <span className="text-slate-500 italic">None</span>
            )}
          </span>
                </TableCell>

                {/* Email */}
                <TableCell className="p-4">
          <span className="text-slate-200 truncate block max-w-xs">
            {customer.email}
          </span>
                </TableCell>

                {/* Phone */}
                <TableCell className="p-4">
                    <span className="text-slate-200">{customer.phone}</span>
                </TableCell>

                {/* Status */}
                <TableCell className="p-4">
                    <Badge className={`${statusColor(customer.status)} px-3 py-0.5 rounded-full text-xs`}>
                        {customer.status}
                    </Badge>
                </TableCell>

                {/* Created At */}
                <TableCell className="flex items-center gap-1 p-4 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(customer.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    })}
                </TableCell>

                {/* Actions */}
                <TableCell className="p-4 text-right">
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center space-x-2"
                    >
                        <UpdateCustomerModal
                            customer={customer}
                            onSuccess={() => router.refresh()}
                        />

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="flex items-center space-x-1">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete <strong>{customer.full_name || 'Not Specified'}</strong>? This action cannot be undone.
                                    </AlertDialogDescription>
                                    <div className="flex justify-end space-x-2 mt-4">
                                        <AlertDialogCancel asChild>
                                            <Button variant="outline" size="sm">
                                                Cancel
                                            </Button>
                                        </AlertDialogCancel>
                                        <AlertDialogAction asChild>
                                            <Button variant="destructive" size="sm" onClick={handleDelete}>
                                                Delete
                                            </Button>
                                        </AlertDialogAction>
                                    </div>
                                </AlertDialogHeader>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </TableCell>
            </TableRow>

            {/* Expanded interactions */}
            {open && (
                <InteractionList fullName={customer.full_name || 'Not Specified'} interactions={interactions} variant="table" />
            )}
        </>
    );
}
