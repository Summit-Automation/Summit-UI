'use client';

import React from 'react';
import { Transaction } from '@/types/transaction';
import TransactionRow from '@/components/bookkeeperComponents/TransactionRow';

export default function TransactionTable({ transactions }: { transactions: Transaction[] }) {
    const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (sortedTransactions.length === 0) {
        return <p className="text-gray-500 italic mt-4">No transactions recorded yet.</p>;
    }

    return (
        <div className="overflow-x-auto shadow border rounded mt-4">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-700 text-slate-100">
                <tr>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Category</th>
                    <th className="p-2 border">Description</th>
                    <th className="p-2 border text-right">Amount</th>
                    <th className="p-2 border text-center">Type</th>
                    <th className="p-2 border text-center">Source</th>
                </tr>
                </thead>
                <tbody>
                {sortedTransactions.map((txn) => (
                    <TransactionRow key={txn.id} transaction={txn} />
                ))}
                </tbody>
            </table>
        </div>
    );
}
