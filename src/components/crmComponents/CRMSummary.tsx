'use client';

import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Activity, MessageSquare, Users} from 'lucide-react';
import {Customer} from '@/types/customer';
import {Interaction} from '@/types/interaction';

const cardStyles = `bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300 backdrop-blur-sm`;
const cardHeaders = `flex items-center justify-between pb-2`;
const cardTitleStyles = `text-sm font-medium text-slate-300`;
const iconStyles = `h-5 w-5 text-icon`;
const iconContainerStyles = `p-2 bg-slate-800/50 rounded-lg`;
const cardContentStyles = `text-3xl font-bold text-white`;

interface CRMSummaryProps {
    customers: Customer[];
    interactions: Interaction[];
}

interface MetricCardProps {
    title: string;
    value: number | string;
    Icon: React.ComponentType<{ className?: string }>;
}

function MetricCard({title, value, Icon}: MetricCardProps) {
    return (<Card className={cardStyles}>
            <CardHeader className={cardHeaders}>
                <CardTitle className={cardTitleStyles}>{title}</CardTitle>
                <div className={iconContainerStyles}>
                    <Icon className={iconStyles.replace('text-icon', 'text-sky-400')}/>
                </div>
            </CardHeader>
            <CardContent>
                <div className={cardContentStyles}>{value}</div>
            </CardContent>
        </Card>);
}


export default function CRMSummary({customers, interactions}: CRMSummaryProps) {
    const totalCustomers = customers.length;
    const totalInteractions = interactions.length;
    const avgInteractions = totalCustomers ? +(totalInteractions / totalCustomers).toFixed(1) : 0;


    return (<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard
            title="Total Customers"
            value={totalCustomers}
            Icon={Users}
        />
        <MetricCard
            title="Interactions Logged"
            value={totalInteractions}
            Icon={MessageSquare}
        />
        <MetricCard
            title="Avg. Interactions / Customer"
            value={avgInteractions}
            Icon={Activity}
        />
    </div>);
}
