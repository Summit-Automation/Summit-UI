// components/dashboardComponents/CashFlowArea.tsx
'use client';

import { memo, useMemo } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    ReferenceLine,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
} from 'recharts';
import { format as formatDateFns, isAfter, parseISO, subDays } from 'date-fns';
import { formatCurrency, formatDate } from '@/utils/shared';
import type { Transaction } from '@/types/transaction';

// Types
export type Bucket = {
    date: string;
    income: number;
    expense: number;
    net: number;
    runningBalance: number;
};

interface CashFlowAreaProps {
    transactions: Transaction[];
    timeRange: '7d' | '30d' | '90d' | 'all';
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{ payload: Bucket; value: number; dataKey: string }>;
    label?: string;
}

// Utility: group transactions by date
function groupCashFlow(transactions: Transaction[]): Bucket[] {
    const map = new Map<string, { income: number; expense: number }>();

    for (const tx of transactions) {
        const dateKey = formatDateFns(parseISO(tx.timestamp), 'yyyy-MM-dd');
        const amount = parseFloat(tx.amount as unknown as string);
        if (!map.has(dateKey)) map.set(dateKey, { income: 0, expense: 0 });
        const entry = map.get(dateKey)!;
        if (tx.type === 'income') entry.income += amount;
        else if (tx.type === 'expense') entry.expense += amount;
    }

    const sorted = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
    let runningBalance = 0;

    return sorted.map(([date, { income, expense }]) => {
        const net = income - expense;
        runningBalance += net;
        return { date, income, expense, net, runningBalance };
    });
}

// Custom styled tooltip
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 shadow-2xl">
                <p className="text-gray-300 text-sm mb-2 font-medium">
                    {formatDateFns(parseISO(label!), 'MMMM d, yyyy')}
                </p>
                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
            <span className="text-emerald-400 text-sm flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              Income
            </span>
                        <span className="text-white font-semibold">{formatCurrency(data.income)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
            <span className="text-red-400 text-sm flex items-center gap-1">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              Expenses
            </span>
                        <span className="text-white font-semibold">{formatCurrency(data.expense)}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-2 mt-2">
                        <div className="flex items-center justify-between gap-4">
              <span className="text-blue-400 text-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                Net Flow
              </span>
                            <span className={`font-bold ${data.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(data.net)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 mt-1">
              <span className="text-purple-400 text-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                Balance
              </span>
                            <span className="text-white font-semibold">{formatCurrency(data.runningBalance)}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

// Date-range selector component
export function TimeRangeSelector({
                                      selected,
                                      onSelect,
                                  }: {
    selected: '7d' | '30d' | '90d' | 'all';
    onSelect: (range: '7d' | '30d' | '90d' | 'all') => void;
}) {
    const ranges = [
        { key: '7d', label: '7D' },
        { key: '30d', label: '30D' },
        { key: '90d', label: '90D' },
        { key: 'all', label: 'ALL' },
    ] as const;

    return (
        <div className="flex bg-gray-800/50 rounded-lg p-1 backdrop-blur-sm border border-gray-700/30">
            {ranges.map(r => (
                <button
                    key={r.key}
                    onClick={() => onSelect(r.key)}
                    className={
                        `px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ` +
                        (selected === r.key
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/50')
                    }
                >
                    {r.label}
                </button>
            ))}
        </div>
    );
}

// Main chart component
const CashFlowArea = memo(function CashFlowArea({
                                                    transactions,
                                                    timeRange,
                                                }: CashFlowAreaProps) {
    const { data } = useMemo(() => {
        let filtered = transactions;
        if (timeRange !== 'all') {
            const days = parseInt(timeRange, 10);
            const cutoff = subDays(new Date(), days);
            filtered = transactions.filter(tx => isAfter(parseISO(tx.timestamp), cutoff));
        }
        return { data: groupCashFlow(filtered) };
    }, [transactions, timeRange]);

    if (!data.length) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-400">
                No cash flow data available
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%"  height={350}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <CartesianGrid stroke="#475569" strokeDasharray="3 3"  horizontal vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={formatDate} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={formatCurrency} axisLine={false} tickLine={false} width={80} />
                <RechartsTooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="2 2" strokeOpacity={0.5} />
                <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="url(#incomeGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stackId="2" stroke="#ef4444" fill="url(#expenseGradient)" strokeWidth={2} />
                <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="runningBalance" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </AreaChart>
        </ResponsiveContainer>
    );
});

export default CashFlowArea;