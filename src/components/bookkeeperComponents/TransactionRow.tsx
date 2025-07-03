'use client';

import {useState} from 'react';
import {Transaction} from '@/types/transaction';
import {ChevronDown, ChevronUp} from 'lucide-react';

export default function TransactionRow({transaction}: { transaction: Transaction }) {
    const [expanded, setExpanded] = useState(false);
    const isIncome = transaction.type === 'income';

    const rowColor = isIncome ? 'bg-green-700 hover:bg-green-600' : 'bg-red-800 hover:bg-red-700';
    const gradientColor = isIncome
        ? 'from-green-200 to-slate-100 dark:from-green-900 dark:to-slate-800'
        : 'from-red-200 to-slate-100 dark:from-red-900 dark:to-slate-800';

    return (
        <>
            <tr
                className={`cursor-pointer ${rowColor} text-white transition-colors duration-150`}
                onClick={() => setExpanded(prev => !prev)}
            >
                <td className="p-2 border">{new Date(transaction.timestamp).toLocaleDateString()}</td>
                <td className="p-2 border">{transaction.category}</td>
                <td className="p-2 border">{transaction.description}</td>
                <td className="p-2 border text-right">${parseFloat(transaction.amount).toFixed(2)}</td>
                <td className="p-2 border text-center capitalize">{transaction.type}</td>
                <td className="p-2 border text-center capitalize">{transaction.source}</td>
                <td className="p-2 border text-center">
                    {expanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                </td>
            </tr>

            {expanded && (
                <tr className={`bg-gradient-to-br ${gradientColor} text-slate-800 dark:text-slate-100`}>
                    <td
                        colSpan={7}
                        className="px-4 py-3 border-b border-slate-300 rounded-b"
                    >
                        <div className="space-y-2 text-sm leading-relaxed">
                            <div>
                                <span className="font-semibold">Customer:</span>{' '}
                                {transaction.customer_name ? (
                                    <span>{transaction.customer_name}</span>
                                ) : (
                                    <span className="italic text-slate-500">Unlinked</span>
                                )}
                            </div>
                            <div>
                                <span className="font-semibold">Interaction:</span>{' '}
                                {transaction.interaction_title ? (
                                    <span>
                                        {transaction.interaction_title}
                                        {transaction.interaction_outcome && (
                                            <span className="italic font-semibold text-slate-300">
                                                {' — '}
                                                {transaction.interaction_outcome}
                                            </span>
                                        )}
                                    </span>
                                ) : (
                                    <span className="italic text-slate-500">None</span>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
