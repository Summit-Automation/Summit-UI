/**
 * Date utilities to prevent hydration mismatches
 */

/**
 * Check if a date is overdue compared to a reference date
 * Pass currentDate as prop to avoid hydration mismatches
 */
export function isOverdue(dueDate: string | undefined | null, status: string, currentDate: Date = new Date()): boolean {
    if (!dueDate || status === 'done') return false;
    return new Date(dueDate) < currentDate;
}

/**
 * Get a stable current date for server-side rendering
 */
export function getCurrentDate(): Date {
    return new Date();
}

/**
 * Format a date for consistent display
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', options || { month: 'short', day: 'numeric' });
}

/**
 * Safe date comparison that works in SSR
 */
export function isDateBefore(date1: string | Date, date2: string | Date): boolean {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    return d1.getTime() < d2.getTime();
}