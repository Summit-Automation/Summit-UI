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

    return (<Button
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-800/50 text-slate-300"
            onClick={handle}
        >
            <RefreshCw className="w-4 h-4 mr-2"/>
            Refresh
        </Button>);
}
