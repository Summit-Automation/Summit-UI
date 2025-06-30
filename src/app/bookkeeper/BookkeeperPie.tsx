'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type PieData = {
    name: string;
    value: number;
}[];

export default function BookkeeperPie({ income, expenses }: { income: number; expenses: number }) {
    const data: PieData = [
        { name: 'Income', value: income },
        { name: 'Expenses', value: expenses },
    ];

    const COLORS = ['#16a34a', '#dc2626']; // green, red

    return (
        <div className=" bg-slate-800 w-full text-white p-4 rounded-lg shadow border border-slate-700">
            <h3 className="text-lg font-semibold mb-2">Income vs. Expenses</h3>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
