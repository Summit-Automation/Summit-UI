'use client';

import { useRouter } from 'next/navigation';
import CreateMileageEntryClientWrapper from '@/components/mileageComponents/mileageActions/CreateMileageEntryClientWrapper';
import AIMileageTrackerModal from '@/components/mileageComponents/AIMileageTrackerModal';
import { Customer } from '@/types/customer';
import { Sparkles } from 'lucide-react';

export default function MileageActions({ customers }: { customers: Customer[] }) {
    const router = useRouter();

    return (
        <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-slate-200">Quick Actions</h3>
            
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Add Mileage */}
                <div className="w-full sm:w-auto">
                    <CreateMileageEntryClientWrapper customers={customers} />
                </div>

                {/* AI Mileage Tracker */}
                <div className="w-full sm:w-auto">
                    <AIMileageTrackerModal
                        customers={customers}
                        onSuccess={() => router.refresh()}
                    />
                </div>
            </div>

            {/* AI Feature Note */}
            <div className="flex items-start gap-2 text-xs text-slate-500 mt-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
                <Sparkles className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>AI-powered mileage calculation using Google Maps Directions API</span>
            </div>
        </div>
    );
}