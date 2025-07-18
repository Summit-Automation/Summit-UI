import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Car, MapPin, DollarSign } from 'lucide-react';
import { MileageEntry } from '@/types/mileage';

const cardStyles = `bg-slate-900/50 border-slate-800 hover:bg-slate-900/70 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300 backdrop-blur-sm`;
const cardHeaders = `flex items-center justify-between pb-2`;
const cardTitleStyles = `text-sm font-medium text-slate-300`;
const iconStyles = `h-4 w-4 text-icon`;
const iconContainerStyles = `p-2 bg-slate-800/50 rounded-lg`;
const cardContentStyles = `text-2xl font-bold text-white`;

interface MetricCardProps {
    title: string;
    value: number | string;
    Icon: React.ComponentType<{ className?: string }>;
    iconColorClass: string;
}

function MetricCard({ title, value, Icon, iconColorClass }: MetricCardProps) {
    return (
        <Card className={cardStyles}>
            <CardHeader className={cardHeaders}>
                <CardTitle className={cardTitleStyles}>{title}</CardTitle>
                <div className={iconContainerStyles}>
                    <Icon className={iconStyles.replace('text-icon', iconColorClass)} />
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className={cardContentStyles}>{value}</div>
            </CardContent>
        </Card>
    );
}

export default function MileageSummary({ mileageEntries }: { mileageEntries: MileageEntry[] }) {
    if (!mileageEntries || mileageEntries.length === 0) {
        return <p className="text-gray-500 italic mt-4">No mileage entries recorded yet.</p>;
    }

    const businessMiles = mileageEntries
        .filter(entry => entry.is_business)
        .reduce((sum, entry) => sum + entry.miles, 0);

    const personalMiles = mileageEntries
        .filter(entry => !entry.is_business)
        .reduce((sum, entry) => sum + entry.miles, 0);

    const totalMiles = businessMiles + personalMiles;
    
    // IRS standard mileage rate for 2025 (estimated)
    const standardMileageRate = 0.67;
    const potentialDeduction = businessMiles * standardMileageRate;

    // Format large numbers for better display
    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        } else {
            return num.toLocaleString();
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard
                title="Total Miles"
                value={formatNumber(totalMiles)}
                Icon={Car}
                iconColorClass="text-sky-400"
            />
            <MetricCard
                title="Business Miles"
                value={formatNumber(businessMiles)}
                Icon={MapPin}
                iconColorClass="text-green-400"
            />
            <MetricCard
                title="Tax Deduction"
                value={`$${potentialDeduction.toFixed(0)}`}
                Icon={DollarSign}
                iconColorClass="text-yellow-400"
            />
        </div>
    );
}