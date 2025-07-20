'use client';

import React from 'react';
import { MileageEntry } from '@/types/mileage';
import { MobileTable } from '@/components/ui/mobile-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Trash2, Car, DollarSign } from 'lucide-react';
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
import UpdateMileageEntryModal from '@/components/mileageComponents/UpdateMileageEntryModal';
import { deleteMileageEntry } from '@/app/lib/services/mileageServices/deleteMileageEntry';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function MileageTable({ mileageEntries }: { mileageEntries: MileageEntry[] }) {
    const router = useRouter();
    
    const sortedEntries = [...mileageEntries].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const deleteMileageEntryHandler = async (id: string) => {
        try {
            await deleteMileageEntry(id);
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

    // Format currency with exact precision
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const columns = [
        {
            key: 'date',
            label: 'Date',
            primary: true,
            render: (value: unknown) => formatDate(value as string)
        },
        {
            key: 'purpose',
            label: 'Purpose',
            primary: true,
            render: (value: unknown) => (
                <span className="font-medium truncate block max-w-[200px] md:max-w-none">
                    {value as string}
                </span>
            )
        },
        {
            key: 'miles',
            label: 'Miles',
            primary: true,
            render: (value: unknown) => (
                <span className="font-mono font-semibold text-blue-400">
                    {formatMiles(value as number)} mi
                </span>
            )
        },
        {
            key: 'is_business',
            label: 'Type',
            render: (value: unknown) => (
                <Badge className={cn(
                    'capitalize text-xs',
                    (value as boolean) 
                        ? 'bg-green-600 text-green-100' 
                        : 'bg-blue-600 text-blue-100'
                )}>
                    {(value as boolean) ? 'Business' : 'Personal'}
                </Badge>
            )
        },
        {
            key: 'start_location',
            label: 'From',
            hideOnMobile: true,
            render: (value: unknown) => (
                <span className="truncate block max-w-xs">
                    {(value as string | null) || <span className="text-slate-500 italic">Not specified</span>}
                </span>
            )
        },
        {
            key: 'end_location',
            label: 'To',
            hideOnMobile: true,
            render: (value: unknown) => (
                <span className="truncate block max-w-xs">
                    {(value as string | null) || <span className="text-slate-500 italic">Not specified</span>}
                </span>
            )
        },
        {
            key: 'customer_name',
            label: 'Customer',
            hideOnMobile: true,
            render: (value: unknown) => (value as string | null) || 'N/A'
        }
    ];

    const renderExpanded = (mileageEntry: MileageEntry) => {
        const potentialDeduction = mileageEntry.miles * standardMileageRate;
        
        return (
            <div className="space-y-4">
                {/* Trip Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Exact Miles Display */}
                    <div className="flex items-start space-x-2">
                        <Car className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                            <div className="text-xs text-slate-400 uppercase">Exact Distance</div>
                            <div className="text-lg font-mono font-bold text-white">
                                {formatMiles(mileageEntry.miles)} miles
                            </div>
                        </div>
                    </div>

                    {/* Tax Deduction */}
                    <div className="flex items-start space-x-2">
                        <DollarSign className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div>
                            <div className="text-xs text-slate-400 uppercase">
                                Tax Deduction (${standardMileageRate}/mile)
                            </div>
                            <div className="text-lg font-mono font-bold text-white">
                                {mileageEntry.is_business 
                                    ? formatCurrency(potentialDeduction)
                                    : 'Not deductible'
                                }
                            </div>
                            {mileageEntry.is_business && (
                                <div className="text-xs text-slate-400 mt-1">
                                    {formatMiles(mileageEntry.miles)} × ${standardMileageRate} = {formatCurrency(potentialDeduction)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Route Details */}
                {(mileageEntry.start_location || mileageEntry.end_location) && (
                    <div className="border-t border-slate-700 pt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-300">Route Details</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-xs text-slate-400 uppercase mb-1">From</div>
                                <div className="text-slate-200">
                                    {mileageEntry.start_location || 'Not specified'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 uppercase mb-1">To</div>
                                <div className="text-slate-200">
                                    {mileageEntry.end_location || 'Not specified'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Customer & Notes */}
                <div className="border-t border-slate-700 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs text-slate-400 uppercase mb-1">Customer</div>
                        <div className="text-sm text-slate-200">
                            {mileageEntry.customer_name || 'No customer assigned'}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase mb-1">Notes</div>
                        <div className="text-sm text-slate-200">
                            {mileageEntry.notes || 'No additional notes'}
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-700">
                    <UpdateMileageEntryModal
                        mileageEntry={mileageEntry}
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
                                    Are you sure you want to permanently delete this mileage entry for {formatMiles(mileageEntry.miles)} miles? 
                                    This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-2 pt-4">
                                <AlertDialogCancel asChild>
                                    <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
                                </AlertDialogCancel>
                                <AlertDialogAction asChild>
                                    <Button 
                                        variant="destructive" 
                                        onClick={() => deleteMileageEntryHandler(mileageEntry.id)}
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
    };

    if (sortedEntries.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400">
                No mileage entries recorded yet.
            </div>
        );
    }

    return (
        <MobileTable
            data={sortedEntries}
            columns={columns}
            renderExpanded={renderExpanded}
            keyExtractor={(entry) => entry.id}
            className="w-full"
            emptyMessage="No mileage entries found"
        />
    );
}