'use server';

import { TimeEntry, TimeEntryWithUser } from '@/types/task';
import { getAuthenticatedUser } from '../shared/authUtils';

export interface CreateTimeEntryData {
    task_id: string;
    minutes: number;
    description: string;
    entry_date?: string;
}

export async function createTimeEntry(timeEntryData: CreateTimeEntryData): Promise<TimeEntry> {
    try {
        const { supabase, organizationId, user } = await getAuthenticatedUser();

        const { data, error } = await supabase
            .from('pm_time_entries')
            .insert({
                ...timeEntryData,
                organization_id: organizationId,
                user_id: user.id,
                entry_date: timeEntryData.entry_date || new Date().toISOString().split('T')[0],
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating time entry:', error);
            throw new Error('Failed to create time entry');
        }

        return data;
    } catch (error) {
        console.error('Error in createTimeEntry:', error);
        throw error;
    }
}

export async function getTimeEntries(taskId?: string): Promise<TimeEntryWithUser[]> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        let query = supabase
            .from('pm_time_entries')
            .select(`
                *
            `)
            .eq('organization_id', organizationId);

        if (taskId) {
            query = query.eq('task_id', taskId);
        }

        const { data, error } = await query.order('entry_date', { ascending: false });

        if (error) {
            console.error('Error fetching time entries:', error);
            throw new Error('Failed to fetch time entries');
        }

        // For now, return basic data without user info (we'll add this back later)
        const transformedData: TimeEntryWithUser[] = (data || []).map((entry) => ({
            ...entry,
            user_email: '',
            user_name: 'Current User',
        }));

        return transformedData;
    } catch (error) {
        console.error('Error in getTimeEntries:', error);
        throw error;
    }
}

export async function updateTimeEntry(timeEntryId: string, timeEntryData: Partial<CreateTimeEntryData>): Promise<TimeEntry> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        const { data, error } = await supabase
            .from('pm_time_entries')
            .update(timeEntryData)
            .eq('id', timeEntryId)
            .eq('organization_id', organizationId)
            .select()
            .single();

        if (error) {
            console.error('Error updating time entry:', error);
            throw new Error('Failed to update time entry');
        }

        return data;
    } catch (error) {
        console.error('Error in updateTimeEntry:', error);
        throw error;
    }
}

export async function deleteTimeEntry(timeEntryId: string): Promise<void> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        const { error } = await supabase
            .from('pm_time_entries')
            .delete()
            .eq('id', timeEntryId)
            .eq('organization_id', organizationId);

        if (error) {
            console.error('Error deleting time entry:', error);
            throw new Error('Failed to delete time entry');
        }
    } catch (error) {
        console.error('Error in deleteTimeEntry:', error);
        throw error;
    }
}