import {getTransactions} from '@/app/lib/services/bookkeeperServices/getTransactions';
import TransactionRow from '@/app/bookkeeper/TransactionRow';
import BookkeeperPie from '@/components/bookkeeperComponents/BookkeeperPie';
import CreateTransactionClientWrapper from '@/app/bookkeeper/CreateTransactionClientWrapper';


export default async function BookkeeperPage() {
    const transactions = await getTransactions();


    // --- Aggregate summary stats ---
    const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const netBalance = totalIncome - totalExpenses;


    return (<div className="p-6 space-y-6">
        <h2 className="text-3xl font-bold mb-4">📒 Bookkeeper Dashboard</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
                {/* 📊 Summary Stats */}
                <div
                    className={`rounded-lg p-4 shadow border-5 border-gray-200 ${netBalance >= 0 ? 'bg-green-900 text-white' : 'bg-red-700 text-white'}`}
                >
                    <h3 className="text-xl font-semibold">Net Balance</h3>
                    <p className="text-2xl font-bold">${netBalance.toFixed(2)}</p>
                </div>
                <div className="bg-green-700 text-white rounded-lg p-4 shadow border-2 border-gray-200">
                    <h3 className="text-lg font-semibold">Total Income</h3>
                    <p className="text-2xl font-bold">${totalIncome.toFixed(2)}</p>
                </div>
                <div className="bg-red-900 text-white rounded-lg p-4 shadow border-2 border-gray-200">
                    <h3 className="text-lg font-semibold">Total Expenses</h3>
                    <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
                </div>
            </div>

            {/* 🥧 Pie Chart */}
            <div className="w-full h-full flex items-center justify-center">
                <BookkeeperPie income={totalIncome} expenses={totalExpenses}/>
            </div>
        </div>


        <fieldset className="mb-6">
            <legend className="text-sm text-gray-500 font-semibold mb-2">
                Actions (coming soon)
            </legend>
            <div className="flex flex-wrap gap-3">
                <div className="flex flex-wrap gap-3 mb-4">

                    <CreateTransactionClientWrapper/>

                    <button
                        className="bg-blue-800 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700"
                        disabled
                        title="Coming soon: Upload receipts using an AI agent (Flowise + OCR)"
                    >
                        🧠 AI Receipt Upload
                    </button>

                    <button
                        className="bg-indigo-700 text-white px-4 py-2 rounded shadow-sm hover:bg-indigo-600"
                        disabled
                        title="Coming soon: Import transactions from CSV"
                    >
                        📥 Import CSV
                    </button>

                    <button
                        className="bg-slate-700 text-white px-4 py-2 rounded shadow-sm hover:bg-slate-600"
                        disabled
                        title="Coming soon: Export data to CSV or PDF"
                    >
                        📤 Export
                    </button>

                    <button
                        className="bg-yellow-700 text-white px-4 py-2 rounded shadow-sm hover:bg-yellow-600"
                        disabled
                        title="Coming soon: Trigger AI agent summary of this ledger"
                    >
                        📝 AI Summary Report
                    </button>
                </div>

            </div>
        </fieldset>

        {/* Transaction Table */}
        {transactions.length === 0 ? (<p className="text-gray-500 italic mt-4">No transactions recorded yet.</p>) : (
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
                    {transactions.map((txn) => (<TransactionRow key={txn.id} transaction={txn}/>))}
                    </tbody>
                </table>
            </div>)}

    </div>);
}
