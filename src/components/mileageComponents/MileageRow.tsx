'use client';

import React, { useState } from 'react';
import { MileageEntry } from '@/types/mileage';
import { TableCell, TableRow } from '@/components/ui/table';
import { CheckCircle, ChevronDown, ChevronUp, MapPin, Trash2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import UpdateMileageEntryModal from '@/components/mileageComponents/UpdateMileageEntryModal';
import { deleteMileageEntry } from '@/app/lib/services/mileageServices/deleteMileageEntry';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function MileageRow({ mileageEntry }: { mileageEntry: MileageEntry }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const isBusiness = mileageEntry.is_business;

    const hoverBg = isBusiness 
        ? 'hover:bg-green-100 dark:hover:bg-green-800' 
        : 'hover:bg-blue-100 dark:hover:bg-blue-800';

    const deleteMileageEntryHandler = async () => {
        try {
            await deleteMileageEntry(mileageEntry.id);
            router.refresh();
        } catch (error) {
            console.error('Failed to delete mileage entry:', error);
        }
    };

    // Format miles - only show decimal if needed (5.0 becomes "5", 5.5 stays "5.5")
    const formatMiles = (miles: number) => {
        return miles % 1 === 0 ? miles.toFixed(0) : miles.toFixed(1);
    };

    // IRS standard mileage rate for 2025
    const standardMileageRate = 0.67;
    const potentialDeduction = mileageEntry.miles * standardMileageRate;

    // Format currency with exact precision
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    return (
        <>
            <TableRow
                onClick={() => setOpen(!open)}
                className={cn('cursor-pointer transition-colors duration-150', hoverBg)}
            >
                <TableCell>
                    {new Date(mileageEntry.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                    {mileageEntry.start_location || <span className="text-slate-500 italic">Not specified</span>}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                    {mileageEntry.end_location || <span className="text-slate-500 italic">Not specified</span>}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                    {mileageEntry.purpose}
                </TableCell>
                <TableCell className="text-right font-mono font-semibold">
                    {formatMiles(mileageEntry.miles)}
                </TableCell>
                <TableCell className="text-center">
                    <Badge 
                        className={cn(
                            'capitalize',
                            isBusiness 
                                ? 'bg-green-600 text-green-100' 
                                : 'bg-blue-600 text-blue-100'
                        )}
                    >
                        {isBusiness ? 'Business' : 'Personal'}
                    </Badge>
                </TableCell>
                <TableCell className="text-center">
                    {mileageEntry.customer_name || 'N/A'}
                </TableCell>
                <TableCell className="text-center">
                    {open ? <ChevronUp /> : <ChevronDown />}
                </TableCell>
            </TableRow>

            {open && (
                <TableRow>
                    <TableCell colSpan={8} className="p-0 bg-transparent">
                        <div className="m-4 bg-slate-700 bg-opacity-50 dark:bg-opacity-30 rounded-lg p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                {/* Exact Miles Display */}
                                <div className="flex items-start space-x-2">
                                    <MapPin className="h-5 w-5 text-slate-400" />
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase">Exact Miles</div>
                                        <div className="text-lg font-mono font-bold text-white">
                                            {formatMiles(mileageEntry.miles)} miles
                                        </div>
                                    </div>
                                </div>

                                {/* Tax Deduction */}
                                <div className="flex items-start space-x-2">
                                    <CheckCircle className="h-5 w-5 text-slate-400" />
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase">
                                            Tax Deduction ({standardMileageRate}/mile)
                                        </div>
                                        <div className="text-lg font-mono font-bold text-white">
                                            {isBusiness 
                                                ? formatCurrency(potentialDeduction)
                                                : 'Not deductible'
                                            }
                                        </div>
                                        {isBusiness && (
                                            <div className="text-xs text-slate-400 mt-1">
                                                {formatMiles(mileageEntry.miles)} × ${standardMileageRate} = {formatCurrency(potentialDeduction)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="flex items-start space-x-2">
                                    <MapPin className="h-5 w-5 text-slate-400" />
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase">Notes</div>
                                        <div className="text-sm text-white">
                                            {mileageEntry.notes || 'No notes'}
                                        </div>
                                    </div>
                                </div>

                                {/* Locations (if specified) */}
                                {(mileageEntry.start_location || mileageEntry.end_location) && (
                                    <div className="flex items-start space-x-2">
                                        <MapPin className="h-5 w-5 text-slate-400" />
                                        <div>
                                            <div className="text-xs text-slate-400 uppercase">Route Details</div>
                                            <div className="text-sm text-white">
                                                <span className="font-medium">From:</span> {mileageEntry.start_location || 'Not specified'}
                                                <br />
                                                <span className="font-medium">To:</span> {mileageEntry.end_location || 'Not specified'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex justify-left space-x-2">
                                <UpdateMileageEntryModal
                                    mileageEntry={mileageEntry}
                                    onSuccess={() => router.refresh()}
                                />

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" className="flex items-center space-x-1">
                                            <Trash2 className="h-4 w-4" />
                                            <span>Delete</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to permanently delete this mileage entry for {formatMiles(mileageEntry.miles)} miles? 
                                                This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="flex justify-end space-x-2 pt-4">
                                            <AlertDialogCancel asChild>
                                                <Button variant="outline">Cancel</Button>
                                            </AlertDialogCancel>
                                            <AlertDialogAction asChild>
                                                <Button variant="destructive" onClick={deleteMileageEntryHandler}>
                                                    Yes, delete
                                                </Button>
                                            </AlertDialogAction>
                                        </div>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}