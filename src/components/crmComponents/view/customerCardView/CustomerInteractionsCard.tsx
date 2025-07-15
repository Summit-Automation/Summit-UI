'use client';

import { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, CalendarCheck, Info } from 'lucide-react';
import { Interaction } from '@/types/interaction';
import {JSX} from "react/jsx-runtime";

const TYPE_COLORS: Record<string, string> = {
    call:    'bg-amber-600 text-amber-100',
    email:   'bg-sky-600   text-sky-100',
    meeting: 'bg-indigo-600 text-indigo-100',
    default: 'bg-slate-600  text-slate-100',
};

const TYPE_ICONS: Record<string, JSX.Element> = {
    call:    <Phone        className="w-4 h-4 text-amber-300" />,
    email:   <Mail         className="w-4 h-4 text-sky-300" />,
    meeting: <CalendarCheck className="w-4 h-4 text-indigo-300" />,
    default: <Info         className="w-4 h-4 text-slate-300" />,
};

export default function CustomerInteractionsCard({
                                                     fullName,
                                                     interactions,
                                                 }: {
    fullName: string;
    interactions: Interaction[];
}) {
    const sorted = useMemo(
        () =>
            [...interactions].sort(
                (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime()
            ),
        [interactions]
    );

    return (
        <div className="mt-4">
            {/* Section header */}
            <h4 className="text-sm font-medium italic text-slate-400 mb-3">
                Interactions for{' '}
                <span className="text-white font-semibold">{fullName}</span>
            </h4>

            {sorted.length === 0 ? (
                <p className="text-slate-500 italic">No interactions recorded.</p>
            ) : (
                <ScrollArea className="h-[300px] pr-2">
                    <div className="space-y-4">
                        {sorted.map((interaction) => {
                            const color = TYPE_COLORS[interaction.type] || TYPE_COLORS.default;
                            const icon  = TYPE_ICONS[interaction.type]  || TYPE_ICONS.default;

                            return (
                                <Card
                                    key={interaction.id}
                                    className="bg-slate-800 border border-slate-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <CardHeader className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-2">
                                            {icon}
                                            <CardTitle className="text-sm font-semibold text-white">
                                                {interaction.title}
                                            </CardTitle>
                                        </div>
                                        <Badge className={`uppercase text-xs px-2 py-0.5 ${color}`}>
                                            {interaction.type}
                                        </Badge>
                                    </CardHeader>

                                    <CardContent className="space-y-2 p-4">
                                        <time className="block text-xs text-slate-400">
                                            {new Date(interaction.created_at).toLocaleString()}
                                        </time>
                                        <p className="text-sm text-slate-200">
                                            {interaction.notes}
                                        </p>
                                        <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>
                        Outcome:{' '}
                          <span className="font-medium text-slate-200">
                          {interaction.outcome}
                        </span>
                      </span>
                                            {interaction.follow_up_required && (
                                                <Badge className="bg-red-600 text-white text-xs px-2 py-0.5">
                                                    🔁 Follow-up
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </ScrollArea>
            )}
        </div>
    );
}
