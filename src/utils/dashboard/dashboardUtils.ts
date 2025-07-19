import { Interaction } from "@/types/interaction";

/**
 * Calculate percentage growth from previous to current.
 * Returns a number rounded to one decimal place.
 */
export function calculateGrowth(current: number, previous: number): number {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return Number((((current - previous) / previous) * 100).toFixed(1));
}

/**
 * Count items whose dateField falls in the specified month.
 * @param items Array of objects with a date field.
 * @param dateField Key of the date field (ISO string).
 * @param monthOffset 0 = current month, -1 = previous month, etc.
 */
export function countInMonth<T>(
    items: T[],
    dateField: keyof T,
    monthOffset = 0
): number {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const start = new Date(target.getFullYear(), target.getMonth(), 1);
    const end = new Date(target.getFullYear(), target.getMonth() + 1, 0);

    return items.filter(item => {
        const dateValue = new Date(item[dateField] as unknown as string);
        return dateValue >= start && dateValue <= end;
    }).length;
}

/**
 * Calculate month-over-month growth percentage for a date-based array.
 */
export function calculateMonthlyGrowth<T>(
    items: T[],
    dateField: keyof T
): number {
    const currentCount = countInMonth(items, dateField, 0);
    const previousCount = countInMonth(items, dateField, -1);
    return calculateGrowth(currentCount, previousCount);
}

/**
 * Count total follow-ups required (no follow-up date available).
 */
export function getFollowUpsDue(interactions: Interaction[]): number {
    return interactions.filter(i => i.follow_up_required).length;
}

// TODO: Implement overdue follow-ups based on a date field.
/**
 * Overdue follow-ups cannot be determined without a date field.
 * Returns 0.
 */
export function getOverdueFollowUps(): number {
    return 0;
}