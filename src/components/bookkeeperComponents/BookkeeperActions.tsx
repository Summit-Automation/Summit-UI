'use client';

import CreateTransactionClientWrapper from '@/components/bookkeeperComponents/bookkeeperActions/CreateTransactionClientWrapper';

export default function BookkeeperActions() {
    return (
        <fieldset className="mb-6">
            <legend className="text-sm text-gray-500 font-semibold mb-2">
                Actions (coming soon)
            </legend>
            <div className="flex flex-wrap gap-3">
                <div className="flex flex-wrap gap-3 mb-4">

                    <CreateTransactionClientWrapper/>

                    <button
                        className="bg-blue-800 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700"
                        disabled
                        title="Coming soon: Upload receipts using an AI agent (Flowise + OCR)"
                    >
                        🧠 AI Receipt Upload
                    </button>

                    <button
                        className="bg-indigo-700 text-white px-4 py-2 rounded shadow-sm hover:bg-indigo-600"
                        disabled
                        title="Coming soon: Import transactions from CSV"
                    >
                        📥 Import CSV
                    </button>

                    <button
                        className="bg-slate-700 text-white px-4 py-2 rounded shadow-sm hover:bg-slate-600"
                        disabled
                        title="Coming soon: Export data to CSV or PDF"
                    >
                        📤 Export
                    </button>

                    <button
                        className="bg-yellow-700 text-white px-4 py-2 rounded shadow-sm hover:bg-yellow-600"
                        disabled
                        title="Coming soon: Trigger AI agent summary of this ledger"
                    >
                        📝 AI Summary Report
                    </button>

                </div>
            </div>
        </fieldset>
    );
}
