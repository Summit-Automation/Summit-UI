// app/crm/CRMCustomerView.tsx
'use client';

import { useState } from 'react';
import { Customer } from '@/types/customer';
import { Interaction } from '@/types/interaction';
import CustomerRow from './customerTableView/CustomerRow';
import CustomerCard from './customerCardView/CustomerCard';

export default function CRMCustomerView({
                                            customers,
                                            interactions,
                                        }: {
    customers: Customer[];
    interactions: Interaction[];
}) {
    const [view, setView] = useState<'table' | 'cards'>('table');

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                <button
                    onClick={() => setView('table')}
                    className={`px-3 py-1 rounded text-sm border ${
                        view === 'table'
                            ? 'bg-slate-700 text-white border-slate-600'
                            : 'text-slate-300 hover:text-white border-transparent'
                    }`}
                >
                    📊 Table
                </button>
                <button
                    onClick={() => setView('cards')}
                    className={`px-3 py-1 rounded text-sm border ${
                        view === 'cards'
                            ? 'bg-slate-700 text-white border-slate-600'
                            : 'text-slate-300 hover:text-white border-transparent'
                    }`}
                >
                    🗂️ Cards
                </button>
            </div>

            {customers.length === 0 ? (
                <p className="text-gray-500 italic">No customers found.</p>
            ) : view === 'table' ? (
                <div className="overflow-x-auto shadow border rounded">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-700 text-slate-100">
                        <tr>
                            <th className="p-2 border">Name</th>
                            <th className="p-2 border">Business</th>
                            <th className="p-2 border">Email</th>
                            <th className="p-2 border">Phone</th>
                            <th className="p-2 border">Status</th>
                            <th className="p-2 border">Created</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-300">
                        {customers.map((customer) => (
                            <CustomerRow
                                key={customer.id}
                                customer={customer}
                                interactions={interactions.filter(
                                    (i) => i.customer_id === customer.id
                                )}
                            />
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customers.map((customer) => (
                        <CustomerCard
                            key={customer.id}
                            customer={customer}
                            interactions={interactions.filter(
                                (i) => i.customer_id === customer.id
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
