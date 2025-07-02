'use client';

import {useState} from 'react';
import {Customer} from '@/types/customer';
import {Interaction} from '@/types/interaction';
import CustomerInteractionsTable from './CustomerInteractionsTable';
import {ChevronDown, ChevronUp} from 'lucide-react';

export default function CustomerRow({
                                        customer, interactions,
                                    }: {
    customer: Customer; interactions: Interaction[];
}) {
    const [expanded, setExpanded] = useState(false);

    return (<>
            <tr
                className="cursor-pointer hover:bg-slate-800 transition group"
                onClick={() => setExpanded((prev) => !prev)}
            >
                <td className="p-2 font-medium text-white flex items-center gap-2">
                    {expanded ? <ChevronUp size={16} className="text-slate-400"/> :
                        <ChevronDown size={16} className="text-slate-500 group-hover:text-slate-300"/>}
                    {customer.full_name}
                </td>
                <td className="p-2">
                    {customer.business ? (<span>{customer.business}</span>) : (
                        <span className="text-gray-400 italic">None</span>)}
                </td>
                <td className="p-2">{customer.email}</td>
                <td className="p-2">{customer.phone}</td>
                <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(customer.status)}`}>
                        {customer.status}
                    </span>
                </td>
                <td className="p-2 text-gray-400">
                    {new Date(customer.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                    })}
                </td>
            </tr>

            {expanded && (<CustomerInteractionsTable
                    fullName={customer.full_name}
                    interactions={interactions}
                />)}
        </>);
}

function statusColor(status: string) {
    switch (status) {
        case 'lead':
            return 'text-sky-400 bg-sky-800/50';
        case 'prospect':
            return 'text-yellow-300 bg-yellow-800/40';
        case 'qualified':
            return 'text-purple-300 bg-purple-800/40';
        case 'contacted':
            return 'text-orange-300 bg-orange-800/40';
        case 'proposal':
            return 'text-indigo-300 bg-indigo-800/40';
        case 'closed':
            return 'text-green-300 bg-green-800/40';
        default:
            return 'text-gray-400 bg-gray-700';
    }
}
