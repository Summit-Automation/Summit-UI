'use client';

import React from 'react';
import {Badge} from '@/components/ui/badge';
import {useRouter} from 'next/navigation';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {Button} from '@/components/ui/button';
import {Trash2} from 'lucide-react';
import {deleteInteraction} from '@/app/lib/services/crmServices/interaction/deleteInteraction';
import UpdateInteractionModalClientWrapper from '@/components/crmComponents/CRMActions/UpdateInteractionClientWrapper';
import type {Interaction} from '@/types/interaction';
import {TYPE_COLORS, TYPE_ICONS} from '@/lib/crmUtils';


interface InteractionItemProps {

    interaction: Interaction;
    variant: 'table' | 'card';
}

export default function InteractionItem({interaction, variant}: InteractionItemProps) {
    const router = useRouter();
    const color = TYPE_COLORS[interaction.type] || TYPE_COLORS.default;
    const icon = TYPE_ICONS[interaction.type] || TYPE_ICONS.default;

    if (variant === 'table') {

        // format dates once
        const date = new Date(interaction.created_at);
        const shortDate = date.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
        return (<div
                className="
        grid grid-cols-[6rem,1fr,8rem,2fr,6rem,4rem,auto]
        gap-4 items-center
        py-2 px-4
        border-b border-slate-700
        even:bg-slate-800
        hover:bg-slate-700
        transition-colors
      "
            >
                {/* Date */}
                <time className="text-xs font-medium text-slate-400 whitespace-nowrap">
                    {shortDate}
                </time>

                {/* Title */}
                <span className="text-sm font-semibold text-white truncate">
                    {interaction.title}
                </span>

                {/* Type */}
                <div className="flex items-center gap-1">
                    {icon}
                    <Badge className={`uppercase text-xs px-2 py-0.5 ${color}`}>
                        {interaction.type}
                    </Badge>
                </div>

                {/* Notes */}
                <span className="text-xs text-slate-400 truncate">
                    Notes:
                </span>

                <span className="text-sm text-slate-300 truncate">
                {interaction.notes}
                </span>

                {/* Outcome */}
                <span className="text-xs text-slate-400 truncate">
                    Outcome:
                </span>
                <span className="text-sm text-slate-300 truncate">
                {interaction.outcome}
                </span>

                {/* Follow-up */}
                {interaction.follow_up_required ? (<Badge className="bg-red-600 text-white text-xs px-2 py-0.5">
                    🔁 Follow-up
                </Badge>) : (<span/>)}

                <div onClick={e => e.stopPropagation()} className="flex gap-2 justify-end">
                    <UpdateInteractionModalClientWrapper
                        interaction={interaction}
                        onSuccess={() => router.refresh()}
                    />


                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="p-1">
                                <Trash2 className="w-4 h-4"/>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Interaction?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This cannot be undone.
                                </AlertDialogDescription>
                                <div className="flex justify-end space-x-2 mt-4">
                                    <AlertDialogCancel asChild>
                                        <Button variant="outline" size="sm">Cancel</Button>
                                    </AlertDialogCancel>
                                    <AlertDialogAction asChild>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={async () => {
                                                await deleteInteraction(interaction.id);
                                                router.refresh();
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </AlertDialogAction>
                                </div>
                            </AlertDialogHeader>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>


        );
    }

    return (<Card
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
                {icon}
                <CardTitle className="text-sm font-semibold text-white">
                    {interaction.title}
                </CardTitle>
            </div>
            <Badge className={`uppercase text-xs px-2 py-0.5 ${color}`}>{interaction.type}</Badge>
        </CardHeader>

        <CardContent className="space-y-2 p-4">
            <time className="block text-xs text-slate-400">
                {new Date(interaction.created_at).toLocaleString()}
            </time>
            <p className="text-sm text-slate-200">{interaction.notes}</p>
            <div className="flex justify-between items-center text-xs text-slate-400">
          <span>
            Outcome: <span className="font-medium text-slate-200">{interaction.outcome}</span>
          </span>
                {interaction.follow_up_required && (
                    <Badge className="bg-red-600 text-white text-xs px-2 py-0.5">🔁 Follow-up</Badge>)}
            </div>
        </CardContent>
    </Card>);
}
