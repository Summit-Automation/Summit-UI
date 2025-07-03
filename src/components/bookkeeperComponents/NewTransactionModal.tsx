'use client';

import React, {useState} from 'react';
import {createTransaction} from '@/app/lib/services/bookkeeperServices/createTransaction';
import {Customer} from '@/types/customer';
import {Interaction} from '@/types/interaction';

export default function NewTransactionModal({
                                                customers, interactions, onSuccess, onClose
                                            }: {
    customers: Customer[], interactions: Interaction[], onSuccess?: () => void, onClose?: () => void
}) {
    const [form, setForm] = useState({
        type: 'expense' as 'income' | 'expense',
        category: '',
        description: '',
        amount: '',
        customer_id: '',
        interaction_id: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setForm((prev) => ({
            ...prev, [name]: value, ...(name === 'customer_id' ? {interaction_id: ''} : {}),
            // reset interaction if customer changes
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const success = await createTransaction({
            ...form,
            amount: form.amount.toString(),
            customer_id: form.customer_id || null,
            interaction_id: form.interaction_id || null,
            customer_name: customers.find((c) => c.id === form.customer_id)?.full_name || null,
            interaction_title: interactions.find((i) => i.id === form.interaction_id)?.title || null,
            interaction_outcome: interactions.find((i) => i.id === form.interaction_id)?.outcome || null,
        });

        if (success) {
            onClose?.();
            onSuccess?.();
        } else {
            alert('Failed to create transaction');
        }
    };

    const customerInteractions = interactions.filter((i) => i.customer_id === form.customer_id);

    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-slate-700 rounded-lg p-6 w-full max-w-md shadow-xl space-y-4">
                <h3 className="text-xl font-bold text-gray-200">Add Transaction</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>

                    <input
                        name="category"
                        placeholder="Category"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />

                    <textarea
                        name="description"
                        placeholder="Description"
                        value={form.description}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />

                    <input
                        name="amount"
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        value={form.amount}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />

                    {/* Customer Dropdown */}
                    <select
                        name="customer_id"
                        value={form.customer_id}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Select Customer (optional)</option>
                        {customers.map((c) => (<option key={c.id} value={c.id}>
                                {c.full_name}
                            </option>))}
                    </select>

                    {/* Interaction Dropdown */}
                    <select
                        name="interaction_id"
                        value={form.interaction_id}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        disabled={!form.customer_id}
                    >
                        <option value="">Select Interaction (optional)</option>
                        {customerInteractions.map((i) => (<option key={i.id} value={i.id}>
                                {i.title || `(Unnamed)`}
                            </option>))}
                    </select>

                    <div className="flex justify-between mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-2 rounded bg-gray-400 hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>);
}
