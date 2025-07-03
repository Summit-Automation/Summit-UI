'use client';

import {useState} from 'react';
import {Customer} from '@/types/customer';
import {Interaction} from '@/types/interaction';
import CustomerInteractionsCard from '@/components/crmComponents/view/customerCardView/CustomerInteractionsCard';
import {ChevronDown, ChevronUp} from 'lucide-react';

export default function CustomerCard({
                                         customer, interactions,
                                     }: {
    customer: Customer; interactions: Interaction[];
}) {
    const [expanded, setExpanded] = useState(false);

    return (<div className="bg-slate-800 rounded-lg border border-slate-700 shadow p-4 space-y-2">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{customer.full_name}</h3>
                <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-slate-200">
                    {expanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                </button>
            </div>
            <p className="text-sm text-slate-300">
                <span className="font-medium text-white">Business:</span>{' '}
                {customer.business || <span className="italic text-gray-400">None</span>}
            </p>
            <p className="text-sm text-slate-300">
                <span className="font-medium text-white">Email:</span> {customer.email}
            </p>
            <p className="text-sm text-slate-300">
                <span className="font-medium text-white">Phone:</span> {customer.phone}
            </p>
            <p>
                <span className={`text-xs px-2 py-1 rounded font-semibold ${statusColor(customer.status)}`}>
                    {customer.status}
                </span>
            </p>
            <p className="text-xs text-slate-400">
                Created:{' '}
                {new Date(customer.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                })}
            </p>

            {expanded && (<CustomerInteractionsCard
                    fullName={customer.full_name}
                    interactions={interactions}
                />)}
        </div>);
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
