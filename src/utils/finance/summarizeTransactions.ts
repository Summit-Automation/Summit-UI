import { Transaction } from '@/types/transaction';

export function summarizeTransactions(transactions: Transaction[]) {
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const transaction of transactions) {
        const amount = parseFloat(transaction.amount);
        if (transaction.type === 'income') {
            totalIncome += amount;
        } else {
            totalExpenses += amount;
        }
    }

    return {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
    };
}