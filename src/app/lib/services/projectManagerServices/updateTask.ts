'use server';

import { Task } from '@/types/task';
import { getAuthenticatedUser } from '../shared/authUtils';
import { updateTaskSchema, UpdateTaskInput } from '@/lib/validation/schemas';
import { validatePartialInput, formatValidationErrors } from '@/lib/validation/validator';
import { Result, success, error as createError } from '@/types/result';

export async function updateTask(taskId: string, input: unknown): Promise<Result<Task, string>> {
    // Validate taskId
    if (!taskId || typeof taskId !== 'string') {
        return createError('Invalid task ID');
    }

    // Validate input
    const validationResult = validatePartialInput<UpdateTaskInput>(updateTaskSchema, input);
    if (!validationResult.success) {
        return createError(formatValidationErrors(validationResult.error));
    }

    const validatedInput = validationResult.data;

    try {
        const { supabase, organizationId, user } = await getAuthenticatedUser();

        // First, verify the task exists and user has access
        const { data: existingTask, error: fetchError } = await supabase
            .from('pm_tasks')
            .select('id, title')
            .eq('id', taskId)
            .eq('organization_id', organizationId)
            .single();

        if (fetchError || !existingTask) {
            return createError('Task not found or access denied');
        }

        // Build update object with validated fields
        const updateData: Record<string, string | number | null | undefined> = {
            ...validatedInput,
            updated_by: user.id,
        };

        // Convert empty strings to null for optional fields
        if (updateData.description === '') updateData.description = null;
        if (updateData.assigned_to === '') updateData.assigned_to = null;
        if (updateData.due_date === '') updateData.due_date = null;

        const { data, error } = await supabase
            .from('pm_tasks')
            .update(updateData)
            .eq('id', taskId)
            .eq('organization_id', organizationId)
            .select()
            .single();

        if (error) {
            console.error('Error updating task:', error);
            return createError('Failed to update task');
        }

        return success(data);
    } catch (err) {
        console.error('Exception in updateTask:', err);
        return createError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
}

export async function deleteTask(taskId: string): Promise<Result<boolean, string>> {
    // Validate taskId
    if (!taskId || typeof taskId !== 'string') {
        return createError('Invalid task ID');
    }

    try {
        const { supabase, organizationId } = await getAuthenticatedUser();

        // First, verify the task exists and user has access
        const { data: existingTask, error: fetchError } = await supabase
            .from('pm_tasks')
            .select('id, title')
            .eq('id', taskId)
            .eq('organization_id', organizationId)
            .single();

        if (fetchError || !existingTask) {
            return createError('Task not found or access denied');
        }

        // Delete the task
        const { error } = await supabase
            .from('pm_tasks')
            .delete()
            .eq('id', taskId)
            .eq('organization_id', organizationId);

        if (error) {
            console.error('Error deleting task:', error);
            return createError('Failed to delete task');
        }

        return success(true);
    } catch (err) {
        console.error('Exception in deleteTask:', err);
        return createError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
}