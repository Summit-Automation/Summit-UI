'use client';

import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Activity, MessageSquare, Users} from 'lucide-react';
import {Customer} from '@/types/customer';
import {Interaction} from '@/types/interaction';
import { cn } from '@/lib/utils';
import { GrowthIndicator } from '@/components/ui/growth-indicator';

const cardStyles = `metric-enhanced card-enhanced data-appear`;
const cardHeaders = `flex items-center justify-between pb-2`;
const cardTitleStyles = `text-sm font-medium text-slate-300 uppercase tracking-wide`;
const iconStyles = `h-4 w-4`;
const iconContainerStyles = `p-2.5 rounded-xl transition-transform duration-200 ease-out group-hover:scale-110`;
const cardContentStyles = `pt-0`;

interface CRMSummaryProps {
    customers: Customer[];
    interactions: Interaction[];
}

interface MetricCardProps {
    title: string;
    value: number | string;
    Icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    bgColor: string;
    subtitle?: string;
    trend?: number;
}

function MetricCard({title, value, Icon, iconColor, bgColor, subtitle, trend}: MetricCardProps) {
    
    return (
        <Card className={`${cardStyles} group`}>
            <CardHeader className={cardHeaders}>
                <CardTitle className={cardTitleStyles}>{title}</CardTitle>
                <div className={`${iconContainerStyles} ${bgColor}`}>
                    <Icon className={cn(iconStyles, iconColor, "icon-interactive")}/>
                </div>
            </CardHeader>
            <CardContent className={cardContentStyles}>
                <div className="flex items-end gap-2">
                    <div className="text-xl font-bold text-gradient" title={value.toString()}>
                        {value}
                    </div>
                    {trend !== undefined && (
                        <GrowthIndicator value={trend} className="mb-0.5" />
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
                iconColor="text-blue-400"
                bgColor="bg-blue-500/20 group-hover:bg-blue-500/30"
                subtitle={`${activeCustomers} active customers`}
                trend={customerEngagementRate > 80 ? 5 : customerEngagementRate > 60 ? 0 : -3}
            />
            <MetricCard
                title="Interactions Logged"
                value={totalInteractions.toLocaleString()}
                Icon={MessageSquare}
                iconColor="text-emerald-400"
                bgColor="bg-emerald-500/20 group-hover:bg-emerald-500/30"
                subtitle={`${recentInteractions} in last 30 days`}
            />
            <MetricCard
                title="Avg. Interactions / Customer"
                value={avgInteractions}
                Icon={Activity}
                iconColor="text-purple-400"
                bgColor="bg-purple-500/20 group-hover:bg-purple-500/30"
                subtitle="Customer engagement score"
                trend={avgInteractions > 3 ? 8 : avgInteractions > 2 ? 2 : -1}
            />
        </div>
    );
}