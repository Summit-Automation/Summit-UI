'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '@/types/transaction';
import { summarizeTransactions} from "@/utils/finance/summarizeTransactions";

type PieData = {
    name: string;
    value: number;
}[];

export default function BookkeeperPie({transactions}: { transactions: Transaction[] }) {
    if (!transactions || transactions.length === 0) {
        return <p className="text-gray-500 italic mt-4">No transactions recorded yet.</p>;
    }
    const { totalIncome: income, totalExpenses: expenses } = summarizeTransactions(transactions);
    const data: PieData = [
        { name: 'Income', value: income },
        { name: 'Expenses', value: expenses },
    ];

    const COLORS = ['#16a34a', '#dc2626']; // green, red

    return (
        <div className="h-full flex flex-col justify-between">
            <h3 className="text-lg font-semibold mb-2">Income vs. Expenses</h3>
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius="75%"
                            label
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

}
