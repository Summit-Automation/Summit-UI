'use client';

import React, {useMemo} from 'react';
import {TableCell, TableRow} from '@/components/ui/table';
import {Card} from '@/components/ui/card';
import InteractionItem from '@/components/crmComponents/view/InteractionItem';
import type {Interaction} from '@/types/interaction';

interface InteractionListProps {
    fullName: string;
    interactions: Interaction[];
    variant: 'card' | 'table';
}

export default function InteractionList({fullName, interactions, variant}: InteractionListProps) {
    // Sort interactions by newest first
    const sorted = useMemo(() => [...interactions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [interactions]);
    const hasInteractions = sorted.length > 0;


    if (variant === 'table') {
        return (<TableRow>
            <TableCell colSpan={7} className="p-0">
                <div className="bg-slate-900">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-slate-800 border-slate-700">
                        <h3 className=" text-lg font-semibold text-white">
                            Interactions for <span className="text-sky-300">{fullName}</span>
                        </h3>
                        <span className="text-slate-400 text-sm">
                            {hasInteractions ? `${sorted.length} interaction${sorted.length > 1 ? 's' : ''}` : 'No interactions recorded.'}
                        </span>
                    </div>

                    {/* Scrollable list */}
                    <div className="max-h-96 overflow-y-auto">
                        {sorted.map(i => (<InteractionItem key={i.id} interaction={i} variant="table"/>))}
                    </div>
                </div>
            </TableCell>
        </TableRow>);
    }

    // Card variant
    return (<Card className="bg-slate-800 border border-slate-700 p-4 space-y-2">
        <p className="italic mb-2 text-slate-300">
            Interactions for <span className="text-white font-semibold">{fullName}</span>:
        </p>
        <div className="space-y-2">
            {sorted.map(i => (<InteractionItem key={i.id} interaction={i} variant="card"/>))}
        </div>
    </Card>);
}
