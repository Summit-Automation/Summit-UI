'use client';

import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

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
        <div className="w-full sm:w-1/2 mx-auto mt-8">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                    </Pie>
                    <Legend verticalAlign="bottom" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
