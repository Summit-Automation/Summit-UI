'use client';

import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Activity, MessageSquare, Users} from 'lucide-react';
import {Customer} from '@/types/customer';
import {Interaction} from '@/types/interaction';
import { cn } from '@/lib/utils';

const cardStyles = `metric-enhanced card-enhanced data-appear`;
const cardHeaders = `flex items-center justify-between pb-2`;
const cardTitleStyles = `text-sm font-medium text-slate-300 uppercase tracking-wide`;
const iconStyles = `h-4 w-4`;
const iconContainerStyles = `p-2 bg-slate-800/50 rounded-lg transition-all duration-300 group-hover:scale-110`;
const cardContentStyles = `pt-0`;

interface CRMSummaryProps {
    customers: Customer[];
    interactions: Interaction[];
}

interface MetricCardProps {
    title: string;
    value: number | string;
    Icon: React.ComponentType<{ className?: string }>;
    subtitle?: string;
    trend?: number;
}

function MetricCard({title, value, Icon, subtitle, trend}: MetricCardProps) {
    const isPositive = trend !== undefined ? trend >= 0 : undefined;
    
    return (
        <Card className={cardStyles}>
            <CardHeader className={cardHeaders}>
                <CardTitle className={cardTitleStyles}>{title}</CardTitle>
                <div className={iconContainerStyles}>
                    <Icon className={cn(iconStyles, 'text-sky-400', "icon-interactive")}/>
                </div>
            </CardHeader>
            <CardContent className={cardContentStyles}>
                <div className="flex items-end gap-2">
                    <div className="text-xl font-bold text-gradient" title={value.toString()}>
                        {value}
                    </div>
                    {trend !== undefined && (
                        <div className={cn(
                            "text-xs px-2 py-1 rounded-full mb-0.5",
                            isPositive 
                                ? "text-green-400 bg-green-400/10 status-badge-enhanced status-success" 
                                : "text-red-400 bg-red-400/10 status-badge-enhanced status-error"
                        )}>
                            {isPositive ? '+' : ''}{trend}%
                        </div>
                    )}
                </div>
                {subtitle && (
                    <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
                )}
            </CardContent>
        </Card>
    );
}

export default function CRMSummary({customers, interactions}: CRMSummaryProps) {
    if (!customers || !interactions) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((index) => (
                    <Card key={index} className="metric-enhanced">
                        <CardContent className="p-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="h-4 w-20 loading-enhanced"></div>
                                    <div className="w-8 h-8 loading-enhanced rounded-lg"></div>
                                </div>
                                <div className="h-8 w-16 loading-enhanced"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const totalCustomers = customers.length;
    const totalInteractions = interactions.length;
    const avgInteractions = totalCustomers ? +(totalInteractions / totalCustomers).toFixed(1) : 0;

    // Calculate additional metrics for enhanced display
    const activeCustomers = customers.filter(c => c.status !== 'churned').length;
    const recentInteractions = interactions.filter(i => {
        const interactionDate = new Date(i.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return interactionDate >= thirtyDaysAgo;
    }).length;

    const customerEngagementRate = totalCustomers > 0 ? ((activeCustomers / totalCustomers) * 100) : 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard
                title="Total Customers"
                value={totalCustomers.toLocaleString()}
                Icon={Users}
                subtitle={`${activeCustomers} active customers`}
                trend={customerEngagementRate > 80 ? 5 : customerEngagementRate > 60 ? 0 : -3}
            />
            <MetricCard
                title="Interactions Logged"
                value={totalInteractions.toLocaleString()}
                Icon={MessageSquare}
                subtitle={`${recentInteractions} in last 30 days`}
            />
            <MetricCard
                title="Avg. Interactions / Customer"
                value={avgInteractions}
                Icon={Activity}
                subtitle="Customer engagement score"
                trend={avgInteractions > 3 ? 8 : avgInteractions > 2 ? 2 : -1}
            />
        </div>
    );
}