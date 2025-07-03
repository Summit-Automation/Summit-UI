import { Transaction } from '@/types/transaction';

export function summarizeTransactions(transactions: Transaction[]) {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const net = income - expenses;

    return {
        totalIncome: income,
        totalExpenses: expenses,
        netBalance: net,
    };
}
