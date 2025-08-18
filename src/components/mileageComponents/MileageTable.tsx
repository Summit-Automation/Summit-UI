'use client';

import React, { useMemo } from 'react';
import { MileageEntry } from '@/types/mileage';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Trash2, Car, DollarSign } from 'lucide-react';
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
import UpdateMileageEntryModal from '@/components/mileageComponents/UpdateMileageEntryModal';
import { deleteMileageEntry } from '@/app/lib/services/mileageServices/deleteMileageEntry';
import { useRouter } from 'next/navigation';

export default function MileageTable({ mileageEntries }: { mileageEntries: MileageEntry[] }) {
    const router = useRouter();
    const { formatAmount } = useCurrency();
    
    const sortedEntries = useMemo(() => 
        [...mileageEntries].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        ), 
        [mileageEntries]
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
            sortable: true,
            render: (value: unknown) => formatDate(value as string)
        },
        {
            key: 'purpose',
            label: 'Purpose',
            primary: true,
            sortable: true,
            render: (value: unknown) => (
                <div className="font-medium max-w-[200px] md:max-w-[300px]" title={value as string}>
                    <span className="truncate block md:inline">{value as string}</span>
                </div>
            )
        },
        {
            key: 'miles',
            label: 'Miles',
            primary: true,
            sortable: true,
            className: "text-right",
            render: (value: unknown) => (
                <span className="font-mono font-semibold text-primary whitespace-nowrap">
                    {formatMiles(value as number)} mi
                </span>
            )
        },
        {
            key: 'is_business',
            label: 'Type',
            sortable: true,
            render: (value: unknown) => (
                <Badge variant={(value as boolean) ? 'default' : 'secondary'} className="capitalize">
                    {(value as boolean) ? 'Business' : 'Personal'}
                </Badge>
            )
        },
        {
            key: 'start_location',
            label: 'From',
            hideOnMobile: true,
            sortable: true,
            render: (value: unknown) => (
                <div className="max-w-[150px]" title={(value as string | null) || 'Not specified'}>
                    <span className="truncate block">
                        {(value as string | null) || <span className="text-muted-foreground italic">Not specified</span>}
                    </span>
                </div>
            )
        },
        {
            key: 'end_location',
            label: 'To',
            hideOnMobile: true,
            sortable: true,
            render: (value: unknown) => (
                <div className="max-w-[150px]" title={(value as string | null) || 'Not specified'}>
                    <span className="truncate block">
                        {(value as string | null) || <span className="text-muted-foreground italic">Not specified</span>}
                    </span>
                </div>
            )
        },
        {
            key: 'customer_name',
            label: 'Customer',
            hideOnMobile: true,
            sortable: true,
            render: (value: unknown) => (
                <div className="max-w-[120px]" title={(value as string | null) || 'N/A'}>
                    <span className="truncate block">{(value as string | null) || 'N/A'}</span>
                </div>
            )
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
                        <Car className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                            <div className="text-xs text-muted-foreground uppercase">Exact Distance</div>
                            <div className="text-lg font-mono font-bold text-foreground">
                                {formatMiles(mileageEntry.miles)} miles
                            </div>
                        </div>
                    </div>

                    {/* Tax Deduction */}
                    <div className="flex items-start space-x-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                            <div className="text-xs text-muted-foreground uppercase">
                                Tax Deduction (${standardMileageRate}/mile)
                            </div>
                            <div className="text-lg font-mono font-bold text-foreground">
                                {mileageEntry.is_business 
                                    ? formatAmount(potentialDeduction)
                                    : 'Not deductible'
                                }
                            </div>
                            {mileageEntry.is_business && (
                                <div className="text-xs text-muted-foreground mt-1">
                                    {formatMiles(mileageEntry.miles)} × ${standardMileageRate} = {formatAmount(potentialDeduction)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Purpose - Full Text */}
                <div className="border-t border-border pt-4">
                    <div className="text-xs text-muted-foreground uppercase mb-2">Full Purpose</div>
                    <div className="text-sm text-foreground p-3 bg-muted rounded-lg break-words">
                        {mileageEntry.purpose}
                    </div>
                </div>

                {/* Route Details */}
                {(mileageEntry.start_location || mileageEntry.end_location) && (
                    <div className="border-t border-border pt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">Route Details</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-xs text-muted-foreground uppercase mb-1">From</div>
                                <div className="text-foreground break-words p-2 bg-muted rounded">
                                    {mileageEntry.start_location || 'Not specified'}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground uppercase mb-1">To</div>
                                <div className="text-foreground break-words p-2 bg-muted rounded">
                                    {mileageEntry.end_location || 'Not specified'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Customer & Notes */}
                <div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs text-muted-foreground uppercase mb-1">Customer</div>
                        <div className="text-sm text-foreground break-words">
                            {mileageEntry.customer_name || 'No customer assigned'}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground uppercase mb-1">Notes</div>
                        <div className="text-sm text-foreground break-words">
                            {mileageEntry.notes || 'No additional notes'}
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-border">
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

    return (
        <DataTable
            data={sortedEntries}
            columns={columns}
            renderExpanded={renderExpanded}
            keyExtractor={(entry) => entry.id}
            className="w-full"
            emptyMessage="No mileage entries found"
        />
    );
}