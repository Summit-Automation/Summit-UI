import {getTransactions} from '@/app/lib/services/bookkeeperServices/getTransactions';
import BookkeeperPie from '@/components/bookkeeperComponents/BookkeeperPie';
import BookkeeperSummary from "@/components/bookkeeperComponents/BookkeeperSummary";
import BookkeeperActions from "@/components/bookkeeperComponents/BookkeeperActions";
import TransactionTable from '@/components/bookkeeperComponents/TransactionTable';


export default async function BookkeeperPage() {
    const transactions = await getTransactions();

    return (<div className="p-6 space-y-6">
        <h2 className="text-3xl font-bold mb-4">📒 Bookkeeper Dashboard</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 🧾 Summary Stats */}
            <div className="bg-gray-800 text-white rounded-lg p-6 shadow h-full">
                <BookkeeperSummary transactions={transactions}/>
            </div>

            {/* 🥧 Pie Chart */}
            <div className="bg-gray-800 text-white rounded-lg p-6 shadow h-full">
                <BookkeeperPie transactions={transactions}/>
            </div>
        </div>

        {/* Button Actions */}
        <BookkeeperActions />

        {/* Transaction Table */}
        <TransactionTable transactions={transactions}/>

    </div>);
}
