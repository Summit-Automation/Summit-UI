'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateMileageEntryClientWrapper from '@/components/mileageComponents/mileageActions/CreateMileageEntryClientWrapper';
import AIMileageTrackerModal from '@/components/mileageComponents/AIMileageTrackerModal';
import { getCustomers } from '@/app/lib/services/crmServices/customer/getCustomers';
import { Customer } from '@/types/customer';
import { Sparkles } from 'lucide-react';

export default function MileageActions() {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCustomers()
            .then(setCustomers)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-slate-200">Quick Actions</h3>
            
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Add Mileage */}
                <div className="w-full sm:w-auto">
                    <CreateMileageEntryClientWrapper />
                </div>

                {/* AI Mileage Tracker */}
                {loading ? (
                    <div className="h-10 bg-slate-800 border border-slate-600 rounded-lg animate-pulse w-full sm:w-auto" />
                ) : (
                    <div className="w-full sm:w-auto">
                        <AIMileageTrackerModal
                            customers={customers}
                            onSuccess={() => router.refresh()}
                        />
                    </div>
                )}
            </div>

            {/* AI Feature Note */}
            <div className="flex items-start gap-2 text-xs text-slate-500 mt-3 p-3 bg-slate-800/20 rounded-lg border border-slate-700/50">
                <Sparkles className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>AI-powered mileage calculation using Google Maps Directions API</span>
            </div>
        </div>
    );
}