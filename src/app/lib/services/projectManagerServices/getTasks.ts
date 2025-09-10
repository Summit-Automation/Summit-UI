'use server';

import { Task, TaskWithDetails } from '@/types/task';
import { getAuthenticatedUser } from '../shared/authUtils';

export async function getTasks(projectId?: string): Promise<Task[]> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        let query = supabase
            .from('pm_tasks')
            .select('*')
            .eq('organization_id', organizationId);

        if (projectId) {
            query = query.eq('project_id', projectId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tasks:', error);
            throw new Error('Failed to fetch tasks');
        }

        return data || [];
    } catch (error) {
        console.error('Error in getTasks:', error);
        throw error;
    }
}

export async function getTasksWithDetails(projectId?: string): Promise<TaskWithDetails[]> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        let query = supabase
            .from('pm_tasks_with_details')
            .select('*')
            .eq('organization_id', organizationId);

        if (projectId) {
            query = query.eq('project_id', projectId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tasks with details:', error);
            throw new Error('Failed to fetch tasks with details');
        }

        return data || [];
    } catch (error) {
        console.error('Error in getTasksWithDetails:', error);
        throw error;
    }
}

export async function getTask(taskId: string): Promise<Task | null> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        const { data, error } = await supabase
            .from('pm_tasks')
            .select('*')
            .eq('id', taskId)
            .eq('organization_id', organizationId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // No rows found
            }
            console.error('Error fetching task:', error);
            throw new Error('Failed to fetch task');
        }

        return data;
    } catch (error) {
        console.error('Error in getTask:', error);
        throw error;
    }
}

export async function getTaskWithDetails(taskId: string): Promise<TaskWithDetails | null> {
    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        const { data, error } = await supabase
            .from('pm_tasks_with_details')
            .select('*')
            .eq('id', taskId)
            .eq('organization_id', organizationId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // No rows found
            }
            console.error('Error fetching task with details:', error);
            throw new Error('Failed to fetch task with details');
        }

        return data;
    } catch (error) {
        console.error('Error in getTaskWithDetails:', error);
        throw error;
    }
}