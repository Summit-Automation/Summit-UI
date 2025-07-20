"use client";

import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {RefreshCw} from 'lucide-react';
import {toast} from 'sonner';

export function RefreshButton() {
    const router = useRouter();
    const handle = () => {
        router.refresh();
        toast.success('Dashboard refreshed 🚀');
    };

    return (
        <Button
            variant="outline"
            size="sm"
            className="bg-slate-900 border-slate-700 text-slate-50 hover:bg-slate-800 hover:border-slate-600 transition-all duration-200"
            onClick={handle}
        >
            <RefreshCw className="w-4 h-4 mr-2"/>
            Refresh
        </Button>
    );
}