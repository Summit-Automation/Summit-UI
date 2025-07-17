'use client';

import React from 'react';
import {Transaction} from '@/types/transaction';
import TransactionRow from '@/components/bookkeeperComponents/TransactionRow';

import {Table, TableBody, TableHead, TableHeader, TableRow,} from '@/components/ui/table';

export default function TransactionTable({transactions}: { transactions: Transaction[] }) {
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (sortedTransactions.length === 0) {
        return <p className="text-gray-500 italic mt-4">No transactions recorded yet.</p>;
    }

    return (<div className="overflow-auto rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center">Type</TableHead>
                        <TableHead className="text-center">Source</TableHead>
                        <TableHead/>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedTransactions.map((txn: Transaction) => (<TransactionRow key={txn.id} transaction={txn}/>))}
                </TableBody>
            </Table>
        </div>);
}
