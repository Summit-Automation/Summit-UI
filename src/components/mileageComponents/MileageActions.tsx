'use client';

import CreateMileageEntryClientWrapper from '@/components/mileageComponents/mileageActions/CreateMileageEntryClientWrapper';
import { Button } from '@/components/ui/button';
import { Brain, Navigation, Sparkles } from 'lucide-react';

export default function MileageActions() {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200">Quick Actions</h3>
            
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Add Mileage - Already working well */}
                <CreateMileageEntryClientWrapper />

                {/* AI Mileage Tracker */}
                <Button
                    variant="outline"
                    disabled
                    className="bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600/20 hover:border-blue-500/50 disabled:opacity-60 disabled:cursor-not-allowed h-10"
                >
                    <Navigation className="h-4 w-4 mr-2" />
                    AI Mileage Tracker
                </Button>
            </div>

            {/* Coming Soon Note */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
                <Sparkles className="h-3 w-3" />
                <span>AI-powered tracking with Google Directions coming soon</span>
            </div>
        </div>
    );
}