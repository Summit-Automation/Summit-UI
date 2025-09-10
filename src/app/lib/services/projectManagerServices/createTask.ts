'use server';

import { Task } from '@/types/task';
import { getAuthenticatedUser } from '../shared/authUtils';
import { createTaskSchema, CreateTaskInput } from '@/lib/validation/schemas';
import { validateInput, formatValidationErrors } from '@/lib/validation/validator';
import { Result, success, error as createError } from '@/types/result';

export type CreateTaskData = CreateTaskInput;

export async function createTask(input: unknown): Promise<Result<Task, string>> {
    // Validate input
    const validationResult = validateInput(createTaskSchema, input);
    if (!validationResult.success) {
        return createError(formatValidationErrors(validationResult.error));
    }

    const validatedInput = validationResult.data;

    try {
        const { supabase, organizationId, user } = await getAuthenticatedUser();

        // Verify the project exists and user has access
        const { data: existingProject, error: projectError } = await supabase
            .from('pm_projects')
            .select('id')
            .eq('id', validatedInput.project_id)
            .eq('organization_id', organizationId)
            .single();

        if (projectError || !existingProject) {
            return createError('Project not found or access denied');
        }

        // Create task with validated fields
        const taskToInsert = {
            project_id: validatedInput.project_id,
            title: validatedInput.title,
            description: validatedInput.description || null,
            status: validatedInput.status,
            priority: validatedInput.priority,
            assigned_to: validatedInput.assigned_to || null,
            due_date: validatedInput.due_date || null,
            estimated_hours: validatedInput.estimated_hours || null,
            organization_id: organizationId,
            created_by: user.id,
            updated_by: user.id,
            actual_hours: 0,
        };

        const { data, error } = await supabase
            .from('pm_tasks')
            .insert(taskToInsert)
            .select()
            .single();

        if (error) {
            console.error('Error creating task:', error);
            return createError('Failed to create task');
        }

        return success(data);
    } catch (err) {
        console.error('Exception in createTask:', err);
        return createError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
}