'use client';

import CreateTransactionClientWrapper from '@/components/bookkeeperComponents/bookkeeperActions/CreateTransactionClientWrapper';
import { Button } from '@/components/ui/button';
import { Brain, Download, Upload, FileText, Sparkles } from 'lucide-react';

export default function BookkeeperActions() {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200">Quick Actions</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Add Transaction - Already working well */}
                <CreateTransactionClientWrapper />

                {/* AI Receipt Upload */}
                <Button
                    variant="outline"
                    disabled
                    className="bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600/20 hover:border-blue-500/50 disabled:opacity-60 disabled:cursor-not-allowed h-10"
                >
                    <Brain className="h-4 w-4 mr-2" />
                    AI Receipt Upload
                </Button>

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
                <span>Advanced features coming soon with AI integration</span>
            </div>
        </div>
    );
}