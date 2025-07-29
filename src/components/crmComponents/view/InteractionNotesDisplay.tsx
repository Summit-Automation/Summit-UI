'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InteractionNotesDisplayProps {
    notes: string;
    maxLength?: number;
}

export default function InteractionNotesDisplay({ 
    notes, 
    maxLength = 50 
}: InteractionNotesDisplayProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldTruncate = notes.length > maxLength;
    
    const displayText = shouldTruncate && !isExpanded 
        ? notes.substring(0, maxLength) + '...' 
        : notes;

    if (!shouldTruncate) {
        return (
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {notes}
            </p>
        );
    }

    return (
        <div className="space-y-2">
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {displayText}
            </p>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 px-2 text-xs text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 transition-colors"
            >
                {isExpanded ? (
                    <>
                        <ChevronUp className="w-3 h-3 mr-1" />
                        Show less
                    </>
                ) : (
                    <>
                        <ChevronDown className="w-3 h-3 mr-1" />
                        Show more
                    </>
                )}
            </Button>
        </div>
    );
}