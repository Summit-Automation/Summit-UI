'use client';

import React, { useState } from 'react';
import { createCustomer } from '@/app/lib/services/crmServices/createCustomer';

export default function NewCustomerModal({ onSuccess }: { onSuccess?: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        status: 'lead',
        business: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await createCustomer(form);
        if (success) {
            setIsOpen(false);
            onSuccess?.();
        } else {
            alert('Failed to create customer');
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
            >
                + New Customer
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-slate-700 rounded-lg p-6 w-full max-w-md shadow-xl space-y-4">
                        <h3 className="text-xl font-bold text-gray-200">Add New Customer</h3>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input
                                type="text"
                                name="full_name"
                                placeholder="Full Name"
                                required
                                value={form.full_name}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Phone"
                                value={form.phone}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="text"
                                name="business"
                                placeholder="Business Name"
                                value={form.business}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            >
                                <option value="lead">Lead</option>
                                <option value="prospect">Prospect</option>
                                <option value="contacted">Contacted</option>
                                <option value="qualified">Qualified</option>
                                <option value="proposal">Proposal</option>
                                <option value="closed">Closed</option>
                            </select>

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
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
