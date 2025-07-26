import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Car, MapPin, DollarSign } from 'lucide-react';
import { MileageEntry } from '@/types/mileage';
import { cn } from '@/lib/utils';

const cardStyles = `metric-enhanced card-enhanced data-appear`;
const cardHeaders = `flex items-center justify-between pb-2`;
const cardTitleStyles = `text-sm font-medium text-slate-300 uppercase tracking-wide`;
const iconStyles = `h-4 w-4`;
const iconContainerStyles = `p-2 bg-slate-800 rounded-lg transition-transform duration-200 ease-out group-hover:scale-105`;
const cardContentStyles = `pt-0`;

interface MetricCardProps {
    title: string;
    value: number | string;
    Icon: React.ComponentType<{ className?: string }>;
    iconColorClass: string;
    subtitle?: string;
    trend?: number;
}

function MetricCard({ title, value, Icon, iconColorClass, subtitle, trend }: MetricCardProps) {
    const isPositive = trend !== undefined ? trend >= 0 : undefined;
    
    return (
        <Card className={cardStyles}>
            <CardHeader className={cardHeaders}>
                <CardTitle className={cardTitleStyles}>{title}</CardTitle>
                <div className={iconContainerStyles}>
                    <Icon className={cn(iconStyles, iconColorClass, "icon-interactive")} />
                </div>
            </CardHeader>
            <CardContent className={cardContentStyles}>
                <div className="flex items-end gap-2">
                    <div className="text-xl font-bold text-gradient truncate" title={value.toString()}>
                        {value}
                    </div>
                    {trend !== undefined && (
                        <div className={cn(
                            "text-xs px-2 py-1 rounded-full mb-0.5",
                            isPositive 
                                ? "text-green-400 bg-green-900 status-badge-enhanced status-success" 
                                : "text-red-400 bg-red-900 status-badge-enhanced status-error"
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

export default function MileageSummary({ mileageEntries }: { mileageEntries: MileageEntry[] }) {
    // Calculate metrics with proper fallbacks for empty data
    const businessMiles = !mileageEntries || mileageEntries.length === 0 
        ? 0 
        : mileageEntries
            .filter(entry => entry.is_business)
            .reduce((sum, entry) => sum + entry.miles, 0);

    const personalMiles = !mileageEntries || mileageEntries.length === 0 
        ? 0 
        : mileageEntries
            .filter(entry => !entry.is_business)
            .reduce((sum, entry) => sum + entry.miles, 0);

    const totalMiles = businessMiles + personalMiles;
    
    // IRS standard mileage rate for 2025 (estimated)
    const standardMileageRate = 0.67;
    const potentialDeduction = businessMiles * standardMileageRate;

    // Calculate additional metrics
    const businessTrips = !mileageEntries || mileageEntries.length === 0 
        ? 0 
        : mileageEntries.filter(entry => entry.is_business).length;
    const avgBusinessTripMiles = businessTrips > 0 ? businessMiles / businessTrips : 0;
    const businessPercentage = totalMiles > 0 ? (businessMiles / totalMiles) * 100 : 0;

    // Format mileage - only show decimal if needed (5.0 becomes "5", 5.5 stays "5.5")
    const formatMiles = (miles: number) => {
        return miles % 1 === 0 ? miles.toFixed(0) : miles.toFixed(1);
    };

    // Format currency with exact amounts for financial precision
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard
                title="Total Miles"
                value={`${formatMiles(totalMiles)} mi`}
                Icon={Car}
                iconColorClass="text-sky-400"
                subtitle={`${businessTrips} business trips`}
                trend={businessPercentage > 70 ? 5 : businessPercentage > 50 ? 0 : -2}
            />
            <MetricCard
                title="Business Miles"
                value={`${formatMiles(businessMiles)} mi`}
                Icon={MapPin}
                iconColorClass="text-green-400"
                subtitle={`${formatMiles(avgBusinessTripMiles)} avg per trip`}
            />
            <MetricCard
                title="Tax Deduction"
                value={formatCurrency(potentialDeduction)}
                Icon={DollarSign}
                iconColorClass="text-yellow-400"
                subtitle={`@ $${standardMileageRate}/mile IRS rate`}
                trend={potentialDeduction > 1000 ? 12 : potentialDeduction > 500 ? 5 : 0}
            />
        </div>
    );
}