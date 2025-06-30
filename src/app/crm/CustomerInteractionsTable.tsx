'use client';

import { Interaction } from '@/types/interaction';

const TYPE_COLORS: Record<string, string> = {
    call: 'bg-amber-500 text-white',
    email: 'bg-sky-500 text-white',
    meeting: 'bg-indigo-500 text-white',
    default: 'bg-slate-500 text-white',
};

export default function CustomerInteractionsTable({
                                                 fullName,
                                                 interactions,
                                             }: {
    fullName: string;
    interactions: Interaction[];
}) {
    return (
        <tr className="bg-slate-800 border-t border-slate-700">
            <td colSpan={6} className="p-4 text-sm text-slate-300">
                <p className="italic mb-4 font-medium text-slate-400">
                    Interactions for <span className="text-white font-semibold">{fullName}</span>:
                </p>

                {interactions.length === 0 ? (
                    <p className="text-gray-500 italic">No interactions recorded.</p>
                ) : (
                    <ul className="space-y-4">
                        {interactions
                            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                            .map((interaction) => {
                                const tagColor = TYPE_COLORS[interaction.type] || TYPE_COLORS.default;
                                return (
                                    <li
                                        key={interaction.id}
                                        className="bg-slate-700 border border-slate-600 rounded-lg p-4 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-white">{interaction.title}</span>
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full uppercase tracking-wide font-semibold ${tagColor}`}
                                            >
                                                {interaction.type}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-400 italic mb-2">
                                            {new Date(interaction.created_at).toLocaleString()}
                                        </div>
                                        <div className="text-sm text-slate-200 mb-2">{interaction.notes}</div>
                                        <div className="text-xs text-slate-400">
                                            Outcome:{' '}
                                            <span className="text-slate-300 font-medium">{interaction.outcome}</span>
                                            {interaction.follow_up_required && (
                                                <span className="ml-4 text-red-400 font-bold">
                                                    🔁 Follow-up required
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                    </ul>
                )}
            </td>
        </tr>
    );
}

