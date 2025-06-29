'use client';

import { Transaction } from '@/types/transaction';

export default function TransactionRow({ transaction }: { transaction: Transaction }) {
    console.log('[TransactionRow]', transaction); // 🔍 Debug this

    const isIncome = transaction.type === 'income';

    return (
        <tr className={isIncome ? 'bg-green-700' : 'bg-red-800'}>
            <td className="p-2 border">{new Date(transaction.timestamp).toLocaleDateString()}</td>
            <td className="p-2 border">{transaction.category}</td>
            <td className="p-2 border">{transaction.description}</td>
            <td className="p-2 border text-right">${parseFloat(transaction.amount).toFixed(2)}</td>
            <td className="p-2 border text-center">{transaction.type}</td>
            <td className="p-2 border text-center">{transaction.source}</td>
        </tr>
    );
}