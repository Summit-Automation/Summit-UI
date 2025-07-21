import { Phone, Mail, CalendarCheck, Info } from 'lucide-react';
import type { JSX } from 'react';
import { getStatusColor } from '@/utils/shared';

// Re-export shared status color function
export { getStatusColor as statusColor };

export const TYPE_COLORS: Record<string, string> = {
    call: 'bg-amber-600 text-amber-100',
    email: 'bg-sky-600 text-sky-100',
    meeting: 'bg-indigo-600 text-indigo-100',
    'site visit': 'bg-purple-600 text-purple-100',
    other: 'bg-slate-600 text-slate-100',
    default: 'bg-slate-600 text-slate-100',
};

export const TYPE_ICONS: Record<string, JSX.Element> = {
    call: <Phone className="w-4 h-4 text-amber-300" />,
    email: <Mail className="w-4 h-4 text-sky-300" />,
    meeting: <CalendarCheck className="w-4 h-4 text-indigo-300" />,
    'site visit': <CalendarCheck className="w-4 h-4 text-purple-300" />,
    other: <Info className="w-4 h-4 text-slate-300" />,
    default: <Info className="w-4 h-4 text-slate-300" />,
};