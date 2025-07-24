'use client';

import {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle,} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Calendar, ChevronDown, ChevronUp, Mail, Phone, Users,} from 'lucide-react';
import InteractionList from '@/components/crmComponents/view/InteractionList';
import {Customer} from '@/types/customer';
import {Interaction} from '@/types/interaction';
import {statusColor} from '@/lib/crmUtils';

export default function CustomerCard({
                                         customer, interactions,
                                     }: {
    customer: Customer; interactions: Interaction[];
}) {
    const [open, setOpen] = useState(false);

    return (<Card
        className="bg-slate-900/50 border border-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-slate-300"/>
                <CardTitle className="text-lg font-semibold text-white">
                    {customer.full_name || 'Not Specified'}
                </CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen((o) => !o)}>
                {open ? (<ChevronUp className="w-5 h-5 text-slate-300"/>) : (
                    <ChevronDown className="w-5 h-5 text-slate-300"/>)}
            </Button>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400"/>
                <span className="text-slate-400">Business:</span>
                <span className="text-white">
            {customer.business || <em className="text-slate-500">None</em>}
          </span>
            </div>

            <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400"/>
                <span className="text-slate-400">Email:</span>
                <span className="text-white truncate">{customer.email}</span>
            </div>

            <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400"/>
                <span className="text-slate-400">Phone:</span>
                <span className="text-white">{customer.phone}</span>
            </div>

            <div className="flex items-center gap-2">
                <Badge
                    className={`rounded-full px-3 py-1 text-xs ${statusColor(customer.status)}`}
                >
                    {customer.status}
                </Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="w-4 h-4"/>
                {new Date(customer.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                })}
            </div>

            {open && (<div className="mt-4">
                <InteractionList
                    fullName={customer.full_name || 'Not Specified'}
                    interactions={interactions}
                    variant="card"
                />
            </div>)}
        </CardContent>
    </Card>);
}