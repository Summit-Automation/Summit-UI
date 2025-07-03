import {Transaction} from '@/types/transaction';
import {summarizeTransactions} from '@/utils/finance/summarizeTransactions';

export default function BookkeeperSummary({transactions}: { transactions: Transaction[] }) {

    if (!transactions || transactions.length === 0) {
        return <p className="text-gray-500 italic mt-4">No transactions recorded yet.</p>;
    }
    const {totalIncome: income, totalExpenses: expenses, netBalance: net} = summarizeTransactions(transactions);

    return (<div className="space-y-4">
            <div
                className={`rounded-lg p-4 shadow border-5 border-gray-200 ${net >= 0 ? 'bg-green-900 text-white' : 'bg-red-700 text-white'}`}>
                <h3 className="text-xl font-semibold">Net Balance</h3>
                <p className="text-2xl font-bold">${net.toFixed(2)}</p>
            </div>
            <div className="bg-green-700 text-white rounded-lg p-4 shadow border-2 border-gray-200">
                <h3 className="text-lg font-semibold">Total Income</h3>
                <p className="text-2xl font-bold">${income.toFixed(2)}</p>
            </div>
            <div className="bg-red-900 text-white rounded-lg p-4 shadow border-2 border-gray-200">
                <h3 className="text-lg font-semibold">Total Expenses</h3>
                <p className="text-2xl font-bold">${expenses.toFixed(2)}</p>
            </div>
        </div>);
}
