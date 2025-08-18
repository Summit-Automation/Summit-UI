import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Car, MapPin, DollarSign } from 'lucide-react';
import { MileageEntry } from '@/types/mileage';
import { cn } from '@/lib/utils';
import { GrowthIndicator } from '@/components/ui/growth-indicator';
import { useCurrency } from '@/contexts/CurrencyContext';

const cardStyles = `metric-enhanced card-enhanced data-appear`;
const cardHeaders = `flex items-center justify-between pb-2`;
const cardTitleStyles = `text-sm font-medium text-slate-300 uppercase tracking-wide`;
const iconStyles = `h-4 w-4`;
const iconContainerStyles = `p-2.5 rounded-xl transition-transform duration-200 ease-out group-hover:scale-110`;
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
    
    // Determine background color based on icon color
    const bgColorClass = iconColorClass.includes('sky') || iconColorClass.includes('blue') ? 'bg-blue-500/20 group-hover:bg-blue-500/30' :
                        iconColorClass.includes('green') ? 'bg-emerald-500/20 group-hover:bg-emerald-500/30' :
                        iconColorClass.includes('yellow') ? 'bg-amber-500/20 group-hover:bg-amber-500/30' :
                        'bg-blue-500/20 group-hover:bg-blue-500/30';
    
    return (
        <Card className={`${cardStyles} group`}>
            <CardHeader className={cardHeaders}>
                <CardTitle className={cardTitleStyles}>{title}</CardTitle>
                <div className={`${iconContainerStyles} ${bgColorClass}`}>
                    <Icon className={cn(iconStyles, iconColorClass, "icon-interactive")} />
                </div>
            </CardHeader>
            <CardContent className={cardContentStyles}>
                <div className="flex items-end gap-2">
                    <div className="text-xl font-bold text-gradient truncate" title={value.toString()}>
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

export default function MileageSummary({ mileageEntries }: { mileageEntries: MileageEntry[] }) {
    const { formatAmount } = useCurrency();
    
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

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard
                title="Total Miles"
                value={`${formatMiles(totalMiles)} mi`}
                Icon={Car}
                iconColorClass="text-blue-400"
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
                value={formatAmount(potentialDeduction)}
                Icon={DollarSign}
                iconColorClass="text-amber-400"
                subtitle={`@ $${standardMileageRate}/mile IRS rate`}
                trend={potentialDeduction > 1000 ? 12 : potentialDeduction > 500 ? 5 : 0}
            />
        </div>
    );
}