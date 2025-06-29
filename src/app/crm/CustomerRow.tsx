// app/crm/CustomerRow.tsx
'use client';

import {useState} from 'react';
import {Customer} from '@/types/customer';
import {Interaction} from "@/types/interaction";

import CustomerInteractions from './CustomerInteractions';


export default function CustomerRow({
                                        customer, interactions
                                    }: {
    customer: Customer; interactions: Interaction[];
}) {
    const [expanded, setExpanded] = useState(false);

    return (<>
        <tr
            className="border border-slate-600 cursor-pointer hover:bg-slate-800 transition"
            onClick={() => setExpanded(!expanded)}
        >
            <td className="p-2 font-medium">{customer.full_name}</td>
            <td className="p-2 font-large">{customer.business ||
                <span className="text-gray-400 italic">None</span>}</td>
            <td className="p-2">{customer.email}</td>
            <td className="p-2">{customer.phone}</td>
            <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(customer.status)}`}>
                        {customer.status}
                    </span>
            </td>
            <td className="p-2 text-gray-500">
                {new Date(customer.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                })}
            </td>
        </tr>
        {expanded && (<CustomerInteractions
            fullName={customer.full_name}
            interactions={interactions}
        />)}

    </>);
}

function statusColor(status: string) {
    switch (status) {
        case 'lead':
            return 'text-sky-400 bg-sky-100/10';
        case 'prospect':
            return 'text-yellow-400 bg-yellow-100/10';
        case 'qualified':
            return 'text-purple-400 bg-purple-100/10';
        case 'contacted':
            return 'text-orange-400 bg-orange-100/10';
        case 'proposal':
            return 'text-indigo-400 bg-indigo-100/10';
        case 'closed':
            return 'text-green-400 bg-green-100/10';
        default:
            return 'text-gray-400 bg-gray-100/10';
    }
}
