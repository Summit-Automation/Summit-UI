'use client';

import React from 'react';
import { MileageEntry } from '@/types/mileage';
import MileageRow from '@/components/mileageComponents/MileageRow';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function MileageTable({ mileageEntries }: { mileageEntries: MileageEntry[] }) {
    const sortedEntries = [...mileageEntries].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (sortedEntries.length === 0) {
        return <p className="text-gray-500 italic mt-4">No mileage entries recorded yet.</p>;
    }

    return (
        <div className="overflow-auto rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead className="text-right">Miles (Exact)</TableHead>
                        <TableHead className="text-center">Type</TableHead>
                        <TableHead className="text-center">Customer</TableHead>
                        <TableHead />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedEntries.map((entry: MileageEntry) => (
                        <MileageRow key={entry.id} mileageEntry={entry} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}