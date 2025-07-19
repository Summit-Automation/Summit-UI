import { MileageEntry } from '@/types/mileage';

/**
 * Calculate total business and personal miles from mileage entries
 */
export function summarizeMileage(entries: MileageEntry[]) {
    const businessMiles = entries
        .filter(entry => entry.is_business)
        .reduce((sum, entry) => sum + entry.miles, 0);

    const personalMiles = entries
        .filter(entry => !entry.is_business)
        .reduce((sum, entry) => sum + entry.miles, 0);

    const totalMiles = businessMiles + personalMiles;
    
    // IRS standard mileage rate for 2025 (estimated)
    const standardMileageRate = 0.67;
    const potentialDeduction = businessMiles * standardMileageRate;

    return {
        businessMiles,
        personalMiles,
        totalMiles,
        potentialDeduction,
        standardMileageRate,
    };
}

/**
 * Calculate monthly growth for mileage entries
 */
export function calculateMileageGrowth(entries: MileageEntry[]): number {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentMonthMiles = entries
        .filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= currentMonth;
        })
        .reduce((sum, entry) => sum + entry.miles, 0);

    const lastMonthMiles = entries
        .filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= lastMonth && entryDate <= lastMonthEnd;
        })
        .reduce((sum, entry) => sum + entry.miles, 0);

    if (lastMonthMiles === 0) {
        return currentMonthMiles > 0 ? 100 : 0;
    }

    return Number((((currentMonthMiles - lastMonthMiles) / lastMonthMiles) * 100).toFixed(1));
}

/**
 * Get mileage entries for a specific month
 */
export function getMileageForMonth(entries: MileageEntry[], year: number, month: number): MileageEntry[] {
    return entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === year && entryDate.getMonth() === month;
    });
}

/**
 * Calculate average miles per business trip
 */
export function getAverageBusinessTripMiles(entries: MileageEntry[]): number {
    const businessTrips = entries.filter(entry => entry.is_business);
    if (businessTrips.length === 0) return 0;
    
    const totalMiles = businessTrips.reduce((sum, entry) => sum + entry.miles, 0);
    return Number((totalMiles / businessTrips.length).toFixed(1));
}

/**
 * Get top customers by miles driven
 */
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