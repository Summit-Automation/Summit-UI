import { Interaction } from "@/types/interaction";
import { calculateGrowth, countInMonth, calculateMonthlyGrowth } from '@/utils/shared';

// Re-export shared utilities
export { calculateGrowth, countInMonth, calculateMonthlyGrowth };

/**
 * Count total follow-ups required (no follow-up date available).
 */
export function getFollowUpsDue(interactions: Interaction[]): number {
    return interactions.filter(i => i.follow_up_required).length;
}

/**
 * Overdue follow-ups cannot be determined without a date field.
 * Returns 0 as placeholder.
 */
export function getOverdueFollowUps(): number {
    return 0;
}