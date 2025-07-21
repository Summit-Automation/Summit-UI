import { MileageEntry } from '@/types/mileage';
import { calculateGrowth } from '@/utils/shared';

const STANDARD_MILEAGE_RATE = 0.67; // IRS rate for 2025

export function summarizeMileage(entries: MileageEntry[]) {
    let businessMiles = 0;
    let personalMiles = 0;

    for (const entry of entries) {
        if (entry.is_business) {
            businessMiles += entry.miles;
        } else {
            personalMiles += entry.miles;
        }
    }

    return {
        businessMiles,
        personalMiles,
        totalMiles: businessMiles + personalMiles,
        potentialDeduction: businessMiles * STANDARD_MILEAGE_RATE,
        standardMileageRate: STANDARD_MILEAGE_RATE,
    };
}

export function calculateMileageGrowth(entries: MileageEntry[]): number {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentMonthMiles = entries
        .filter(entry => new Date(entry.date) >= currentMonth)
        .reduce((sum, entry) => sum + entry.miles, 0);

    const lastMonthMiles = entries
        .filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= lastMonth && entryDate <= lastMonthEnd;
        })
        .reduce((sum, entry) => sum + entry.miles, 0);

    return calculateGrowth(currentMonthMiles, lastMonthMiles);
}

export function getMileageForMonth(entries: MileageEntry[], year: number, month: number): MileageEntry[] {
    return entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === year && entryDate.getMonth() === month;
    });
}

export function getAverageBusinessTripMiles(entries: MileageEntry[]): number {
    const businessTrips = entries.filter(entry => entry.is_business);
    if (businessTrips.length === 0) return 0;
    
    const totalMiles = businessTrips.reduce((sum, entry) => sum + entry.miles, 0);
    return Number((totalMiles / businessTrips.length).toFixed(1));
}

export function getTopCustomersByMiles(entries: MileageEntry[], limit: number = 5) {
    const customerMiles = new Map<string, { name: string; miles: number; trips: number }>();

    entries
        .filter(entry => entry.is_business && entry.customer_name)
        .forEach(entry => {
            const key = entry.customer_name!;
            const existing = customerMiles.get(key) || { name: key, miles: 0, trips: 0 };
            existing.miles += entry.miles;
            existing.trips += 1;
            customerMiles.set(key, existing);
        });

    return Array.from(customerMiles.values())
        .sort((a, b) => b.miles - a.miles)
        .slice(0, limit);
}