'use client';

import { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import CustomerInteractionsTable from './CustomerInteractionsTable';
import { Customer } from '@/types/customer';
import { Interaction } from '@/types/interaction';

export default function CustomerRow({
                                        customer,
                                        interactions,
                                    }: {
    customer: Customer;
    interactions: Interaction[];
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <TableRow
                onClick={() => setOpen((o) => !o)}
                className="bg-slate-900/50 border-b border-slate-800 hover:bg-slate-900/70 transition-all duration-200 cursor-pointer"
            >
                <TableCell className="flex items-center gap-3 p-4">
                    {open
                        ? <ChevronUp size={20} className="text-slate-400" />
                        : <ChevronDown size={20} className="text-slate-500" />
                    }
                    <span className="text-white font-semibold">{customer.full_name}</span>
                </TableCell>
                <TableCell className="p-4">
          <span className="text-slate-200">
            {customer.business || <span className="text-slate-500 italic">None</span>}
          </span>
                </TableCell>
                <TableCell className="p-4">
                    <span className="text-slate-200 truncate block max-w-xs">{customer.email}</span>
                </TableCell>
                <TableCell className="p-4">
                    <span className="text-slate-200">{customer.phone}</span>
                </TableCell>
                <TableCell className="p-4">
                    <Badge className={`${statusColor(customer.status)} px-3 py-0.5 rounded-full text-xs`}>
                        {customer.status}
                    </Badge>
                </TableCell>
                <TableCell className="flex items-center gap-1 p-4 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(customer.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    })}
                </TableCell>
            </TableRow>

            {open && (
                <TableRow>
                    <TableCell colSpan={6} className="p-0">
                        <CustomerInteractionsTable
                            fullName={customer.full_name}
                            interactions={interactions}
                        />
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}

function statusColor(status: string) {
    switch (status) {
        case 'lead':      return 'bg-sky-600 text-sky-100';
        case 'prospect':  return 'bg-yellow-600 text-yellow-100';
        case 'qualified': return 'bg-purple-600 text-purple-100';
        case 'contacted': return 'bg-orange-600 text-orange-100';
        case 'proposal':  return 'bg-indigo-600 text-indigo-100';
        case 'closed':    return 'bg-emerald-600 text-emerald-100';
        default:          return 'bg-slate-600 text-slate-100';
    }
}
