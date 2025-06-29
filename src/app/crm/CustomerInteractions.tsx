// app/crm/CustomerInteractions.tsx
'use client';

import {Interaction} from '@/types/interaction';

export default function CustomerInteractions({
                                                 fullName, interactions,
                                             }: {
    fullName: string; interactions: Interaction[];
}) {
    return (<tr className="bg-slate-800 border-t border-slate-700">
            <td colSpan={6} className="p-4 text-sm text-slate-300">
                <p className="italic mb-2">Interactions for {fullName}:</p>
                {interactions.length === 0 ? (<p className="text-gray-500 italic">No interactions recorded.</p>) : (
                    <ul className="space-y-2">
                        {interactions
                            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                            .map((interaction) => (
                                <li key={interaction.id} className="border-l-4 border-slate-600 pl-2">
                                    <div className="text-sm font-semibold">{interaction.title}</div>
                                    <div className="text-xs text-gray-400 italic">
                                        [{interaction.type}] {new Date(interaction.created_at).toLocaleString()}
                                    </div>
                                    <div className="text-sm">{interaction.notes}</div>
                                    <div className="text-xs text-gray-400">
                                        Outcome: {interaction.outcome}
                                        {interaction.follow_up_required && (
                                            <span className="ml-2 text-red-400 font-bold">Follow-up required</span>)}
                                    </div>
                                </li>))}
                    </ul>)}
            </td>
        </tr>);
}
