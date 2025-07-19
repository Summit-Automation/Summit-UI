'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateTransactionClientWrapper from '@/components/bookkeeperComponents/bookkeeperActions/CreateTransactionClientWrapper';
import AIReceiptUploadModal from '@/components/bookkeeperComponents/AIReceiptUploadModal';
import { getCustomers } from '@/app/lib/services/crmServices/customer/getCustomers';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileText, Sparkles } from 'lucide-react';

export default function BookkeeperActions() {
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
            
            {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 4 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Add Transaction */}
                <div className="w-full">
                    <CreateTransactionClientWrapper />
                </div>

                {/* AI Receipt Upload */}
                {loading ? (
                    <div className="h-10 bg-slate-800 border border-slate-600 rounded-lg animate-pulse" />
                ) : (
                    <div className="w-full">
                        <AIReceiptUploadModal
                            customers={customers}
                            onSuccess={() => router.refresh()}
                        />
                    </div>
                )}

                {/* Import CSV */}
                <Button
                    variant="outline"
                    disabled
                    className="w-full bg-indigo-600/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/20 hover:border-indigo-500/50 disabled:opacity-60 disabled:cursor-not-allowed h-10"
                >
                    <Upload className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Import CSV</span>
                </Button>

                {/* Export */}
                <Button
                    variant="outline"
                    disabled
                    className="w-full bg-slate-600/10 border-slate-500/30 text-slate-400 hover:bg-slate-600/20 hover:border-slate-500/50 disabled:opacity-60 disabled:cursor-not-allowed h-10"
                >
                    <Download className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Export Data</span>
                </Button>
            </div>

            {/* Secondary Actions - Mobile: Stack vertically, Desktop: Horizontal */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* AI Summary Report */}
                <Button
                    variant="outline"
                    disabled
                    className="w-full sm:w-auto bg-yellow-600/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-600/20 hover:border-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed h-10"
                >
                    <FileText className="h-4 w-4 mr-2" />
                    <span>AI Summary Report</span>
                </Button>
            </div>

            {/* Coming Soon Note */}
            <div className="flex items-start gap-2 text-xs text-slate-500 mt-3 p-3 bg-slate-800/20 rounded-lg border border-slate-700/50">
                <Sparkles className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>AI-powered receipt scanning with automatic transaction creation</span>
            </div>
        </div>
    );
}