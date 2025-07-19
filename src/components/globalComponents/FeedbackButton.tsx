'use client';

import { Button } from '@/components/ui/button';
import { MessageSquare, ExternalLink } from 'lucide-react';

export default function FeedbackButton() {
    const handleFeedbackClick = () => {
        window.open('https://forms.gle/DGs93nhZPMj33rQG6', '_blank', 'noopener,noreferrer');
    };

    return (
        <Button
            onClick={handleFeedbackClick}
            variant="outline"
            size="sm"
            className="
                fixed bottom-6 right-6 z-50
                bg-slate-800/90 border-slate-700 text-slate-300 
                hover:bg-slate-700/90 hover:text-sky-400 hover:border-sky-500
                backdrop-blur-sm shadow-lg transition-all duration-200
                flex items-center gap-2
            "
        >
            <MessageSquare className="w-4 h-4" />
            <span>Feedback</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
        </Button>
    );
}