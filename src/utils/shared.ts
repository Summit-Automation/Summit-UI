// Shared formatting utilities (server-safe)
export const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    }).format(amount);

export const formatDate = (date: string) => 
    new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });

export const formatMiles = (miles: number) => 
    miles % 1 === 0 ? miles.toFixed(0) : miles.toFixed(1);

export const truncateText = (text: string, length: number) => 
    text.length > length ? text.substring(0, length) + '...' : text;

// Common growth calculation
export function calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(1));
}

// Count items in specific month
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

// Calculate monthly growth
export function calculateMonthlyGrowth<T>(items: T[], dateField: keyof T): number {
    const currentCount = countInMonth(items, dateField, 0);
    const previousCount = countInMonth(items, dateField, -1);
    return calculateGrowth(currentCount, previousCount);
}

// Status colors for CRM
export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        lead: 'bg-sky-600 text-sky-100',
        prospect: 'bg-yellow-600 text-yellow-100',
        qualified: 'bg-purple-600 text-purple-100',
        contacted: 'bg-orange-600 text-orange-100',
        proposal: 'bg-indigo-600 text-indigo-100',
        closed: 'bg-emerald-600 text-emerald-100',
        churned: 'bg-red-600 text-red-100'
    };
    return colors[status] || 'bg-slate-600 text-slate-100';
}

// Common type definitions
export interface BaseEntity {
    id: string;
    created_at: string;
    updated_at?: string;
}

export interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export interface TableColumn<T> {
    key: keyof T | string;
    label: string;
    render?: (value: unknown, item: T) => React.ReactNode;
    hideOnMobile?: boolean;
    primary?: boolean;
}

// Common validation patterns
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phonePattern = /^\+?[\d\s\-\(\)]+$/;
export const numberPattern = /^[0-9]+\.?[0-9]*$/;

// Error handling utility
export function handleAsyncError(error: unknown, fallback: string): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return fallback;
}