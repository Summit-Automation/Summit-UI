'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateTransactionClientWrapper from '@/components/bookkeeperComponents/bookkeeperActions/CreateTransactionClientWrapper';
import AIReceiptUploadModal from '@/components/bookkeeperComponents/AIReceiptUploadModal';
import { getCustomers } from '@/app/lib/services/crmServices/customer/getCustomers';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Brain, Download, Upload, FileText, Sparkles } from 'lucide-react';

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
            <h3 className="text-lg font-semibold text-slate-200">Quick Actions</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Add Transaction - Already working well */}
                <CreateTransactionClientWrapper />

                {/* AI Receipt Upload */}
                {loading ? (
                    <div className="h-10 bg-slate-800 border border-slate-600 rounded-lg animate-pulse" />
                ) : (
                    <AIReceiptUploadModal
                        customers={customers}
                        onSuccess={() => router.refresh()}
                    />
                )}

                {/* Import CSV */}
                <Button
                    variant="outline"
                    disabled
                    className="bg-indigo-600/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/20 hover:border-indigo-500/50 disabled:opacity-60 disabled:cursor-not-allowed h-10"
                >
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                </Button>

                {/* Export */}
                <Button
                    variant="outline"
                    disabled
                    className="bg-slate-600/10 border-slate-500/30 text-slate-400 hover:bg-slate-600/20 hover:border-slate-500/50 disabled:opacity-60 disabled:cursor-not-allowed h-10"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                </Button>

                {/* AI Summary Report */}
                <Button
                    variant="outline"
                    disabled
                    className="bg-yellow-600/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-600/20 hover:border-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed h-10 sm:col-span-2 lg:col-span-1"
                >
                    <FileText className="h-4 w-4 mr-2" />
                    AI Summary Report
                </Button>
            </div>

            {/* Coming Soon Note */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
                <Sparkles className="h-3 w-3" />
                <span>AI-powered receipt scanning with automatic transaction creation</span>
            </div>
        </div>
    );
}