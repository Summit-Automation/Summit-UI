'use client';

import React, { useEffect, useState } from 'react';
import { createInteraction } from '@/app/lib/services/crmServices/createInteraction';
import { Customer } from '@/types/customer';

export default function NewInteractionModal({
                                                customers,
                                                onSuccess,
                                            }: {
    customers: Customer[];
    onSuccess?: () => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState({
        customer_id: '',
        customer_name: '',
        type: 'call',
        title: '',
        notes: '',
        outcome: '',
        follow_up_required: false,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, follow_up_required: e.target.checked });
    };

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const customerId = e.target.value;
        const customer = customers.find((c) => c.id === customerId);
        if (customer) {
            setForm({
                ...form,
                customer_id: customer.id,
                customer_name: customer.full_name,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await createInteraction(form);
        if (success) {
            setIsOpen(false);
            onSuccess?.();
        } else {
            alert('Failed to create interaction');
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-yellow-600 text-white px-4 py-2 rounded shadow hover:bg-yellow-700 transition"
            >
                + New Interaction
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-slate-700 rounded-lg p-6 w-full max-w-xl shadow-xl space-y-4">
                        <h3 className="text-xl font-bold text-gray-200">Log New Interaction</h3>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <select
                                name="customer_id"
                                required
                                value={form.customer_id}
                                onChange={handleCustomerChange}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Select a customer</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.full_name} {c.business ? `– ${c.business}` : ''}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            >
                                <option value="call">Call</option>
                                <option value="email">Email</option>
                                <option value="meeting">Meeting</option>
                                <option value="site visit">Site Visit</option>
                                <option value="other">Other</option>
                            </select>

                            <input
                                type="text"
                                name="title"
                                placeholder="Title"
                                value={form.title}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />

                            <textarea
                                name="notes"
                                placeholder="Notes"
                                value={form.notes}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />

                            <input
                                type="text"
                                name="outcome"
                                placeholder="Outcome"
                                value={form.outcome}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />

                            <label className="inline-flex items-center gap-2 text-gray-200">
                                <input
                                    type="checkbox"
                                    checked={form.follow_up_required}
                                    onChange={handleCheckbox}
                                />
                                Follow-up required
                            </label>

                            <div className="flex justify-between mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-3 py-2 rounded bg-gray-400 hover:bg-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Save Interaction
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
