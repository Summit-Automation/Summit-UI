'use client';

import CreateMileageEntryClientWrapper from '@/components/mileageComponents/mileageActions/CreateMileageEntryClientWrapper';

export default function MileageActions() {
    return (
        <fieldset className="mb-6">
            <legend className="text-sm text-gray-500 font-semibold mb-2">
                Actions
            </legend>
            <div className="flex flex-wrap gap-3">
                <CreateMileageEntryClientWrapper />

                <button
                    className="bg-blue-800 text-white px-4 py-2 rounded shadow-sm hover:bg-blue-700"
                    disabled
                    title="Coming soon: AI-powered mileage tracking with Google Directions"
                >
                    🤖 AI Mileage Tracker
                </button>
            </div>
        </fieldset>
    );
}