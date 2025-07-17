// src/lib/crmUtils.ts
import { Phone, Mail, CalendarCheck, Info } from 'lucide-react';
import type { JSX } from 'react';

export function statusColor(status: string): string {
    switch (status) {
        case 'lead':      return 'bg-sky-600 text-sky-100';
        case 'prospect':  return 'bg-yellow-600 text-yellow-100';
        case 'qualified': return 'bg-purple-600 text-purple-100';
        case 'contacted': return 'bg-orange-600 text-orange-100';
        case 'proposal':  return 'bg-indigo-600 text-indigo-100';
        case 'closed':    return 'bg-emerald-600 text-emerald-100';
        default:          return 'bg-slate-600 text-slate-100';
    }
}

export const TYPE_COLORS: Record<string, string> = {
    call:    'bg-amber-600 text-amber-100',
    email:   'bg-sky-600   text-sky-100',
    meeting: 'bg-indigo-600 text-indigo-100',
    default: 'bg-slate-600  text-slate-100',
};

export const TYPE_ICONS: Record<string, JSX.Element> = {
    call:    <Phone        className="w-4 h-4 text-amber-300" />,
    email:   <Mail         className="w-4 h-4 text-sky-300" />,
    meeting: <CalendarCheck className="w-4 h-4 text-indigo-300" />,
    default: <Info         className="w-4 h-4 text-slate-300" />,
};
